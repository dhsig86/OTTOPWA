import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PatientProvider } from './contexts/PatientContext';
import { Layout } from './components/Shell/Layout';
import { lazyWithRetry } from './utils/lazyWithRetry';

// Pages (Lazy Loaded)
const Home           = lazyWithRetry(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login          = lazyWithRetry(() => import('./pages/Login').then(m => ({ default: m.Login })));
const ModuleFrame    = lazyWithRetry(() => import('./components/ModuleFrame').then(m => ({ default: m.ModuleFrame })));
const VideoChannels  = lazyWithRetry(() => import('./pages/modules/VideoChannels').then(m => ({ default: m.VideoChannels })));
const Feedback       = lazyWithRetry(() => import('./pages/modules/Feedback').then(m => ({ default: m.Feedback })));
const PeriOp         = lazyWithRetry(() => import('./pages/modules/PeriOp').then(m => ({ default: m.PeriOp })));

const InfoPage       = lazyWithRetry(() => import('./pages/modules/InfoPage').then(m => ({ default: m.InfoPage })));
const Search         = lazyWithRetry(() => import('./pages/Search').then(m => ({ default: m.Search })));
const Notifications  = lazyWithRetry(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const Onboarding        = lazyWithRetry(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));
const Profile           = lazyWithRetry(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const CompleteProfile   = lazyWithRetry(() => import('./pages/CompleteProfile').then(m => ({ default: m.CompleteProfile })));
const NotFound          = lazyWithRetry(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const PremiumPage       = lazyWithRetry(() => import('./pages/modules/PremiumPage').then(m => ({ default: m.PremiumPage })));

import { ErrorBoundary } from './components/ErrorBoundary';
import { WarmUpSplash } from './components/WarmUpSplash';

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
  // Mostra WarmUpSplash uma vez por sessão — dá tempo para Render/Heroku acordarem
  const [warmUpDone, setWarmUpDone] = useState(() =>
    sessionStorage.getItem('otto_warmup_done') === '1'
  );

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!profileCompleted) return <Navigate to="/complete-profile" replace />;

  if (!warmUpDone) {
    return (
      <WarmUpSplash
        onReady={() => {
          sessionStorage.setItem('otto_warmup_done', '1');
          setWarmUpDone(true);
        }}
      />
    );
  }

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
        <Route path="modules/feedback" element={<Feedback />} />
        <Route path="modules/periop" element={<PeriOp />} />

        <Route path="modules/info" element={<InfoPage />} />
        <Route path="modules/premium" element={<PremiumPage />} />  {/* BUG-04: conectado — não mais redirect silencioso */}
        
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
