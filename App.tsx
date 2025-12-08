import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import BattlePage from './pages/BattlePage';

// Placeholder component for pages that aren't built yet
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-40">
      <h2 className="text-4xl font-black text-med-text mb-2">{title}</h2>
      <p className="font-bold text-xl">Coming Soon</p>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex min-h-screen bg-med-bg text-med-text selection:bg-med-primary selection:text-white">
        
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Wrapper */}
        <main className="flex-1 md:ml-20 lg:ml-64 flex flex-col">
          
          <TopBar />

          {/* Routes Content */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/battle" element={<BattlePage />} />
            
            {/* Added placeholders for missing pages to prevent errors */}
            <Route path="/review" element={<PlaceholderPage title="Review" />} />
            <Route path="/leaderboard" element={<PlaceholderPage title="Rankings" />} />
            <Route path="/shop" element={<PlaceholderPage title="Item Shop" />} />
            
            {/* Fallback routes for demo */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

        </main>

      </div>
    </HashRouter>
  );
};

export default App;