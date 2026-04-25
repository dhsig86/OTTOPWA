import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PatientProvider } from './contexts/PatientContext';
import { Layout } from './components/Shell/Layout';

// Pages (Lazy Loaded)
const Home           = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login          = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const ModuleFrame    = lazy(() => import('./components/ModuleFrame').then(m => ({ default: m.ModuleFrame })));
const VideoChannels  = lazy(() => import('./pages/modules/VideoChannels').then(m => ({ default: m.VideoChannels })));
const ZumbidoTherapy = lazy(() => import('./pages/modules/ZumbidoTherapy').then(m => ({ default: m.ZumbidoTherapy })));
const Feedback       = lazy(() => import('./pages/modules/Feedback').then(m => ({ default: m.Feedback })));
const PeriOp         = lazy(() => import('./pages/modules/PeriOp').then(m => ({ default: m.PeriOp })));
const QuizPage       = lazy(() => import('./pages/modules/QuizPage').then(m => ({ default: m.QuizPage })));
const InfoPage       = lazy(() => import('./pages/modules/InfoPage').then(m => ({ default: m.InfoPage })));
const Search         = lazy(() => import('./pages/Search').then(m => ({ default: m.Search })));
const Notifications  = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const Onboarding        = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));
const Profile           = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const CompleteProfile   = lazy(() => import('./pages/CompleteProfile').then(m => ({ default: m.CompleteProfile })));
const NotFound          = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

import { ErrorBoundary } from './components/ErrorBoundary';

const PageLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[40vh]">
    <div className="w-8 h-8 rounded-full border-4 border-[#1D9E75] border-t-transparent animate-spin" />
  </div>
);

// Requer autenticação, mas não exige profileCompleted (usado no /complete-profile)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, profileCompleted } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!profileCompleted) return <Navigate to="/complete-profile" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/complete-profile" element={<AuthRoute><CompleteProfile /></AuthRoute>} />
      <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Home />} />
        
        {/* Navigation Routes */}
        <Route path="search" element={<Search />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Dynamic & Mock Modules */}
        <Route path="modules/webview" element={<ModuleFrame />} />
        <Route path="modules/videos" element={<VideoChannels />} />
        <Route path="modules/zumbido" element={<ZumbidoTherapy />} />
        <Route path="modules/feedback" element={<Feedback />} />
        <Route path="modules/periop" element={<PeriOp />} />
        <Route path="modules/quiz" element={<QuizPage />} />
        <Route path="modules/info" element={<InfoPage />} />
        <Route path="modules/premium" element={<Navigate to="/" replace />} />
        
        <Route path="*" element={<NotFound />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
    </ErrorBoundary>
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
