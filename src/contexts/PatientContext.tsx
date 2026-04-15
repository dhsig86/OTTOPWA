import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PatientContextType {
  patientId: string | null;
  doctorId: string | null;
  setPatientData: (patient: string | null, doctor: string | null) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const storedPatient = localStorage.getItem('otto_patient_id');
    const storedDoctor = localStorage.getItem('otto_doctor_id');
    
    if (storedPatient) setPatientId(storedPatient);
    if (storedDoctor) setDoctorId(storedDoctor);
  }, []);

  const setPatientData = (patient: string | null, doctor: string | null) => {
    setPatientId(patient);
    setDoctorId(doctor);
    
    if (patient) localStorage.setItem('otto_patient_id', patient);
    else localStorage.removeItem('otto_patient_id');
    
    if (doctor) localStorage.setItem('otto_doctor_id', doctor);
    else localStorage.removeItem('otto_doctor_id');
  };

  return (
    <PatientContext.Provider value={{ patientId, doctorId, setPatientData }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};
