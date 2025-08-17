import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useBranding } from './hooks/useBranding';
import { useTheme } from './hooks/useTheme';
import { initializeApi } from './utils/api';
import { AppConfig } from './types';

// Pages
import SetupPage from './pages/SetupPage';
import MainPage from './pages/MainPage';

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-text-secondary">Carregando...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const { branding, isLoading: brandingLoading } = useBranding();
  const { isDark } = useTheme();
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppConfig();
    checkSetupStatus();
  }, []);

  const loadAppConfig = async () => {
    try {
      const response = await fetch('/config/app.json');
      if (response.ok) {
        const config = await response.json();
        setAppConfig(config);
        initializeApi(config);
      }
    } catch (error) {
      console.error('Failed to load app config:', error);
    }
  };

  const checkSetupStatus = () => {
    const setupComplete = localStorage.getItem('setupComplete');
    setIsSetupComplete(setupComplete === 'true');
    setIsLoading(false);
  };

  const completeSetup = () => {
    localStorage.setItem('setupComplete', 'true');
    setIsSetupComplete(true);
  };

  if (isLoading || brandingLoading || !appConfig) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
        <Routes>
          <Route 
            path="/setup" 
            element={
              <SetupPage 
                branding={branding} 
                onComplete={completeSetup}
              />
            } 
          />
          <Route 
            path="/app" 
            element={
              isSetupComplete ? (
                <MainPage branding={branding} appConfig={appConfig} />
              ) : (
                <Navigate to="/setup" replace />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              <Navigate to={isSetupComplete ? "/app" : "/setup"} replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;