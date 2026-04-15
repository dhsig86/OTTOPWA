import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PatientProvider } from './contexts/PatientContext';
import { Layout } from './components/Shell/Layout';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ModuleFrame } from './components/ModuleFrame';
import { VideoChannels } from './pages/modules/VideoChannels';
import { ZumbidoTherapy } from './pages/modules/ZumbidoTherapy';
import { Feedback } from './pages/modules/Feedback';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Home />} />
        
        {/* Dynamic & Mock Modules */}
        <Route path="modules/webview" element={<ModuleFrame />} />
        <Route path="modules/videos" element={<VideoChannels />} />
        <Route path="modules/zumbido" element={<ZumbidoTherapy />} />
        <Route path="modules/feedback" element={<Feedback />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <Router>
          <AppRoutes />
        </Router>
      </PatientProvider>
    </AuthProvider>
  );
}

export default App;
