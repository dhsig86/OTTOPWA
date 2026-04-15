import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePatient } from '../contexts/PatientContext';

export const ModuleFrame: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, profile } = useAuth();
  const { patientId, doctorId } = usePatient();
  
  const state = location.state as { url?: string };
  const targetUrl = state?.url;

  if (!targetUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p>Módulo não encontrado.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-otto-teal">Voltar</button>
      </div>
    );
  }

  // Construct URL with query parameters
  const getFullUrl = () => {
    try {
      const url = new URL(targetUrl.startsWith('http') ? targetUrl : window.location.origin + targetUrl);
      if (userId) url.searchParams.append('otto_user', userId);
      if (profile) url.searchParams.append('otto_profile', profile);
      if (patientId) url.searchParams.append('otto_patient', patientId);
      if (doctorId) url.searchParams.append('otto_doctor', doctorId);
      return url.toString();
    } catch {
      return targetUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <header className="h-14 bg-otto-teal text-white flex items-center px-2 shrink-0 shadow-sm relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 mr-2 hover:bg-otto-teal-dark rounded-full transition flex items-center gap-1"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </button>
      </header>
      <div className="flex-1 w-full bg-gray-50 relative">
        <iframe
          src={getFullUrl()}
          className="absolute inset-0 w-full h-full border-0"
          title="Módulo Externo"
          allow="camera; microphone; fullscreen; autoplay; geolocation"
        />
      </div>
    </div>
  );
};
