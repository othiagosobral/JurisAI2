import { useState, useEffect } from 'react';
import { BrandingConfig } from '../types';

const defaultBranding: BrandingConfig = {
  appName: "JurisAI",
  tagline: "Assistente Jurídico Inteligente",
  logo: "/logo.svg",
  favicon: "/favicon.ico",
  colors: {
    light: {
      primary: "#1e40af",
      secondary: "#64748b",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#1e293b",
      textSecondary: "#64748b"
    },
    dark: {
      primary: "#3b82f6",
      secondary: "#94a3b8",
      accent: "#fbbf24",
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f1f5f9",
      textSecondary: "#94a3b8"
    }
  },
  fonts: {
    primary: "Inter",
    secondary: "system-ui"
  },
  contact: {
    email: "contato@jurisai.com.br",
    phone: "+55 11 99999-9999",
    website: "https://jurisai.com.br"
  }
};

export const useBranding = () => {
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      // Try to load from localStorage first (user customizations)
      const savedBranding = localStorage.getItem('branding');
      if (savedBranding) {
        setBranding(JSON.parse(savedBranding));
      } else {
        // Load default branding from config file
        const response = await fetch('/config/branding.json');
        if (response.ok) {
          const configBranding = await response.json();
          setBranding(configBranding);
        }
      }
    } catch (error) {
      console.warn('Failed to load branding config, using defaults:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBranding = (newBranding: Partial<BrandingConfig>) => {
    const updatedBranding = { ...branding, ...newBranding };
    setBranding(updatedBranding);
    localStorage.setItem('branding', JSON.stringify(updatedBranding));
    applyBrandingToDOM(updatedBranding);
  };

  const applyBrandingToDOM = (brandingConfig: BrandingConfig) => {
    const root = document.documentElement;
    const isDark = document.documentElement.classList.contains('dark');
    const colors = isDark ? brandingConfig.colors.dark : brandingConfig.colors.light;

    // Apply CSS custom properties
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);

    // Update document title and favicon
    document.title = `${brandingConfig.appName} - ${brandingConfig.tagline}`;
    
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = brandingConfig.favicon;
    }
  };

  const resetBranding = () => {
    setBranding(defaultBranding);
    localStorage.removeItem('branding');
    applyBrandingToDOM(defaultBranding);
  };

  // Apply branding when it changes
  useEffect(() => {
    if (!isLoading) {
      applyBrandingToDOM(branding);
    }
  }, [branding, isLoading]);

  return {
    branding,
    updateBranding,
    resetBranding,
    isLoading
  };
};