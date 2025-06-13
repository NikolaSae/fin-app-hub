// contexts/theme-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CustomTheme, defaultThemes } from '@/types/theme';

interface ThemeContextType {
  currentTheme: CustomTheme;
  themes: CustomTheme[];
  setTheme: (themeId: string) => void;
  addCustomTheme: (theme: CustomTheme) => void;
  removeCustomTheme: (themeId: string) => void;
  isCustomTheme: (themeId: string) => boolean;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<CustomTheme>(defaultThemes[0]);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const themes = [...defaultThemes, ...customThemes];

  // Sprečavanje FOUC-a - učitavanje teme pre renderovanja
  useEffect(() => {
    const loadTheme = () => {
      try {
        console.log('🎨 Loading theme from localStorage...');
        const savedThemeId = localStorage.getItem('theme') || 'light';
        const savedCustomThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
        
        console.log('📋 Saved theme ID:', savedThemeId);
        console.log('🎭 Custom themes count:', savedCustomThemes.length);
        
        setCustomThemes(savedCustomThemes);
        
        const allThemes = [...defaultThemes, ...savedCustomThemes];
        const theme = allThemes.find(t => t.id === savedThemeId) || defaultThemes[0];
        
        console.log('✅ Theme found:', theme.name, theme.id);
        
        setCurrentTheme(theme);
        applyTheme(theme);
        
        // Dodaj kratku animaciju za smooth prelazak
        setTimeout(() => {
          console.log('🚀 Theme loaded successfully');
          setIsLoaded(true);
        }, 50);
      } catch (error) {
        console.error('❌ Error loading theme:', error);
        setCurrentTheme(defaultThemes[0]);
        applyTheme(defaultThemes[0]);
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  const applyTheme = (theme: CustomTheme) => {
    console.log('🎨 Applying theme:', theme.name, theme.id);
    const root = document.documentElement;
    
    // Ukloni postojeće klase tema
    root.classList.remove('light', 'dark', 'custom-theme');
    
    // Dodaj osnovnu klasu teme
    if (theme.id === 'light' || theme.id === 'dark') {
      root.classList.add(theme.id);
      console.log('✅ Applied default theme class:', theme.id);
    } else {
      // Za custom teme, primeni boje direktno kao CSS varijable
      console.log('🎭 Applying custom theme colors...');
      Object.entries(theme.colors).forEach(([key, value]) => {
        const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssVarName, value);
        console.log(`   ${cssVarName}: ${value}`);
      });
      
      // Dodaj custom klasu
      root.classList.add('custom-theme');
      console.log('✅ Applied custom-theme class');
    }
    
    console.log('🎨 Theme applied successfully');
  };

  const setTheme = (themeId: string) => {
    console.log('🔄 Changing theme to:', themeId);
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      console.log('✅ Theme found in available themes');
      setCurrentTheme(theme);
      applyTheme(theme);
      localStorage.setItem('theme', themeId);
      console.log('💾 Theme saved to localStorage');
    } else {
      console.error('❌ Theme not found:', themeId);
      console.log('📋 Available themes:', themes.map(t => `${t.name} (${t.id})`));
    }
  };

  const addCustomTheme = (theme: CustomTheme) => {
    console.log('➕ Adding custom theme:', theme.name);
    const newCustomThemes = [...customThemes, theme];
    setCustomThemes(newCustomThemes);
    localStorage.setItem('customThemes', JSON.stringify(newCustomThemes));
    console.log('✅ Custom theme added and saved');
  };

  const removeCustomTheme = (themeId: string) => {
    console.log('🗑️ Removing custom theme:', themeId);
    const newCustomThemes = customThemes.filter(t => t.id !== themeId);
    setCustomThemes(newCustomThemes);
    localStorage.setItem('customThemes', JSON.stringify(newCustomThemes));
    
    // Ako je obrisana trenutna tema, prebaci na light
    if (currentTheme.id === themeId) {
      console.log('🔄 Removed theme was active, switching to light');
      setTheme('light');
    }
  };

  const isCustomTheme = (themeId: string) => {
    return !defaultThemes.find(t => t.id === themeId);
  };

  // Debug log za trenutno stanje
  useEffect(() => {
    if (isLoaded) {
      console.log('📊 Theme Context State:');
      console.log('  Current theme:', currentTheme.name, currentTheme.id);
      console.log('  Total themes:', themes.length);
      console.log('  Is loaded:', isLoaded);
    }
  }, [currentTheme, themes, isLoaded]);

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      themes,
      setTheme,
      addCustomTheme,
      removeCustomTheme,
      isCustomTheme,
      isLoaded
    }}>
      {children}
    </ThemeContext.Provider>
  );
}