import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { CreatorAuthProvider } from '@/contexts/CreatorAuthContext';
import { routes } from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <CreatorAuthProvider>
        <IntersectObserver />
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <main className="flex-grow">
            <Routes>
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={route.element}
                />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        <Toaster position="top-right" richColors />
      </CreatorAuthProvider>
    </Router>
  );
};

export default App;