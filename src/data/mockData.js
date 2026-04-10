// Mock data for the entire EHR system
import { v4 as uuidv4 } from 'uuid';

// ========== USERS & AUTH ==========
export const users = [
  {
    id: 'u1',
    username: 'dr.chris',
    password: 'Pass123!',
    firstName: 'Chris',
    lastName: 'L.',
    role: 'prescriber',
    credentials: 'MD, PhD',
    specialty: 'Psychiatry',
    npi: '1234567890',
    deaNumber: 'FM1234567',
    email: 'chris.l@mindcare.health',
    epcsPin: '9921',
    twoFactorEnabled: true,
  },
  {
    id: 'u2',
    username: 'np.joseph',
    password: 'Pass123!',
    firstName: 'Joseph',
    lastName: '',
    role: 'prescriber',
    credentials: 'PMHNP-BC',
    specialty: 'Psychiatric Mental Health',
    npi: '0987654321',
    deaNumber: 'FJ9876543',
    email: 'joseph@mindcare.health',
    epcsPin: '4456',
    twoFactorEnabled: true,
  },
  {
    id: 'u3',
    username: 'irina.s',
    password: 'Pass123!',
    firstName: 'Irina',
    lastName: 'S.',
    role: 'prescriber',
    credentials: 'MD',
    specialty: 'Psychiatry',
    npi: '1122334455',
    deaNumber: 'FS1122334',
    email: 'irina.s@mindcare.health',
    epcsPin: '7743',
    twoFactorEnabled: true,
  },
  {
    id: 'u4',
    username: 'nurse.kelly',
    password: 'Pass123!',
    firstName: 'Kelly',
    lastName: 'Chen',
    role: 'nurse',
    credentials: 'RN',
    specialty: 'Behavioral Health',
    npi: '',
    email: 'kelly.chen@mindcare.health',
  },
  {
    id: 'u5',
    username: 'admin',
    password: 'Pass123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    credentials: '',
    specialty: '',
    npi: '',
    email: 'admin@mindcare.health',
  },

  // ── Patient portal accounts ──────────────────────────────────
  { id: 'pat-p1', username: 'james.anderson', password: 'Patient1!', firstName: 'James', lastName: 'Anderson', role: 'patient', patientId: 'p1', email: 'james.anderson@email.com' },
  { id: 'pat-p2', username: 'maria.garcia',   password: 'Patient1!', firstName: 'Maria', lastName: 'Garcia',   role: 'patient', patientId: 'p2', email: 'maria.garcia@email.com' },
  { id: 'pat-p3', username: 'robert.chen',    password: 'Patient1!', firstName: 'Robert', lastName: 'Chen',   role: 'patient', patientId: 'p3', email: 'robert.chen@email.com' },
  { id: 'pat-p4', username: 'ashley.kim',     password: 'Patient1!', firstName: 'Ashley', lastName: 'Kim',    role: 'patient', patientId: 'p4', email: 'ashley.kim@email.com' },
  { id: 'pat-p5', username: 'dorothy.wilson', password: 'Patient1!', firstName: 'Dorothy', lastName: 'Wilson', role: 'patient', patientId: 'p5', email: 'dorothy.wilson@email.com' },
  { id: 'pat-p6', username: 'marcus.brown',   password: 'Patient1!', firstName: 'Marcus', lastName: 'Brown',  role: 'patient', patientId: 'p6', email: 'marcus.brown@email.com' },
];

// ========== PATIENTS ==========
export const patients = [
  {
    id: 'p1',
    mrn: 'MRN-00001',
    firstName: 'James',
    lastName: 'Anderson',
    dob: '1985-03-15',
    age: 41,
    gender: 'Male',
    pronouns: 'He/Him',
    ssn: '***-**-4521',
    race: 'White',
    ethnicity: 'Non-Hispanic',
    language: 'English',
    maritalStatus: 'Married',
    phone: '(555) 234-5678',
    cellPhone: '(555) 987-6543',
    email: 'james.anderson@email.com',
    address: {
      street: '1234 Oak Avenue',
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
    },
    emergencyContact: {
      name: 'Lisa Anderson',
      relationship: 'Spouse',
      phone: '(555) 234-5679',
    },
    insurance: {
      primary: {
        name: 'Blue Cross Blue Shield',
        memberId: 'BCB123456789',
        groupNumber: 'GRP-5500',
        copay: 30,
      },
      secondary: null,
    },
    pcp: 'Dr. Robert Smith',
    assignedProvider: 'u1',
    photo: null,
    isBTG: false,
    isActive: true,
    lastVisit: '2026-04-02',
    nextAppointment: '2026-04-10',
    flags: ['Fall Risk'],
  },
  {
    id: 'p2',
    mrn: 'MRN-00002',
    firstName: 'Maria',
    lastName: 'Garcia',
    dob: '1992-07-22',
    age: 33,
    gender: 'Female',
    pronouns: 'She/Her',
    ssn: '***-**-8834',
    race: 'Hispanic',
    ethnicity: 'Hispanic/Latino',
    language: 'Spanish',
    maritalStatus: 'Single',
    phone: '(555) 345-6789',
    cellPhone: '(555) 876-5432',
    email: 'maria.garcia@email.com',
    address: {
      street: '5678 Pine Street',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
    },
    emergencyContact: {
      name: 'Carlos Garcia',
      relationship: 'Brother',
      phone: '(555) 345-6780',
    },
    insurance: {
      primary: {
        name: 'Aetna',
        memberId: 'AET987654321',
        groupNumber: 'GRP-8800',
        copay: 25,
      },
      secondary: null,
    },
    pcp: 'Dr. Jennifer Lee',
    assignedProvider: 'u1',
    photo: null,
    isBTG: false,
    isActive: true,
    lastVisit: '2026-04-05',
    nextAppointment: '2026-04-12',
    flags: ['Suicide Risk - Monitor'],
  },
  {
    id: 'p3',
    mrn: 'MRN-00003',
    firstName: 'David',
    lastName: 'Thompson',
    dob: '1978-11-08',
    age: 47,
    gender: 'Male',
    pronouns: 'He/Him',
    ssn: '***-**-2267',
    race: 'African American',
    ethnicity: 'Non-Hispanic',
    language: 'English',
    maritalStatus: 'Divorced',
    phone: '(555) 456-7890',
    cellPhone: '(555) 765-4321',
    email: 'david.thompson@email.com',
    address: {
      street: '9012 Elm Drive',
      city: 'Springfield',
      state: 'IL',
      zip: '62702',
    },
    emergencyContact: {
      name: 'Patricia Thompson',
      relationship: 'Mother',
      phone: '(555) 456-7891',
    },
    insurance: {
      primary: {
        name: 'United Healthcare',
        memberId: 'UHC456789012',
        groupNumber: 'GRP-3300',
        copay: 40,
      },
      secondary: {
        name: 'Medicaid',
        memberId: 'MCD789012345',
        groupNumber: '',
        copay: 0,
      },
    },
    pcp: 'Dr. William Davis',
    assignedProvider: 'u2',
    photo: null,
    isBTG: false,
    isActive: true,
    lastVisit: '2026-03-28',
    nextAppointment: '2026-04-15',
    flags: ['Substance Use History', 'Controlled Substance Agreement'],
  },
  {
    id: 'p4',
    mrn: 'MRN-00004',
    firstName: 'Emily',
    lastName: 'Chen',
    dob: '2001-01-30',
    age: 25,
    gender: 'Female',
    pronouns: 'She/Her',
    ssn: '***-**-9912',
    race: 'Asian',
    ethnicity: 'Non-Hispanic',
    language: 'English',
    maritalStatus: 'Single',
    phone: '(555) 567-8901',
    cellPhone: '(555) 654-3210',
    email: 'emily.chen@email.com',
    address: {
      street: '3456 Maple Court',
      city: 'Springfield',
      state: 'IL',
      zip: '62703',
    },
    emergencyContact: {
      name: 'Wei Chen',
      relationship: 'Father',
      phone: '(555) 567-8902',
    },
    insurance: {
      primary: {
        name: 'Cigna',
        memberId: 'CIG321654987',
        groupNumber: 'GRP-7700',
        copay: 20,
      },
      secondary: null,
    },
    pcp: 'Dr. Susan Park',
    assignedProvider: 'u2',
    photo: null,
    isBTG: false,
    isActive: true,
    lastVisit: '2026-04-07',
    nextAppointment: '2026-04-14',
    flags: [],
  },
  {
    id: 'p5',
    mrn: 'MRN-00005',
    firstName: 'Robert',
    lastName: 'Wilson',
    dob: '1965-09-12',
    age: 60,
    gender: 'Male',
    pronouns: 'He/Him',
    ssn: '***-**-5548',
    race: 'White',
    ethnicity: 'Non-Hispanic',
    language: 'English',
    maritalStatus: 'Widowed',
    phone: '(555) 678-9012',
    cellPhone: '(555) 543-2109',
    email: 'robert.wilson@email.com',
    address: {
      street: '7890 Cedar Lane',
      city: 'Springfield',
      state: 'IL',
      zip: '62705',
    },
    emergencyContact: {
      name: 'Karen Wilson',
      relationship: 'Daughter',
      phone: '(555) 678-9013',
    },
    insurance: {
      primary: {
        name: 'Medicare',
        memberId: 'MCR567890123',
        groupNumber: '',
        copay: 0,
      },
      secondary: {
        name: 'AARP Supplemental',
        memberId: 'AARP123456',
        groupNumber: 'GRP-SUP',
        copay: 0,
      },
    },
    pcp: 'Dr. Thomas Brown',
    assignedProvider: 'u1',
    photo: null,
    isBTG: true,
    isActive: true,
    lastVisit: '2026-03-20',
    nextAppointment: '2026-04-18',
    flags: ['VIP', 'BTG Protected'],
  },
  {
    id: 'p6',
    mrn: 'MRN-00006',
    firstName: 'Aisha',
    lastName: 'Patel',
    dob: '1990-05-18',
    age: 35,
    gender: 'Female',
    pronouns: 'She/Her',
    ssn: '***-**-3376',
    race: 'Asian',
    ethnicity: 'Non-Hispanic',
    language: 'English',
    maritalStatus: 'Married',
    phone: '(555) 789-0123',
    cellPhone: '(555) 432-1098',
    email: 'aisha.patel@email.com',
    address: {
      street: '2345 Birch Road',
      city: 'Springfield',
      state: 'IL',
      zip: '62706',
    },
    emergencyContact: {
      name: 'Raj Patel',
      relationship: 'Spouse',
      phone: '(555) 789-0124',
    },
    insurance: {
      primary: {
        name: 'Anthem',
        memberId: 'ANT654987321',
        groupNumber: 'GRP-4400',
        copay: 35,
      },
      secondary: null,
    },
    pcp: 'Dr. Michelle Taylor',
    assignedProvider: 'u1',
    photo: null,
    isBTG: true,
    isActive: true,
    lastVisit: '2026-04-01',
    nextAppointment: '2026-04-20',
    flags: ['BTG Protected', 'Interpreter Needed - Hindi'],
  },
];

// ========== ALLERGIES ==========
export const allergies = {
  p1: [
    { id: 'a1', allergen: 'Penicillin', type: 'Medication', reaction: 'Hives, Anaphylaxis', severity: 'Severe', status: 'Active', onsetDate: '2005-06-15', source: 'Patient Reported' },
    { id: 'a2', allergen: 'Sulfa Drugs', type: 'Medication', reaction: 'Rash', severity: 'Moderate', status: 'Active', onsetDate: '2010-03-20', source: 'Clinician Verified' },
    { id: 'a3', allergen: 'Latex', type: 'Environmental', reaction: 'Contact Dermatitis', severity: 'Mild', status: 'Active', onsetDate: '2015-01-10', source: 'Patient Reported' },
  ],
  p2: [
    { id: 'a4', allergen: 'Codeine', type: 'Medication', reaction: 'Nausea, Vomiting', severity: 'Moderate', status: 'Active', onsetDate: '2018-09-05', source: 'Patient Reported' },
    { id: 'a5', allergen: 'Shellfish', type: 'Food', reaction: 'Throat Swelling', severity: 'Severe', status: 'Active', onsetDate: '2012-12-25', source: 'Clinician Verified' },
  ],
  p3: [
    { id: 'a6', allergen: 'No Known Drug Allergies (NKDA)', type: 'None', reaction: '', severity: '', status: 'Active', onsetDate: '', source: 'Patient Reported' },
  ],
  p4: [
    { id: 'a7', allergen: 'Ibuprofen', type: 'Medication', reaction: 'GI Bleeding', severity: 'Severe', status: 'Active', onsetDate: '2022-04-18', source: 'Clinician Verified' },
    { id: 'a8', allergen: 'Peanuts', type: 'Food', reaction: 'Anaphylaxis', severity: 'Severe', status: 'Active', onsetDate: '2001-01-30', source: 'Patient Reported' },
    { id: 'a9', allergen: 'Dust Mites', type: 'Environmental', reaction: 'Rhinitis, Asthma', severity: 'Moderate', status: 'Active', onsetDate: '2015-07-01', source: 'Patient Reported' },
  ],
  p5: [
    { id: 'a10', allergen: 'Lisinopril', type: 'Medication', reaction: 'Angioedema', severity: 'Severe', status: 'Active', onsetDate: '2019-11-30', source: 'Clinician Verified' },
  ],
  p6: [
    { id: 'a11', allergen: 'Aspirin', type: 'Medication', reaction: 'Bronchospasm', severity: 'Moderate', status: 'Active', onsetDate: '2020-02-14', source: 'Patient Reported' },
    { id: 'a12', allergen: 'Bee Stings', type: 'Environmental', reaction: 'Anaphylaxis', severity: 'Severe', status: 'Active', onsetDate: '2008-08-22', source: 'Clinician Verified' },
  ],
};

// ========== PROBLEM LIST ==========
export const problems = {
  p1: [
    { id: 'pr1', code: 'F33.1', description: 'Major Depressive Disorder, Recurrent, Moderate', status: 'Active', onsetDate: '2020-01-15', diagnosedBy: 'Dr. Chris L.' },
    { id: 'pr2', code: 'F41.1', description: 'Generalized Anxiety Disorder', status: 'Active', onsetDate: '2020-01-15', diagnosedBy: 'Dr. Chris L.' },
    { id: 'pr3', code: 'G47.00', description: 'Insomnia, Unspecified', status: 'Active', onsetDate: '2021-06-10', diagnosedBy: 'Dr. Chris L.' },
    { id: 'pr4', code: 'E11.9', description: 'Type 2 Diabetes Mellitus', status: 'Active', onsetDate: '2018-03-20', diagnosedBy: 'Dr. Smith (PCP)' },
  ],
  p2: [
    { id: 'pr5', code: 'F43.10', description: 'Post-Traumatic Stress Disorder', status: 'Active', onsetDate: '2022-05-01', diagnosedBy: 'Dr. Chris L.' },
    { id: 'pr6', code: 'F33.2', description: 'Major Depressive Disorder, Recurrent, Severe', status: 'Active', onsetDate: '2022-05-01', diagnosedBy: 'Dr. Chris L.' },
    { id: 'pr7', code: 'F40.10', description: 'Social Anxiety Disorder', status: 'Active', onsetDate: '2023-02-14', diagnosedBy: 'Dr. Chris L.' },
  ],
  p3: [
    { id: 'pr8', code: 'F10.20', description: 'Alcohol Use Disorder, Moderate', status: 'Active', onsetDate: '2019-08-15', diagnosedBy: 'Joseph' },
    { id: 'pr9', code: 'F33.0', description: 'Major Depressive Disorder, Recurrent, Mild', status: 'Active', onsetDate: '2019-08-15', diagnosedBy: 'Joseph' },
    { id: 'pr10', code: 'I10', description: 'Essential Hypertension', status: 'Active', onsetDate: '2015-04-10', diagnosedBy: 'Dr. Davis (PCP)' },
    { id: 'pr11', code: 'F17.210', description: 'Nicotine Dependence, Cigarettes', status: 'Active', onsetDate: '2010-01-01', diagnosedBy: 'Joseph' },
  ],
  p4: [
    { id: 'pr12', code: 'F90.2', description: 'ADHD, Combined Type', status: 'Active', onsetDate: '2015-09-01', diagnosedBy: 'Joseph' },
    { id: 'pr13', code: 'F41.1', description: 'Generalized Anxiety Disorder', status: 'Active', onsetDate: '2023-01-20', diagnosedBy: 'Joseph' },
    { id: 'pr14', code: 'F50.00', description: 'Anorexia Nervosa, Unspecified', status: 'In Remission', onsetDate: '2019-06-15', diagnosedBy: 'Dr. Park (PCP)' },
  ],
  p5: [
    { id: 'pr15', code: 'F32.2', description: 'Major Depressive Disorder, Single Episode, Severe', status: 'Active', onsetDate: '2025-12-01', diagnosedBy: 'Dr. Chris L.' },
    { id: 'pr16', code: 'F41.0', description: 'Panic Disorder', status: 'Active', onsetDate: '2026-01-10', diagnosedBy: 'Dr. Chris L.' },
    { id: 'pr17', code: 'G30.9', description: 'Alzheimers Disease, Unspecified (Early Onset)', status: 'Active', onsetDate: '2025-06-15', diagnosedBy: 'Dr. Brown (PCP)' },
  ],
  p6: [
    { id: 'pr18', code: 'F31.31', description: 'Bipolar Disorder, Current Episode Depressed, Mild', status: 'Active', onsetDate: '2021-03-10', diagnosedBy: 'Dr. Chris L.' },
    { id: 'pr19', code: 'F41.1', description: 'Generalized Anxiety Disorder', status: 'Active', onsetDate: '2021-03-10', diagnosedBy: 'Dr. Chris L.' },
    { id: 'pr20', code: 'N94.3', description: 'Premenstrual Dysphoric Disorder', status: 'Active', onsetDate: '2022-08-05', diagnosedBy: 'Dr. Taylor (PCP)' },
  ],
};

