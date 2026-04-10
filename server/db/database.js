import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '..', config.dbPath);

// Ensure the db directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

let SQL;
let rawDb;
let inTransaction = false;

// Save database to disk
function save() {
  const data = rawDb.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

// Auto-save on process exit
process.on('exit', () => { if (rawDb) save(); });
process.on('SIGINT', () => { if (rawDb) save(); process.exit(); });
process.on('SIGTERM', () => { if (rawDb) save(); process.exit(); });

// ─── better-sqlite3 compatible wrapper ───────────────
class PreparedStatement {
  constructor(database, sql) {
    this._db = database;
    this._sql = sql;
  }

  _bindParams(params) {
    // better-sqlite3 passes params as spread args: .get(a, b, c)
    // sql.js expects an array: stmt.bind([a, b, c])
    return params;
  }

  all(...params) {
    const stmt = this._db.prepare(this._sql);
    if (params.length > 0) stmt.bind(this._bindParams(params));
    const results = [];
    while (stmt.step()) {
      const cols = stmt.getColumnNames();
      const vals = stmt.get();
      const row = {};
      for (let i = 0; i < cols.length; i++) row[cols[i]] = vals[i];
      results.push(row);
    }
    stmt.free();
    return results;
  }

  get(...params) {
    const stmt = this._db.prepare(this._sql);
    if (params.length > 0) stmt.bind(this._bindParams(params));
    let row = undefined;
    if (stmt.step()) {
      const cols = stmt.getColumnNames();
      const vals = stmt.get();
      row = {};
      for (let i = 0; i < cols.length; i++) row[cols[i]] = vals[i];
    }
    stmt.free();
    return row;
  }

  run(...params) {
    this._db.run(this._sql, this._bindParams(params));
    if (!inTransaction) save();
    return {
      changes: this._db.getRowsModified(),
      lastInsertRowid: 0,
    };
  }
}

// Wrapper object that mimics better-sqlite3 database
const db = {
  prepare(sql) {
    return new PreparedStatement(rawDb, sql);
  },

  exec(sql) {
    rawDb.run(sql);
    save();
  },

  pragma(expr) {
    rawDb.run(`PRAGMA ${expr}`);
  },

  transaction(fn) {
    return (...args) => {
      inTransaction = true;
      rawDb.run('BEGIN');
      try {
        const result = fn(...args);
        rawDb.run('COMMIT');
        inTransaction = false;
        save();
        return result;
      } catch (e) {
        try { rawDb.run('ROLLBACK'); } catch (_) { /* no active txn */ }
        inTransaction = false;
        throw e;
      }
    };
  },
};

export async function initializeDatabase() {
  SQL = await initSqlJs();

  // Load existing DB from disk, or create fresh
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    rawDb = new SQL.Database(buffer);
  } else {
    rawDb = new SQL.Database();
  }

  rawDb.run('PRAGMA foreign_keys = ON');

  rawDb.run(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT DEFAULT '',
      role TEXT NOT NULL CHECK(role IN ('prescriber','nurse','front_desk','admin','patient')),
      credentials TEXT DEFAULT '',
      specialty TEXT DEFAULT '',
      npi TEXT DEFAULT '',
      dea_number TEXT DEFAULT '',
      email TEXT NOT NULL,
      epcs_pin_hash TEXT,
      two_factor_enabled INTEGER DEFAULT 0,
      patient_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Patients table
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      mrn TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      pronouns TEXT DEFAULT '',
      ssn TEXT DEFAULT '',
      race TEXT DEFAULT '',
      ethnicity TEXT DEFAULT '',
      language TEXT DEFAULT 'English',
      marital_status TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      cell_phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      address_street TEXT DEFAULT '',
      address_city TEXT DEFAULT '',
      address_state TEXT DEFAULT '',
      address_zip TEXT DEFAULT '',
      emergency_contact_name TEXT DEFAULT '',
      emergency_contact_relationship TEXT DEFAULT '',
      emergency_contact_phone TEXT DEFAULT '',
      insurance_primary_name TEXT DEFAULT '',
      insurance_primary_member_id TEXT DEFAULT '',
      insurance_primary_group_number TEXT DEFAULT '',
      insurance_primary_copay REAL DEFAULT 0,
      insurance_secondary_name TEXT,
      insurance_secondary_member_id TEXT,
      insurance_secondary_group_number TEXT,
      insurance_secondary_copay REAL,
      pcp TEXT DEFAULT '',
      assigned_provider TEXT,
      photo TEXT,
      is_btg INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      last_visit TEXT,
      next_appointment TEXT,
      flags TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Allergies
    CREATE TABLE IF NOT EXISTS allergies (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      allergen TEXT NOT NULL,
      type TEXT NOT NULL,
      reaction TEXT DEFAULT '',
      severity TEXT DEFAULT '',
      status TEXT DEFAULT 'Active',
      onset_date TEXT DEFAULT '',
      source TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    -- Problem List
    CREATE TABLE IF NOT EXISTS problems (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      code TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      onset_date TEXT DEFAULT '',
      diagnosed_by TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    -- Vital Signs
    CREATE TABLE IF NOT EXISTS vitals (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      bp TEXT DEFAULT '',
      hr INTEGER,
      rr INTEGER,
      temp REAL,
      spo2 REAL,
      weight REAL,
      height REAL,
      bmi REAL,
      pain INTEGER,
      taken_by TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    -- Medications
    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      name TEXT NOT NULL,
      dose TEXT DEFAULT '',
      route TEXT DEFAULT 'Oral',
      frequency TEXT DEFAULT '',
      start_date TEXT DEFAULT '',
      prescriber TEXT DEFAULT '',
      status TEXT DEFAULT 'Active',
      refills_left INTEGER DEFAULT 0,
      is_controlled INTEGER DEFAULT 0,
      schedule TEXT,
      pharmacy TEXT DEFAULT '',
      last_filled TEXT DEFAULT '',
      sig TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    -- Medication Rx History
    CREATE TABLE IF NOT EXISTS medication_rx_history (
      id TEXT PRIMARY KEY,
      medication_id TEXT NOT NULL,
      date TEXT NOT NULL,
      prescribed_by TEXT DEFAULT '',
      pharmacy TEXT DEFAULT '',
      qty INTEGER DEFAULT 0,
      refill_number INTEGER DEFAULT 0,
      type TEXT DEFAULT 'New Prescription',
      note TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE
    );

    -- Orders
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      ordered_date TEXT DEFAULT '',
      ordered_by TEXT DEFAULT '',
      priority TEXT DEFAULT 'Routine',
      notes TEXT DEFAULT '',
      lab_facility TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    -- Lab Results
    CREATE TABLE IF NOT EXISTS lab_results (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      order_date TEXT NOT NULL,
      result_date TEXT,
      ordered_by TEXT DEFAULT '',
      status TEXT DEFAULT 'Pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    -- Lab Result Tests
    CREATE TABLE IF NOT EXISTS lab_result_tests (
      id TEXT PRIMARY KEY,
      lab_result_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (lab_result_id) REFERENCES lab_results(id) ON DELETE CASCADE
    );

    -- Lab Result Components
    CREATE TABLE IF NOT EXISTS lab_result_components (
      id TEXT PRIMARY KEY,
      test_id TEXT NOT NULL,
      component TEXT NOT NULL,
      value TEXT DEFAULT '',
      unit TEXT DEFAULT '',
      range TEXT DEFAULT '',
      flag TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (test_id) REFERENCES lab_result_tests(id) ON DELETE CASCADE
    );

    -- Encounters
    CREATE TABLE IF NOT EXISTS encounters (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT DEFAULT '',
      provider TEXT DEFAULT '',
      provider_name TEXT DEFAULT '',
      credentials TEXT DEFAULT '',
      visit_type TEXT DEFAULT '',
      cpt_code TEXT DEFAULT '',
      icd_code TEXT DEFAULT '',
      reason TEXT DEFAULT '',
      duration TEXT DEFAULT '',
      chief_complaint TEXT DEFAULT '',
      hpi TEXT DEFAULT '',
      interval_note TEXT DEFAULT '',
      mse TEXT DEFAULT '',
      assessment TEXT DEFAULT '',
      plan TEXT DEFAULT '',
      safety_si_level TEXT DEFAULT 'None',
      safety_hi_level TEXT DEFAULT 'None',
      safety_self_harm INTEGER DEFAULT 0,
      safety_substance_use INTEGER DEFAULT 0,
      safety_plan_updated INTEGER DEFAULT 0,
      safety_crisis_resources INTEGER DEFAULT 0,
      safety_notes TEXT DEFAULT '',
      follow_up TEXT DEFAULT '',
      disposition TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    -- Assessment Scores
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      tool TEXT NOT NULL,
      score INTEGER NOT NULL,
      interpretation TEXT DEFAULT '',
      date TEXT NOT NULL,
      administered_by TEXT DEFAULT '',
      answers TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    -- Immunizations
    CREATE TABLE IF NOT EXISTS immunizations (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      vaccine TEXT NOT NULL,
      date TEXT NOT NULL,
      site TEXT DEFAULT '',
      route TEXT DEFAULT '',
      lot TEXT DEFAULT '',
      manufacturer TEXT DEFAULT '',
      administered_by TEXT DEFAULT '',
      next_due TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    -- Appointments
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT,
      patient_name TEXT DEFAULT '',
      provider TEXT DEFAULT '',
      provider_name TEXT DEFAULT '',
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      duration INTEGER DEFAULT 30,
      type TEXT DEFAULT 'Office Visit',
      status TEXT DEFAULT 'Scheduled',
      reason TEXT DEFAULT '',
      visit_type TEXT DEFAULT 'In-Person',
      room TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Blocked Days
    CREATE TABLE IF NOT EXISTS blocked_days (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      date TEXT NOT NULL,
      block_type TEXT DEFAULT 'full',
      reason TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Inbox Messages
    CREATE TABLE IF NOT EXISTS inbox_messages (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      from_name TEXT NOT NULL,
      to_user TEXT NOT NULL,
      patient_id TEXT,
      patient_name TEXT DEFAULT '',
      subject TEXT DEFAULT '',
      body TEXT DEFAULT '',
      date TEXT NOT NULL,
      time TEXT DEFAULT '',
      read INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'Normal',
      status TEXT DEFAULT 'Unread',
      urgent INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Staff Messaging Channels
    CREATE TABLE IF NOT EXISTS staff_channels (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      type TEXT DEFAULT 'channel',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Staff Messages
    CREATE TABLE IF NOT EXISTS staff_messages (
      id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT DEFAULT '',
      content TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now')),
      reactions TEXT DEFAULT '{}',
      FOREIGN KEY (channel_id) REFERENCES staff_channels(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- BTG Audit Log
    CREATE TABLE IF NOT EXISTS btg_audit_log (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      patient_name TEXT DEFAULT '',
      accessed_by TEXT NOT NULL,
      accessed_by_name TEXT DEFAULT '',
      reason TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now')),
      approved INTEGER DEFAULT 1,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    -- BTG Active Access
    CREATE TABLE IF NOT EXISTS btg_access (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      granted_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT
    );

    -- Smart Phrases
    CREATE TABLE IF NOT EXISTS smart_phrases (
      id TEXT PRIMARY KEY,
      trigger_text TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'Clinical',
      content TEXT NOT NULL,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Medication Database (reference)
    CREATE TABLE IF NOT EXISTS medication_database (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      class TEXT DEFAULT '',
      doses TEXT DEFAULT '[]',
      routes TEXT DEFAULT '[]',
      is_controlled INTEGER DEFAULT 0,
      schedule TEXT DEFAULT ''
    );

    -- EPCS OTP tracking
    CREATE TABLE IF NOT EXISTS epcs_otps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      otp_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_allergies_patient ON allergies(patient_id);
    CREATE INDEX IF NOT EXISTS idx_problems_patient ON problems(patient_id);
    CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vitals(patient_id);
    CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);
    CREATE INDEX IF NOT EXISTS idx_orders_patient ON orders(patient_id);
    CREATE INDEX IF NOT EXISTS idx_lab_results_patient ON lab_results(patient_id);
    CREATE INDEX IF NOT EXISTS idx_encounters_patient ON encounters(patient_id);
    CREATE INDEX IF NOT EXISTS idx_assessments_patient ON assessments(patient_id);
    CREATE INDEX IF NOT EXISTS idx_immunizations_patient ON immunizations(patient_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
    CREATE INDEX IF NOT EXISTS idx_appointments_provider ON appointments(provider);
    CREATE INDEX IF NOT EXISTS idx_inbox_to_user ON inbox_messages(to_user);
    CREATE INDEX IF NOT EXISTS idx_staff_messages_channel ON staff_messages(channel_id);
    CREATE INDEX IF NOT EXISTS idx_btg_audit_patient ON btg_audit_log(patient_id);
    CREATE INDEX IF NOT EXISTS idx_rx_history_med ON medication_rx_history(medication_id);
    CREATE INDEX IF NOT EXISTS idx_lab_tests_result ON lab_result_tests(lab_result_id);
    CREATE INDEX IF NOT EXISTS idx_lab_components_test ON lab_result_components(test_id);
  `);

  save();
  console.log('Database schema initialized');
}

export default db;
