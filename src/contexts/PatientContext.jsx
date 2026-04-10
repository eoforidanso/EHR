import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  patients as patientsData,
  allergies as allergiesData,
  problems as problemsData,
  vitals as vitalsData,
  medications as medsData,
  immunizations as immunData,
  labResults as labData,
  assessmentScores as assessData,
  orders as ordersData,
  inboxMessages as inboxData,
  appointments as aptsData,
  btgAuditLog as btgData,
  encounters as encountersData,
} from '../data/mockData';

const PatientContext = createContext(null);

export function PatientProvider({ children }) {
  const [patients] = useState(patientsData);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const MAX_OPEN_CHARTS = 4;
  const [openCharts, setOpenCharts] = useState([]);
  const [allergies, setAllergies] = useState(allergiesData);
  const [problemList, setProblemList] = useState(problemsData);
  const [vitalSigns, setVitalSigns] = useState(vitalsData);
  const [meds, setMeds] = useState(medsData);
  const [immunizations] = useState(immunData);
  const [labResults] = useState(labData);
  const [assessmentScores, setAssessmentScores] = useState(assessData);
  const [orders, setOrders] = useState(ordersData);
  const [inboxMessages, setInboxMessages] = useState(inboxData);
  const [appointments, setAppointments] = useState(aptsData);
  const [btgAuditLog, setBtgAuditLog] = useState(btgData);
  const [btgAccessGranted, setBtgAccessGranted] = useState({});
  const [encounters, setEncounters] = useState(encountersData);
  const [blockedDays, setBlockedDays] = useState([]);

  const selectPatient = useCallback((patientId) => {
    const p = patientsData.find((pt) => pt.id === patientId);
    setSelectedPatient(p || null);
  }, []);

  const openChart = useCallback((patientId) => {
    const p = patientsData.find((pt) => pt.id === patientId);
    if (!p) return;
    setSelectedPatient(p);
    setOpenCharts((prev) => {
      if (prev.some((c) => c.id === patientId)) return prev;
      const next = [...prev, p];
      if (next.length > MAX_OPEN_CHARTS) next.shift();
      return next;
    });
  }, []);

  const closeChart = useCallback((patientId) => {
    setOpenCharts((prev) => {
      const next = prev.filter((c) => c.id !== patientId);
      return next;
    });
    setSelectedPatient((current) => {
      if (current?.id === patientId) {
        const remaining = openCharts.filter((c) => c.id !== patientId);
        return remaining.length > 0 ? remaining[remaining.length - 1] : null;
      }
      return current;
    });
  }, [openCharts]);

  const addAllergy = useCallback((patientId, allergy) => {
    setAllergies((prev) => ({
      ...prev,
      [patientId]: [...(prev[patientId] || []), { ...allergy, id: `a-${Date.now()}` }],
    }));
  }, []);

  const addProblem = useCallback((patientId, problem) => {
    setProblemList((prev) => ({
      ...prev,
      [patientId]: [...(prev[patientId] || []), { ...problem, id: `pr-${Date.now()}` }],
    }));
  }, []);

  const addVitals = useCallback((patientId, vital) => {
    setVitalSigns((prev) => ({
      ...prev,
      [patientId]: [{ ...vital, id: `v-${Date.now()}` }, ...(prev[patientId] || [])],
    }));
  }, []);

  const addOrder = useCallback((patientId, order) => {
    setOrders((prev) => ({
      ...prev,
      [patientId]: [...(prev[patientId] || []), { ...order, id: `o-${Date.now()}` }],
    }));
  }, []);

  const addMedication = useCallback((patientId, med) => {
    setMeds((prev) => ({
      ...prev,
      [patientId]: [...(prev[patientId] || []), { ...med, id: `m-${Date.now()}` }],
    }));
  }, []);

  const updateMedication = useCallback((patientId, medId, updates) => {
    setMeds((prev) => ({
      ...prev,
      [patientId]: (prev[patientId] || []).map((m) =>
        m.id === medId ? { ...m, ...updates } : m
      ),
    }));
  }, []);

  const removeMedication = useCallback((patientId, medId) => {
    setMeds((prev) => ({
      ...prev,
      [patientId]: (prev[patientId] || []).filter((m) => m.id !== medId),
    }));
  }, []);

  const addAssessment = useCallback((patientId, assessment) => {
    setAssessmentScores((prev) => ({
      ...prev,
      [patientId]: [{ ...assessment, id: `as-${Date.now()}` }, ...(prev[patientId] || [])],
    }));
  }, []);

  const updateMessageStatus = useCallback((msgId, newStatus) => {
    setInboxMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, status: newStatus, read: newStatus === 'Read' } : m))
    );
  }, []);

  const addInboxMessage = useCallback((message) => {
    setInboxMessages((prev) => [
      { ...message, id: `msg-${Date.now()}`, read: false, status: 'Unread' },
      ...prev,
    ]);
  }, []);

  const requestBTGAccess = useCallback(
    (patientId, userId, userName, reason) => {
      const patient = patientsData.find((p) => p.id === patientId);
      const entry = {
        id: `btg-${Date.now()}`,
        patientId,
        patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
        accessedBy: userId,
        accessedByName: userName,
        reason,
        timestamp: new Date().toISOString(),
        approved: true,
      };
      setBtgAuditLog((prev) => [entry, ...prev]);
      setBtgAccessGranted((prev) => ({ ...prev, [patientId]: true }));
      return true;
    },
    []
  );

  const hasBTGAccess = useCallback(
    (patientId) => {
      return btgAccessGranted[patientId] === true;
    },
    [btgAccessGranted]
  );

  const updateAppointmentStatus = useCallback((aptId, status) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === aptId ? { ...a, status } : a))
    );
  }, []);

  const addEncounter = useCallback((patientId, encounter) => {
    setEncounters((prev) => ({
      ...prev,
      [patientId]: [{ ...encounter, id: `enc-${Date.now()}` }, ...(prev[patientId] || [])],
    }));
  }, []);

  const updateEncounter = useCallback((patientId, encounterId, updates) => {
    setEncounters((prev) => ({
      ...prev,
      [patientId]: (prev[patientId] || []).map((e) =>
        e.id === encounterId ? { ...e, ...updates } : e
      ),
    }));
  }, []);

  const addBlockedDay = useCallback((entry) => {
    setBlockedDays((prev) => [...prev, { ...entry, id: `bd-${Date.now()}-${Math.random()}` }]);
  }, []);

  const removeBlockedDay = useCallback((id) => {
    setBlockedDays((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <PatientContext.Provider
      value={{
        patients,
        selectedPatient,
        selectPatient,
        openCharts,
        openChart,
        closeChart,
        allergies,
        addAllergy,
        problemList,
        addProblem,
        vitalSigns,
        addVitals,
        meds,
        addMedication,
        updateMedication,
        removeMedication,
        immunizations,
        labResults,
        assessmentScores,
        addAssessment,
        orders,
        addOrder,
        inboxMessages,
        updateMessageStatus,
        addInboxMessage,
        appointments,
        updateAppointmentStatus,
        encounters,
        addEncounter,
        updateEncounter,
        blockedDays,
        addBlockedDay,
        removeBlockedDay,
        btgAuditLog,
        requestBTGAccess,
        hasBTGAccess,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatient must be used within PatientProvider');
  return ctx;
}