// ========== VITALS ==========
export const vitals = {
  p1: [
    { id: 'v1', date: '2026-04-02', time: '09:15', bp: '128/82', hr: 76, rr: 16, temp: 98.6, spo2: 98, weight: 185, height: 70, bmi: 26.5, pain: 2, takenBy: 'Kelly Chen, RN' },
    { id: 'v2', date: '2026-03-05', time: '10:30', bp: '132/85', hr: 80, rr: 18, temp: 98.4, spo2: 97, weight: 187, height: 70, bmi: 26.8, pain: 3, takenBy: 'Kelly Chen, RN' },
    { id: 'v3', date: '2026-02-01', time: '14:00', bp: '135/88', hr: 82, rr: 16, temp: 98.6, spo2: 98, weight: 190, height: 70, bmi: 27.3, pain: 4, takenBy: 'Kelly Chen, RN' },
  ],
  p2: [
    { id: 'v4', date: '2026-04-05', time: '11:00', bp: '118/72', hr: 68, rr: 14, temp: 98.2, spo2: 99, weight: 135, height: 64, bmi: 23.2, pain: 0, takenBy: 'Kelly Chen, RN' },
    { id: 'v5', date: '2026-03-08', time: '09:45', bp: '120/74', hr: 72, rr: 16, temp: 98.6, spo2: 98, weight: 136, height: 64, bmi: 23.3, pain: 1, takenBy: 'Kelly Chen, RN' },
  ],
  p3: [
    { id: 'v6', date: '2026-03-28', time: '13:30', bp: '142/92', hr: 88, rr: 18, temp: 98.8, spo2: 96, weight: 210, height: 72, bmi: 28.5, pain: 5, takenBy: 'Kelly Chen, RN' },
    { id: 'v7', date: '2026-02-28', time: '10:00', bp: '148/95', hr: 92, rr: 20, temp: 98.6, spo2: 95, weight: 215, height: 72, bmi: 29.2, pain: 4, takenBy: 'Kelly Chen, RN' },
  ],
  p4: [
    { id: 'v8', date: '2026-04-07', time: '08:30', bp: '110/68', hr: 72, rr: 14, temp: 97.8, spo2: 99, weight: 115, height: 63, bmi: 20.4, pain: 0, takenBy: 'Kelly Chen, RN' },
  ],
  p5: [
    { id: 'v9', date: '2026-03-20', time: '15:00', bp: '152/96', hr: 84, rr: 18, temp: 98.4, spo2: 95, weight: 178, height: 68, bmi: 27.1, pain: 6, takenBy: 'Kelly Chen, RN' },
  ],
  p6: [
    { id: 'v10', date: '2026-04-01', time: '10:15', bp: '122/76', hr: 74, rr: 16, temp: 98.6, spo2: 98, weight: 145, height: 65, bmi: 24.1, pain: 1, takenBy: 'Kelly Chen, RN' },
  ],
};

