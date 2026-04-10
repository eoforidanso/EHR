import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db, { initializeDatabase } from './database.js';

const SALT_ROUNDS = 10;

function hashPassword(pwd) {
  return bcrypt.hashSync(pwd, SALT_ROUNDS);
}

export default async function seed() {
  await initializeDatabase();

  // Check if already seeded
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (count.c > 0) {
    console.log('Database already seeded, skipping.');
    return;
  }

  console.log('Seeding database...');

  const insertUser = db.prepare(`INSERT INTO users (id, username, password_hash, first_name, last_name, role, credentials, specialty, npi, dea_number, email, epcs_pin_hash, two_factor_enabled, patient_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insertPatient = db.prepare(`INSERT INTO patients (id, mrn, first_name, last_name, dob, gender, pronouns, ssn, race, ethnicity, language, marital_status, phone, cell_phone, email, address_street, address_city, address_state, address_zip, emergency_contact_name, emergency_contact_relationship, emergency_contact_phone, insurance_primary_name, insurance_primary_member_id, insurance_primary_group_number, insurance_primary_copay, insurance_secondary_name, insurance_secondary_member_id, insurance_secondary_group_number, insurance_secondary_copay, pcp, assigned_provider, photo, is_btg, is_active, last_visit, next_appointment, flags) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insertAllergy = db.prepare(`INSERT INTO allergies (id, patient_id, allergen, type, reaction, severity, status, onset_date, source) VALUES (?,?,?,?,?,?,?,?,?)`);
  const insertProblem = db.prepare(`INSERT INTO problems (id, patient_id, code, description, status, onset_date, diagnosed_by) VALUES (?,?,?,?,?,?,?)`);
  const insertVital = db.prepare(`INSERT INTO vitals (id, patient_id, date, time, bp, hr, rr, temp, spo2, weight, height, bmi, pain, taken_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insertMed = db.prepare(`INSERT INTO medications (id, patient_id, name, dose, route, frequency, start_date, prescriber, status, refills_left, is_controlled, schedule, pharmacy, last_filled, sig) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insertRxHist = db.prepare(`INSERT INTO medication_rx_history (id, medication_id, date, prescribed_by, pharmacy, qty, refill_number, type, note) VALUES (?,?,?,?,?,?,?,?,?)`);
  const insertOrder = db.prepare(`INSERT INTO orders (id, patient_id, type, description, status, ordered_date, ordered_by, priority, notes) VALUES (?,?,?,?,?,?,?,?,?)`);
  const insertLabResult = db.prepare(`INSERT INTO lab_results (id, patient_id, order_date, result_date, ordered_by, status) VALUES (?,?,?,?,?,?)`);
  const insertLabTest = db.prepare(`INSERT INTO lab_result_tests (id, lab_result_id, name) VALUES (?,?,?)`);
  const insertLabComp = db.prepare(`INSERT INTO lab_result_components (id, test_id, component, value, unit, range, flag) VALUES (?,?,?,?,?,?,?)`);
  const insertAssessment = db.prepare(`INSERT INTO assessments (id, patient_id, tool, score, interpretation, date, administered_by, answers) VALUES (?,?,?,?,?,?,?,?)`);
  const insertImmunization = db.prepare(`INSERT INTO immunizations (id, patient_id, vaccine, date, site, route, lot, manufacturer, administered_by, next_due) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  const insertAppointment = db.prepare(`INSERT INTO appointments (id, patient_id, patient_name, provider, provider_name, date, time, duration, type, status, reason, visit_type, room) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insertEncounter = db.prepare(`INSERT INTO encounters (id, patient_id, date, time, provider, provider_name, credentials, visit_type, cpt_code, icd_code, reason, duration, chief_complaint, hpi, interval_note, mse, assessment, plan, safety_si_level, safety_hi_level, safety_self_harm, safety_substance_use, safety_plan_updated, safety_crisis_resources, safety_notes, follow_up, disposition) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insertInbox = db.prepare(`INSERT INTO inbox_messages (id, type, from_name, to_user, patient_id, patient_name, subject, body, date, time, read, priority, status, urgent) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insertSmartPhrase = db.prepare(`INSERT INTO smart_phrases (id, trigger_text, name, category, content) VALUES (?,?,?,?,?)`);
  const insertChannel = db.prepare(`INSERT INTO staff_channels (id, name, type) VALUES (?,?,?)`);
  const insertMedDb = db.prepare(`INSERT INTO medication_database (id, name, class, doses, routes, is_controlled, schedule) VALUES (?,?,?,?,?,?,?)`);
  const insertBtgLog = db.prepare(`INSERT INTO btg_audit_log (id, patient_id, patient_name, accessed_by, accessed_by_name, reason, timestamp, approved) VALUES (?,?,?,?,?,?,?,?)`);

  const transaction = db.transaction(() => {
    // ── Users ──
    const users = [
      { id: 'u1', username: 'dr.chris', password: 'Pass123!', firstName: 'Chris', lastName: 'L.', role: 'prescriber', credentials: 'MD, PhD', specialty: 'Psychiatry', npi: '1234567890', deaNumber: 'FM1234567', email: 'chris.l@mindcare.health', epcsPin: '9921', twoFactorEnabled: true },
      { id: 'u2', username: 'np.joseph', password: 'Pass123!', firstName: 'Joseph', lastName: '', role: 'prescriber', credentials: 'PMHNP-BC', specialty: 'Psychiatric Mental Health', npi: '0987654321', deaNumber: 'FJ9876543', email: 'joseph@mindcare.health', epcsPin: '4456', twoFactorEnabled: true },
      { id: 'u3', username: 'irina.s', password: 'Pass123!', firstName: 'Irina', lastName: 'S.', role: 'prescriber', credentials: 'MD', specialty: 'Psychiatry', npi: '1122334455', deaNumber: 'FS1122334', email: 'irina.s@mindcare.health', epcsPin: '7743', twoFactorEnabled: true },
      { id: 'u4', username: 'nurse.kelly', password: 'Pass123!', firstName: 'Kelly', lastName: 'Chen', role: 'nurse', credentials: 'RN', specialty: 'Behavioral Health', npi: '', email: 'kelly.chen@mindcare.health', epcsPin: null, twoFactorEnabled: false },
      { id: 'u5', username: 'admin', password: 'Pass123!', firstName: 'Admin', lastName: 'User', role: 'admin', credentials: '', specialty: '', npi: '', email: 'admin@mindcare.health', epcsPin: null, twoFactorEnabled: false },
      { id: 'pat-p1', username: 'james.anderson', password: 'Patient1!', firstName: 'James', lastName: 'Anderson', role: 'patient', credentials: '', specialty: '', npi: '', email: 'james.anderson@email.com', epcsPin: null, twoFactorEnabled: false, patientId: 'p1' },
      { id: 'pat-p2', username: 'maria.garcia', password: 'Patient1!', firstName: 'Maria', lastName: 'Garcia', role: 'patient', credentials: '', specialty: '', npi: '', email: 'maria.garcia@email.com', epcsPin: null, twoFactorEnabled: false, patientId: 'p2' },
      { id: 'pat-p3', username: 'robert.chen', password: 'Patient1!', firstName: 'Robert', lastName: 'Chen', role: 'patient', credentials: '', specialty: '', npi: '', email: 'robert.chen@email.com', epcsPin: null, twoFactorEnabled: false, patientId: 'p3' },
      { id: 'pat-p4', username: 'ashley.kim', password: 'Patient1!', firstName: 'Ashley', lastName: 'Kim', role: 'patient', credentials: '', specialty: '', npi: '', email: 'ashley.kim@email.com', epcsPin: null, twoFactorEnabled: false, patientId: 'p4' },
      { id: 'pat-p5', username: 'dorothy.wilson', password: 'Patient1!', firstName: 'Dorothy', lastName: 'Wilson', role: 'patient', credentials: '', specialty: '', npi: '', email: 'dorothy.wilson@email.com', epcsPin: null, twoFactorEnabled: false, patientId: 'p5' },
      { id: 'pat-p6', username: 'marcus.brown', password: 'Patient1!', firstName: 'Marcus', lastName: 'Brown', role: 'patient', credentials: '', specialty: '', npi: '', email: 'marcus.brown@email.com', epcsPin: null, twoFactorEnabled: false, patientId: 'p6' },
    ];
    for (const u of users) {
      insertUser.run(u.id, u.username, hashPassword(u.password), u.firstName, u.lastName, u.role, u.credentials || '', u.specialty || '', u.npi || '', u.deaNumber || '', u.email, u.epcsPin ? hashPassword(u.epcsPin) : null, u.twoFactorEnabled ? 1 : 0, u.patientId || null);
    }

    // ── Patients ──
    const patients = [
      { id:'p1', mrn:'MRN-00001', firstName:'James', lastName:'Anderson', dob:'1985-03-15', gender:'Male', pronouns:'He/Him', ssn:'***-**-4521', race:'White', ethnicity:'Non-Hispanic', language:'English', maritalStatus:'Married', phone:'(555) 234-5678', cellPhone:'(555) 987-6543', email:'james.anderson@email.com', street:'1234 Oak Avenue', city:'Springfield', state:'IL', zip:'62704', ecName:'Lisa Anderson', ecRel:'Spouse', ecPhone:'(555) 234-5679', priName:'Blue Cross Blue Shield', priMemberId:'BCB123456789', priGroup:'GRP-5500', priCopay:30, secName:null, secMemberId:null, secGroup:null, secCopay:null, pcp:'Dr. Robert Smith', assignedProvider:'u1', isBtg:0, lastVisit:'2026-04-02', nextAppt:'2026-04-10', flags:JSON.stringify(['Fall Risk']) },
      { id:'p2', mrn:'MRN-00002', firstName:'Maria', lastName:'Garcia', dob:'1992-07-22', gender:'Female', pronouns:'She/Her', ssn:'***-**-8834', race:'Hispanic', ethnicity:'Hispanic/Latino', language:'Spanish', maritalStatus:'Single', phone:'(555) 345-6789', cellPhone:'(555) 876-5432', email:'maria.garcia@email.com', street:'5678 Pine Street', city:'Springfield', state:'IL', zip:'62701', ecName:'Carlos Garcia', ecRel:'Brother', ecPhone:'(555) 345-6780', priName:'Aetna', priMemberId:'AET987654321', priGroup:'GRP-8800', priCopay:25, secName:null, secMemberId:null, secGroup:null, secCopay:null, pcp:'Dr. Jennifer Lee', assignedProvider:'u1', isBtg:0, lastVisit:'2026-04-05', nextAppt:'2026-04-12', flags:JSON.stringify(['Suicide Risk - Monitor']) },
      { id:'p3', mrn:'MRN-00003', firstName:'David', lastName:'Thompson', dob:'1978-11-08', gender:'Male', pronouns:'He/Him', ssn:'***-**-2267', race:'African American', ethnicity:'Non-Hispanic', language:'English', maritalStatus:'Divorced', phone:'(555) 456-7890', cellPhone:'(555) 765-4321', email:'david.thompson@email.com', street:'9012 Elm Drive', city:'Springfield', state:'IL', zip:'62702', ecName:'Patricia Thompson', ecRel:'Mother', ecPhone:'(555) 456-7891', priName:'United Healthcare', priMemberId:'UHC456789012', priGroup:'GRP-3300', priCopay:40, secName:'Medicaid', secMemberId:'MCD789012345', secGroup:'', secCopay:0, pcp:'Dr. William Davis', assignedProvider:'u2', isBtg:0, lastVisit:'2026-03-28', nextAppt:'2026-04-15', flags:JSON.stringify(['Substance Use History','Controlled Substance Agreement']) },
      { id:'p4', mrn:'MRN-00004', firstName:'Emily', lastName:'Chen', dob:'2001-01-30', gender:'Female', pronouns:'She/Her', ssn:'***-**-9912', race:'Asian', ethnicity:'Non-Hispanic', language:'English', maritalStatus:'Single', phone:'(555) 567-8901', cellPhone:'(555) 654-3210', email:'emily.chen@email.com', street:'3456 Maple Court', city:'Springfield', state:'IL', zip:'62703', ecName:'Wei Chen', ecRel:'Father', ecPhone:'(555) 567-8902', priName:'Cigna', priMemberId:'CIG321654987', priGroup:'GRP-7700', priCopay:20, secName:null, secMemberId:null, secGroup:null, secCopay:null, pcp:'Dr. Susan Park', assignedProvider:'u2', isBtg:0, lastVisit:'2026-04-07', nextAppt:'2026-04-14', flags:JSON.stringify([]) },
      { id:'p5', mrn:'MRN-00005', firstName:'Robert', lastName:'Wilson', dob:'1965-09-12', gender:'Male', pronouns:'He/Him', ssn:'***-**-5548', race:'White', ethnicity:'Non-Hispanic', language:'English', maritalStatus:'Widowed', phone:'(555) 678-9012', cellPhone:'(555) 543-2109', email:'robert.wilson@email.com', street:'7890 Cedar Lane', city:'Springfield', state:'IL', zip:'62705', ecName:'Karen Wilson', ecRel:'Daughter', ecPhone:'(555) 678-9013', priName:'Medicare', priMemberId:'MCR567890123', priGroup:'', priCopay:0, secName:'AARP Supplemental', secMemberId:'AARP123456', secGroup:'GRP-SUP', secCopay:0, pcp:'Dr. Thomas Brown', assignedProvider:'u1', isBtg:1, lastVisit:'2026-03-20', nextAppt:'2026-04-18', flags:JSON.stringify(['VIP','BTG Protected']) },
      { id:'p6', mrn:'MRN-00006', firstName:'Aisha', lastName:'Patel', dob:'1990-05-18', gender:'Female', pronouns:'She/Her', ssn:'***-**-3376', race:'Asian', ethnicity:'Non-Hispanic', language:'English', maritalStatus:'Married', phone:'(555) 789-0123', cellPhone:'(555) 432-1098', email:'aisha.patel@email.com', street:'2345 Birch Road', city:'Springfield', state:'IL', zip:'62706', ecName:'Raj Patel', ecRel:'Spouse', ecPhone:'(555) 789-0124', priName:'Anthem', priMemberId:'ANT654987321', priGroup:'GRP-4400', priCopay:35, secName:null, secMemberId:null, secGroup:null, secCopay:null, pcp:'Dr. Michelle Taylor', assignedProvider:'u1', isBtg:1, lastVisit:'2026-04-01', nextAppt:'2026-04-20', flags:JSON.stringify(['BTG Protected','Interpreter Needed - Hindi']) },
    ];
    for (const p of patients) {
      insertPatient.run(p.id, p.mrn, p.firstName, p.lastName, p.dob, p.gender, p.pronouns, p.ssn, p.race, p.ethnicity, p.language, p.maritalStatus, p.phone, p.cellPhone, p.email, p.street, p.city, p.state, p.zip, p.ecName, p.ecRel, p.ecPhone, p.priName, p.priMemberId, p.priGroup, p.priCopay, p.secName, p.secMemberId, p.secGroup, p.secCopay, p.pcp, p.assignedProvider, null, p.isBtg, 1, p.lastVisit, p.nextAppt, p.flags);
    }

    // ── Allergies ──
    const allergies = [
      { id:'a1', pid:'p1', allergen:'Penicillin', type:'Medication', reaction:'Hives, Anaphylaxis', severity:'Severe', status:'Active', onsetDate:'2005-06-15', source:'Patient Reported' },
      { id:'a2', pid:'p1', allergen:'Sulfa Drugs', type:'Medication', reaction:'Rash', severity:'Moderate', status:'Active', onsetDate:'2010-03-20', source:'Clinician Verified' },
      { id:'a3', pid:'p1', allergen:'Latex', type:'Environmental', reaction:'Contact Dermatitis', severity:'Mild', status:'Active', onsetDate:'2015-01-10', source:'Patient Reported' },
      { id:'a4', pid:'p2', allergen:'Codeine', type:'Medication', reaction:'Nausea, Vomiting', severity:'Moderate', status:'Active', onsetDate:'2018-09-05', source:'Patient Reported' },
      { id:'a5', pid:'p2', allergen:'Shellfish', type:'Food', reaction:'Throat Swelling', severity:'Severe', status:'Active', onsetDate:'2012-12-25', source:'Clinician Verified' },
      { id:'a6', pid:'p3', allergen:'No Known Drug Allergies (NKDA)', type:'None', reaction:'', severity:'', status:'Active', onsetDate:'', source:'Patient Reported' },
      { id:'a7', pid:'p4', allergen:'Ibuprofen', type:'Medication', reaction:'GI Bleeding', severity:'Severe', status:'Active', onsetDate:'2022-04-18', source:'Clinician Verified' },
      { id:'a8', pid:'p4', allergen:'Peanuts', type:'Food', reaction:'Anaphylaxis', severity:'Severe', status:'Active', onsetDate:'2001-01-30', source:'Patient Reported' },
      { id:'a9', pid:'p4', allergen:'Dust Mites', type:'Environmental', reaction:'Rhinitis, Asthma', severity:'Moderate', status:'Active', onsetDate:'2015-07-01', source:'Patient Reported' },
      { id:'a10', pid:'p5', allergen:'Lisinopril', type:'Medication', reaction:'Angioedema', severity:'Severe', status:'Active', onsetDate:'2019-11-30', source:'Clinician Verified' },
      { id:'a11', pid:'p6', allergen:'Aspirin', type:'Medication', reaction:'Bronchospasm', severity:'Moderate', status:'Active', onsetDate:'2020-02-14', source:'Patient Reported' },
      { id:'a12', pid:'p6', allergen:'Bee Stings', type:'Environmental', reaction:'Anaphylaxis', severity:'Severe', status:'Active', onsetDate:'2008-08-22', source:'Clinician Verified' },
    ];
    for (const a of allergies) insertAllergy.run(a.id, a.pid, a.allergen, a.type, a.reaction, a.severity, a.status, a.onsetDate, a.source);

    // ── Problems ──
    const problems = [
      { id:'pr1', pid:'p1', code:'F33.1', desc:'Major Depressive Disorder, Recurrent, Moderate', status:'Active', onset:'2020-01-15', by:'Dr. Chris L.' },
      { id:'pr2', pid:'p1', code:'F41.1', desc:'Generalized Anxiety Disorder', status:'Active', onset:'2020-01-15', by:'Dr. Chris L.' },
      { id:'pr3', pid:'p1', code:'G47.00', desc:'Insomnia, Unspecified', status:'Active', onset:'2021-06-10', by:'Dr. Chris L.' },
      { id:'pr4', pid:'p1', code:'E11.9', desc:'Type 2 Diabetes Mellitus', status:'Active', onset:'2018-03-20', by:'Dr. Smith (PCP)' },
      { id:'pr5', pid:'p2', code:'F43.10', desc:'Post-Traumatic Stress Disorder', status:'Active', onset:'2022-05-01', by:'Dr. Chris L.' },
      { id:'pr6', pid:'p2', code:'F33.2', desc:'Major Depressive Disorder, Recurrent, Severe', status:'Active', onset:'2022-05-01', by:'Dr. Chris L.' },
      { id:'pr7', pid:'p2', code:'F40.10', desc:'Social Anxiety Disorder', status:'Active', onset:'2023-02-14', by:'Dr. Chris L.' },
      { id:'pr8', pid:'p3', code:'F10.20', desc:'Alcohol Use Disorder, Moderate', status:'Active', onset:'2019-08-15', by:'Joseph' },
      { id:'pr9', pid:'p3', code:'F33.0', desc:'Major Depressive Disorder, Recurrent, Mild', status:'Active', onset:'2019-08-15', by:'Joseph' },
      { id:'pr10', pid:'p3', code:'I10', desc:'Essential Hypertension', status:'Active', onset:'2015-04-10', by:'Dr. Davis (PCP)' },
      { id:'pr11', pid:'p3', code:'F17.210', desc:'Nicotine Dependence, Cigarettes', status:'Active', onset:'2010-01-01', by:'Joseph' },
      { id:'pr12', pid:'p4', code:'F90.2', desc:'ADHD, Combined Type', status:'Active', onset:'2015-09-01', by:'Joseph' },
      { id:'pr13', pid:'p4', code:'F41.1', desc:'Generalized Anxiety Disorder', status:'Active', onset:'2023-01-20', by:'Joseph' },
      { id:'pr14', pid:'p4', code:'F50.00', desc:'Anorexia Nervosa, Unspecified', status:'In Remission', onset:'2019-06-15', by:'Dr. Park (PCP)' },
      { id:'pr15', pid:'p5', code:'F32.2', desc:'Major Depressive Disorder, Single Episode, Severe', status:'Active', onset:'2025-12-01', by:'Dr. Chris L.' },
      { id:'pr16', pid:'p5', code:'F41.0', desc:'Panic Disorder', status:'Active', onset:'2026-01-10', by:'Dr. Chris L.' },
      { id:'pr17', pid:'p5', code:'G30.9', desc:'Alzheimers Disease, Unspecified (Early Onset)', status:'Active', onset:'2025-06-15', by:'Dr. Brown (PCP)' },
      { id:'pr18', pid:'p6', code:'F31.31', desc:'Bipolar Disorder, Current Episode Depressed, Mild', status:'Active', onset:'2021-03-10', by:'Dr. Chris L.' },
      { id:'pr19', pid:'p6', code:'F41.1', desc:'Generalized Anxiety Disorder', status:'Active', onset:'2021-03-10', by:'Dr. Chris L.' },
      { id:'pr20', pid:'p6', code:'N94.3', desc:'Premenstrual Dysphoric Disorder', status:'Active', onset:'2022-08-05', by:'Dr. Taylor (PCP)' },
    ];
    for (const p of problems) insertProblem.run(p.id, p.pid, p.code, p.desc, p.status, p.onset, p.by);

    // ── Vitals ──
    const vitals = [
      { id:'v1', pid:'p1', date:'2026-04-02', time:'09:15', bp:'128/82', hr:76, rr:16, temp:98.6, spo2:98, weight:185, height:70, bmi:26.5, pain:2, takenBy:'Kelly Chen, RN' },
      { id:'v2', pid:'p1', date:'2026-03-05', time:'10:30', bp:'132/85', hr:80, rr:18, temp:98.4, spo2:97, weight:187, height:70, bmi:26.8, pain:3, takenBy:'Kelly Chen, RN' },
      { id:'v3', pid:'p1', date:'2026-02-01', time:'14:00', bp:'135/88', hr:82, rr:16, temp:98.6, spo2:98, weight:190, height:70, bmi:27.3, pain:4, takenBy:'Kelly Chen, RN' },
      { id:'v4', pid:'p2', date:'2026-04-05', time:'11:00', bp:'118/72', hr:68, rr:14, temp:98.2, spo2:99, weight:135, height:64, bmi:23.2, pain:0, takenBy:'Kelly Chen, RN' },
      { id:'v5', pid:'p2', date:'2026-03-08', time:'09:45', bp:'120/74', hr:72, rr:16, temp:98.6, spo2:98, weight:136, height:64, bmi:23.3, pain:1, takenBy:'Kelly Chen, RN' },
      { id:'v6', pid:'p3', date:'2026-03-28', time:'13:30', bp:'142/92', hr:88, rr:18, temp:98.8, spo2:96, weight:210, height:72, bmi:28.5, pain:5, takenBy:'Kelly Chen, RN' },
      { id:'v7', pid:'p3', date:'2026-02-28', time:'10:00', bp:'148/95', hr:92, rr:20, temp:98.6, spo2:95, weight:215, height:72, bmi:29.2, pain:4, takenBy:'Kelly Chen, RN' },
      { id:'v8', pid:'p4', date:'2026-04-07', time:'08:30', bp:'110/68', hr:72, rr:14, temp:97.8, spo2:99, weight:115, height:63, bmi:20.4, pain:0, takenBy:'Kelly Chen, RN' },
      { id:'v9', pid:'p5', date:'2026-03-20', time:'15:00', bp:'152/96', hr:84, rr:18, temp:98.4, spo2:95, weight:178, height:68, bmi:27.1, pain:6, takenBy:'Kelly Chen, RN' },
      { id:'v10', pid:'p6', date:'2026-04-01', time:'10:15', bp:'122/76', hr:74, rr:16, temp:98.6, spo2:98, weight:145, height:65, bmi:24.1, pain:1, takenBy:'Kelly Chen, RN' },
    ];
    for (const v of vitals) insertVital.run(v.id, v.pid, v.date, v.time, v.bp, v.hr, v.rr, v.temp, v.spo2, v.weight, v.height, v.bmi, v.pain, v.takenBy);

    // ── Medications + Rx History ──
    const meds = [
      { id:'m1', pid:'p1', name:'Sertraline (Zoloft)', dose:'100mg', route:'Oral', freq:'Once daily', start:'2020-02-01', prescriber:'Dr. Chris L.', status:'Active', refills:3, controlled:0, schedule:null, pharmacy:'CVS Pharmacy - Main St', lastFilled:'2026-03-15', sig:'Take 1 tablet by mouth once daily in the morning', rxHistory:[
        { date:'2026-03-15', by:'Dr. Chris L.', pharmacy:'CVS Pharmacy - Main St', qty:90, refill:7, type:'Refill', note:'90-day supply' },
        { date:'2025-12-15', by:'Dr. Chris L.', pharmacy:'CVS Pharmacy - Main St', qty:90, refill:6, type:'Refill', note:'' },
        { date:'2020-02-01', by:'Dr. Chris L.', pharmacy:'CVS Pharmacy - Main St', qty:30, refill:0, type:'New Prescription', note:'Initial prescription' },
      ]},
      { id:'m2', pid:'p1', name:'Trazodone', dose:'50mg', route:'Oral', freq:'Once daily at bedtime', start:'2021-07-01', prescriber:'Dr. Chris L.', status:'Active', refills:2, controlled:0, schedule:null, pharmacy:'CVS Pharmacy - Main St', lastFilled:'2026-03-15', sig:'Take 1 tablet by mouth at bedtime as needed for insomnia', rxHistory:[
        { date:'2026-03-15', by:'Dr. Chris L.', pharmacy:'CVS Pharmacy - Main St', qty:30, refill:4, type:'Refill', note:'' },
        { date:'2021-07-01', by:'Dr. Chris L.', pharmacy:'CVS Pharmacy - Main St', qty:30, refill:0, type:'New Prescription', note:'Added for insomnia' },
      ]},
      { id:'m3', pid:'p1', name:'Metformin', dose:'500mg', route:'Oral', freq:'Twice daily', start:'2018-04-01', prescriber:'Dr. Robert Smith (PCP)', status:'Active', refills:5, controlled:0, schedule:null, pharmacy:'CVS Pharmacy - Main St', lastFilled:'2026-03-01', sig:'Take 1 tablet by mouth twice daily with meals', rxHistory:[
        { date:'2026-03-01', by:'Dr. Robert Smith (PCP)', pharmacy:'CVS Pharmacy - Main St', qty:90, refill:10, type:'Refill', note:'90-day supply' },
        { date:'2018-04-01', by:'Dr. Robert Smith (PCP)', pharmacy:'CVS Pharmacy - Main St', qty:30, refill:0, type:'New Prescription', note:'For Type 2 Diabetes' },
      ]},
      { id:'m4', pid:'p2', name:'Venlafaxine XR (Effexor XR)', dose:'150mg', route:'Oral', freq:'Once daily', start:'2022-06-01', prescriber:'Dr. Chris L.', status:'Active', refills:4, controlled:0, schedule:null, pharmacy:'Walgreens - 5th Ave', lastFilled:'2026-03-20', sig:'Take 1 capsule by mouth once daily with food', rxHistory:[
        { date:'2026-03-20', by:'Dr. Chris L.', pharmacy:'Walgreens - 5th Ave', qty:90, refill:5, type:'Refill', note:'90-day supply' },
        { date:'2022-06-01', by:'Dr. Chris L.', pharmacy:'Walgreens - 5th Ave', qty:30, refill:0, type:'New Prescription', note:'Started at 75mg for titration' },
      ]},
      { id:'m5', pid:'p2', name:'Prazosin', dose:'2mg', route:'Oral', freq:'Once daily at bedtime', start:'2022-08-15', prescriber:'Dr. Chris L.', status:'Active', refills:3, controlled:0, schedule:null, pharmacy:'Walgreens - 5th Ave', lastFilled:'2026-03-20', sig:'Take 1 tablet by mouth at bedtime for nightmares', rxHistory:[
        { date:'2026-03-20', by:'Dr. Chris L.', pharmacy:'Walgreens - 5th Ave', qty:30, refill:4, type:'Refill', note:'' },
        { date:'2022-08-15', by:'Dr. Chris L.', pharmacy:'Walgreens - 5th Ave', qty:30, refill:0, type:'New Prescription', note:'For PTSD-related nightmares' },
      ]},
      { id:'m6', pid:'p2', name:'Hydroxyzine', dose:'25mg', route:'Oral', freq:'Every 6 hours as needed', start:'2023-01-10', prescriber:'Dr. Chris L.', status:'Active', refills:2, controlled:0, schedule:null, pharmacy:'Walgreens - 5th Ave', lastFilled:'2026-02-28', sig:'Take 1 tablet by mouth every 6 hours as needed for anxiety', rxHistory:[] },
      { id:'m7', pid:'p3', name:'Naltrexone', dose:'50mg', route:'Oral', freq:'Once daily', start:'2020-01-15', prescriber:'NP Michael Johnson', status:'Active', refills:5, controlled:0, schedule:null, pharmacy:'Rite Aid - Center St', lastFilled:'2026-03-10', sig:'Take 1 tablet by mouth once daily', rxHistory:[] },
      { id:'m8', pid:'p3', name:'Bupropion XL (Wellbutrin XL)', dose:'300mg', route:'Oral', freq:'Once daily', start:'2020-01-15', prescriber:'NP Michael Johnson', status:'Active', refills:4, controlled:0, schedule:null, pharmacy:'Rite Aid - Center St', lastFilled:'2026-03-10', sig:'Take 1 tablet by mouth once daily in the morning', rxHistory:[] },
      { id:'m9', pid:'p3', name:'Lisinopril', dose:'20mg', route:'Oral', freq:'Once daily', start:'2015-05-01', prescriber:'Dr. William Davis (PCP)', status:'Active', refills:6, controlled:0, schedule:null, pharmacy:'Rite Aid - Center St', lastFilled:'2026-03-01', sig:'Take 1 tablet by mouth once daily', rxHistory:[] },
      { id:'m10', pid:'p4', name:'Adderall XR (Amphetamine/Dextroamphetamine)', dose:'20mg', route:'Oral', freq:'Once daily in the morning', start:'2023-03-01', prescriber:'NP Michael Johnson', status:'Active', refills:0, controlled:1, schedule:'Schedule II', pharmacy:'CVS Pharmacy - College Ave', lastFilled:'2026-03-25', sig:'Take 1 capsule by mouth once daily in the morning', rxHistory:[
        { date:'2026-03-25', by:'NP Michael Johnson', pharmacy:'CVS Pharmacy - College Ave', qty:30, refill:36, type:'Written Rx', note:'Monthly CII — no refills' },
        { date:'2023-03-01', by:'NP Michael Johnson', pharmacy:'CVS Pharmacy - College Ave', qty:30, refill:0, type:'New Prescription', note:'Initiated for ADHD' },
      ]},
      { id:'m11', pid:'p4', name:'Buspirone', dose:'15mg', route:'Oral', freq:'Twice daily', start:'2023-02-01', prescriber:'NP Michael Johnson', status:'Active', refills:3, controlled:0, schedule:null, pharmacy:'CVS Pharmacy - College Ave', lastFilled:'2026-03-15', sig:'Take 1 tablet by mouth twice daily', rxHistory:[] },
      { id:'m12', pid:'p5', name:'Mirtazapine (Remeron)', dose:'30mg', route:'Oral', freq:'Once daily at bedtime', start:'2026-01-01', prescriber:'Dr. Chris L.', status:'Active', refills:5, controlled:0, schedule:null, pharmacy:'Walmart Pharmacy', lastFilled:'2026-03-20', sig:'Take 1 tablet by mouth at bedtime', rxHistory:[] },
      { id:'m13', pid:'p5', name:'Lorazepam (Ativan)', dose:'0.5mg', route:'Oral', freq:'Twice daily as needed', start:'2026-01-15', prescriber:'Dr. Chris L.', status:'Active', refills:1, controlled:1, schedule:'Schedule IV', pharmacy:'Walmart Pharmacy', lastFilled:'2026-03-01', sig:'Take 1 tablet by mouth twice daily as needed for acute anxiety', rxHistory:[] },
      { id:'m14', pid:'p5', name:'Donepezil (Aricept)', dose:'10mg', route:'Oral', freq:'Once daily at bedtime', start:'2025-07-01', prescriber:'Dr. Thomas Brown (PCP)', status:'Active', refills:4, controlled:0, schedule:null, pharmacy:'Walmart Pharmacy', lastFilled:'2026-03-15', sig:'Take 1 tablet by mouth at bedtime', rxHistory:[] },
      { id:'m15', pid:'p6', name:'Lamotrigine (Lamictal)', dose:'200mg', route:'Oral', freq:'Once daily', start:'2021-06-01', prescriber:'Dr. Chris L.', status:'Active', refills:5, controlled:0, schedule:null, pharmacy:'Walgreens - Oak Park', lastFilled:'2026-03-25', sig:'Take 1 tablet by mouth once daily', rxHistory:[] },
      { id:'m16', pid:'p6', name:'Quetiapine (Seroquel)', dose:'100mg', route:'Oral', freq:'Once daily at bedtime', start:'2021-09-15', prescriber:'Dr. Chris L.', status:'Active', refills:3, controlled:0, schedule:null, pharmacy:'Walgreens - Oak Park', lastFilled:'2026-03-25', sig:'Take 1 tablet by mouth at bedtime', rxHistory:[] },
    ];
    for (const m of meds) {
      insertMed.run(m.id, m.pid, m.name, m.dose, m.route, m.freq, m.start, m.prescriber, m.status, m.refills, m.controlled, m.schedule, m.pharmacy, m.lastFilled, m.sig);
      for (const rx of m.rxHistory) {
        insertRxHist.run(uuidv4(), m.id, rx.date, rx.by, rx.pharmacy, rx.qty, rx.refill, rx.type, rx.note);
      }
    }

    // ── Orders ──
    const orders = [
      { id:'o1', pid:'p1', type:'Lab', desc:'CBC w/ Differential, CMP, HbA1c, Lipid Panel', status:'Completed', date:'2026-03-28', by:'Dr. Chris L.', priority:'Routine', notes:'Routine monitoring' },
      { id:'o2', pid:'p1', type:'Lab', desc:'TSH, Vitamin D 25-Hydroxy', status:'Pending', date:'2026-04-02', by:'Dr. Chris L.', priority:'Routine', notes:'Annual screening' },
      { id:'o3', pid:'p1', type:'Referral', desc:'Referral to CBT Therapist', status:'Completed', date:'2026-01-15', by:'Dr. Chris L.', priority:'Routine', notes:'Weekly CBT' },
      { id:'o4', pid:'p2', type:'Lab', desc:'TSH, CBC', status:'Completed', date:'2026-03-25', by:'Dr. Chris L.', priority:'Routine', notes:'Thyroid screening' },
      { id:'o5', pid:'p2', type:'Referral', desc:'Referral to EMDR Therapist', status:'Active', date:'2026-04-05', by:'Dr. Chris L.', priority:'Urgent', notes:'EMDR for PTSD' },
      { id:'o6', pid:'p2', type:'Imaging', desc:'Brain MRI w/o contrast', status:'Pending', date:'2026-04-05', by:'Dr. Chris L.', priority:'Routine', notes:'R/O organic pathology' },
      { id:'o7', pid:'p3', type:'Lab', desc:'Hepatic Function Panel, UDS', status:'Completed', date:'2026-03-20', by:'Joseph', priority:'Routine', notes:'Monitoring LFTs' },
      { id:'o8', pid:'p3', type:'Referral', desc:'Referral to AA/NA Support Group', status:'Active', date:'2026-03-28', by:'Joseph', priority:'Routine', notes:'Community support for AUD' },
      { id:'o9', pid:'p4', type:'Lab', desc:'CBC, CMP', status:'Pending', date:'2026-04-07', by:'Joseph', priority:'Routine', notes:'Baseline labs' },
      { id:'o10', pid:'p4', type:'Prescription', desc:'Adderall XR 20mg - Refill', status:'Pending EPCS Auth', date:'2026-04-07', by:'Joseph', priority:'Routine', notes:'Schedule II' },
      { id:'o11', pid:'p5', type:'Referral', desc:'Referral to Neuropsychology', status:'Active', date:'2026-03-20', by:'Dr. Chris L.', priority:'Urgent', notes:'Cognitive assessment' },
      { id:'o12', pid:'p5', type:'Lab', desc:'BMP, TSH, B12, Folate', status:'Pending', date:'2026-03-20', by:'Dr. Chris L.', priority:'Routine', notes:'R/O reversible causes' },
      { id:'o13', pid:'p6', type:'Lab', desc:'Lamotrigine Level, CBC, CMP', status:'Pending', date:'2026-04-01', by:'Dr. Chris L.', priority:'Routine', notes:'Therapeutic drug monitoring' },
    ];
    for (const o of orders) insertOrder.run(o.id, o.pid, o.type, o.desc, o.status, o.date, o.by, o.priority, o.notes);

    // ── Lab Results (with nested structure) ──
    const labResults = [
      { id:'lab1', pid:'p1', orderDate:'2026-03-28', resultDate:'2026-03-30', orderedBy:'Dr. Chris L.', status:'Final', tests:[
        { name:'CBC w/ Differential', results:[
          { comp:'WBC', val:'7.2', unit:'K/uL', range:'4.5-11.0', flag:'' },
          { comp:'RBC', val:'4.8', unit:'M/uL', range:'4.5-5.5', flag:'' },
          { comp:'Hemoglobin', val:'14.2', unit:'g/dL', range:'13.5-17.5', flag:'' },
          { comp:'Hematocrit', val:'42.1', unit:'%', range:'38.0-50.0', flag:'' },
          { comp:'Platelets', val:'245', unit:'K/uL', range:'150-400', flag:'' },
        ]},
        { name:'Comprehensive Metabolic Panel', results:[
          { comp:'Glucose', val:'142', unit:'mg/dL', range:'70-100', flag:'H' },
          { comp:'BUN', val:'18', unit:'mg/dL', range:'7-20', flag:'' },
          { comp:'Creatinine', val:'1.0', unit:'mg/dL', range:'0.7-1.3', flag:'' },
          { comp:'Sodium', val:'140', unit:'mEq/L', range:'136-145', flag:'' },
          { comp:'Potassium', val:'4.2', unit:'mEq/L', range:'3.5-5.0', flag:'' },
          { comp:'ALT', val:'28', unit:'U/L', range:'7-56', flag:'' },
          { comp:'AST', val:'24', unit:'U/L', range:'10-40', flag:'' },
        ]},
        { name:'HbA1c', results:[ { comp:'Hemoglobin A1c', val:'7.2', unit:'%', range:'<5.7', flag:'H' } ]},
        { name:'Lipid Panel', results:[
          { comp:'Total Cholesterol', val:'210', unit:'mg/dL', range:'<200', flag:'H' },
          { comp:'LDL', val:'135', unit:'mg/dL', range:'<100', flag:'H' },
          { comp:'HDL', val:'42', unit:'mg/dL', range:'>40', flag:'' },
          { comp:'Triglycerides', val:'165', unit:'mg/dL', range:'<150', flag:'H' },
        ]},
      ]},
      { id:'lab2', pid:'p2', orderDate:'2026-03-25', resultDate:'2026-03-27', orderedBy:'Dr. Chris L.', status:'Final', tests:[
        { name:'TSH', results:[ { comp:'TSH', val:'2.4', unit:'mIU/L', range:'0.4-4.0', flag:'' } ]},
        { name:'CBC', results:[
          { comp:'WBC', val:'6.5', unit:'K/uL', range:'4.5-11.0', flag:'' },
          { comp:'Hemoglobin', val:'13.2', unit:'g/dL', range:'12.0-16.0', flag:'' },
        ]},
      ]},
      { id:'lab3', pid:'p3', orderDate:'2026-03-20', resultDate:'2026-03-22', orderedBy:'Joseph', status:'Final', tests:[
        { name:'Hepatic Function Panel', results:[
          { comp:'ALT', val:'62', unit:'U/L', range:'7-56', flag:'H' },
          { comp:'AST', val:'55', unit:'U/L', range:'10-40', flag:'H' },
          { comp:'Alkaline Phosphatase', val:'95', unit:'U/L', range:'44-147', flag:'' },
          { comp:'Total Bilirubin', val:'1.1', unit:'mg/dL', range:'0.1-1.2', flag:'' },
          { comp:'Albumin', val:'3.8', unit:'g/dL', range:'3.5-5.5', flag:'' },
        ]},
        { name:'Urine Drug Screen', results:[
          { comp:'Amphetamines', val:'Negative', unit:'', range:'Negative', flag:'' },
          { comp:'Benzodiazepines', val:'Negative', unit:'', range:'Negative', flag:'' },
          { comp:'Cocaine', val:'Negative', unit:'', range:'Negative', flag:'' },
          { comp:'Opiates', val:'Negative', unit:'', range:'Negative', flag:'' },
          { comp:'THC', val:'Positive', unit:'', range:'Negative', flag:'A' },
          { comp:'Alcohol (EtOH)', val:'Negative', unit:'', range:'Negative', flag:'' },
        ]},
      ]},
    ];
    for (const lab of labResults) {
      insertLabResult.run(lab.id, lab.pid, lab.orderDate, lab.resultDate, lab.orderedBy, lab.status);
      for (const test of lab.tests) {
        const testId = uuidv4();
        insertLabTest.run(testId, lab.id, test.name);
        for (const r of test.results) {
          insertLabComp.run(uuidv4(), testId, r.comp, r.val, r.unit, r.range, r.flag);
        }
      }
    }

    // ── Assessments ──
    const assessments = [
      { id:'as1',pid:'p1',tool:'PHQ-9',score:14,interp:'Moderately Severe Depression',date:'2026-04-02',by:'Dr. Chris L.',answers:'[2,2,2,1,1,2,1,2,1]' },
      { id:'as2',pid:'p1',tool:'PHQ-9',score:18,interp:'Moderately Severe Depression',date:'2026-03-05',by:'Dr. Chris L.',answers:'[2,3,2,2,1,2,2,2,2]' },
      { id:'as3',pid:'p1',tool:'GAD-7',score:12,interp:'Moderate Anxiety',date:'2026-04-02',by:'Dr. Chris L.',answers:'[2,2,1,2,2,1,2]' },
      { id:'as4',pid:'p1',tool:'GAD-7',score:15,interp:'Severe Anxiety',date:'2026-03-05',by:'Dr. Chris L.',answers:'[3,2,2,2,2,2,2]' },
      { id:'as5',pid:'p1',tool:'Columbia Suicide Severity Rating',score:2,interp:'Low Risk',date:'2026-04-02',by:'Dr. Chris L.',answers:'[]' },
      { id:'as6',pid:'p2',tool:'PHQ-9',score:22,interp:'Severe Depression',date:'2026-04-05',by:'Dr. Chris L.',answers:'[3,3,3,2,2,3,2,2,2]' },
      { id:'as7',pid:'p2',tool:'PCL-5',score:52,interp:'Probable PTSD (cutoff: 31-33)',date:'2026-04-05',by:'Dr. Chris L.',answers:'[]' },
      { id:'as8',pid:'p2',tool:'Columbia Suicide Severity Rating',score:3,interp:'Moderate Risk',date:'2026-04-05',by:'Dr. Chris L.',answers:'[]' },
      { id:'as9',pid:'p2',tool:'GAD-7',score:18,interp:'Severe Anxiety',date:'2026-04-05',by:'Dr. Chris L.',answers:'[3,3,2,3,2,3,2]' },
      { id:'as10',pid:'p3',tool:'AUDIT-C',score:7,interp:'Positive for Alcohol Misuse',date:'2026-03-28',by:'Joseph',answers:'[]' },
      { id:'as11',pid:'p3',tool:'PHQ-9',score:8,interp:'Mild Depression',date:'2026-03-28',by:'Joseph',answers:'[1,1,1,1,1,1,1,0,1]' },
      { id:'as12',pid:'p3',tool:'DAST-10',score:3,interp:'Low Level Drug Use',date:'2026-03-28',by:'Joseph',answers:'[]' },
      { id:'as13',pid:'p4',tool:'ASRS v1.1',score:15,interp:'Highly Consistent with ADHD',date:'2026-04-07',by:'Joseph',answers:'[]' },
      { id:'as14',pid:'p4',tool:'GAD-7',score:10,interp:'Moderate Anxiety',date:'2026-04-07',by:'Joseph',answers:'[2,1,1,2,1,2,1]' },
      { id:'as15',pid:'p4',tool:'PHQ-9',score:6,interp:'Mild Depression',date:'2026-04-07',by:'Joseph',answers:'[1,1,0,1,1,1,0,0,1]' },
      { id:'as16',pid:'p5',tool:'PHQ-9',score:24,interp:'Severe Depression',date:'2026-03-20',by:'Dr. Chris L.',answers:'[3,3,3,3,2,3,3,2,2]' },
      { id:'as17',pid:'p5',tool:'MoCA',score:22,interp:'Mild Cognitive Impairment',date:'2026-03-20',by:'Dr. Chris L.',answers:'[]' },
      { id:'as18',pid:'p5',tool:'Columbia Suicide Severity Rating',score:4,interp:'High Risk',date:'2026-03-20',by:'Dr. Chris L.',answers:'[]' },
      { id:'as19',pid:'p5',tool:'GAD-7',score:19,interp:'Severe Anxiety',date:'2026-03-20',by:'Dr. Chris L.',answers:'[3,3,3,3,2,3,2]' },
      { id:'as20',pid:'p6',tool:'MDQ',score:9,interp:'Positive for Bipolar Spectrum',date:'2026-04-01',by:'Dr. Chris L.',answers:'[]' },
      { id:'as21',pid:'p6',tool:'PHQ-9',score:11,interp:'Moderate Depression',date:'2026-04-01',by:'Dr. Chris L.',answers:'[2,1,2,1,1,1,1,1,1]' },
      { id:'as22',pid:'p6',tool:'GAD-7',score:13,interp:'Moderate Anxiety',date:'2026-04-01',by:'Dr. Chris L.',answers:'[2,2,2,2,1,2,2]' },
    ];
    for (const a of assessments) insertAssessment.run(a.id, a.pid, a.tool, a.score, a.interp, a.date, a.by, a.answers);

    // ── Immunizations ──
    const immunizations = [
      { id:'imm1', pid:'p1', vaccine:'Influenza (Flu)', date:'2025-10-15', site:'Left Deltoid', route:'IM', lot:'FL2025-A1234', mfr:'Sanofi Pasteur', by:'Kelly Chen, RN', nextDue:'2026-10-01' },
      { id:'imm2', pid:'p1', vaccine:'COVID-19 (Updated 2025-2026)', date:'2025-09-20', site:'Right Deltoid', route:'IM', lot:'CV2526-B5678', mfr:'Pfizer-BioNTech', by:'Kelly Chen, RN', nextDue:'2026-09-01' },
      { id:'imm3', pid:'p1', vaccine:'Tdap', date:'2022-06-10', site:'Left Deltoid', route:'IM', lot:'TD2022-C9012', mfr:'GSK', by:'Kelly Chen, RN', nextDue:'2032-06-10' },
      { id:'imm4', pid:'p1', vaccine:'Hepatitis B (Series Complete)', date:'2020-03-15', site:'Right Deltoid', route:'IM', lot:'HB2020-D3456', mfr:'Merck', by:'External', nextDue:'Complete' },
      { id:'imm5', pid:'p2', vaccine:'Influenza (Flu)', date:'2025-11-01', site:'Left Deltoid', route:'IM', lot:'FL2025-E7890', mfr:'Sanofi Pasteur', by:'Kelly Chen, RN', nextDue:'2026-10-01' },
      { id:'imm6', pid:'p2', vaccine:'COVID-19 (Updated 2025-2026)', date:'2025-10-05', site:'Right Deltoid', route:'IM', lot:'CV2526-F1234', mfr:'Moderna', by:'Kelly Chen, RN', nextDue:'2026-09-01' },
      { id:'imm7', pid:'p3', vaccine:'Influenza (Flu)', date:'2025-10-20', site:'Left Deltoid', route:'IM', lot:'FL2025-G5678', mfr:'Sanofi Pasteur', by:'Kelly Chen, RN', nextDue:'2026-10-01' },
      { id:'imm8', pid:'p3', vaccine:'Pneumococcal (PCV20)', date:'2025-01-15', site:'Left Deltoid', route:'IM', lot:'PN2025-H9012', mfr:'Pfizer', by:'External', nextDue:'Complete' },
      { id:'imm9', pid:'p4', vaccine:'Influenza (Flu)', date:'2025-09-15', site:'Left Deltoid', route:'IM', lot:'FL2025-I3456', mfr:'Sanofi Pasteur', by:'Kelly Chen, RN', nextDue:'2026-10-01' },
      { id:'imm10', pid:'p4', vaccine:'HPV (Gardasil 9 - Series Complete)', date:'2019-03-20', site:'Right Deltoid', route:'IM', lot:'HPV2019-J7890', mfr:'Merck', by:'External', nextDue:'Complete' },
      { id:'imm11', pid:'p5', vaccine:'Influenza (Flu)', date:'2025-10-10', site:'Left Deltoid', route:'IM', lot:'FL2025-K1234', mfr:'Sanofi Pasteur', by:'Kelly Chen, RN', nextDue:'2026-10-01' },
      { id:'imm12', pid:'p5', vaccine:'Shingrix (Dose 2 of 2)', date:'2024-06-15', site:'Right Deltoid', route:'IM', lot:'SH2024-L5678', mfr:'GSK', by:'External', nextDue:'Complete' },
      { id:'imm13', pid:'p5', vaccine:'Pneumococcal (PCV20)', date:'2025-02-10', site:'Left Deltoid', route:'IM', lot:'PN2025-M9012', mfr:'Pfizer', by:'Kelly Chen, RN', nextDue:'Complete' },
      { id:'imm14', pid:'p6', vaccine:'Influenza (Flu)', date:'2025-11-05', site:'Left Deltoid', route:'IM', lot:'FL2025-N3456', mfr:'Sanofi Pasteur', by:'Kelly Chen, RN', nextDue:'2026-10-01' },
      { id:'imm15', pid:'p6', vaccine:'COVID-19 (Updated 2025-2026)', date:'2025-10-15', site:'Right Deltoid', route:'IM', lot:'CV2526-O7890', mfr:'Pfizer-BioNTech', by:'Kelly Chen, RN', nextDue:'2026-09-01' },
    ];
    for (const i of immunizations) insertImmunization.run(i.id, i.pid, i.vaccine, i.date, i.site, i.route, i.lot, i.mfr, i.by, i.nextDue);

    // ── Appointments ──
    const appointments = [
      { id:'apt1', pid:'p1', pName:'James Anderson', prov:'u1', provName:'Dr. Chris L.', date:'2026-04-09', time:'09:00', dur:30, type:'Follow-Up', status:'Checked In', reason:'Med management - depression/anxiety', vType:'In-Person', room:'Room 3' },
      { id:'apt2', pid:'p2', pName:'Maria Garcia', prov:'u1', provName:'Dr. Chris L.', date:'2026-04-09', time:'09:30', dur:60, type:'Follow-Up', status:'Scheduled', reason:'PTSD follow-up', vType:'Telehealth', room:'Virtual' },
      { id:'apt3', pid:'p4', pName:'Emily Chen', prov:'u2', provName:'Joseph', date:'2026-04-09', time:'10:00', dur:30, type:'Follow-Up', status:'Scheduled', reason:'ADHD follow-up', vType:'In-Person', room:'Room 1' },
      { id:'apt4', pid:'p6', pName:'Aisha Patel', prov:'u1', provName:'Dr. Chris L.', date:'2026-04-09', time:'10:30', dur:30, type:'Follow-Up', status:'Scheduled', reason:'Bipolar management', vType:'Telehealth', room:'Virtual' },
      { id:'apt5', pid:null, pName:'New Patient - Alex Rivera', prov:'u1', provName:'Dr. Chris L.', date:'2026-04-09', time:'11:00', dur:60, type:'New Patient', status:'Confirmed', reason:'Initial psych evaluation', vType:'In-Person', room:'Room 2' },
      { id:'apt6', pid:'p3', pName:'David Thompson', prov:'u2', provName:'Joseph', date:'2026-04-09', time:'11:00', dur:30, type:'Follow-Up', status:'Confirmed', reason:'AUD management', vType:'In-Person', room:'Room 4' },
      { id:'apt7', pid:'p5', pName:'Robert Wilson', prov:'u1', provName:'Dr. Chris L.', date:'2026-04-09', time:'13:00', dur:45, type:'Follow-Up', status:'Confirmed', reason:'Depression/anxiety, cognitive decline', vType:'In-Person', room:'Room 3' },
      { id:'apt8', pid:null, pName:'New Patient - Jordan Taylor', prov:'u2', provName:'Joseph', date:'2026-04-09', time:'14:00', dur:60, type:'New Patient', status:'Confirmed', reason:'Initial evaluation - OCD', vType:'Telehealth', room:'Virtual' },
      { id:'apt9', pid:'p1', pName:'James Anderson', prov:'u1', provName:'Dr. Chris L.', date:'2026-04-11', time:'09:00', dur:30, type:'Follow-Up', status:'Scheduled', reason:'Lab review', vType:'Telehealth', room:'Virtual' },
      { id:'apt10', pid:'p2', pName:'Maria Garcia', prov:'u1', provName:'Dr. Chris L.', date:'2026-04-14', time:'10:00', dur:60, type:'Follow-Up', status:'Scheduled', reason:'PTSD re-assessment', vType:'In-Person', room:'Room 2' },
      { id:'apt11', pid:'p6', pName:'Aisha Patel', prov:'u1', provName:'Dr. Chris L.', date:'2026-04-16', time:'11:00', dur:30, type:'Follow-Up', status:'Scheduled', reason:'Lamotrigine check', vType:'In-Person', room:'Room 3' },
      { id:'apt12', pid:'p3', pName:'David Thompson', prov:'u2', provName:'Joseph', date:'2026-04-18', time:'14:00', dur:30, type:'Follow-Up', status:'Scheduled', reason:'AUD follow-up', vType:'In-Person', room:'Room 1' },
      { id:'apt13', pid:'p4', pName:'Emily Chen', prov:'u2', provName:'Joseph', date:'2026-04-21', time:'09:30', dur:30, type:'Follow-Up', status:'Scheduled', reason:'ADHD check-in', vType:'Telehealth', room:'Virtual' },
      { id:'apt14', pid:'p5', pName:'Robert Wilson', prov:'u1', provName:'Dr. Chris L.', date:'2026-04-23', time:'13:00', dur:45, type:'Follow-Up', status:'Scheduled', reason:'Cognitive decline follow-up', vType:'In-Person', room:'Room 3' },
      { id:'apt15', pid:null, pName:'New Patient - Sarah Kim', prov:'u1', provName:'Dr. Chris L.', date:'2026-04-25', time:'10:00', dur:60, type:'New Patient', status:'Scheduled', reason:'Postpartum depression', vType:'In-Person', room:'Room 2' },
      { id:'apt16', pid:'p1', pName:'James Anderson', prov:'u1', provName:'Dr. Chris L.', date:'2026-04-28', time:'09:00', dur:30, type:'Follow-Up', status:'Scheduled', reason:'Sertraline dose check', vType:'In-Person', room:'Room 3' },
    ];
    for (const a of appointments) insertAppointment.run(a.id, a.pid, a.pName, a.prov, a.provName, a.date, a.time, a.dur, a.type, a.status, a.reason, a.vType, a.room);

    // ── Encounters ──
    const encounters = [
      { id:'enc-hist-1', pid:'p1', date:'2026-03-12', time:'09:15', provider:'Elena Martinez', providerName:'Dr. Chris L.', credentials:'MD, PhD', visitType:'Follow-Up', cptCode:'99214', icdCode:'F33.1', reason:'Med management', duration:'28 min', chiefComplaint:'Persistent low mood', hpi:'Mr. Anderson returns for follow-up of MDD and GAD. Partial improvement on Sertraline 100mg.', intervalNote:'Mood improved from 3/10 to 5/10.', mse:'Cooperative, restricted affect, linear thought process, no SI/HI.', assessment:'MDD partial response to Sertraline 100mg.', plan:'1. Increase Sertraline to 150mg\n2. Continue Trazodone 50mg\n3. Return in 4 weeks', safety:{ si:'None', hi:'None', sh:0, su:0, spu:0, cr:0, notes:'' }, followUp:'4 Weeks', disposition:'Stable' },
      { id:'enc-hist-2', pid:'p1', date:'2026-02-14', time:'09:00', provider:'Elena Martinez', providerName:'Dr. Chris L.', credentials:'MD, PhD', visitType:'Follow-Up', cptCode:'99214', icdCode:'F33.1', reason:'Med management', duration:'32 min', chiefComplaint:'Worsening mood', hpi:'Worsening depressive symptoms. PHQ-9 increased from 10 to 16.', intervalNote:'Mood declined, sleep disrupted, weight loss 5 lbs.', mse:'Psychomotor slowing, soft speech, constricted affect, tearful.', assessment:'MDD worsening on Sertraline 50mg.', plan:'1. Increase Sertraline to 100mg\n2. Add Trazodone 50mg\n3. Return in 4 weeks', safety:{ si:'None', hi:'None', sh:0, su:0, spu:0, cr:0, notes:'' }, followUp:'4 Weeks', disposition:'Stable' },
      { id:'enc-hist-3', pid:'p2', date:'2026-03-25', time:'10:00', provider:'Elena Martinez', providerName:'Dr. Chris L.', credentials:'MD, PhD', visitType:'Follow-Up', cptCode:'99215', icdCode:'F43.10', reason:'PTSD follow-up', duration:'52 min', chiefComplaint:'Increased nightmares', hpi:'Anniversary reaction. Nightmares 4-5/week.', intervalNote:'Hypervigilance worsened, social isolation increasing.', mse:'Hypervigilant, anxious, tearful discussing nightmares.', assessment:'PTSD with anniversary reaction.', plan:'1. Increase Prazosin to 4mg QHS\n2. Continue Sertraline 150mg\n3. Continue PE therapy\n4. Return in 3 weeks', safety:{ si:'None', hi:'None', sh:0, su:0, spu:1, cr:1, notes:'Crisis line reviewed. Safety plan updated.' }, followUp:'3 Weeks', disposition:'Stable with symptom exacerbation' },
      { id:'enc-hist-4', pid:'p4', date:'2026-03-15', time:'14:00', provider:'Michael Johnson', providerName:'Joseph', credentials:'PMHNP-BC', visitType:'Follow-Up', cptCode:'99214', icdCode:'F90.0', reason:'ADHD follow-up', duration:'25 min', chiefComplaint:'Medication refill', hpi:'Good response to Adderall XR 20mg.', intervalNote:'Grades improved, appetite slightly decreased.', mse:'Well-groomed, cooperative, full range affect.', assessment:'ADHD well controlled on Adderall XR 20mg.', plan:'1. Continue Adderall XR 20mg\n2. Monitor weight\n3. Return in 3 months', safety:{ si:'None', hi:'None', sh:0, su:0, spu:0, cr:0, notes:'' }, followUp:'3 Months', disposition:'Stable' },
    ];
    for (const e of encounters) {
      insertEncounter.run(e.id, e.pid, e.date, e.time, e.provider, e.providerName, e.credentials, e.visitType, e.cptCode, e.icdCode, e.reason, e.duration, e.chiefComplaint, e.hpi, e.intervalNote, e.mse, e.assessment, e.plan, e.safety.si, e.safety.hi, e.safety.sh, e.safety.su, e.safety.spu, e.safety.cr, e.safety.notes, e.followUp, e.disposition);
    }

    // ── Inbox Messages ──
    const inboxMessages = [
      { id:'msg1', type:'Rx Refill Request', from:'CVS Pharmacy - Main St', to:'u1', pid:'p1', pName:'James Anderson', subject:'Refill Request: Sertraline 100mg', body:'Patient requesting refill of Sertraline 100mg #90. 0 refills remaining.', date:'2026-04-08', time:'09:15', read:0, priority:'Normal', status:'Pending', urgent:0 },
      { id:'msg2', type:'Lab Result', from:'Quest Diagnostics', to:'u1', pid:'p1', pName:'James Anderson', subject:'Lab Results Ready: CBC, CMP, HbA1c', body:'Lab results are now available for review.', date:'2026-04-08', time:'08:30', read:0, priority:'Normal', status:'Pending', urgent:0 },
      { id:'msg3', type:'Patient Message', from:'Maria Garcia', to:'u1', pid:'p2', pName:'Maria Garcia', subject:'Medication Side Effects', body:'Experiencing dizziness and headaches since starting Prazosin.', date:'2026-04-07', time:'16:45', read:0, priority:'High', status:'Pending', urgent:0 },
      { id:'msg4', type:'Prior Authorization', from:'Aetna Insurance', to:'u1', pid:'p2', pName:'Maria Garcia', subject:'PA Required: Brain MRI w/o contrast', body:'Prior authorization required for Brain MRI.', date:'2026-04-07', time:'14:20', read:1, priority:'High', status:'In Progress', urgent:0 },
      { id:'msg5', type:'Rx Refill Request', from:'CVS Pharmacy - College Ave', to:'u2', pid:'p4', pName:'Emily Chen', subject:'Refill Request: Adderall XR 20mg (Schedule II)', body:'Schedule II - requires new prescription.', date:'2026-04-08', time:'10:00', read:0, priority:'High', status:'Pending', urgent:0 },
      { id:'msg6', type:'Staff Message', from:'Sarah Williams (Front Desk)', to:'u1', pid:null, pName:null, subject:'Schedule Change Request', body:'Patient Robert Wilson requesting to move appointment.', date:'2026-04-08', time:'08:00', read:0, priority:'Normal', status:'Pending', urgent:0 },
      { id:'msg7', type:'Patient Message', from:'David Thompson', to:'u2', pid:'p3', pName:'David Thompson', subject:'Missed Dose Question', body:'Missed Naltrexone yesterday. Should I take double dose?', date:'2026-04-08', time:'07:30', read:0, priority:'Normal', status:'Pending', urgent:0 },
      { id:'msg8', type:'Referral Update', from:'Dr. Sarah Kim, PhD (EMDR)', to:'u1', pid:'p2', pName:'Maria Garcia', subject:'Referral Accepted - EMDR Therapy', body:'First appointment scheduled for 04/15/2026.', date:'2026-04-06', time:'11:30', read:1, priority:'Normal', status:'Completed', urgent:0 },
      { id:'msg9', type:'Check-in Alert', from:'System', to:'u3', pid:'p1', pName:'James Anderson', subject:'Patient Checked In - 10:00 AM Appointment', body:'James Anderson has checked in. Insurance verified. Copay: $30 collected.', date:'2026-04-09', time:'09:45', read:0, priority:'Normal', status:'Pending', urgent:0 },
      { id:'msg10', type:'Insurance Alert', from:'System', to:'u3', pid:'p3', pName:'David Thompson', subject:'Insurance Eligibility Failed', body:'United Healthcare eligibility check failed.', date:'2026-04-08', time:'16:00', read:0, priority:'High', status:'Pending', urgent:0 },
    ];
    for (const m of inboxMessages) insertInbox.run(m.id, m.type, m.from, m.to, m.pid, m.pName, m.subject, m.body, m.date, m.time, m.read, m.priority, m.status, m.urgent);

    // ── Smart Phrases ──
    const smartPhrases = [
      { id:'sp1', trigger:'.mentalstatusexam', name:'Mental Status Exam - Normal', category:'Exam', content:'MENTAL STATUS EXAMINATION:\nAppearance: Well-groomed, appropriately dressed\nBehavior: Cooperative, good eye contact\nSpeech: Normal rate, rhythm, and volume\nMood: "Good"\nAffect: Euthymic, congruent, full range\nThought Process: Linear, logical, goal-directed\nThought Content: No SI/HI, no hallucinations, no delusions\nCognition: Alert and oriented x4\nInsight: Good\nJudgment: Good\nMemory: Intact' },
      { id:'sp2', trigger:'.mseneg', name:'Mental Status Exam - Depressed', category:'Exam', content:'MENTAL STATUS EXAMINATION:\nAppearance: Casually dressed, fair hygiene, appears fatigued\nBehavior: Cooperative, psychomotor retardation, decreased eye contact\nSpeech: Decreased rate and volume\nMood: "Depressed"\nAffect: Dysphoric, constricted, tearful\nThought Process: Linear but slowed\nThought Content: Endorses passive SI without plan or intent. Denies HI. No hallucinations.\nCognition: Alert and oriented x4\nInsight: Fair\nJudgment: Fair\nMemory: Intact' },
      { id:'sp3', trigger:'.mseanx', name:'Mental Status Exam - Anxious', category:'Exam', content:'MENTAL STATUS EXAMINATION:\nAppearance: Appropriately dressed, appears tense\nBehavior: Cooperative, restless, fidgeting\nSpeech: Pressured rate, normal volume\nMood: "Anxious"\nAffect: Anxious, restricted range\nThought Process: Linear, occasionally tangential\nThought Content: Excessive worry. Denies SI/HI. No hallucinations.\nCognition: Alert and oriented x4\nInsight: Good\nJudgment: Good\nMemory: Intact' },
      { id:'sp4', trigger:'.safetyplan', name:'Safety Plan', category:'Clinical', content:'SAFETY PLAN:\n1. Warning Signs: []\n2. Internal Coping Strategies: []\n3. Social Settings for Distraction: []\n4. People I Can Ask for Help: []\n5. Professionals/Agencies: 988 Suicide & Crisis Lifeline\n6. Making Environment Safe: []\n7. Reasons for Living: []' },
      { id:'sp5', trigger:'.followupmh', name:'Follow Up - Mental Health', category:'Plan', content:'PLAN:\n1. Continue current medication regimen\n2. Return in [4/6/8/12] weeks\n3. Continue therapy\n4. Call clinic or ER if worsening symptoms\n5. Safety plan and crisis resources reviewed\n6. Labs ordered: []\n7. Medication changes: []\n8. Referrals: []' },
      { id:'sp6', trigger:'.initialpsych', name:'Initial Psychiatric Evaluation Template', category:'Note', content:'PSYCHIATRIC EVALUATION\n\nCHIEF COMPLAINT: []\nHISTORY OF PRESENT ILLNESS: []\nPAST PSYCHIATRIC HISTORY: []\nSUBSTANCE USE HISTORY: []\nFAMILY PSYCHIATRIC HISTORY: []\nSOCIAL HISTORY: []\nMEDICAL HISTORY: []\nMENTAL STATUS EXAMINATION: []\nASSESSMENT: []\nDIAGNOSES: []\nPLAN: []' },
      { id:'sp7', trigger:'.progressnote', name:'Progress Note Template', category:'Note', content:'FOLLOW-UP PSYCHIATRIC NOTE\n\nSubjective: []\nObjective: []\nAssessment: []\nPlan: []' },
      { id:'sp8', trigger:'.telehealthnote', name:'Telehealth Note Header', category:'Note', content:'TELEHEALTH VISIT NOTE\nVisit Type: Audio/Video Telehealth\nPlatform: MindCare Telehealth (HIPAA-compliant)\nConsent: Informed consent obtained' },
      { id:'sp9', trigger:'.controlledsubstance', name:'Controlled Substance Agreement Note', category:'Clinical', content:'CONTROLLED SUBSTANCE MANAGEMENT:\n- Agreement reviewed: [Y/N]\n- PDMP checked: [Date]\n- Last UDS: [Date]\n- Risk assessment: [Low/Moderate/High]\n- Medication: []\n- Next PDMP check: []\n- Next UDS: []' },
      { id:'sp10', trigger:'.suiciderisk', name:'Suicide Risk Assessment', category:'Clinical', content:'SUICIDE RISK ASSESSMENT:\nC-SSRS administered.\nRisk Level: [None/Low/Moderate/High/Imminent]\nProtective Factors: []\nRisk Factors: []\nSafety Plan: [Reviewed/Created/Updated]\nDisposition: []' },
    ];
    for (const sp of smartPhrases) insertSmartPhrase.run(sp.id, sp.trigger, sp.name, sp.category, sp.content);

    // ── Staff Channels ──
    const channels = [
      { id: 'ch-general', name: 'General', type: 'channel' },
      { id: 'ch-clinical', name: 'Clinical', type: 'channel' },
      { id: 'ch-urgent', name: 'Urgent', type: 'channel' },
      { id: 'ch-frontdesk', name: 'Front Desk', type: 'channel' },
      { id: 'ch-teaching', name: 'Teaching', type: 'channel' },
      { id: 'ch-pharmacy', name: 'Pharmacy', type: 'channel' },
    ];
    for (const ch of channels) insertChannel.run(ch.id, ch.name, ch.type);

    // ── BTG Audit Log (sample entries) ──
    insertBtgLog.run(uuidv4(), 'p5', 'Robert Wilson', 'u1', 'Dr. Chris L.', 'Patient called in crisis, need immediate access to chart for safety assessment', '2026-03-20T15:30:00Z', 1);
    insertBtgLog.run(uuidv4(), 'p6', 'Aisha Patel', 'u1', 'Dr. Chris L.', 'Scheduled follow-up visit, needed to review chart for bipolar management', '2026-04-01T10:00:00Z', 1);

    // ── Medication Database (sample of key psychiatric meds) ──
    const medDb = [
      { name:'Sertraline (Zoloft)', cls:'SSRI', doses:['25mg','50mg','100mg','150mg','200mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Fluoxetine (Prozac)', cls:'SSRI', doses:['10mg','20mg','40mg','60mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Escitalopram (Lexapro)', cls:'SSRI', doses:['5mg','10mg','20mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Paroxetine (Paxil)', cls:'SSRI', doses:['10mg','20mg','30mg','40mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Citalopram (Celexa)', cls:'SSRI', doses:['10mg','20mg','40mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Venlafaxine XR (Effexor XR)', cls:'SNRI', doses:['37.5mg','75mg','150mg','225mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Duloxetine (Cymbalta)', cls:'SNRI', doses:['20mg','30mg','60mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Bupropion XL (Wellbutrin XL)', cls:'Atypical Antidepressant', doses:['150mg','300mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Mirtazapine (Remeron)', cls:'Atypical Antidepressant', doses:['7.5mg','15mg','30mg','45mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Trazodone', cls:'SARI', doses:['25mg','50mg','100mg','150mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Buspirone', cls:'Anxiolytic', doses:['5mg','10mg','15mg','30mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Hydroxyzine', cls:'Antihistamine/Anxiolytic', doses:['10mg','25mg','50mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Lorazepam (Ativan)', cls:'Benzodiazepine', doses:['0.5mg','1mg','2mg'], routes:['Oral','IM','IV'], ctrl:1, sched:'Schedule IV' },
      { name:'Alprazolam (Xanax)', cls:'Benzodiazepine', doses:['0.25mg','0.5mg','1mg','2mg'], routes:['Oral'], ctrl:1, sched:'Schedule IV' },
      { name:'Clonazepam (Klonopin)', cls:'Benzodiazepine', doses:['0.25mg','0.5mg','1mg','2mg'], routes:['Oral'], ctrl:1, sched:'Schedule IV' },
      { name:'Diazepam (Valium)', cls:'Benzodiazepine', doses:['2mg','5mg','10mg'], routes:['Oral','IV','IM'], ctrl:1, sched:'Schedule IV' },
      { name:'Adderall XR (Amphetamine/Dextroamphetamine)', cls:'Stimulant', doses:['5mg','10mg','15mg','20mg','25mg','30mg'], routes:['Oral'], ctrl:1, sched:'Schedule II' },
      { name:'Methylphenidate ER (Concerta)', cls:'Stimulant', doses:['18mg','27mg','36mg','54mg'], routes:['Oral'], ctrl:1, sched:'Schedule II' },
      { name:'Lisdexamfetamine (Vyvanse)', cls:'Stimulant', doses:['20mg','30mg','40mg','50mg','60mg','70mg'], routes:['Oral'], ctrl:1, sched:'Schedule II' },
      { name:'Lithium Carbonate', cls:'Mood Stabilizer', doses:['150mg','300mg','600mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Lamotrigine (Lamictal)', cls:'Mood Stabilizer/Anticonvulsant', doses:['25mg','50mg','100mg','150mg','200mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Valproic Acid (Depakote)', cls:'Mood Stabilizer/Anticonvulsant', doses:['250mg','500mg','750mg','1000mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Quetiapine (Seroquel)', cls:'Atypical Antipsychotic', doses:['25mg','50mg','100mg','200mg','300mg','400mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Aripiprazole (Abilify)', cls:'Atypical Antipsychotic', doses:['2mg','5mg','10mg','15mg','20mg','30mg'], routes:['Oral','IM'], ctrl:0, sched:'' },
      { name:'Risperidone (Risperdal)', cls:'Atypical Antipsychotic', doses:['0.25mg','0.5mg','1mg','2mg','3mg','4mg'], routes:['Oral','IM'], ctrl:0, sched:'' },
      { name:'Olanzapine (Zyprexa)', cls:'Atypical Antipsychotic', doses:['2.5mg','5mg','10mg','15mg','20mg'], routes:['Oral','IM'], ctrl:0, sched:'' },
      { name:'Naltrexone', cls:'Opioid Antagonist', doses:['25mg','50mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Prazosin', cls:'Alpha-1 Blocker', doses:['1mg','2mg','5mg','10mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Donepezil (Aricept)', cls:'Cholinesterase Inhibitor', doses:['5mg','10mg','23mg'], routes:['Oral'], ctrl:0, sched:'' },
      { name:'Metformin', cls:'Biguanide', doses:['500mg','850mg','1000mg'], routes:['Oral'], ctrl:0, sched:'' },
    ];
    for (const m of medDb) {
      insertMedDb.run(uuidv4(), m.name, m.cls, JSON.stringify(m.doses), JSON.stringify(m.routes), m.ctrl, m.sched);
    }

    console.log('  Seeded users, patients, allergies, problems, vitals, medications,');
    console.log('  orders, labs, assessments, immunizations, appointments, encounters,');
    console.log('  inbox messages, smart phrases, channels, BTG log, medication database.');
  });

  transaction();
  console.log('Database seeding complete!');
}

// Run directly
seed().catch(err => { console.error(err); process.exit(1); });
