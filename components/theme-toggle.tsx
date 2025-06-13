// components/theme-toggle.tsx
"use client";

import { useTheme } from '@/contexts/theme-context';
import { useState } from 'react';
import { ThemeCustomizer } from './theme-customizer';

export function ThemeToggle() {
  const { currentTheme, themes, setTheme, isLoaded } = useTheme();
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isLoaded) {
    // Prikaži placeholder tokom učitavanja da spreči FOUC
    return (
      <div className="flex items-center gap-2 opacity-0 animate-pulse">
        <div className="w-20 h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const getThemeIcon = (themeId: string) => {
    switch (themeId) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      default: return '🎨';
    }
  };

  // Ciklično prebacivanje kroz glavne opcije: Light -> Dark -> Custom/First Custom -> Light
  const cycleMainThemes = () => {
    const customThemes = themes.filter(t => !['light', 'dark'].includes(t.id));
    
    if (currentTheme.id === 'light') {
      setTheme('dark');
    } else if (currentTheme.id === 'dark') {
      if (customThemes.length > 0) {
        setTheme(customThemes[0].id);
      } else {
        // Nema custom tema, otvori customizer
        setShowCustomizer(true);
      }
    } else {
      // Trenutno je custom tema, vrati na light
      setTheme('light');
    }
  };

  const getMainToggleText = () => {
    const customThemes = themes.filter(t => !['light', 'dark'].includes(t.id));
    
    if (currentTheme.id === 'light') {
      return '🌙 Dark';
    } else if (currentTheme.id === 'dark') {
      if (customThemes.length > 0) {
        return '🎨 Custom';
      } else {
        return '🎨 Create';
      }
    } else {
      return '☀️ Light';
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Glavni toggle sa 3 opcije */}
        <button
          onClick={cycleMainThemes}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          title={`Current: ${currentTheme.name} - Click to cycle themes`}
        >
          {getMainToggleText()}
        </button>

        {/* Dropdown za sve opcije */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 px-2 py-2 rounded-md bg-secondary hover:bg-accent transition-colors"
            title="All theme options"
          >
            <span className="text-xs">⚙️</span>
            <span className="text-xs">▼</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-popover border border-border rounded-md shadow-lg z-50">
              <div className="py-1">
                <div className="px-3 py-1 text-xs font-medium text-muted-foreground border-b border-border">
                  Default Themes
                </div>
                {themes.filter(t => ['light', 'dark'].includes(t.id)).map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 ${
                      currentTheme.id === theme.id ? 'bg-accent' : ''
                    }`}
                  >
                    <span>{getThemeIcon(theme.id)}</span>
                    <span>{theme.name}</span>
                    {currentTheme.id === theme.id && <span className="ml-auto text-xs">✓</span>}
                  </button>
                ))}
                
                {themes.filter(t => !['light', 'dark'].includes(t.id)).length > 0 && (
                  <>
                    <div className="px-3 py-1 text-xs font-medium text-muted-foreground border-b border-t border-border">
                      Custom Themes
                    </div>
                    {themes.filter(t => !['light', 'dark'].includes(t.id)).map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setTheme(theme.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 ${
                          currentTheme.id === theme.id ? 'bg-accent' : ''
                        }`}
                      >
                        <span>{getThemeIcon(theme.id)}</span>
                        <span>{theme.name}</span>
                        {currentTheme.id === theme.id && <span className="ml-auto text-xs">✓</span>}
                      </button>
                    ))}
                  </>
                )}
                
                <hr className="my-1 border-border" />
                <button
                  onClick={() => {
                    setShowCustomizer(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 font-medium"
                >
                  <span>➕</span>
                  <span>Create New Theme</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Theme Customizer Modal */}
      {showCustomizer && (
        <ThemeCustomizer onClose={() => setShowCustomizer(false)} />
      )}

      {/* Overlay za zatvaranje dropdown-a */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}