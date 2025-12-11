import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import BattlePage from './pages/BattlePage';
import BattleQuiz from './pages/BattleQuiz';
import AuthPage from './pages/AuthPage';
import Onboarding from './pages/Onboarding';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-40">
    <h2 className="text-4xl font-black text-med-text mb-2">{title}</h2>
    <p className="font-bold text-xl">Coming Soon</p>
  </div>
);

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-med-bg text-med-text selection:bg-med-primary selection:text-white">
      <Sidebar />
      <main className="flex-1 md:ml-20 lg:ml-64 flex flex-col">
        <TopBar />
        {children}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-med-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black text-med-text">Chargement...</h2>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <AuthPage />}
        />
        <Route
          path="/onboarding"
          element={session ? <Onboarding /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/"
          element={
            session ? (
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/battle"
          element={
            session ? (
              <ProtectedLayout>
                <BattlePage />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/battle-quiz/:battleId"
          element={
            session ? (
              <ProtectedLayout>
                <BattleQuiz />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/review"
          element={
            session ? (
              <ProtectedLayout>
                <PlaceholderPage title="Review" />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/leaderboard"
          element={
            session ? (
              <ProtectedLayout>
                <PlaceholderPage title="Rankings" />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/shop"
          element={
            session ? (
              <ProtectedLayout>
                <PlaceholderPage title="Item Shop" />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;