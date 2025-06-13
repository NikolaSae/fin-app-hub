// components/theme-customizer.tsx (Ažurirana UI komponenta sa dropdownom)
"use client";

import { useTheme } from "@/components/theme-provider";
import React, { useState } from "react";

export function ThemeCustomizer() {
  const {
    theme,
    colors,
    hexColors,
    handleColorChange,
    saveCustomTheme,
    setAppTheme,
    resetCustomColors,
    customizableColors
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center px-4 py-2 rounded-lg bg-card text-card-foreground shadow-md hover:bg-card/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        aria-expanded={isOpen}
        aria-controls="theme-customizer-panel"
      >
        <h3 className="text-lg font-semibold whitespace-nowrap">Podešavanja Teme</h3>
        <span className="ml-2">{isOpen ? '◀' : '▶'}</span> 
      </button>

      <div
        id="theme-customizer-panel"
        className={`
          absolute top-0 right-[calc(100%+10px)] 
          w-[1100px] p-4 md:p-6 border rounded-lg bg-card text-card-foreground shadow-md
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'max-w-[1100px] opacity-100' : 'max-w-0 opacity-0 pointer-events-none'}
        `}
      >
        <div className="flex items-center justify-center space-x-2 mb-6 pt-4 border-t border-border">
          <button onClick={() => setAppTheme('light')} className={`px-4 py-2 rounded-md text-sm ${theme === 'light' ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-accent'}`}>☀️ Svetla</button>
          <button onClick={() => setAppTheme('dark')} className={`px-4 py-2 rounded-md text-sm ${theme === 'dark' ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-accent'}`}>🌙 Tamna</button>
          <button onClick={saveCustomTheme} className={`px-4 py-2 rounded-md text-sm ${theme === 'custom' ? 'ring-2 ring-primary bg-primary/10' : 'hover:bg-accent'}`}>🎨 Prilagođena</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Object.entries(customizableColors).map(([key, label]) => (
            <div key={key} className="flex flex-col items-start"> 
              <label htmlFor={key} className="text-sm text-muted-foreground mb-1">{label}</label>
              <div className="flex items-center space-x-2 p-1 border rounded-md bg-background w-full"> 
                <input
                  id={key}
                  type="color"
                  value={hexColors[key] || '#000000'}
                  onChange={(e) => handleColorChange(key, e.target.value, 'hex')}
                  className="w-8 h-8 rounded-md cursor-pointer bg-transparent border-none"
                  aria-label={`Birač boja za ${label}`}
                />
                <input
                  type="text"
                  value={colors[key] || ''}
                  onChange={(e) => handleColorChange(key, e.target.value, 'hsl')}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  placeholder="npr. 240 10% 3.9%"
                />
              </div>
            </div>
          ))}
        </div>

        {theme === 'custom' && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-center text-muted-foreground mb-2">Resetuj prilagođene boje na:</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => resetCustomColors('light')} className="text-sm text-primary hover:underline">Podrazumevanu svetlu</button>
              <button onClick={() => resetCustomColors('dark')} className="text-sm text-primary hover:underline">Podrazumevanu tamnu</button>
            </div>
          </div>
        )}

        <button onClick={saveCustomTheme} className="w-full mt-6 bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors">
          Sačuvaj prilagođenu temu
        </button>
      </div>
    </div>
  );
}