// ========== MEDICATIONS / PRESCRIPTIONS ==========
export const medications = {
  p1: [
    { id: 'm1', name: 'Sertraline (Zoloft)', dose: '100mg', route: 'Oral', frequency: 'Once daily', startDate: '2020-02-01', prescriber: 'Dr. Chris L.', status: 'Active', refillsLeft: 3, isControlled: false, schedule: null, pharmacy: 'CVS Pharmacy - Main St', lastFilled: '2026-03-15', sig: 'Take 1 tablet by mouth once daily in the morning', rxHistory: [
      { date: '2026-03-15', prescribedBy: 'Dr. Chris L.', pharmacy: 'CVS Pharmacy - Main St', qty: 90, refillNumber: 7, type: 'Refill', note: '90-day supply' },
      { date: '2025-12-15', prescribedBy: 'Dr. Chris L.', pharmacy: 'CVS Pharmacy - Main St', qty: 90, refillNumber: 6, type: 'Refill', note: '' },
      { date: '2025-09-15', prescribedBy: 'Dr. Chris L.', pharmacy: 'CVS Pharmacy - Main St', qty: 90, refillNumber: 5, type: 'Refill', note: '' },
      { date: '2025-06-15', prescribedBy: 'Dr. Chris L.', pharmacy: 'CVS Pharmacy - Main St', qty: 90, refillNumber: 4, type: 'Refill', note: '' },
      { date: '2020-02-01', prescribedBy: 'Dr. Chris L.', pharmacy: 'CVS Pharmacy - Main St', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'Initial prescription for depression' },
    ] },
    { id: 'm2', name: 'Trazodone', dose: '50mg', route: 'Oral', frequency: 'Once daily at bedtime', startDate: '2021-07-01', prescriber: 'Dr. Chris L.', status: 'Active', refillsLeft: 2, isControlled: false, schedule: null, pharmacy: 'CVS Pharmacy - Main St', lastFilled: '2026-03-15', sig: 'Take 1 tablet by mouth at bedtime as needed for insomnia', rxHistory: [
      { date: '2026-03-15', prescribedBy: 'Dr. Chris L.', pharmacy: 'CVS Pharmacy - Main St', qty: 30, refillNumber: 4, type: 'Refill', note: '' },
      { date: '2025-12-01', prescribedBy: 'Dr. Chris L.', pharmacy: 'CVS Pharmacy - Main St', qty: 30, refillNumber: 3, type: 'Refill', note: '' },
      { date: '2025-08-01', prescribedBy: 'Dr. Chris L.', pharmacy: 'CVS Pharmacy - Main St', qty: 30, refillNumber: 2, type: 'Refill', note: '' },
      { date: '2021-07-01', prescribedBy: 'Dr. Chris L.', pharmacy: 'CVS Pharmacy - Main St', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'Added for insomnia management' },
    ] },
    { id: 'm3', name: 'Metformin', dose: '500mg', route: 'Oral', frequency: 'Twice daily', startDate: '2018-04-01', prescriber: 'Dr. Robert Smith (PCP)', status: 'Active', refillsLeft: 5, isControlled: false, schedule: null, pharmacy: 'CVS Pharmacy - Main St', lastFilled: '2026-03-01', sig: 'Take 1 tablet by mouth twice daily with meals', rxHistory: [
      { date: '2026-03-01', prescribedBy: 'Dr. Robert Smith (PCP)', pharmacy: 'CVS Pharmacy - Main St', qty: 90, refillNumber: 10, type: 'Refill', note: '90-day supply' },
      { date: '2025-12-01', prescribedBy: 'Dr. Robert Smith (PCP)', pharmacy: 'CVS Pharmacy - Main St', qty: 90, refillNumber: 9, type: 'Refill', note: '' },
      { date: '2025-09-01', prescribedBy: 'Dr. Robert Smith (PCP)', pharmacy: 'CVS Pharmacy - Main St', qty: 90, refillNumber: 8, type: 'Refill', note: '' },
      { date: '2018-04-01', prescribedBy: 'Dr. Robert Smith (PCP)', pharmacy: 'CVS Pharmacy - Main St', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'Initiated for Type 2 Diabetes management' },
    ] },
  ],
  p2: [
    { id: 'm4', name: 'Venlafaxine XR (Effexor XR)', dose: '150mg', route: 'Oral', frequency: 'Once daily', startDate: '2022-06-01', prescriber: 'Dr. Chris L.', status: 'Active', refillsLeft: 4, isControlled: false, schedule: null, pharmacy: 'Walgreens - 5th Ave', lastFilled: '2026-03-20', sig: 'Take 1 capsule by mouth once daily with food', rxHistory: [
      { date: '2026-03-20', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - 5th Ave', qty: 90, refillNumber: 5, type: 'Refill', note: '90-day supply' },
      { date: '2025-12-20', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - 5th Ave', qty: 90, refillNumber: 4, type: 'Refill', note: '' },
      { date: '2025-09-20', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - 5th Ave', qty: 90, refillNumber: 3, type: 'Refill', note: '' },
      { date: '2022-09-01', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - 5th Ave', qty: 30, refillNumber: 1, type: 'Refill', note: 'Dose increased from 75mg to 150mg' },
      { date: '2022-06-01', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - 5th Ave', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'Started at 75mg for titration' },
    ] },
    { id: 'm5', name: 'Prazosin', dose: '2mg', route: 'Oral', frequency: 'Once daily at bedtime', startDate: '2022-08-15', prescriber: 'Dr. Chris L.', status: 'Active', refillsLeft: 3, isControlled: false, schedule: null, pharmacy: 'Walgreens - 5th Ave', lastFilled: '2026-03-20', sig: 'Take 1 tablet by mouth at bedtime for nightmares', rxHistory: [
      { date: '2026-03-20', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - 5th Ave', qty: 30, refillNumber: 4, type: 'Refill', note: '' },
      { date: '2025-12-20', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - 5th Ave', qty: 30, refillNumber: 3, type: 'Refill', note: '' },
      { date: '2025-09-20', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - 5th Ave', qty: 30, refillNumber: 2, type: 'Refill', note: '' },
      { date: '2022-08-15', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - 5th Ave', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'For PTSD-related nightmares' },
    ] },
    { id: 'm6', name: 'Hydroxyzine', dose: '25mg', route: 'Oral', frequency: 'Every 6 hours as needed', startDate: '2023-01-10', prescriber: 'Dr. Chris L.', status: 'Active', refillsLeft: 2, isControlled: false, schedule: null, pharmacy: 'Walgreens - 5th Ave', lastFilled: '2026-02-28', sig: 'Take 1 tablet by mouth every 6 hours as needed for anxiety', rxHistory: [
      { date: '2026-02-28', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - 5th Ave', qty: 30, refillNumber: 2, type: 'Refill', note: '' },
      { date: '2025-10-01', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - 5th Ave', qty: 30, refillNumber: 1, type: 'Refill', note: '' },
      { date: '2023-01-10', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - 5th Ave', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'Added for PRN anxiety relief' },
    ] },
  ],
  p3: [
    { id: 'm7', name: 'Naltrexone', dose: '50mg', route: 'Oral', frequency: 'Once daily', startDate: '2020-01-15', prescriber: 'NP Michael Johnson', status: 'Active', refillsLeft: 5, isControlled: false, schedule: null, pharmacy: 'Rite Aid - Center St', lastFilled: '2026-03-10', sig: 'Take 1 tablet by mouth once daily', rxHistory: [
      { date: '2026-03-10', prescribedBy: 'NP Michael Johnson', pharmacy: 'Rite Aid - Center St', qty: 90, refillNumber: 6, type: 'Refill', note: '90-day supply' },
      { date: '2025-12-10', prescribedBy: 'NP Michael Johnson', pharmacy: 'Rite Aid - Center St', qty: 30, refillNumber: 5, type: 'Refill', note: '' },
      { date: '2025-09-10', prescribedBy: 'NP Michael Johnson', pharmacy: 'Rite Aid - Center St', qty: 30, refillNumber: 4, type: 'Refill', note: '' },
      { date: '2020-01-15', prescribedBy: 'NP Michael Johnson', pharmacy: 'Rite Aid - Center St', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'Initiated for alcohol use disorder (AUD) treatment' },
    ] },
    { id: 'm8', name: 'Bupropion XL (Wellbutrin XL)', dose: '300mg', route: 'Oral', frequency: 'Once daily', startDate: '2020-01-15', prescriber: 'NP Michael Johnson', status: 'Active', refillsLeft: 4, isControlled: false, schedule: null, pharmacy: 'Rite Aid - Center St', lastFilled: '2026-03-10', sig: 'Take 1 tablet by mouth once daily in the morning', rxHistory: [
      { date: '2026-03-10', prescribedBy: 'NP Michael Johnson', pharmacy: 'Rite Aid - Center St', qty: 30, refillNumber: 5, type: 'Refill', note: '' },
      { date: '2025-12-10', prescribedBy: 'NP Michael Johnson', pharmacy: 'Rite Aid - Center St', qty: 30, refillNumber: 4, type: 'Refill', note: '' },
      { date: '2020-04-15', prescribedBy: 'NP Michael Johnson', pharmacy: 'Rite Aid - Center St', qty: 30, refillNumber: 1, type: 'Refill', note: 'Dose increased from 150mg to 300mg' },
      { date: '2020-01-15', prescribedBy: 'NP Michael Johnson', pharmacy: 'Rite Aid - Center St', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'Started at 150mg for depression; also supports smoking cessation' },
    ] },
    { id: 'm9', name: 'Lisinopril', dose: '20mg', route: 'Oral', frequency: 'Once daily', startDate: '2015-05-01', prescriber: 'Dr. William Davis (PCP)', status: 'Active', refillsLeft: 6, isControlled: false, schedule: null, pharmacy: 'Rite Aid - Center St', lastFilled: '2026-03-01', sig: 'Take 1 tablet by mouth once daily', rxHistory: [
      { date: '2026-03-01', prescribedBy: 'Dr. William Davis (PCP)', pharmacy: 'Rite Aid - Center St', qty: 90, refillNumber: 12, type: 'Refill', note: '90-day supply' },
      { date: '2025-12-01', prescribedBy: 'Dr. William Davis (PCP)', pharmacy: 'Rite Aid - Center St', qty: 90, refillNumber: 11, type: 'Refill', note: '' },
      { date: '2025-09-01', prescribedBy: 'Dr. William Davis (PCP)', pharmacy: 'Rite Aid - Center St', qty: 90, refillNumber: 10, type: 'Refill', note: '' },
      { date: '2015-05-01', prescribedBy: 'Dr. William Davis (PCP)', pharmacy: 'Rite Aid - Center St', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'Initiated for hypertension management' },
    ] },
  ],
  p4: [
    { id: 'm10', name: 'Adderall XR (Amphetamine/Dextroamphetamine)', dose: '20mg', route: 'Oral', frequency: 'Once daily in the morning', startDate: '2023-03-01', prescriber: 'NP Michael Johnson', status: 'Active', refillsLeft: 0, isControlled: true, schedule: 'Schedule II', pharmacy: 'CVS Pharmacy - College Ave', lastFilled: '2026-03-25', sig: 'Take 1 capsule by mouth once daily in the morning', rxHistory: [
      { date: '2026-03-25', prescribedBy: 'NP Michael Johnson', pharmacy: 'CVS Pharmacy - College Ave', qty: 30, refillNumber: 36, type: 'Written Rx', note: 'Monthly CII — no refills' },
      { date: '2026-02-25', prescribedBy: 'NP Michael Johnson', pharmacy: 'CVS Pharmacy - College Ave', qty: 30, refillNumber: 35, type: 'Written Rx', note: 'Monthly CII — no refills' },
      { date: '2026-01-25', prescribedBy: 'NP Michael Johnson', pharmacy: 'CVS Pharmacy - College Ave', qty: 30, refillNumber: 34, type: 'Written Rx', note: 'Monthly CII — no refills' },
      { date: '2023-03-01', prescribedBy: 'NP Michael Johnson', pharmacy: 'CVS Pharmacy - College Ave', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'Initiated for ADHD; titrated from 10mg' },
    ] },
    { id: 'm11', name: 'Buspirone', dose: '15mg', route: 'Oral', frequency: 'Twice daily', startDate: '2023-02-01', prescriber: 'NP Michael Johnson', status: 'Active', refillsLeft: 3, isControlled: false, schedule: null, pharmacy: 'CVS Pharmacy - College Ave', lastFilled: '2026-03-15', sig: 'Take 1 tablet by mouth twice daily', rxHistory: [
      { date: '2026-03-15', prescribedBy: 'NP Michael Johnson', pharmacy: 'CVS Pharmacy - College Ave', qty: 60, refillNumber: 3, type: 'Refill', note: '' },
      { date: '2025-12-15', prescribedBy: 'NP Michael Johnson', pharmacy: 'CVS Pharmacy - College Ave', qty: 60, refillNumber: 2, type: 'Refill', note: '' },
      { date: '2025-06-01', prescribedBy: 'NP Michael Johnson', pharmacy: 'CVS Pharmacy - College Ave', qty: 60, refillNumber: 1, type: 'Refill', note: 'Dose increased from 10mg to 15mg' },
      { date: '2023-02-01', prescribedBy: 'NP Michael Johnson', pharmacy: 'CVS Pharmacy - College Ave', qty: 60, refillNumber: 0, type: 'New Prescription', note: 'For generalized anxiety disorder' },
    ] },
  ],
  p5: [
    { id: 'm12', name: 'Mirtazapine (Remeron)', dose: '30mg', route: 'Oral', frequency: 'Once daily at bedtime', startDate: '2026-01-01', prescriber: 'Dr. Chris L.', status: 'Active', refillsLeft: 5, isControlled: false, schedule: null, pharmacy: 'Walmart Pharmacy', lastFilled: '2026-03-20', sig: 'Take 1 tablet by mouth at bedtime', rxHistory: [
      { date: '2026-03-20', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walmart Pharmacy', qty: 30, refillNumber: 2, type: 'Refill', note: '' },
      { date: '2026-02-01', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walmart Pharmacy', qty: 30, refillNumber: 1, type: 'Refill', note: 'Dose increased from 15mg to 30mg' },
      { date: '2026-01-01', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walmart Pharmacy', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'Started at 15mg for depression and insomnia' },
    ] },
    { id: 'm13', name: 'Lorazepam (Ativan)', dose: '0.5mg', route: 'Oral', frequency: 'Twice daily as needed', startDate: '2026-01-15', prescriber: 'Dr. Chris L.', status: 'Active', refillsLeft: 1, isControlled: true, schedule: 'Schedule IV', pharmacy: 'Walmart Pharmacy', lastFilled: '2026-03-01', sig: 'Take 1 tablet by mouth twice daily as needed for acute anxiety', rxHistory: [
      { date: '2026-03-01', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walmart Pharmacy', qty: 30, refillNumber: 2, type: 'Written Rx', note: 'CIV — limited supply per PDMP guidelines' },
      { date: '2026-02-01', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walmart Pharmacy', qty: 30, refillNumber: 1, type: 'Written Rx', note: '' },
      { date: '2026-01-15', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walmart Pharmacy', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'Short-term for acute anxiety; review in 90 days' },
    ] },
    { id: 'm14', name: 'Donepezil (Aricept)', dose: '10mg', route: 'Oral', frequency: 'Once daily at bedtime', startDate: '2025-07-01', prescriber: 'Dr. Thomas Brown (PCP)', status: 'Active', refillsLeft: 4, isControlled: false, schedule: null, pharmacy: 'Walmart Pharmacy', lastFilled: '2026-03-15', sig: 'Take 1 tablet by mouth at bedtime', rxHistory: [
      { date: '2026-03-15', prescribedBy: 'Dr. Thomas Brown (PCP)', pharmacy: 'Walmart Pharmacy', qty: 30, refillNumber: 3, type: 'Refill', note: '' },
      { date: '2025-12-15', prescribedBy: 'Dr. Thomas Brown (PCP)', pharmacy: 'Walmart Pharmacy', qty: 30, refillNumber: 2, type: 'Refill', note: '' },
      { date: '2025-10-01', prescribedBy: 'Dr. Thomas Brown (PCP)', pharmacy: 'Walmart Pharmacy', qty: 30, refillNumber: 1, type: 'Refill', note: 'Dose increased from 5mg to 10mg' },
      { date: '2025-07-01', prescribedBy: 'Dr. Thomas Brown (PCP)', pharmacy: 'Walmart Pharmacy', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'Initiated for mild cognitive impairment / early Alzheimer\'s — started at 5mg' },
    ] },
  ],
  p6: [
    { id: 'm15', name: 'Lamotrigine (Lamictal)', dose: '200mg', route: 'Oral', frequency: 'Once daily', startDate: '2021-06-01', prescriber: 'Dr. Chris L.', status: 'Active', refillsLeft: 5, isControlled: false, schedule: null, pharmacy: 'Walgreens - Oak Park', lastFilled: '2026-03-25', sig: 'Take 1 tablet by mouth once daily', rxHistory: [
      { date: '2026-03-25', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - Oak Park', qty: 90, refillNumber: 5, type: 'Refill', note: '90-day supply' },
      { date: '2025-12-25', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - Oak Park', qty: 90, refillNumber: 4, type: 'Refill', note: '' },
      { date: '2025-09-25', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - Oak Park', qty: 90, refillNumber: 3, type: 'Refill', note: '' },
      { date: '2021-09-01', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - Oak Park', qty: 30, refillNumber: 1, type: 'Refill', note: 'Dose titrated to 200mg per protocol' },
      { date: '2021-06-01', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - Oak Park', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'Titration start at 25mg for bipolar I disorder' },
    ] },
    { id: 'm16', name: 'Quetiapine (Seroquel)', dose: '100mg', route: 'Oral', frequency: 'Once daily at bedtime', startDate: '2021-09-15', prescriber: 'Dr. Chris L.', status: 'Active', refillsLeft: 3, isControlled: false, schedule: null, pharmacy: 'Walgreens - Oak Park', lastFilled: '2026-03-25', sig: 'Take 1 tablet by mouth at bedtime', rxHistory: [
      { date: '2026-03-25', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - Oak Park', qty: 30, refillNumber: 4, type: 'Refill', note: '' },
      { date: '2025-12-25', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - Oak Park', qty: 30, refillNumber: 3, type: 'Refill', note: '' },
      { date: '2025-09-25', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - Oak Park', qty: 30, refillNumber: 2, type: 'Refill', note: '' },
      { date: '2021-09-15', prescribedBy: 'Dr. Chris L.', pharmacy: 'Walgreens - Oak Park', qty: 30, refillNumber: 0, type: 'New Prescription', note: 'Added as mood stabilizer adjunct for bipolar I' },
    ] },
  ],
};

// ========== IMMUNIZATIONS ==========
export const immunizations = {
  p1: [
    { id: 'imm1', vaccine: 'Influenza (Flu)', date: '2025-10-15', site: 'Left Deltoid', route: 'IM', lot: 'FL2025-A1234', manufacturer: 'Sanofi Pasteur', administeredBy: 'Kelly Chen, RN', nextDue: '2026-10-01' },
    { id: 'imm2', vaccine: 'COVID-19 (Updated 2025-2026)', date: '2025-09-20', site: 'Right Deltoid', route: 'IM', lot: 'CV2526-B5678', manufacturer: 'Pfizer-BioNTech', administeredBy: 'Kelly Chen, RN', nextDue: '2026-09-01' },
    { id: 'imm3', vaccine: 'Tdap', date: '2022-06-10', site: 'Left Deltoid', route: 'IM', lot: 'TD2022-C9012', manufacturer: 'GSK', administeredBy: 'Kelly Chen, RN', nextDue: '2032-06-10' },
    { id: 'imm4', vaccine: 'Hepatitis B (Series Complete)', date: '2020-03-15', site: 'Right Deltoid', route: 'IM', lot: 'HB2020-D3456', manufacturer: 'Merck', administeredBy: 'External', nextDue: 'Complete' },
  ],
  p2: [
    { id: 'imm5', vaccine: 'Influenza (Flu)', date: '2025-11-01', site: 'Left Deltoid', route: 'IM', lot: 'FL2025-E7890', manufacturer: 'Sanofi Pasteur', administeredBy: 'Kelly Chen, RN', nextDue: '2026-10-01' },
    { id: 'imm6', vaccine: 'COVID-19 (Updated 2025-2026)', date: '2025-10-05', site: 'Right Deltoid', route: 'IM', lot: 'CV2526-F1234', manufacturer: 'Moderna', administeredBy: 'Kelly Chen, RN', nextDue: '2026-09-01' },
  ],
  p3: [
    { id: 'imm7', vaccine: 'Influenza (Flu)', date: '2025-10-20', site: 'Left Deltoid', route: 'IM', lot: 'FL2025-G5678', manufacturer: 'Sanofi Pasteur', administeredBy: 'Kelly Chen, RN', nextDue: '2026-10-01' },
    { id: 'imm8', vaccine: 'Pneumococcal (PCV20)', date: '2025-01-15', site: 'Left Deltoid', route: 'IM', lot: 'PN2025-H9012', manufacturer: 'Pfizer', administeredBy: 'External', nextDue: 'Complete' },
  ],
  p4: [
    { id: 'imm9', vaccine: 'Influenza (Flu)', date: '2025-09-15', site: 'Left Deltoid', route: 'IM', lot: 'FL2025-I3456', manufacturer: 'Sanofi Pasteur', administeredBy: 'Kelly Chen, RN', nextDue: '2026-10-01' },
    { id: 'imm10', vaccine: 'HPV (Gardasil 9 - Series Complete)', date: '2019-03-20', site: 'Right Deltoid', route: 'IM', lot: 'HPV2019-J7890', manufacturer: 'Merck', administeredBy: 'External', nextDue: 'Complete' },
  ],
  p5: [
    { id: 'imm11', vaccine: 'Influenza (Flu)', date: '2025-10-10', site: 'Left Deltoid', route: 'IM', lot: 'FL2025-K1234', manufacturer: 'Sanofi Pasteur', administeredBy: 'Kelly Chen, RN', nextDue: '2026-10-01' },
    { id: 'imm12', vaccine: 'Shingrix (Dose 2 of 2)', date: '2024-06-15', site: 'Right Deltoid', route: 'IM', lot: 'SH2024-L5678', manufacturer: 'GSK', administeredBy: 'External', nextDue: 'Complete' },
    { id: 'imm13', vaccine: 'Pneumococcal (PCV20)', date: '2025-02-10', site: 'Left Deltoid', route: 'IM', lot: 'PN2025-M9012', manufacturer: 'Pfizer', administeredBy: 'Kelly Chen, RN', nextDue: 'Complete' },
  ],
  p6: [
    { id: 'imm14', vaccine: 'Influenza (Flu)', date: '2025-11-05', site: 'Left Deltoid', route: 'IM', lot: 'FL2025-N3456', manufacturer: 'Sanofi Pasteur', administeredBy: 'Kelly Chen, RN', nextDue: '2026-10-01' },
    { id: 'imm15', vaccine: 'COVID-19 (Updated 2025-2026)', date: '2025-10-15', site: 'Right Deltoid', route: 'IM', lot: 'CV2526-O7890', manufacturer: 'Pfizer-BioNTech', administeredBy: 'Kelly Chen, RN', nextDue: '2026-09-01' },
  ],
};

// ========== LAB RESULTS ==========
export const labResults = {
  p1: [
    {
      id: 'lab1', orderDate: '2026-03-28', resultDate: '2026-03-30', orderedBy: 'Dr. Chris L.', status: 'Final',
      tests: [
        { name: 'CBC w/ Differential', results: [
          { component: 'WBC', value: '7.2', unit: 'K/uL', range: '4.5-11.0', flag: '' },
          { component: 'RBC', value: '4.8', unit: 'M/uL', range: '4.5-5.5', flag: '' },
          { component: 'Hemoglobin', value: '14.2', unit: 'g/dL', range: '13.5-17.5', flag: '' },
          { component: 'Hematocrit', value: '42.1', unit: '%', range: '38.0-50.0', flag: '' },
          { component: 'Platelets', value: '245', unit: 'K/uL', range: '150-400', flag: '' },
        ]},
        { name: 'Comprehensive Metabolic Panel', results: [
          { component: 'Glucose', value: '142', unit: 'mg/dL', range: '70-100', flag: 'H' },
          { component: 'BUN', value: '18', unit: 'mg/dL', range: '7-20', flag: '' },
          { component: 'Creatinine', value: '1.0', unit: 'mg/dL', range: '0.7-1.3', flag: '' },
          { component: 'Sodium', value: '140', unit: 'mEq/L', range: '136-145', flag: '' },
          { component: 'Potassium', value: '4.2', unit: 'mEq/L', range: '3.5-5.0', flag: '' },
          { component: 'ALT', value: '28', unit: 'U/L', range: '7-56', flag: '' },
          { component: 'AST', value: '24', unit: 'U/L', range: '10-40', flag: '' },
        ]},
        { name: 'HbA1c', results: [
          { component: 'Hemoglobin A1c', value: '7.2', unit: '%', range: '<5.7', flag: 'H' },
        ]},
        { name: 'Lipid Panel', results: [
          { component: 'Total Cholesterol', value: '210', unit: 'mg/dL', range: '<200', flag: 'H' },
          { component: 'LDL', value: '135', unit: 'mg/dL', range: '<100', flag: 'H' },
          { component: 'HDL', value: '42', unit: 'mg/dL', range: '>40', flag: '' },
          { component: 'Triglycerides', value: '165', unit: 'mg/dL', range: '<150', flag: 'H' },
        ]},
      ],
    },
  ],
  p2: [
    {
      id: 'lab2', orderDate: '2026-03-25', resultDate: '2026-03-27', orderedBy: 'Dr. Chris L.', status: 'Final',
      tests: [
        { name: 'TSH', results: [
          { component: 'TSH', value: '2.4', unit: 'mIU/L', range: '0.4-4.0', flag: '' },
        ]},
        { name: 'CBC', results: [
          { component: 'WBC', value: '6.5', unit: 'K/uL', range: '4.5-11.0', flag: '' },
          { component: 'Hemoglobin', value: '13.2', unit: 'g/dL', range: '12.0-16.0', flag: '' },
        ]},
      ],
    },
  ],
  p3: [
    {
      id: 'lab3', orderDate: '2026-03-20', resultDate: '2026-03-22', orderedBy: 'Joseph', status: 'Final',
      tests: [
        { name: 'Hepatic Function Panel', results: [
          { component: 'ALT', value: '62', unit: 'U/L', range: '7-56', flag: 'H' },
          { component: 'AST', value: '55', unit: 'U/L', range: '10-40', flag: 'H' },
          { component: 'Alkaline Phosphatase', value: '95', unit: 'U/L', range: '44-147', flag: '' },
          { component: 'Total Bilirubin', value: '1.1', unit: 'mg/dL', range: '0.1-1.2', flag: '' },
          { component: 'Albumin', value: '3.8', unit: 'g/dL', range: '3.5-5.5', flag: '' },
        ]},
        { name: 'Urine Drug Screen', results: [
          { component: 'Amphetamines', value: 'Negative', unit: '', range: 'Negative', flag: '' },
          { component: 'Benzodiazepines', value: 'Negative', unit: '', range: 'Negative', flag: '' },
          { component: 'Cocaine', value: 'Negative', unit: '', range: 'Negative', flag: '' },
          { component: 'Opiates', value: 'Negative', unit: '', range: 'Negative', flag: '' },
          { component: 'THC', value: 'Positive', unit: '', range: 'Negative', flag: 'A' },
          { component: 'Alcohol (EtOH)', value: 'Negative', unit: '', range: 'Negative', flag: '' },
        ]},
      ],
    },
  ],
  p4: [],
  p5: [],
  p6: [],
};

// ========== ASSESSMENT TOOLS / SCORES ==========
export const assessmentScores = {
  p1: [
    { id: 'as1', tool: 'PHQ-9', score: 14, interpretation: 'Moderately Severe Depression', date: '2026-04-02', administeredBy: 'Dr. Chris L.', answers: [2,2,2,1,1,2,1,2,1] },
    { id: 'as2', tool: 'PHQ-9', score: 18, interpretation: 'Moderately Severe Depression', date: '2026-03-05', administeredBy: 'Dr. Chris L.', answers: [2,3,2,2,1,2,2,2,2] },
    { id: 'as3', tool: 'GAD-7', score: 12, interpretation: 'Moderate Anxiety', date: '2026-04-02', administeredBy: 'Dr. Chris L.', answers: [2,2,1,2,2,1,2] },
    { id: 'as4', tool: 'GAD-7', score: 15, interpretation: 'Severe Anxiety', date: '2026-03-05', administeredBy: 'Dr. Chris L.', answers: [3,2,2,2,2,2,2] },
    { id: 'as5', tool: 'Columbia Suicide Severity Rating', score: 2, interpretation: 'Low Risk - Non-specific active suicidal thoughts', date: '2026-04-02', administeredBy: 'Dr. Chris L.' },
  ],
  p2: [
    { id: 'as6', tool: 'PHQ-9', score: 22, interpretation: 'Severe Depression', date: '2026-04-05', administeredBy: 'Dr. Chris L.', answers: [3,3,3,2,2,3,2,2,2] },
    { id: 'as7', tool: 'PCL-5', score: 52, interpretation: 'Probable PTSD (cutoff: 31-33)', date: '2026-04-05', administeredBy: 'Dr. Chris L.' },
    { id: 'as8', tool: 'Columbia Suicide Severity Rating', score: 3, interpretation: 'Moderate Risk - Active suicidal ideation with some intent', date: '2026-04-05', administeredBy: 'Dr. Chris L.' },
    { id: 'as9', tool: 'GAD-7', score: 18, interpretation: 'Severe Anxiety', date: '2026-04-05', administeredBy: 'Dr. Chris L.', answers: [3,3,2,3,2,3,2] },
  ],
  p3: [
    { id: 'as10', tool: 'AUDIT-C', score: 7, interpretation: 'Positive for Alcohol Misuse', date: '2026-03-28', administeredBy: 'Joseph' },
    { id: 'as11', tool: 'PHQ-9', score: 8, interpretation: 'Mild Depression', date: '2026-03-28', administeredBy: 'Joseph', answers: [1,1,1,1,1,1,1,0,1] },
    { id: 'as12', tool: 'DAST-10', score: 3, interpretation: 'Low Level Drug Use', date: '2026-03-28', administeredBy: 'Joseph' },
  ],
  p4: [
    { id: 'as13', tool: 'ASRS v1.1', score: 15, interpretation: 'Highly Consistent with ADHD', date: '2026-04-07', administeredBy: 'Joseph' },
    { id: 'as14', tool: 'GAD-7', score: 10, interpretation: 'Moderate Anxiety', date: '2026-04-07', administeredBy: 'Joseph', answers: [2,1,1,2,1,2,1] },
    { id: 'as15', tool: 'PHQ-9', score: 6, interpretation: 'Mild Depression', date: '2026-04-07', administeredBy: 'Joseph', answers: [1,1,0,1,1,1,0,0,1] },
  ],
  p5: [
    { id: 'as16', tool: 'PHQ-9', score: 24, interpretation: 'Severe Depression', date: '2026-03-20', administeredBy: 'Dr. Chris L.', answers: [3,3,3,3,2,3,3,2,2] },
    { id: 'as17', tool: 'MoCA', score: 22, interpretation: 'Mild Cognitive Impairment (Normal: ≥26)', date: '2026-03-20', administeredBy: 'Dr. Chris L.' },
    { id: 'as18', tool: 'Columbia Suicide Severity Rating', score: 4, interpretation: 'High Risk - Active suicidal ideation with plan', date: '2026-03-20', administeredBy: 'Dr. Chris L.' },
    { id: 'as19', tool: 'GAD-7', score: 19, interpretation: 'Severe Anxiety', date: '2026-03-20', administeredBy: 'Dr. Chris L.', answers: [3,3,3,3,2,3,2] },
  ],
  p6: [
    { id: 'as20', tool: 'MDQ', score: 9, interpretation: 'Positive for Bipolar Spectrum', date: '2026-04-01', administeredBy: 'Dr. Chris L.' },
    { id: 'as21', tool: 'PHQ-9', score: 11, interpretation: 'Moderate Depression', date: '2026-04-01', administeredBy: 'Dr. Chris L.', answers: [2,1,2,1,1,1,1,1,1] },
    { id: 'as22', tool: 'GAD-7', score: 13, interpretation: 'Moderate Anxiety', date: '2026-04-01', administeredBy: 'Dr. Chris L.', answers: [2,2,2,2,1,2,2] },
  ],
};

// ========== ORDERS ==========
export const orders = {
  p1: [
    { id: 'o1', type: 'Lab', description: 'CBC w/ Differential, CMP, HbA1c, Lipid Panel', status: 'Completed', orderedDate: '2026-03-28', orderedBy: 'Dr. Chris L.', priority: 'Routine', notes: 'Routine monitoring - diabetes, med management' },
    { id: 'o2', type: 'Lab', description: 'TSH, Vitamin D 25-Hydroxy', status: 'Pending', orderedDate: '2026-04-02', orderedBy: 'Dr. Chris L.', priority: 'Routine', notes: 'Annual screening' },
    { id: 'o3', type: 'Referral', description: 'Referral to CBT Therapist', status: 'Completed', orderedDate: '2026-01-15', orderedBy: 'Dr. Chris L.', priority: 'Routine', notes: 'Weekly CBT for depression and anxiety' },
  ],
  p2: [
    { id: 'o4', type: 'Lab', description: 'TSH, CBC', status: 'Completed', orderedDate: '2026-03-25', orderedBy: 'Dr. Chris L.', priority: 'Routine', notes: 'Thyroid screening, baseline labs' },
    { id: 'o5', type: 'Referral', description: 'Referral to EMDR Therapist', status: 'Active', orderedDate: '2026-04-05', orderedBy: 'Dr. Chris L.', priority: 'Urgent', notes: 'EMDR therapy for PTSD' },
    { id: 'o6', type: 'Imaging', description: 'Brain MRI w/o contrast', status: 'Pending', orderedDate: '2026-04-05', orderedBy: 'Dr. Chris L.', priority: 'Routine', notes: 'R/O organic pathology given severity of symptoms' },
  ],
  p3: [
    { id: 'o7', type: 'Lab', description: 'Hepatic Function Panel, UDS', status: 'Completed', orderedDate: '2026-03-20', orderedBy: 'Joseph', priority: 'Routine', notes: 'Monitoring LFTs and compliance' },
    { id: 'o8', type: 'Referral', description: 'Referral to AA/NA Support Group', status: 'Active', orderedDate: '2026-03-28', orderedBy: 'Joseph', priority: 'Routine', notes: 'Community support for alcohol use disorder' },
  ],
  p4: [
    { id: 'o9', type: 'Lab', description: 'CBC, CMP', status: 'Pending', orderedDate: '2026-04-07', orderedBy: 'Joseph', priority: 'Routine', notes: 'Baseline labs before stimulant monitoring' },
    { id: 'o10', type: 'Prescription', description: 'Adderall XR 20mg - Refill', status: 'Pending EPCS Auth', orderedDate: '2026-04-07', orderedBy: 'Joseph', priority: 'Routine', notes: 'Schedule II - requires EPCS authentication' },
  ],
  p5: [
    { id: 'o11', type: 'Referral', description: 'Referral to Neuropsychology', status: 'Active', orderedDate: '2026-03-20', orderedBy: 'Dr. Chris L.', priority: 'Urgent', notes: 'Cognitive assessment for early onset Alzheimers' },
    { id: 'o12', type: 'Lab', description: 'BMP, TSH, B12, Folate', status: 'Pending', orderedDate: '2026-03-20', orderedBy: 'Dr. Chris L.', priority: 'Routine', notes: 'R/O reversible causes of cognitive decline' },
  ],
  p6: [
    { id: 'o13', type: 'Lab', description: 'Lamotrigine Level, CBC, CMP', status: 'Pending', orderedDate: '2026-04-01', orderedBy: 'Dr. Chris L.', priority: 'Routine', notes: 'Therapeutic drug monitoring' },
  ],
};

// ========== CLINICAL INBOX MESSAGES ==========
export const inboxMessages = [
  { id: 'msg1', type: 'Rx Refill Request', from: 'CVS Pharmacy - Main St', to: 'u1', patient: 'p1', patientName: 'James Anderson', subject: 'Refill Request: Sertraline 100mg', body: 'Patient requesting refill of Sertraline 100mg #90. Last filled 03/15/2026. 0 refills remaining.', date: '2026-04-08', time: '09:15', read: false, priority: 'Normal', status: 'Pending' },
  { id: 'msg2', type: 'Lab Result', from: 'Quest Diagnostics', to: 'u1', patient: 'p1', patientName: 'James Anderson', subject: 'Lab Results Ready: CBC, CMP, HbA1c, Lipid Panel', body: 'Lab results are now available for review. Click to view full results.', date: '2026-04-08', time: '08:30', read: false, priority: 'Normal', status: 'Pending' },
  { id: 'msg3', type: 'Patient Message', from: 'Maria Garcia', to: 'u1', patient: 'p2', patientName: 'Maria Garcia', subject: 'Medication Side Effects', body: 'Dr. Chris L., I have been experiencing increased dizziness and headaches since starting Prazosin. Should I continue taking it? I am also having trouble sleeping. Please advise.', date: '2026-04-07', time: '16:45', read: false, priority: 'High', status: 'Pending' },
  { id: 'msg4', type: 'Prior Authorization', from: 'Aetna Insurance', to: 'u1', patient: 'p2', patientName: 'Maria Garcia', subject: 'PA Required: Brain MRI w/o contrast', body: 'Prior authorization is required for the ordered Brain MRI. Please submit clinical documentation supporting medical necessity.', date: '2026-04-07', time: '14:20', read: true, priority: 'High', status: 'In Progress' },
  { id: 'msg5', type: 'Rx Refill Request', from: 'CVS Pharmacy - College Ave', to: 'u2', patient: 'p4', patientName: 'Emily Chen', subject: 'Refill Request: Adderall XR 20mg (Schedule II)', body: 'Patient requesting refill of Adderall XR 20mg #30. CONTROLLED SUBSTANCE - Schedule II. Requires new prescription. Last filled 03/25/2026.', date: '2026-04-08', time: '10:00', read: false, priority: 'High', status: 'Pending' },
  { id: 'msg6', type: 'Staff Message', from: 'Sarah Williams (Front Desk)', to: 'u1', patient: null, patientName: null, subject: 'Schedule Change Request', body: 'Dr. Chris L., patient Robert Wilson called requesting to move his 04/18 appointment to 04/16. He mentioned his symptoms are worsening. Should I accommodate?', date: '2026-04-08', time: '08:00', read: false, priority: 'Normal', status: 'Pending' },
  { id: 'msg7', type: 'Patient Message', from: 'David Thompson', to: 'u2', patient: 'p3', patientName: 'David Thompson', subject: 'Missed Dose Question', body: 'Joseph, I accidentally missed my Naltrexone yesterday. Should I take a double dose today or just continue as normal?', date: '2026-04-08', time: '07:30', read: false, priority: 'Normal', status: 'Pending' },
  { id: 'msg8', type: 'Referral Update', from: 'Dr. Sarah Kim, PhD (EMDR)', to: 'u1', patient: 'p2', patientName: 'Maria Garcia', subject: 'Referral Accepted - EMDR Therapy', body: 'I am accepting the referral for Maria Garcia for EMDR therapy. First appointment scheduled for 04/15/2026 at 2:00 PM. Will send progress notes after each session.', date: '2026-04-06', time: '11:30', read: true, priority: 'Normal', status: 'Completed' },
  // Front desk messages
  { id: 'msg9', type: 'Check-in Alert', from: 'System', to: 'u3', patient: 'p1', patientName: 'James Anderson', subject: 'Patient Checked In - 10:00 AM Appointment', body: 'James Anderson has checked in for his 10:00 AM appointment with Dr. Chris L.. Insurance verified. Copay: $30 collected.', date: '2026-04-09', time: '09:45', read: false, priority: 'Normal', status: 'Pending' },
  { id: 'msg10', type: 'Insurance Alert', from: 'System', to: 'u3', patient: 'p3', patientName: 'David Thompson', subject: 'Insurance Eligibility Failed', body: 'United Healthcare eligibility check failed for David Thompson. Policy may be inactive. Please verify coverage before next appointment on 04/15.', date: '2026-04-08', time: '16:00', read: false, priority: 'High', status: 'Pending' },
];

// ========== SMART PHRASES ==========
export const smartPhrases = [
  { id: 'sp1', trigger: '.mentalstatusexam', name: 'Mental Status Exam - Normal', category: 'Exam', content: 'MENTAL STATUS EXAMINATION:\nAppearance: Well-groomed, appropriately dressed, good hygiene\nBehavior: Cooperative, good eye contact, no psychomotor agitation or retardation\nSpeech: Normal rate, rhythm, and volume; spontaneous and coherent\nMood: "Good" (patient-reported)\nAffect: Euthymic, congruent with stated mood, full range\nThought Process: Linear, logical, goal-directed\nThought Content: No suicidal ideation, homicidal ideation, or auditory/visual hallucinations. No delusions or paranoia.\nCognition: Alert and oriented x4 (person, place, time, situation). Attention and concentration intact.\nInsight: Good\nJudgment: Good\nMemory: Intact for recent and remote events' },
  { id: 'sp2', trigger: '.mseneg', name: 'Mental Status Exam - Depressed', category: 'Exam', content: 'MENTAL STATUS EXAMINATION:\nAppearance: Casually dressed, fair hygiene, appears fatigued\nBehavior: Cooperative but psychomotor retardation noted. Decreased eye contact.\nSpeech: Decreased rate and volume, increased latency\nMood: "Depressed" / "Down" (patient-reported)\nAffect: Dysphoric, constricted range, tearful at times\nThought Process: Linear but slowed, occasionally circumstantial\nThought Content: Endorses passive suicidal ideation without plan or intent. Denies homicidal ideation. No auditory/visual hallucinations. No delusions.\nCognition: Alert and oriented x4. Attention and concentration mildly impaired.\nInsight: Fair\nJudgment: Fair\nMemory: Intact' },
  { id: 'sp3', trigger: '.mseanx', name: 'Mental Status Exam - Anxious', category: 'Exam', content: 'MENTAL STATUS EXAMINATION:\nAppearance: Appropriately dressed, appears tense, fidgeting\nBehavior: Cooperative, restless, frequent position changes, wringing hands\nSpeech: Pressured rate, normal volume, coherent\nMood: "Anxious" / "Nervous" (patient-reported)\nAffect: Anxious, mildly restricted range\nThought Process: Linear but tangential at times, occasionally racing\nThought Content: Endorses excessive worry. Denies suicidal/homicidal ideation. No hallucinations or delusions.\nCognition: Alert and oriented x4. Attention and concentration impaired by anxiety.\nInsight: Good\nJudgment: Good\nMemory: Intact' },
  { id: 'sp4', trigger: '.safetyplan', name: 'Safety Plan', category: 'Clinical', content: 'SAFETY PLAN:\n1. Warning Signs (thoughts, images, mood, situation, behavior): []\n2. Internal Coping Strategies (things I can do to take my mind off problems): []\n3. People and Social Settings that Provide Distraction: []\n4. People I Can Ask for Help:\n   - Name: _____ Phone: _____\n   - Name: _____ Phone: _____\n5. Professionals/Agencies I Can Contact During a Crisis:\n   - Clinician: _____ Phone: _____\n   - 988 Suicide & Crisis Lifeline: Call or Text 988\n   - Crisis Text Line: Text HOME to 741741\n   - Local ER: _____\n6. Making the Environment Safe (removing/restricting access to lethal means): []\n7. My Reasons for Living: []' },
  { id: 'sp5', trigger: '.followupmh', name: 'Follow Up - Mental Health', category: 'Plan', content: 'PLAN:\n1. Continue current medication regimen as prescribed\n2. Return to clinic in [4/6/8/12] weeks for follow-up\n3. Continue therapy [weekly/biweekly] with [therapist name]\n4. Patient instructed to call clinic or go to nearest ER if experiencing worsening symptoms, suicidal thoughts, or medication side effects\n5. Reviewed safety plan and crisis resources (988 Lifeline)\n6. Labs ordered: []\n7. Medication changes: []\n8. Referrals: []' },
  { id: 'sp6', trigger: '.initialpsych', name: 'Initial Psychiatric Evaluation Template', category: 'Note', content: 'PSYCHIATRIC EVALUATION\n\nCHIEF COMPLAINT: []\n\nHISTORY OF PRESENT ILLNESS:\nPatient is a [age]-year-old [gender] presenting for [initial evaluation/follow-up] for [presenting concern]. [Narrative description of current symptoms, onset, duration, severity, triggers, and impact on functioning.]\n\nPAST PSYCHIATRIC HISTORY:\n- Previous diagnoses: []\n- Previous hospitalizations: []\n- Previous medications: []\n- Previous therapy/treatment: []\n- History of self-harm/suicide attempts: []\n\nSUBSTANCE USE HISTORY:\n- Alcohol: []\n- Cannabis: []\n- Tobacco/Nicotine: []\n- Stimulants: []\n- Opioids: []\n- Other: []\n\nFAMILY PSYCHIATRIC HISTORY:\n- []\n\nSOCIAL HISTORY:\n- Living situation: []\n- Employment/Education: []\n- Relationships: []\n- Support system: []\n- Legal history: []\n- Trauma history: []\n\nMEDICAL HISTORY:\n- Active conditions: []\n- Surgical history: []\n\nREVIEW OF SYSTEMS: []\n\nMENTAL STATUS EXAMINATION: [use .mentalstatusexam]\n\nASSESSMENT:\n[]\n\nDIAGNOSES:\n1. []\n\nPLAN:\n[use .followupmh]' },
  { id: 'sp7', trigger: '.progressnote', name: 'Progress Note Template', category: 'Note', content: 'FOLLOW-UP PSYCHIATRIC NOTE\n\nSubjective:\nPatient reports []. Since last visit, patient describes []. Sleep: []. Appetite: []. Energy: []. Mood: []. Medication compliance: []. Side effects: []. Therapy progress: [].\n\nObjective:\nVitals: [auto-populated]\nMental Status Exam: [use .mentalstatusexam]\nAssessment scores: [auto-populated]\n\nAssessment:\n[age]-year-old [gender] with [diagnoses] presenting for follow-up. [Clinical impression and progress summary.]\n\nPlan:\n[use .followupmh]' },
  { id: 'sp8', trigger: '.telehealthnote', name: 'Telehealth Note Header', category: 'Note', content: 'TELEHEALTH VISIT NOTE\nVisit Type: Audio/Video Telehealth\nPlatform: MindCare Telehealth (HIPAA-compliant)\nPatient Location: [City, State] - Confirmed patient is in a private, safe location\nProvider Location: [Office/Home] - [City, State]\nConsent: Informed consent for telehealth obtained and documented\nIdentity Verification: Patient identity verified via [visual confirmation/DOB/MRN]\nTechnology: [Video/Audio] connection maintained throughout visit. No significant connectivity issues. / [Document any interruptions]' },
  { id: 'sp9', trigger: '.controlledsubstance', name: 'Controlled Substance Agreement Note', category: 'Clinical', content: 'CONTROLLED SUBSTANCE MANAGEMENT:\n- Controlled substance agreement reviewed and signed: [Yes/No]\n- PDMP checked: [Date] - Results: [Consistent/Inconsistent with prescribed medications]\n- Last UDS: [Date] - Results: []\n- Risk assessment for misuse: [Low/Moderate/High]\n- Current medication: []\n- Dose/frequency: []\n- Quantity dispensed: []\n- Refills authorized: []\n- Next PDMP check due: []\n- Next UDS due: []\n- Patient counseled on: proper use, storage, disposal, risks of dependence, not sharing medications' },
  { id: 'sp10', trigger: '.suiciderisk', name: 'Suicide Risk Assessment', category: 'Clinical', content: 'SUICIDE RISK ASSESSMENT:\nColumbia-Suicide Severity Rating Scale (C-SSRS) administered.\n\n1. Have you wished you were dead or wished you could go to sleep and not wake up? [Y/N]\n2. Have you actually had any thoughts of killing yourself? [Y/N]\n3. Have you been thinking about how you might do this? [Y/N]\n4. Have you had these thoughts and had some intention of acting on them? [Y/N]\n5. Have you started to work out or worked out the details of how to kill yourself? [Y/N]\n6. Have you ever done anything, started to do anything, or prepared to do anything to end your life? [Y/N]\n\nRisk Level: [None/Low/Moderate/High/Imminent]\nProtective Factors: []\nRisk Factors: []\nSafety Plan: [Reviewed/Created/Updated]\nDisposition: []' },
];

// ========== APPOINTMENTS (Today's Schedule) ==========
export const appointments = [
  // ── Today: April 9, 2026 ──
  { id: 'apt1', patientId: 'p1', patientName: 'James Anderson', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-04-09', time: '09:00', duration: 30, type: 'Follow-Up', status: 'Checked In', reason: 'Med management - depression/anxiety', visitType: 'In-Person', room: 'Room 3' },
  { id: 'apt2', patientId: 'p2', patientName: 'Maria Garcia', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-04-09', time: '09:30', duration: 60, type: 'Follow-Up', status: 'Scheduled', reason: 'PTSD follow-up, medication review', visitType: 'Telehealth', room: 'Virtual' },
  { id: 'apt3', patientId: 'p4', patientName: 'Emily Chen', provider: 'u2', providerName: 'Joseph', date: '2026-04-09', time: '10:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'ADHD follow-up, stimulant refill', visitType: 'In-Person', room: 'Room 1' },
  { id: 'apt4', patientId: 'p6', patientName: 'Aisha Patel', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-04-09', time: '10:30', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'Bipolar disorder management', visitType: 'Telehealth', room: 'Virtual' },
  { id: 'apt5', patientId: null, patientName: 'New Patient - Alex Rivera', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-04-09', time: '11:00', duration: 60, type: 'New Patient', status: 'Confirmed', reason: 'Initial psych evaluation - depression, anxiety', visitType: 'In-Person', room: 'Room 2' },
  { id: 'apt6', patientId: 'p3', patientName: 'David Thompson', provider: 'u2', providerName: 'Joseph', date: '2026-04-09', time: '11:00', duration: 30, type: 'Follow-Up', status: 'Confirmed', reason: 'AUD management, med review', visitType: 'In-Person', room: 'Room 4' },
  { id: 'apt7', patientId: 'p5', patientName: 'Robert Wilson', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-04-09', time: '13:00', duration: 45, type: 'Follow-Up', status: 'Confirmed', reason: 'Depression/anxiety management, cognitive decline monitoring', visitType: 'In-Person', room: 'Room 3' },
  { id: 'apt8', patientId: null, patientName: 'New Patient - Jordan Taylor', provider: 'u2', providerName: 'Joseph', date: '2026-04-09', time: '14:00', duration: 60, type: 'New Patient', status: 'Confirmed', reason: 'Initial evaluation - OCD symptoms', visitType: 'Telehealth', room: 'Virtual' },

  // ── April 2026 (other days) ──
  { id: 'apt9',  patientId: 'p1', patientName: 'James Anderson', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-04-11', time: '09:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'Lab review — Sertraline level', visitType: 'Telehealth', room: 'Virtual' },
  { id: 'apt10', patientId: 'p2', patientName: 'Maria Garcia', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-04-14', time: '10:00', duration: 60, type: 'Follow-Up', status: 'Scheduled', reason: 'PTSD re-assessment, PCL-5', visitType: 'In-Person', room: 'Room 2' },
  { id: 'apt11', patientId: 'p6', patientName: 'Aisha Patel', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-04-16', time: '11:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'Lamotrigine titration check', visitType: 'In-Person', room: 'Room 3' },
  { id: 'apt12', patientId: 'p3', patientName: 'David Thompson', provider: 'u2', providerName: 'Joseph', date: '2026-04-18', time: '14:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'AUD follow-up, naltrexone refill', visitType: 'In-Person', room: 'Room 1' },
  { id: 'apt13', patientId: 'p4', patientName: 'Emily Chen', provider: 'u2', providerName: 'Joseph', date: '2026-04-21', time: '09:30', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'ADHD check-in, grades review', visitType: 'Telehealth', room: 'Virtual' },
  { id: 'apt14', patientId: 'p5', patientName: 'Robert Wilson', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-04-23', time: '13:00', duration: 45, type: 'Follow-Up', status: 'Scheduled', reason: 'Cognitive decline follow-up, MMSE', visitType: 'In-Person', room: 'Room 3' },
  { id: 'apt15', patientId: null, patientName: 'New Patient - Sarah Kim', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-04-25', time: '10:00', duration: 60, type: 'New Patient', status: 'Scheduled', reason: 'Initial eval — postpartum depression', visitType: 'In-Person', room: 'Room 2' },
  { id: 'apt16', patientId: 'p1', patientName: 'James Anderson', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-04-28', time: '09:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'Sertraline dose check, PHQ-9', visitType: 'In-Person', room: 'Room 3' },
  { id: 'apt17', patientId: 'p6', patientName: 'Aisha Patel', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-04-30', time: '11:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'Bipolar mgmt — mood check', visitType: 'Telehealth', room: 'Virtual' },

  // ── May 2026 ──
  { id: 'apt18', patientId: 'p2', patientName: 'Maria Garcia', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-05-01', time: '10:00', duration: 60, type: 'Follow-Up', status: 'Scheduled', reason: 'PTSD follow-up, PE session #10', visitType: 'In-Person', room: 'Room 2' },
  { id: 'apt19', patientId: 'p3', patientName: 'David Thompson', provider: 'u2', providerName: 'Joseph', date: '2026-05-02', time: '14:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'AUD management, sobriety check', visitType: 'In-Person', room: 'Room 1' },
  { id: 'apt20', patientId: 'p4', patientName: 'Emily Chen', provider: 'u2', providerName: 'Joseph', date: '2026-05-05', time: '09:30', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'Adderall refill, weight check', visitType: 'In-Person', room: 'Room 1' },
  { id: 'apt21', patientId: 'p1', patientName: 'James Anderson', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-05-07', time: '09:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'Med management follow-up', visitType: 'Telehealth', room: 'Virtual' },
  { id: 'apt22', patientId: 'p5', patientName: 'Robert Wilson', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-05-08', time: '13:00', duration: 45, type: 'Follow-Up', status: 'Scheduled', reason: 'Depression/cognitive monitoring', visitType: 'In-Person', room: 'Room 3' },
  { id: 'apt23', patientId: 'p6', patientName: 'Aisha Patel', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-05-12', time: '11:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'Bipolar — Lamotrigine 100mg check', visitType: 'In-Person', room: 'Room 3' },
  { id: 'apt24', patientId: null, patientName: 'New Patient - Marcus Lee', provider: 'u2', providerName: 'Joseph', date: '2026-05-13', time: '10:00', duration: 60, type: 'New Patient', status: 'Scheduled', reason: 'Initial eval — social anxiety', visitType: 'Telehealth', room: 'Virtual' },
  { id: 'apt25', patientId: 'p2', patientName: 'Maria Garcia', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-05-15', time: '10:00', duration: 45, type: 'Follow-Up', status: 'Scheduled', reason: 'PTSD follow-up, Prazosin review', visitType: 'In-Person', room: 'Room 2' },
  { id: 'apt26', patientId: 'p3', patientName: 'David Thompson', provider: 'u2', providerName: 'Joseph', date: '2026-05-16', time: '14:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'AUD follow-up, liver panel review', visitType: 'In-Person', room: 'Room 4' },
  { id: 'apt27', patientId: 'p1', patientName: 'James Anderson', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-05-20', time: '09:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'Sertraline 150mg check-in', visitType: 'In-Person', room: 'Room 3' },
  { id: 'apt28', patientId: 'p4', patientName: 'Emily Chen', provider: 'u2', providerName: 'Joseph', date: '2026-05-22', time: '09:30', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'ADHD semester review', visitType: 'Telehealth', room: 'Virtual' },
  { id: 'apt29', patientId: 'p5', patientName: 'Robert Wilson', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-05-27', time: '13:00', duration: 45, type: 'Follow-Up', status: 'Scheduled', reason: 'Dementia staging, caregiver meeting', visitType: 'In-Person', room: 'Room 3' },
  { id: 'apt30', patientId: 'p6', patientName: 'Aisha Patel', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-05-29', time: '11:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'Bipolar stable check, labs', visitType: 'In-Person', room: 'Room 3' },

  // ── June 2026 ──
  { id: 'apt31', patientId: 'p2', patientName: 'Maria Garcia', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-06-02', time: '10:00', duration: 60, type: 'Follow-Up', status: 'Scheduled', reason: 'PTSD — PE completion session', visitType: 'In-Person', room: 'Room 2' },
  { id: 'apt32', patientId: 'p3', patientName: 'David Thompson', provider: 'u2', providerName: 'Joseph', date: '2026-06-03', time: '14:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'AUD 6-month milestone', visitType: 'In-Person', room: 'Room 1' },
  { id: 'apt33', patientId: 'p1', patientName: 'James Anderson', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-06-04', time: '09:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'MDD quarterly review', visitType: 'In-Person', room: 'Room 3' },
  { id: 'apt34', patientId: 'p4', patientName: 'Emily Chen', provider: 'u2', providerName: 'Joseph', date: '2026-06-08', time: '09:30', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'ADHD summer plan, med holiday discuss', visitType: 'Telehealth', room: 'Virtual' },
  { id: 'apt35', patientId: 'p5', patientName: 'Robert Wilson', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-06-10', time: '13:00', duration: 45, type: 'Follow-Up', status: 'Scheduled', reason: 'Depression/cognitive follow-up', visitType: 'In-Person', room: 'Room 3' },
  { id: 'apt36', patientId: 'p6', patientName: 'Aisha Patel', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-06-12', time: '11:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'Bipolar mgmt, Lamotrigine level', visitType: 'In-Person', room: 'Room 3' },
  { id: 'apt37', patientId: null, patientName: 'New Patient - Olivia Brown', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-06-15', time: '10:00', duration: 60, type: 'New Patient', status: 'Scheduled', reason: 'Initial eval — panic disorder', visitType: 'In-Person', room: 'Room 2' },
  { id: 'apt38', patientId: 'p2', patientName: 'Maria Garcia', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-06-18', time: '10:00', duration: 45, type: 'Follow-Up', status: 'Scheduled', reason: 'PTSD maintenance phase', visitType: 'Telehealth', room: 'Virtual' },
  { id: 'apt39', patientId: 'p3', patientName: 'David Thompson', provider: 'u2', providerName: 'Joseph', date: '2026-06-19', time: '14:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'AUD follow-up, naltrexone', visitType: 'In-Person', room: 'Room 4' },
  { id: 'apt40', patientId: 'p1', patientName: 'James Anderson', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-06-24', time: '09:00', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'Depression check-in, PHQ-9', visitType: 'In-Person', room: 'Room 3' },
  { id: 'apt41', patientId: 'p4', patientName: 'Emily Chen', provider: 'u2', providerName: 'Joseph', date: '2026-06-26', time: '09:30', duration: 30, type: 'Follow-Up', status: 'Scheduled', reason: 'ADHD stimulant refill', visitType: 'In-Person', room: 'Room 1' },
  { id: 'apt42', patientId: 'p5', patientName: 'Robert Wilson', provider: 'u1', providerName: 'Dr. Chris L.', date: '2026-06-30', time: '13:00', duration: 45, type: 'Follow-Up', status: 'Scheduled', reason: 'Dementia monitoring, family session', visitType: 'In-Person', room: 'Room 3' },
];

// ========== ENCOUNTER HISTORY ==========
export const encounterHistory = {
  p1: [
    {
      id: 'enc-hist-1', date: '2026-03-12', time: '09:15', provider: 'Elena Martinez', credentials: 'MD, PhD',
      visitType: 'Follow-Up', cptCode: '99214', icdCode: 'F33.1 - Major depressive disorder, recurrent, moderate',
      reason: 'Med management - depression/anxiety', duration: '28 min',
      chiefComplaint: 'Patient reports persistent low mood and difficulty concentrating at work despite medication adjustments.',
      hpi: 'Mr. Anderson returns for follow-up of MDD and GAD. He reports partial improvement on Sertraline 100mg, noting that anxiety has improved approximately 50% but depressive symptoms persist, particularly anhedonia and difficulty concentrating. Sleep has improved with trazodone. Denies side effects from current regimen. Adherent with medications.',
      intervalNote: 'Since last visit 4 weeks ago: mood improved from 3/10 to 5/10, sleep 6-7 hrs (improved), appetite stable, energy still low. Started walking 20 min 3x/week. Work performance still impacted.',
      mse: 'Appearance: Casually dressed, adequate grooming\nBehavior: Cooperative, good eye contact\nSpeech: Normal rate and volume\nMood: "A little better but not great"\nAffect: Restricted range, congruent\nThought Process: Linear and goal-directed\nThought Content: No suicidal ideation, No homicidal ideation\nPerception: No hallucinations\nCognition: Alert and oriented x4, concentration mildly impaired\nInsight: Good\nJudgment: Good',
      assessment: 'Major depressive disorder, recurrent, moderate — partial response to Sertraline 100mg. GAD improving. Continue current approach with dose optimization.',
      plan: '1. Increase Sertraline from 100mg to 150mg daily\n2. Continue Trazodone 50mg QHS for insomnia\n3. Continue therapy referral - CBT\n4. PHQ-9 today: 14 (moderate)\n5. Return in 4 weeks for reassessment',
      safety: { siLevel: 'None', hiLevel: 'None', selfHarm: false, substanceUse: false, safetyPlanUpdated: false, crisisResources: false, safetyNotes: '' },
      followUp: '4 Weeks', disposition: 'Stable - follow up as scheduled',
    },
    {
      id: 'enc-hist-2', date: '2026-02-14', time: '09:00', provider: 'Elena Martinez', credentials: 'MD, PhD',
      visitType: 'Follow-Up', cptCode: '99214', icdCode: 'F33.1 - Major depressive disorder, recurrent, moderate',
      reason: 'Med management - depression/anxiety', duration: '32 min',
      chiefComplaint: 'Follow-up for depression and anxiety. Reports worsening mood over past month.',
      hpi: 'Patient reports worsening depressive symptoms over past 4 weeks. PHQ-9 increased from 10 to 16. Difficulty sleeping, early morning awakening at 4 AM. Appetite decreased, lost 5 lbs. Continues to work but struggling with motivation. No change in anxiety symptoms on current Sertraline 50mg.',
      intervalNote: 'Since last visit: mood declined from 5/10 to 3/10, sleep disrupted (early awakening), appetite decreased, weight loss 5 lbs. Job stress increased — new supervisor. Compliant with medications.',
      mse: 'Appearance: Casually dressed, mildly disheveled\nBehavior: Cooperative, psychomotor slowing noted\nSpeech: Soft, reduced rate\nMood: "Terrible"\nAffect: Constricted, tearful at times\nThought Process: Linear, impoverished at times\nThought Content: No suicidal ideation, No homicidal ideation, feelings of worthlessness\nPerception: No hallucinations\nCognition: Alert and oriented x4\nInsight: Fair\nJudgment: Fair',
      assessment: 'MDD worsening on Sertraline 50mg. GAD stable. No acute safety concerns. Medication adjustment indicated.',
      plan: '1. Increase Sertraline from 50mg to 100mg daily\n2. Add Trazodone 50mg QHS for insomnia\n3. PHQ-9: 16 (moderately severe)\n4. Discussed sleep hygiene strategies\n5. Return in 4 weeks',
      safety: { siLevel: 'None', hiLevel: 'None', selfHarm: false, substanceUse: false, safetyPlanUpdated: false, crisisResources: false, safetyNotes: '' },
      followUp: '4 Weeks', disposition: 'Stable - follow up as scheduled',
    },
  ],
  p2: [
    {
      id: 'enc-hist-3', date: '2026-03-25', time: '10:00', provider: 'Elena Martinez', credentials: 'MD, PhD',
      visitType: 'Follow-Up', cptCode: '99215', icdCode: 'F43.10 - Post-traumatic stress disorder',
      reason: 'PTSD follow-up, medication review', duration: '52 min',
      chiefComplaint: 'Continuing PTSD treatment. Reports increase in nightmares after anniversary of trauma.',
      hpi: 'Ms. Garcia presents for PTSD follow-up. Reports increased nightmares (4-5/week, up from 1-2/week) coinciding with trauma anniversary. Hypervigilance has increased. Using grounding techniques learned in PE therapy with moderate success. Prazosin 2mg QHS provides partial relief. Sertraline 150mg continued — daytime anxiety improved but still present.',
      intervalNote: 'Anniversary reaction noted. Nightmares increased 4-5x/week. Hypervigilance and startle response worsened. Continuing PE therapy weekly. Using grounding and safety plan. No flashbacks during day. Social isolation increasing.',
      mse: 'Appearance: Well-groomed, guarded posture\nBehavior: Cooperative but hypervigilant, scanning room\nSpeech: Normal rate, slightly pressured when discussing trauma content\nMood: "Anxious and on edge"\nAffect: Anxious, tearful when discussing nightmares\nThought Process: Linear, occasionally tangential when discussing trauma\nThought Content: No suicidal ideation, No homicidal ideation, intrusive trauma memories\nPerception: No hallucinations, flashback-like experiences when triggered\nCognition: Alert and oriented x4\nInsight: Good\nJudgment: Good',
      assessment: 'PTSD with anniversary reaction. Nightmare frequency increased. Current medication partially effective. Consider prazosin adjustment.',
      plan: '1. Increase Prazosin from 2mg to 4mg QHS for nightmares\n2. Continue Sertraline 150mg\n3. Continue PE therapy (session 8 of 12)\n4. PCL-5 score: 48 (above clinical threshold)\n5. Safety plan reviewed and updated\n6. Return in 3 weeks given symptom increase',
      safety: { siLevel: 'None', hiLevel: 'None', selfHarm: false, substanceUse: false, safetyPlanUpdated: true, crisisResources: true, safetyNotes: 'Crisis line number reviewed. Safety plan updated with new coping strategies.' },
      followUp: '3 Weeks', disposition: 'Stable with symptom exacerbation - close follow up',
    },
  ],
  p4: [
    {
      id: 'enc-hist-4', date: '2026-03-15', time: '14:00', provider: 'Michael Johnson', credentials: 'PMHNP-BC',
      visitType: 'Follow-Up', cptCode: '99214', icdCode: 'F90.0 - ADHD, predominantly inattentive type',
      reason: 'ADHD follow-up, stimulant management', duration: '25 min',
      chiefComplaint: 'ADHD medication refill. Reports good response to current regimen.',
      hpi: 'Ms. Chen returns for ADHD follow-up on Adderall XR 20mg. Reports significant improvement in focus and productivity at school. Able to complete assignments within deadlines. Appetite slightly decreased but manageable. Sleep onset delayed by approximately 30 minutes. No cardiovascular symptoms. Heart rate and BP stable.',
      intervalNote: 'Since last visit: grades improved from B- to B+, able to focus in lectures for full duration, organization improved with planner use. Weight stable. Sleep onset delayed but total hours adequate (7 hrs).',
      mse: 'Appearance: Well-groomed, bright affect\nBehavior: Cooperative, organized\nSpeech: Normal rate and volume\nMood: "Good"\nAffect: Full range, congruent\nThought Process: Linear and goal-directed\nThought Content: No suicidal ideation, No homicidal ideation\nPerception: No hallucinations\nCognition: Alert and oriented x4, attention improved on medication\nInsight: Good\nJudgment: Good',
      assessment: 'ADHD-I, well controlled on Adderall XR 20mg. Mild appetite suppression and delayed sleep onset — tolerable side effects.',
      plan: '1. Continue Adderall XR 20mg QAM\n2. Monitor weight and appetite\n3. BP and HR checked today — within normal limits\n4. Counseled on sleep hygiene\n5. 90-day Rx provided via EPCS\n6. Return in 3 months or sooner if concerns',
      safety: { siLevel: 'None', hiLevel: 'None', selfHarm: false, substanceUse: false, safetyPlanUpdated: false, crisisResources: false, safetyNotes: '' },
      followUp: '3 Months', disposition: 'Stable - routine follow up',
    },
  ],
  p6: [
    {
      id: 'enc-hist-5', date: '2026-03-20', time: '11:00', provider: 'Elena Martinez', credentials: 'MD, PhD',
      visitType: 'Follow-Up', cptCode: '99214', icdCode: 'F31.32 - Bipolar disorder, current episode depressed, moderate',
      reason: 'Bipolar disorder management', duration: '35 min',
      chiefComplaint: 'Mood has been depressed for past 2 weeks despite Lithium. Having difficulty getting out of bed.',
      hpi: 'Ms. Patel presents with depressed mood for 2 weeks. Currently on Lithium 900mg with level 0.8. No manic symptoms. Reports hypersomnia (sleeping 12-14 hrs), loss of interest in activities, difficulty with ADLs. Denies substance use. Weight gain 8 lbs over past month — attributes to increased appetite and inactivity.',
      intervalNote: 'Depressive episode onset ~2 weeks ago without clear trigger. PHQ-9: 18 (moderately severe). Previously euthymic for 4 months on current regimen. Last lithium level 0.8 (therapeutic). TSH normal 3 months ago.',
      mse: 'Appearance: Disheveled, fatigued appearance\nBehavior: Cooperative, psychomotor retardation\nSpeech: Slow rate, low volume\nMood: "Depressed"\nAffect: Flat, tearful\nThought Process: Linear but slowed\nThought Content: No suicidal ideation, No homicidal ideation, hopelessness present\nPerception: No hallucinations\nCognition: Alert and oriented x4, concentration impaired\nInsight: Fair\nJudgment: Fair',
      assessment: 'Bipolar I disorder, current episode depressed, moderate. Breakthrough depression despite therapeutic lithium level. Consider adjunctive treatment.',
      plan: '1. Add Lamotrigine 25mg daily x2 weeks, then titrate to 50mg\n2. Continue Lithium 900mg, recheck level in 2 weeks\n3. Labs: Lithium level, TSH, CBC, BMP\n4. PHQ-9: 18\n5. Discussed activity scheduling for behavioral activation\n6. Return in 2 weeks for Lamotrigine titration',
      safety: { siLevel: 'None', hiLevel: 'None', selfHarm: false, substanceUse: false, safetyPlanUpdated: false, crisisResources: true, safetyNotes: 'Hopelessness present but no suicidal ideation. Crisis resources reviewed.' },
      followUp: '2 Weeks', disposition: 'Stable - close follow up for medication titration',
    },
  ],
};

// ========== BTG AUDIT LOG ==========
export const btgAuditLog = [
  { id: 'btg1', patientId: 'p5', patientName: 'Robert Wilson', accessedBy: 'u4', accessedByName: 'Kelly Chen, RN', reason: 'Patient called in crisis - needed to verify current medications for ER communication', timestamp: '2026-04-05T14:30:00Z', approved: true },
  { id: 'btg2', patientId: 'p6', patientName: 'Aisha Patel', accessedBy: 'u2', accessedByName: 'NP Michael Johnson', reason: 'Covering for Dr. Chris L. - urgent medication question from pharmacy', timestamp: '2026-04-03T16:45:00Z', approved: true },
];

// ========== MEDICATION DATABASE (for ordering) ==========
export const medicationDatabase = [
  // SSRIs
  { name: 'Sertraline (Zoloft)', class: 'SSRI', doses: ['25mg', '50mg', '100mg', '150mg', '200mg'], routes: ['Oral'], isControlled: false },
  { name: 'Fluoxetine (Prozac)', class: 'SSRI', doses: ['10mg', '20mg', '40mg', '60mg'], routes: ['Oral'], isControlled: false },
  { name: 'Escitalopram (Lexapro)', class: 'SSRI', doses: ['5mg', '10mg', '20mg'], routes: ['Oral'], isControlled: false },
  { name: 'Paroxetine (Paxil)', class: 'SSRI', doses: ['10mg', '20mg', '30mg', '40mg'], routes: ['Oral'], isControlled: false },
  { name: 'Citalopram (Celexa)', class: 'SSRI', doses: ['10mg', '20mg', '40mg'], routes: ['Oral'], isControlled: false },
  // SNRIs
  { name: 'Venlafaxine XR (Effexor XR)', class: 'SNRI', doses: ['37.5mg', '75mg', '150mg', '225mg'], routes: ['Oral'], isControlled: false },
  { name: 'Duloxetine (Cymbalta)', class: 'SNRI', doses: ['20mg', '30mg', '60mg', '90mg', '120mg'], routes: ['Oral'], isControlled: false },
  { name: 'Desvenlafaxine (Pristiq)', class: 'SNRI', doses: ['25mg', '50mg', '100mg'], routes: ['Oral'], isControlled: false },
  // Atypical Antidepressants
  { name: 'Bupropion XL (Wellbutrin XL)', class: 'Atypical Antidepressant', doses: ['150mg', '300mg', '450mg'], routes: ['Oral'], isControlled: false },
  { name: 'Mirtazapine (Remeron)', class: 'Atypical Antidepressant', doses: ['7.5mg', '15mg', '30mg', '45mg'], routes: ['Oral'], isControlled: false },
  { name: 'Trazodone', class: 'Atypical Antidepressant', doses: ['25mg', '50mg', '100mg', '150mg', '200mg', '300mg'], routes: ['Oral'], isControlled: false },
  // Antipsychotics
  { name: 'Quetiapine (Seroquel)', class: 'Atypical Antipsychotic', doses: ['25mg', '50mg', '100mg', '200mg', '300mg', '400mg'], routes: ['Oral'], isControlled: false },
  { name: 'Aripiprazole (Abilify)', class: 'Atypical Antipsychotic', doses: ['2mg', '5mg', '10mg', '15mg', '20mg', '30mg'], routes: ['Oral'], isControlled: false },
  { name: 'Olanzapine (Zyprexa)', class: 'Atypical Antipsychotic', doses: ['2.5mg', '5mg', '10mg', '15mg', '20mg'], routes: ['Oral'], isControlled: false },
  { name: 'Risperidone (Risperdal)', class: 'Atypical Antipsychotic', doses: ['0.5mg', '1mg', '2mg', '3mg', '4mg'], routes: ['Oral'], isControlled: false },
  // Mood Stabilizers
  { name: 'Lamotrigine (Lamictal)', class: 'Mood Stabilizer', doses: ['25mg', '50mg', '100mg', '150mg', '200mg', '250mg', '300mg'], routes: ['Oral'], isControlled: false },
  { name: 'Lithium Carbonate', class: 'Mood Stabilizer', doses: ['150mg', '300mg', '600mg', '900mg'], routes: ['Oral'], isControlled: false },
  { name: 'Valproic Acid (Depakote)', class: 'Mood Stabilizer', doses: ['250mg', '500mg', '750mg', '1000mg'], routes: ['Oral'], isControlled: false },
  // Anxiolytics - Non-controlled
  { name: 'Buspirone', class: 'Anxiolytic', doses: ['5mg', '7.5mg', '10mg', '15mg', '30mg'], routes: ['Oral'], isControlled: false },
  { name: 'Hydroxyzine', class: 'Anxiolytic', doses: ['10mg', '25mg', '50mg'], routes: ['Oral'], isControlled: false },
  // Benzodiazepines (Controlled)
  { name: 'Lorazepam (Ativan)', class: 'Benzodiazepine', doses: ['0.5mg', '1mg', '2mg'], routes: ['Oral'], isControlled: true, schedule: 'Schedule IV' },
  { name: 'Clonazepam (Klonopin)', class: 'Benzodiazepine', doses: ['0.25mg', '0.5mg', '1mg', '2mg'], routes: ['Oral'], isControlled: true, schedule: 'Schedule IV' },
  { name: 'Alprazolam (Xanax)', class: 'Benzodiazepine', doses: ['0.25mg', '0.5mg', '1mg', '2mg'], routes: ['Oral'], isControlled: true, schedule: 'Schedule IV' },
  { name: 'Diazepam (Valium)', class: 'Benzodiazepine', doses: ['2mg', '5mg', '10mg'], routes: ['Oral'], isControlled: true, schedule: 'Schedule IV' },
  // Stimulants (Controlled)
  { name: 'Adderall XR (Amphetamine/Dextroamphetamine)', class: 'Stimulant', doses: ['5mg', '10mg', '15mg', '20mg', '25mg', '30mg'], routes: ['Oral'], isControlled: true, schedule: 'Schedule II' },
  { name: 'Methylphenidate ER (Concerta)', class: 'Stimulant', doses: ['18mg', '27mg', '36mg', '54mg'], routes: ['Oral'], isControlled: true, schedule: 'Schedule II' },
  { name: 'Lisdexamfetamine (Vyvanse)', class: 'Stimulant', doses: ['10mg', '20mg', '30mg', '40mg', '50mg', '60mg', '70mg'], routes: ['Oral'], isControlled: true, schedule: 'Schedule II' },
  // Non-stimulant ADHD
  { name: 'Atomoxetine (Strattera)', class: 'Non-Stimulant ADHD', doses: ['10mg', '18mg', '25mg', '40mg', '60mg', '80mg', '100mg'], routes: ['Oral'], isControlled: false },
  { name: 'Guanfacine ER (Intuniv)', class: 'Non-Stimulant ADHD', doses: ['1mg', '2mg', '3mg', '4mg'], routes: ['Oral'], isControlled: false },
  // Sleep
  { name: 'Zolpidem (Ambien)', class: 'Sedative-Hypnotic', doses: ['5mg', '10mg'], routes: ['Oral'], isControlled: true, schedule: 'Schedule IV' },
  { name: 'Eszopiclone (Lunesta)', class: 'Sedative-Hypnotic', doses: ['1mg', '2mg', '3mg'], routes: ['Oral'], isControlled: true, schedule: 'Schedule IV' },
  { name: 'Suvorexant (Belsomra)', class: 'Sedative-Hypnotic', doses: ['5mg', '10mg', '15mg', '20mg'], routes: ['Oral'], isControlled: true, schedule: 'Schedule IV' },
  // PTSD specific
  { name: 'Prazosin', class: 'Alpha-1 Blocker', doses: ['1mg', '2mg', '5mg', '10mg', '15mg', '20mg'], routes: ['Oral'], isControlled: false },
  // Substance Use
  { name: 'Naltrexone', class: 'Opioid Antagonist', doses: ['50mg'], routes: ['Oral'], isControlled: false },
  { name: 'Buprenorphine/Naloxone (Suboxone)', class: 'Opioid Partial Agonist', doses: ['2mg/0.5mg', '4mg/1mg', '8mg/2mg', '12mg/3mg'], routes: ['Sublingual'], isControlled: true, schedule: 'Schedule III' },
  { name: 'Acamprosate (Campral)', class: 'GABA Analog', doses: ['333mg'], routes: ['Oral'], isControlled: false },
  { name: 'Disulfiram (Antabuse)', class: 'Alcohol Deterrent', doses: ['250mg', '500mg'], routes: ['Oral'], isControlled: false },
  { name: 'Naloxone Nasal Spray (Narcan)', class: 'Opioid Antagonist', doses: ['4mg'], routes: ['Intranasal'], isControlled: false },
];

// ========== LAB ORDER DATABASE ==========
export const labOrderDatabase = [
  { name: 'CBC w/ Differential', code: '85025', category: 'Hematology' },
  { name: 'Comprehensive Metabolic Panel (CMP)', code: '80053', category: 'Chemistry' },
  { name: 'Basic Metabolic Panel (BMP)', code: '80048', category: 'Chemistry' },
  { name: 'Hepatic Function Panel', code: '80076', category: 'Chemistry' },
  { name: 'Lipid Panel', code: '80061', category: 'Chemistry' },
  { name: 'TSH', code: '84443', category: 'Endocrine' },
  { name: 'Free T4', code: '84439', category: 'Endocrine' },
  { name: 'HbA1c', code: '83036', category: 'Endocrine' },
  { name: 'Lithium Level', code: '80178', category: 'Therapeutic Drug Monitoring' },
  { name: 'Valproic Acid Level', code: '80164', category: 'Therapeutic Drug Monitoring' },
  { name: 'Lamotrigine Level', code: '80175', category: 'Therapeutic Drug Monitoring' },
  { name: 'Urine Drug Screen (10-panel)', code: '80307', category: 'Toxicology' },
  { name: 'Urine Drug Screen (12-panel w/ confirmation)', code: '80308', category: 'Toxicology' },
  { name: 'Blood Alcohol Level', code: '80320', category: 'Toxicology' },
  { name: 'Vitamin D 25-Hydroxy', code: '82306', category: 'Chemistry' },
  { name: 'Vitamin B12', code: '82607', category: 'Chemistry' },
  { name: 'Folate', code: '82746', category: 'Chemistry' },
  { name: 'Prolactin', code: '84146', category: 'Endocrine' },
  { name: 'RPR (Syphilis Screen)', code: '86592', category: 'Infectious Disease' },
  { name: 'HIV 1/2 Antibody', code: '86703', category: 'Infectious Disease' },
  { name: 'Hepatitis Panel (A, B, C)', code: '80074', category: 'Infectious Disease' },
  { name: 'Urinalysis w/ Reflex Culture', code: '81001', category: 'Urinalysis' },
  { name: 'CRP (C-Reactive Protein)', code: '86140', category: 'Inflammatory' },
  { name: 'ESR (Sed Rate)', code: '85652', category: 'Inflammatory' },
  { name: 'Pregnancy Test (Urine)', code: '81025', category: 'Urinalysis' },
  { name: 'Pregnancy Test (Serum hCG)', code: '84703', category: 'Chemistry' },
];

// ========== ILLINOIS PHARMACIES ==========
export const pharmacies = [
  // Walgreens
  { id: 'ph1', name: 'Walgreens #5734', chain: 'Walgreens', address: '757 N Michigan Ave', city: 'Chicago', state: 'IL', zip: '60611', phone: '(312) 664-8681', fax: '(312) 664-8682', npi: '1234567890', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-9pm' },
  { id: 'ph2', name: 'Walgreens #3218', chain: 'Walgreens', address: '2 E Roosevelt Rd', city: 'Chicago', state: 'IL', zip: '60605', phone: '(312) 427-0863', fax: '(312) 427-0864', npi: '1234567891', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-9pm' },
  { id: 'ph3', name: 'Walgreens #4590', chain: 'Walgreens', address: '6140 N Broadway', city: 'Chicago', state: 'IL', zip: '60660', phone: '(773) 973-0430', fax: '(773) 973-0431', npi: '1234567892', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-9pm' },
  { id: 'ph4', name: 'Walgreens #12835', chain: 'Walgreens', address: '1601 N Wells St', city: 'Chicago', state: 'IL', zip: '60614', phone: '(312) 642-4008', fax: '(312) 642-4009', npi: '1234567893', hours: 'Mon-Fri 7am-10pm, Sat-Sun 8am-10pm' },
  { id: 'ph5', name: 'Walgreens #2867', chain: 'Walgreens', address: '200 W Adams St', city: 'Chicago', state: 'IL', zip: '60606', phone: '(312) 332-1862', fax: '(312) 332-1863', npi: '1234567894', hours: 'Mon-Fri 7am-9pm, Sat 9am-6pm, Sun Closed' },
  { id: 'ph6', name: 'Walgreens #9021', chain: 'Walgreens', address: '1500 N Clybourn Ave', city: 'Chicago', state: 'IL', zip: '60610', phone: '(312) 944-5515', fax: '(312) 944-5516', npi: '1234567895', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-9pm' },
  { id: 'ph7', name: 'Walgreens #4103', chain: 'Walgreens', address: '2001 Butterfield Rd', city: 'Downers Grove', state: 'IL', zip: '60515', phone: '(630) 963-0126', fax: '(630) 963-0127', npi: '1234567896', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-9pm' },
  { id: 'ph8', name: 'Walgreens #6820', chain: 'Walgreens', address: '1 S Prospect Ave', city: 'Park Ridge', state: 'IL', zip: '60068', phone: '(847) 825-7380', fax: '(847) 825-7381', npi: '1234567897', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-9pm' },
  { id: 'ph9', name: 'Walgreens #3907', chain: 'Walgreens', address: '1010 Lake St', city: 'Oak Park', state: 'IL', zip: '60301', phone: '(708) 386-5215', fax: '(708) 386-5216', npi: '1234567898', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-9pm' },
  { id: 'ph10', name: 'Walgreens #5415', chain: 'Walgreens', address: '6301 N Sheridan Rd', city: 'Chicago', state: 'IL', zip: '60660', phone: '(773) 338-3380', fax: '(773) 338-3381', npi: '1234567899', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-9pm' },
  { id: 'ph11', name: 'Walgreens #11302', chain: 'Walgreens', address: '501 N State St', city: 'Springfield', state: 'IL', zip: '62702', phone: '(217) 544-2101', fax: '(217) 544-2102', npi: '1234567900', hours: 'Mon-Fri 8am-9pm, Sat-Sun 9am-6pm' },
  { id: 'ph12', name: 'Walgreens #7205', chain: 'Walgreens', address: '2316 W Monroe St', city: 'Springfield', state: 'IL', zip: '62704', phone: '(217) 546-8234', fax: '(217) 546-8235', npi: '1234567901', hours: 'Mon-Fri 8am-9pm, Sat-Sun 9am-6pm' },
  { id: 'ph13', name: 'Walgreens #4710', chain: 'Walgreens', address: '1320 E Empire St', city: 'Bloomington', state: 'IL', zip: '61701', phone: '(309) 662-0389', fax: '(309) 662-0390', npi: '1234567902', hours: 'Mon-Fri 8am-9pm, Sat-Sun 9am-6pm' },
  { id: 'ph14', name: 'Walgreens #6318', chain: 'Walgreens', address: '7501 N University St', city: 'Peoria', state: 'IL', zip: '61614', phone: '(309) 692-2148', fax: '(309) 692-2149', npi: '1234567903', hours: 'Mon-Fri 8am-9pm, Sat-Sun 9am-6pm' },
  { id: 'ph15', name: 'Walgreens #8456', chain: 'Walgreens', address: '2000 Wabash Ave', city: 'Springfield', state: 'IL', zip: '62704', phone: '(217) 787-1330', fax: '(217) 787-1331', npi: '1234567904', hours: 'Mon-Fri 8am-9pm, Sat-Sun 9am-6pm' },
  // Jewel-Osco
  { id: 'ph16', name: 'Jewel-Osco Pharmacy #3042', chain: 'Jewel-Osco', address: '1224 S Wabash Ave', city: 'Chicago', state: 'IL', zip: '60605', phone: '(312) 663-0974', fax: '(312) 663-0975', npi: '2345678901', hours: 'Mon-Fri 9am-9pm, Sat 9am-6pm, Sun 10am-5pm' },
  { id: 'ph17', name: 'Jewel-Osco Pharmacy #3156', chain: 'Jewel-Osco', address: '550 N State St', city: 'Chicago', state: 'IL', zip: '60654', phone: '(312) 923-0285', fax: '(312) 923-0286', npi: '2345678902', hours: 'Mon-Fri 9am-9pm, Sat 9am-6pm, Sun 10am-5pm' },
  { id: 'ph18', name: 'Jewel-Osco Pharmacy #3310', chain: 'Jewel-Osco', address: '4660 N Broadway', city: 'Chicago', state: 'IL', zip: '60640', phone: '(773) 275-3820', fax: '(773) 275-3821', npi: '2345678903', hours: 'Mon-Fri 9am-9pm, Sat 9am-6pm, Sun 10am-5pm' },
  { id: 'ph19', name: 'Jewel-Osco Pharmacy #3125', chain: 'Jewel-Osco', address: '1340 S Canal St', city: 'Chicago', state: 'IL', zip: '60607', phone: '(312) 563-1481', fax: '(312) 563-1482', npi: '2345678904', hours: 'Mon-Fri 9am-9pm, Sat 9am-6pm, Sun 10am-5pm' },
  { id: 'ph20', name: 'Jewel-Osco Pharmacy #3480', chain: 'Jewel-Osco', address: '3531 N Broadway', city: 'Chicago', state: 'IL', zip: '60657', phone: '(773) 348-1012', fax: '(773) 348-1013', npi: '2345678905', hours: 'Mon-Fri 9am-9pm, Sat 9am-6pm, Sun 10am-5pm' },
  { id: 'ph21', name: 'Jewel-Osco Pharmacy #3522', chain: 'Jewel-Osco', address: '1955 E Oakton St', city: 'Des Plaines', state: 'IL', zip: '60018', phone: '(847) 635-0423', fax: '(847) 635-0424', npi: '2345678906', hours: 'Mon-Fri 9am-9pm, Sat 9am-6pm, Sun 10am-5pm' },
  { id: 'ph22', name: 'Jewel-Osco Pharmacy #3690', chain: 'Jewel-Osco', address: '160 S Lincolnway', city: 'North Aurora', state: 'IL', zip: '60542', phone: '(630) 897-7440', fax: '(630) 897-7441', npi: '2345678907', hours: 'Mon-Fri 9am-9pm, Sat 9am-6pm, Sun 10am-5pm' },
  { id: 'ph23', name: 'Jewel-Osco Pharmacy #3201', chain: 'Jewel-Osco', address: '1301 S Naper Blvd', city: 'Naperville', state: 'IL', zip: '60540', phone: '(630) 369-1720', fax: '(630) 369-1721', npi: '2345678908', hours: 'Mon-Fri 9am-9pm, Sat 9am-6pm, Sun 10am-5pm' },
  { id: 'ph24', name: 'Jewel-Osco Pharmacy #3344', chain: 'Jewel-Osco', address: '2855 W 95th St', city: 'Evergreen Park', state: 'IL', zip: '60805', phone: '(708) 424-2012', fax: '(708) 424-2013', npi: '2345678909', hours: 'Mon-Fri 9am-9pm, Sat 9am-6pm, Sun 10am-5pm' },
  { id: 'ph25', name: 'Jewel-Osco Pharmacy #3890', chain: 'Jewel-Osco', address: '2940 N Ashland Ave', city: 'Chicago', state: 'IL', zip: '60657', phone: '(773) 868-4001', fax: '(773) 868-4002', npi: '2345678910', hours: 'Mon-Fri 9am-9pm, Sat 9am-6pm, Sun 10am-5pm' },
  // CVS
  { id: 'ph26', name: 'CVS Pharmacy #8432', chain: 'CVS', address: '205 W Randolph St', city: 'Chicago', state: 'IL', zip: '60606', phone: '(312) 782-8820', fax: '(312) 782-8821', npi: '3456789012', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-8pm' },
  { id: 'ph27', name: 'CVS Pharmacy #8205', chain: 'CVS', address: '600 W Diversey Pkwy', city: 'Chicago', state: 'IL', zip: '60614', phone: '(773) 525-2500', fax: '(773) 525-2501', npi: '3456789013', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-8pm' },
  { id: 'ph28', name: 'CVS Pharmacy #8671', chain: 'CVS', address: '4051 N Broadway', city: 'Chicago', state: 'IL', zip: '60613', phone: '(773) 477-2350', fax: '(773) 477-2351', npi: '3456789014', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-8pm' },
  { id: 'ph29', name: 'CVS Pharmacy #8310', chain: 'CVS', address: '6150 N Lincoln Ave', city: 'Chicago', state: 'IL', zip: '60659', phone: '(773) 267-1210', fax: '(773) 267-1211', npi: '3456789015', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-8pm' },
  { id: 'ph30', name: 'CVS Pharmacy #8530', chain: 'CVS', address: '3033 N Halsted St', city: 'Chicago', state: 'IL', zip: '60657', phone: '(773) 935-3011', fax: '(773) 935-3012', npi: '3456789016', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-8pm' },
  { id: 'ph31', name: 'CVS Pharmacy #8919', chain: 'CVS', address: '7520 W North Ave', city: 'Elmwood Park', state: 'IL', zip: '60707', phone: '(708) 453-4410', fax: '(708) 453-4411', npi: '3456789017', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-8pm' },
  { id: 'ph32', name: 'CVS Pharmacy #8702', chain: 'CVS', address: '1165 Ogden Ave', city: 'Naperville', state: 'IL', zip: '60540', phone: '(630) 961-4012', fax: '(630) 961-4013', npi: '3456789018', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-8pm' },
  { id: 'ph33', name: 'CVS Pharmacy #8145', chain: 'CVS', address: '4809 Cal Sag Rd', city: 'Crestwood', state: 'IL', zip: '60418', phone: '(708) 385-7700', fax: '(708) 385-7701', npi: '3456789019', hours: 'Mon-Fri 8am-10pm, Sat-Sun 9am-8pm' },
  { id: 'ph34', name: 'CVS Pharmacy #8821', chain: 'CVS', address: '3101 Montvale Dr', city: 'Springfield', state: 'IL', zip: '62704', phone: '(217) 698-2250', fax: '(217) 698-2251', npi: '3456789020', hours: 'Mon-Fri 8am-9pm, Sat 9am-6pm, Sun 10am-5pm' },
  { id: 'ph35', name: 'CVS Pharmacy #8054', chain: 'CVS', address: '2108 N Veterans Pkwy', city: 'Bloomington', state: 'IL', zip: '61704', phone: '(309) 662-4730', fax: '(309) 662-4731', npi: '3456789021', hours: 'Mon-Fri 8am-9pm, Sat 9am-6pm, Sun 10am-5pm' },
  // Meijer
  { id: 'ph36', name: 'Meijer Pharmacy #253', chain: 'Meijer', address: '8300 S Holland Rd', city: 'Chicago', state: 'IL', zip: '60620', phone: '(773) 488-3410', fax: '(773) 488-3411', npi: '4567890123', hours: 'Mon-Fri 9am-9pm, Sat 9am-7pm, Sun 10am-6pm' },
  { id: 'ph37', name: 'Meijer Pharmacy #289', chain: 'Meijer', address: '4901 W North Ave', city: 'Chicago', state: 'IL', zip: '60639', phone: '(773) 745-2550', fax: '(773) 745-2551', npi: '4567890124', hours: 'Mon-Fri 9am-9pm, Sat 9am-7pm, Sun 10am-6pm' },
  { id: 'ph38', name: 'Meijer Pharmacy #302', chain: 'Meijer', address: '2500 W Lake St', city: 'Melrose Park', state: 'IL', zip: '60160', phone: '(708) 338-1260', fax: '(708) 338-1261', npi: '4567890125', hours: 'Mon-Fri 9am-9pm, Sat 9am-7pm, Sun 10am-6pm' },
  { id: 'ph39', name: 'Meijer Pharmacy #267', chain: 'Meijer', address: '7000 Cermak Rd', city: 'Berwyn', state: 'IL', zip: '60402', phone: '(708) 484-7310', fax: '(708) 484-7311', npi: '4567890126', hours: 'Mon-Fri 9am-9pm, Sat 9am-7pm, Sun 10am-6pm' },
  { id: 'ph40', name: 'Meijer Pharmacy #198', chain: 'Meijer', address: '12001 S Pulaski Rd', city: 'Alsip', state: 'IL', zip: '60803', phone: '(708) 396-0105', fax: '(708) 396-0106', npi: '4567890127', hours: 'Mon-Fri 9am-9pm, Sat 9am-7pm, Sun 10am-6pm' },
  { id: 'ph41', name: 'Meijer Pharmacy #275', chain: 'Meijer', address: '4200 Conestoga Dr', city: 'Springfield', state: 'IL', zip: '62711', phone: '(217) 679-3290', fax: '(217) 679-3291', npi: '4567890128', hours: 'Mon-Fri 9am-9pm, Sat 9am-7pm, Sun 10am-6pm' },
  { id: 'ph42', name: 'Meijer Pharmacy #310', chain: 'Meijer', address: '1601 E Empire St', city: 'Bloomington', state: 'IL', zip: '61701', phone: '(309) 664-5420', fax: '(309) 664-5421', npi: '4567890129', hours: 'Mon-Fri 9am-9pm, Sat 9am-7pm, Sun 10am-6pm' },
  { id: 'ph43', name: 'Meijer Pharmacy #245', chain: 'Meijer', address: '3600 E Lincolnway', city: 'Sterling', state: 'IL', zip: '61081', phone: '(815) 564-2340', fax: '(815) 564-2341', npi: '4567890130', hours: 'Mon-Fri 9am-9pm, Sat 9am-7pm, Sun 10am-6pm' },
  { id: 'ph44', name: 'Meijer Pharmacy #320', chain: 'Meijer', address: '2501 N Prospect Ave', city: 'Champaign', state: 'IL', zip: '61822', phone: '(217) 373-1250', fax: '(217) 373-1251', npi: '4567890131', hours: 'Mon-Fri 9am-9pm, Sat 9am-7pm, Sun 10am-6pm' },
  { id: 'ph45', name: 'Meijer Pharmacy #188', chain: 'Meijer', address: '5001 W War Memorial Dr', city: 'Peoria', state: 'IL', zip: '61615', phone: '(309) 693-8720', fax: '(309) 693-8721', npi: '4567890132', hours: 'Mon-Fri 9am-9pm, Sat 9am-7pm, Sun 10am-6pm' },
];

// ========== ILLINOIS LAB FACILITIES ==========
export const labFacilities = [
  // ── Quest Diagnostics ──────────────────────────────────
  { id: 'lab1',  name: 'Quest Diagnostics — Chicago Loop',          chain: 'Quest Diagnostics', address: '200 W Adams St, Suite 200',              city: 'Chicago',         state: 'IL', zip: '60606', phone: '(312) 782-4480', fax: '(312) 782-4481', services: ['Blood Draw', 'Urine Collection', 'Drug Screening', 'Employer Testing'] },
  { id: 'lab2',  name: 'Quest Diagnostics — Streeterville',         chain: 'Quest Diagnostics', address: '680 N Lake Shore Dr, Suite 820',          city: 'Chicago',         state: 'IL', zip: '60611', phone: '(312) 943-7400', fax: '(312) 943-7401', services: ['Blood Draw', 'Urine Collection', 'Genetic Testing', 'Drug Screening'] },
  { id: 'lab3',  name: 'Quest Diagnostics — Lincoln Park',          chain: 'Quest Diagnostics', address: '2525 N Clark St',                         city: 'Chicago',         state: 'IL', zip: '60614', phone: '(773) 281-7600', fax: '(773) 281-7601', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab4',  name: 'Quest Diagnostics — Skokie',                chain: 'Quest Diagnostics', address: '9933 Lawler Ave, Suite 550',              city: 'Skokie',          state: 'IL', zip: '60077', phone: '(847) 568-2250', fax: '(847) 568-2251', services: ['Blood Draw', 'Urine Collection', 'Drug Screening', 'Employer Testing'] },
  { id: 'lab5',  name: 'Quest Diagnostics — Naperville',            chain: 'Quest Diagnostics', address: '1020 E Ogden Ave, Suite 106',             city: 'Naperville',      state: 'IL', zip: '60563', phone: '(630) 527-6120', fax: '(630) 527-6121', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab6',  name: 'Quest Diagnostics — Schaumburg',            chain: 'Quest Diagnostics', address: '1699 E Woodfield Rd, Suite 200',          city: 'Schaumburg',      state: 'IL', zip: '60173', phone: '(847) 517-3200', fax: '(847) 517-3201', services: ['Blood Draw', 'Urine Collection', 'Drug Screening', 'Employer Testing'] },
  { id: 'lab7',  name: 'Quest Diagnostics — Oak Brook',             chain: 'Quest Diagnostics', address: '2011 York Rd, Suite 100',                 city: 'Oak Brook',       state: 'IL', zip: '60523', phone: '(630) 571-8000', fax: '(630) 571-8001', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab8',  name: 'Quest Diagnostics — Orland Park',           chain: 'Quest Diagnostics', address: '16311 S Harlem Ave',                      city: 'Orland Park',     state: 'IL', zip: '60462', phone: '(708) 460-5510', fax: '(708) 460-5511', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab9',  name: 'Quest Diagnostics — Springfield',           chain: 'Quest Diagnostics', address: '350 W Carpenter St, Suite 100',           city: 'Springfield',     state: 'IL', zip: '62702', phone: '(217) 544-9800', fax: '(217) 544-9801', services: ['Blood Draw', 'Urine Collection', 'Drug Screening', 'Employer Testing'] },
  { id: 'lab10', name: 'Quest Diagnostics — Bloomington',           chain: 'Quest Diagnostics', address: '801 N Hershey Rd, Suite A',               city: 'Bloomington',     state: 'IL', zip: '61704', phone: '(309) 661-6200', fax: '(309) 661-6201', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab11', name: 'Quest Diagnostics — Peoria',                chain: 'Quest Diagnostics', address: '5401 N Knoxville Ave',                    city: 'Peoria',          state: 'IL', zip: '61614', phone: '(309) 589-3200', fax: '(309) 589-3201', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab12', name: 'Quest Diagnostics — Rockford',              chain: 'Quest Diagnostics', address: '5302 E State St, Suite 100',              city: 'Rockford',        state: 'IL', zip: '61108', phone: '(815) 227-6800', fax: '(815) 227-6801', services: ['Blood Draw', 'Urine Collection', 'Drug Screening', 'Employer Testing'] },
  { id: 'lab35', name: 'Quest Diagnostics — Aurora',                chain: 'Quest Diagnostics', address: '2000 W Galena Blvd, Suite 100',           city: 'Aurora',          state: 'IL', zip: '60506', phone: '(630) 896-7100', fax: '(630) 896-7101', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab36', name: 'Quest Diagnostics — Joliet',                chain: 'Quest Diagnostics', address: '3400 Glenwood Ave, Suite A',              city: 'Joliet',          state: 'IL', zip: '60435', phone: '(815) 744-0440', fax: '(815) 744-0441', services: ['Blood Draw', 'Urine Collection', 'Drug Screening', 'Employer Testing'] },
  { id: 'lab37', name: 'Quest Diagnostics — Elgin',                 chain: 'Quest Diagnostics', address: '1455 Larkin Ave, Suite 100',              city: 'Elgin',           state: 'IL', zip: '60123', phone: '(847) 697-3630', fax: '(847) 697-3631', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab38', name: 'Quest Diagnostics — Waukegan',              chain: 'Quest Diagnostics', address: '2516 Washington St',                      city: 'Waukegan',        state: 'IL', zip: '60085', phone: '(847) 623-1191', fax: '(847) 623-1192', services: ['Blood Draw', 'Urine Collection', 'Drug Screening', 'Employer Testing'] },
  { id: 'lab39', name: 'Quest Diagnostics — Champaign',             chain: 'Quest Diagnostics', address: '2103 S Neil St, Suite 1',                 city: 'Champaign',       state: 'IL', zip: '61820', phone: '(217) 352-5151', fax: '(217) 352-5152', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab40', name: 'Quest Diagnostics — Decatur',               chain: 'Quest Diagnostics', address: '877 W Wood St',                           city: 'Decatur',         state: 'IL', zip: '62522', phone: '(217) 422-4170', fax: '(217) 422-4171', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },

  // ── LabCorp ────────────────────────────────────────────
  { id: 'lab13', name: 'LabCorp — Chicago Downtown',                chain: 'LabCorp', address: '30 N Michigan Ave, Suite 1110',              city: 'Chicago',         state: 'IL', zip: '60602', phone: '(312) 726-4690', fax: '(312) 726-4691', services: ['Blood Draw', 'Urine Collection', 'Genetic Testing', 'Drug Screening'] },
  { id: 'lab14', name: 'LabCorp — River North',                     chain: 'LabCorp', address: '444 N Michigan Ave, Suite 710',              city: 'Chicago',         state: 'IL', zip: '60611', phone: '(312) 329-0102', fax: '(312) 329-0103', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab15', name: 'LabCorp — Lakeview',                        chain: 'LabCorp', address: '3000 N Halsted St, Suite 610',               city: 'Chicago',         state: 'IL', zip: '60657', phone: '(773) 472-1550', fax: '(773) 472-1551', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab16', name: 'LabCorp — Evanston',                        chain: 'LabCorp', address: '1033 University Pl, Suite 200',              city: 'Evanston',        state: 'IL', zip: '60201', phone: '(847) 866-3100', fax: '(847) 866-3101', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab17', name: 'LabCorp — Arlington Heights',               chain: 'LabCorp', address: '800 W Biesterfield Rd, Suite 206',          city: 'Arlington Heights',state: 'IL', zip: '60005', phone: '(847) 394-1700', fax: '(847) 394-1701', services: ['Blood Draw', 'Urine Collection', 'Drug Screening', 'Employer Testing'] },
  { id: 'lab18', name: 'LabCorp — Naperville',                      chain: 'LabCorp', address: '1550 N Route 59, Suite 120',                city: 'Naperville',      state: 'IL', zip: '60563', phone: '(630) 527-1770', fax: '(630) 527-1771', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab19', name: 'LabCorp — Oak Lawn',                        chain: 'LabCorp', address: '5201 W 95th St',                            city: 'Oak Lawn',        state: 'IL', zip: '60453', phone: '(708) 424-6200', fax: '(708) 424-6201', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab20', name: 'LabCorp — Tinley Park',                     chain: 'LabCorp', address: '18400 S 80th Ave, Suite 200',               city: 'Tinley Park',     state: 'IL', zip: '60487', phone: '(708) 429-5100', fax: '(708) 429-5101', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab21', name: 'LabCorp — Springfield',                     chain: 'LabCorp', address: '301 N Eighth St, Suite 200',                city: 'Springfield',     state: 'IL', zip: '62702', phone: '(217) 525-2020', fax: '(217) 525-2021', services: ['Blood Draw', 'Urine Collection', 'Drug Screening', 'Employer Testing'] },
  { id: 'lab22', name: 'LabCorp — Champaign',                       chain: 'LabCorp', address: '2103 S Neil St, Suite 2',                   city: 'Champaign',       state: 'IL', zip: '61820', phone: '(217) 351-6100', fax: '(217) 351-6101', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab23', name: 'LabCorp — Rockford',                        chain: 'LabCorp', address: '920 N Alpine Rd, Suite 104',                city: 'Rockford',        state: 'IL', zip: '61107', phone: '(815) 398-4400', fax: '(815) 398-4401', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab24', name: 'LabCorp — Peoria',                          chain: 'LabCorp', address: '7309 N University St, Suite 103',           city: 'Peoria',          state: 'IL', zip: '61614', phone: '(309) 693-5300', fax: '(309) 693-5301', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab41', name: 'LabCorp — Joliet',                          chain: 'LabCorp', address: '900 Essington Rd, Suite 200',               city: 'Joliet',          state: 'IL', zip: '60435', phone: '(815) 744-2300', fax: '(815) 744-2301', services: ['Blood Draw', 'Urine Collection', 'Drug Screening', 'Employer Testing'] },
  { id: 'lab42', name: 'LabCorp — Aurora',                          chain: 'LabCorp', address: '1700 N Farnsworth Ave, Suite 7',            city: 'Aurora',          state: 'IL', zip: '60505', phone: '(630) 978-7040', fax: '(630) 978-7041', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab43', name: 'LabCorp — Waukegan',                        chain: 'LabCorp', address: '1188 S Waukegan Rd, Suite 100',             city: 'Waukegan',        state: 'IL', zip: '60085', phone: '(847) 244-9730', fax: '(847) 244-9731', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab44', name: 'LabCorp — Bolingbrook',                     chain: 'LabCorp', address: '200 S Weber Rd, Suite 111',                 city: 'Bolingbrook',     state: 'IL', zip: '60490', phone: '(630) 679-0808', fax: '(630) 679-0809', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab45', name: 'LabCorp — Normal',                          chain: 'LabCorp', address: '1311 Franklin Ave, Suite A',                city: 'Normal',          state: 'IL', zip: '61761', phone: '(309) 452-8510', fax: '(309) 452-8511', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },

  // ── Hospital-Based / Reference Labs ───────────────────
  { id: 'lab25', name: 'Northwestern Memorial Hospital Lab',         chain: 'Northwestern Medicine', address: '251 E Huron St',                    city: 'Chicago',         state: 'IL', zip: '60611', phone: '(312) 926-2000', fax: '(312) 926-2001', services: ['Full Pathology', 'Blood Draw', 'Urine', 'Genetic Testing', 'Toxicology'] },
  { id: 'lab26', name: 'Rush University Medical Center Lab',         chain: 'Rush Health', address: '1653 W Congress Pkwy',                        city: 'Chicago',         state: 'IL', zip: '60612', phone: '(312) 942-5000', fax: '(312) 942-5001', services: ['Full Pathology', 'Blood Draw', 'Toxicology', 'Genetic Testing'] },
  { id: 'lab27', name: 'Advocate Christ Medical Center Lab',         chain: 'Advocate Health', address: '4440 W 95th St',                           city: 'Oak Lawn',        state: 'IL', zip: '60453', phone: '(708) 684-8000', fax: '(708) 684-8001', services: ['Full Pathology', 'Blood Draw', 'Drug Screening', 'Genetic Testing'] },
  { id: 'lab28', name: "OSF Saint Francis Medical Center Lab",       chain: 'OSF HealthCare', address: '530 NE Glen Oak Ave',                       city: 'Peoria',          state: 'IL', zip: '61637', phone: '(309) 655-2000', fax: '(309) 655-2001', services: ['Full Pathology', 'Blood Draw', 'Toxicology'] },
  { id: 'lab29', name: 'Memorial Medical Center Lab',                chain: 'Memorial Health', address: '701 N First St',                           city: 'Springfield',     state: 'IL', zip: '62781', phone: '(217) 788-3000', fax: '(217) 788-3001', services: ['Full Pathology', 'Blood Draw', 'Drug Screening'] },
  { id: 'lab30', name: 'SwedishAmerican Hospital Lab',               chain: 'UW Health', address: '1401 E State St',                                city: 'Rockford',        state: 'IL', zip: '61104', phone: '(815) 968-4400', fax: '(815) 968-4401', services: ['Full Pathology', 'Blood Draw', 'Toxicology'] },
  { id: 'lab31', name: 'Carle Foundation Hospital Lab',              chain: 'Carle Health', address: '611 W Park St',                               city: 'Urbana',          state: 'IL', zip: '61801', phone: '(217) 383-3311', fax: '(217) 383-3312', services: ['Full Pathology', 'Blood Draw', 'Genetic Testing', 'Drug Screening'] },
  { id: 'lab32', name: 'Advocate Good Samaritan Hospital Lab',       chain: 'Advocate Health', address: '3815 Highland Ave',                        city: 'Downers Grove',   state: 'IL', zip: '60515', phone: '(630) 275-5900', fax: '(630) 275-5901', services: ['Full Pathology', 'Blood Draw', 'Drug Screening'] },
  { id: 'lab33', name: 'Edward Hospital Lab',                        chain: 'Edward-Elmhurst Health', address: '801 S Washington St',              city: 'Naperville',      state: 'IL', zip: '60540', phone: '(630) 527-3000', fax: '(630) 527-3001', services: ['Full Pathology', 'Blood Draw', 'Toxicology', 'Genetic Testing'] },
  { id: 'lab34', name: 'Loyola University Medical Center Lab',       chain: 'Trinity Health', address: '2160 S First Ave',                          city: 'Maywood',         state: 'IL', zip: '60153', phone: '(708) 216-9000', fax: '(708) 216-9001', services: ['Full Pathology', 'Blood Draw', 'Genetic Testing', 'Toxicology'] },
  { id: 'lab46', name: 'NorthShore University HealthSystem Lab',     chain: 'NorthShore', address: '2650 Ridge Ave',                                city: 'Evanston',        state: 'IL', zip: '60201', phone: '(847) 570-2000', fax: '(847) 570-2001', services: ['Full Pathology', 'Blood Draw', 'Genetic Testing', 'Drug Screening'] },
  { id: 'lab47', name: 'Amita Health Saint Joseph Medical Lab',      chain: 'Amita Health', address: '333 N Madison St',                            city: 'Joliet',          state: 'IL', zip: '60435', phone: '(815) 725-7133', fax: '(815) 725-7134', services: ['Full Pathology', 'Blood Draw', 'Toxicology'] },
  { id: 'lab48', name: 'Morris Hospital Lab',                        chain: 'Morris Hospital', address: '150 W High St',                            city: 'Morris',          state: 'IL', zip: '60450', phone: '(815) 942-2932', fax: '(815) 942-2933', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab49', name: 'UnityPoint Health Methodist Lab',            chain: 'UnityPoint Health', address: '221 NE Glen Oak Ave',                    city: 'Peoria',          state: 'IL', zip: '61636', phone: '(309) 672-5522', fax: '(309) 672-5523', services: ['Full Pathology', 'Blood Draw', 'Toxicology', 'Drug Screening'] },

  // ── Specialty / Toxicology ─────────────────────────────
  { id: 'lab50', name: 'Millennium Health — Chicago',                chain: 'Millennium Health', address: '111 W Jackson Blvd, Suite 1700',          city: 'Chicago',         state: 'IL', zip: '60604', phone: '(312) 566-9900', fax: '(312) 566-9901', services: ['Urine Drug Testing', 'Toxicology', 'Oral Fluid Testing', 'PDMP Support'] },
  { id: 'lab51', name: 'Aegis Sciences — Illinois Collection Site',  chain: 'Aegis Sciences', address: '1740 W Harrison St, Suite 200',              city: 'Chicago',         state: 'IL', zip: '60612', phone: '(312) 421-9000', fax: '(312) 421-9001', services: ['Urine Drug Testing', 'Toxicology', 'Oral Fluid Testing'] },
  { id: 'lab52', name: 'USDTL — Drug Testing Labs (Chicago)',        chain: 'USDTL', address: '1700 S Mount Prospect Rd',                           city: 'Des Plaines',     state: 'IL', zip: '60018', phone: '(800) 235-2367', fax: '(847) 299-5600', services: ['Urine Drug Testing', 'Hair Drug Testing', 'Cord Blood Testing', 'Meconium'] },
  { id: 'lab53', name: 'Clinical Reference Lab (CRL) — IL Drop',    chain: 'CRL', address: '601 W Diversey Pkwy, Suite 100',                        city: 'Chicago',         state: 'IL', zip: '60614', phone: '(800) 445-6917', fax: '(913) 492-2843', services: ['Urine Drug Testing', 'Blood Draw', 'Wellness Testing'] },
  { id: 'lab54', name: 'Genoptix / NeoGenomics — Chicago',           chain: 'NeoGenomics', address: '400 N Michigan Ave, Suite 900',                 city: 'Chicago',         state: 'IL', zip: '60611', phone: '(312) 222-9100', fax: '(312) 222-9101', services: ['Genetic Testing', 'Oncology Genomics', 'Blood Draw'] },

  // ── Outpatient / Retail Clinic Labs ───────────────────
  { id: 'lab55', name: 'Walgreens Diagnostic Imaging & Lab (Wicker Park)', chain: 'Walgreens Health', address: '1372 N Milwaukee Ave',              city: 'Chicago',         state: 'IL', zip: '60622', phone: '(773) 395-6811', fax: '', services: ['Blood Draw', 'Urine Collection', 'Wellness Screening'] },
  { id: 'lab56', name: 'CVS MinuteClinic Lab — Chicago N Clark',    chain: 'CVS MinuteClinic', address: '3101 N Clark St',                           city: 'Chicago',         state: 'IL', zip: '60657', phone: '(773) 880-7700', fax: '', services: ['Blood Draw', 'Urine Collection', 'Strep/Flu Testing'] },
  { id: 'lab57', name: 'Immediate Care NW Indiana Lab — Calumet City', chain: 'Immediate Care', address: '1509 Torrence Ave',                        city: 'Calumet City',    state: 'IL', zip: '60409', phone: '(708) 730-4300', fax: '(708) 730-4301', services: ['Blood Draw', 'Urine Collection', 'Drug Screening', 'Employer Testing'] },
  { id: 'lab58', name: 'Duly Health & Care Lab — Plainfield',       chain: 'Duly Health', address: '13291 S Route 59, Suite 100',                    city: 'Plainfield',      state: 'IL', zip: '60585', phone: '(815) 436-6700', fax: '(815) 436-6701', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
  { id: 'lab59', name: 'Midwest Express Clinic Lab — Homer Glen',   chain: 'Midwest Express Clinic', address: '14315 S Bell Rd',                     city: 'Homer Glen',      state: 'IL', zip: '60491', phone: '(708) 364-6000', fax: '(708) 364-6001', services: ['Blood Draw', 'Urine Collection', 'Drug Screening', 'Employer Testing'] },
  { id: 'lab60', name: 'Touchpoint Health Lab — Decatur',           chain: 'Touchpoint Health', address: '3901 N Woodford St',                       city: 'Decatur',         state: 'IL', zip: '62526', phone: '(217) 876-2831', fax: '(217) 876-2832', services: ['Blood Draw', 'Urine Collection', 'Drug Screening'] },
];


// ========== ENCOUNTERS ==========
export const encounters = {
  p1: [
    { id: 'enc-p1-1', patientId: 'p1', date: '2026-03-12', time: '09:00', type: 'Follow-Up', provider: 'u1', providerName: 'Dr. Chris L.', chiefComplaint: 'Persistent low mood, trouble sleeping', status: 'Completed', subjective: 'Patient reports mood has been consistently low for the past 3 weeks. Sleep onset delayed by 1-2 hrs. Appetite decreased. Denies SI.', objective: 'Alert, cooperative. Affect flat. PHQ-9: 14 (moderate depression). BP 122/78, HR 72.', assessment: 'Major Depressive Disorder, moderate � partial response to current sertraline dose.', plan: 'Increase sertraline from 100mg to 150mg daily. Repeat PHQ-9 in 4 weeks. Referred to individual therapy.', diagnoses: ['F32.1'], signedBy: 'Dr. Chris L.', signedAt: '2026-03-12T10:15:00Z' },
    { id: 'enc-p1-2', patientId: 'p1', date: '2026-01-22', time: '09:00', type: 'Medication Management', provider: 'u1', providerName: 'Dr. Chris L.', chiefComplaint: 'Medication refill � sertraline', status: 'Completed', subjective: 'Patient doing well on sertraline 100mg. Reports mild improvement in mood and energy. No side effects.', objective: 'Alert, euthymic. PHQ-9: 10 (mild). BP 118/76.', assessment: 'MDD � improving. Continue current regimen.', plan: 'Refill sertraline 100mg #90. RTC 6 weeks.', diagnoses: ['F32.0'], signedBy: 'Dr. Chris L.', signedAt: '2026-01-22T09:50:00Z' },
  ],
  p2: [
    { id: 'enc-p2-1', patientId: 'p2', date: '2026-03-20', time: '10:00', type: 'Psychiatric Evaluation', provider: 'u1', providerName: 'Dr. Chris L.', chiefComplaint: 'PTSD symptoms, nightmares worsening', status: 'Completed', subjective: 'Patient reports increase in trauma-related nightmares 4-5x/week. Hypervigilance in public places. Avoidance of crowded areas. PCL-5 score: 52.', objective: 'Anxious, guarded. Affect restricted. Maintains appropriate eye contact. Denies SI/HI.', assessment: 'PTSD � acute exacerbation. Consider PE therapy protocol.', plan: 'Start Prolonged Exposure (PE) therapy � scheduled weekly sessions. Continue prazosin 2mg QHS for nightmares. F/U 2 weeks.', diagnoses: ['F43.10'], signedBy: 'Dr. Chris L.', signedAt: '2026-03-20T11:30:00Z' },
  ],
  p3: [
    { id: 'enc-p3-1', patientId: 'p3', date: '2026-02-14', time: '11:00', type: 'Follow-Up', provider: 'u2', providerName: 'Joseph', chiefComplaint: 'AUD management check-in, craving control', status: 'Completed', subjective: 'Patient reports 45 days sobriety. Occasional cravings but managing with naltrexone. Attending AA 3x/week.', objective: 'Alert, well-groomed. Cooperative. Liver function improved on labs. LFTs trending down.', assessment: 'AUD � in remission, early. Positive response to naltrexone.', plan: 'Continue naltrexone 50mg daily. Repeat LFTs in 8 weeks. Encourage AA attendance. RTC 4 weeks.', diagnoses: ['F10.20'], signedBy: 'Joseph', signedAt: '2026-02-14T11:55:00Z' },
  ],
  p4: [
    { id: 'enc-p4-1', patientId: 'p4', date: '2026-03-05', time: '09:30', type: 'Follow-Up', provider: 'u2', providerName: 'Joseph', chiefComplaint: 'ADHD follow-up, school performance', status: 'Completed', subjective: 'Parent reports improvement in focus at school. Teacher feedback positive. Patient completing homework more consistently. Sleep normal.', objective: 'Alert, age-appropriate. Cooperative. Vanderbilt: 18 (improved from 28).', assessment: 'ADHD, combined type � responding well to Adderall XR.', plan: 'Continue Adderall XR 20mg daily. Medication bridge for summer pending. RTC 6 weeks.', diagnoses: ['F90.2'], signedBy: 'Joseph', signedAt: '2026-03-05T10:20:00Z' },
  ],
  p5: [
    { id: 'enc-p5-1', patientId: 'p5', date: '2026-03-18', time: '13:00', type: 'Follow-Up', provider: 'u1', providerName: 'Dr. Chris L.', chiefComplaint: 'Memory concerns, depressive symptoms', status: 'Completed', subjective: 'Family reports increased forgetfulness � misplacing items, forgetting appointments. Patient minimizes. Also reports low mood, fatigue.', objective: 'MMSE: 21/30 (mild cognitive impairment). PHQ-9: 12. BP 138/84.', assessment: 'Mild cognitive impairment. Co-morbid depression may be exacerbating cognitive symptoms.', plan: 'Refer to neuropsychology for full evaluation. Start mirtazapine 7.5mg QHS for depression/sleep. Caregiver education provided.', diagnoses: ['G31.84', 'F32.1'], signedBy: 'Dr. Chris L.', signedAt: '2026-03-18T14:10:00Z' },
  ],
  p6: [
    { id: 'enc-p6-1', patientId: 'p6', date: '2026-03-25', time: '11:00', type: 'Medication Management', provider: 'u1', providerName: 'Dr. Chris L.', chiefComplaint: 'Bipolar mood stabilization, lamotrigine titration', status: 'Completed', subjective: 'Patient in mixed state last month but reports improvement. Current mood is euthymic. No manic symptoms. Good sleep. Denies depressive episodes.', objective: 'Euthymic, organized thinking. Cooperative. Lamotrigine level: 8.2 mcg/mL.', assessment: 'Bipolar I � stabilized on lamotrigine titration. Level therapeutic.', plan: 'Increase lamotrigine to 200mg daily. Monitor for rash. Mood diary encouraged. RTC 4 weeks.', diagnoses: ['F31.10'], signedBy: 'Dr. Chris L.', signedAt: '2026-03-25T11:45:00Z' },
  ],
};
