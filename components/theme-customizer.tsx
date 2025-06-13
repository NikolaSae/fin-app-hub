<<<<<<< HEAD
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
=======
// components/theme-customizer.tsx

"use client";

import { useState } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { CustomTheme } from '@/types/theme';

interface ThemeCustomizerProps {
  onClose: () => void;
}

export function ThemeCustomizer({ onClose }: ThemeCustomizerProps) {
  const { currentTheme, addCustomTheme, setTheme } = useTheme();
  const [themeName, setThemeName] = useState('');
  const [colors, setColors] = useState(currentTheme.colors);

  const handleColorChange = (colorKey: keyof CustomTheme['colors'], value: string) => {
    const hslValue = hexToHsl(value);
    setColors(prev => ({
      ...prev,
      [colorKey]: hslValue
    }));
  };

  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const hslToHex = (hsl: string): string => {
    const [h, s, l] = hsl.split(' ').map((val, i) => {
      if (i === 0) return parseInt(val) / 360;
      return parseInt(val.replace('%', '')) / 100;
    });

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const saveTheme = () => {
    if (!themeName.trim()) {
      alert('Molimo unesite ime teme');
      return;
    }

    const newTheme: CustomTheme = {
      id: `custom-${Date.now()}`,
      name: themeName,
      colors
    };

    addCustomTheme(newTheme);
    setTheme(newTheme.id);
    onClose();
  };

  // Koristi sva polja iz CustomTheme interfejsa
  const colorFields = [
    { key: 'background', label: 'Background', description: 'Osnovna pozadina' },
    { key: 'foreground', label: 'Foreground', description: 'Osnovni tekst' },
    { key: 'card', label: 'Card', description: 'Pozadina kartice' },
    { key: 'cardForeground', label: 'Card Text', description: 'Tekst na kartici' },
    { key: 'popover', label: 'Popover', description: 'Pozadina popup-a' },
    { key: 'popoverForeground', label: 'Popover Text', description: 'Tekst popup-a' },
    { key: 'primary', label: 'Primary', description: 'Primarna boja' },
    { key: 'primaryForeground', label: 'Primary Text', description: 'Tekst na primarnoj' },
    { key: 'secondary', label: 'Secondary', description: 'Sekundarna boja' },
    { key: 'secondaryForeground', label: 'Secondary Text', description: 'Tekst na sekundarnoj' },
    { key: 'muted', label: 'Muted', description: 'Prigušena boja' },
    { key: 'mutedForeground', label: 'Muted Text', description: 'Prigušen tekst' },
    { key: 'accent', label: 'Accent', description: 'Boja akcenta' },
    { key: 'accentForeground', label: 'Accent Text', description: 'Tekst na akcentu' },
    { key: 'destructive', label: 'Destructive', description: 'Opasna akcija' },
    { key: 'destructiveForeground', label: 'Destructive Text', description: 'Tekst opasne akcije' },
    { key: 'border', label: 'Border', description: 'Boja okvira' },
    { key: 'input', label: 'Input', description: 'Input polja' },
    { key: 'ring', label: 'Ring', description: 'Focus ring' },
    { key: 'disguistingGreen', label: 'Green Accent', description: 'Zeleni akcenat' },
    { key: 'disguistingGreenDark', label: 'Dark Green', description: 'Tamno zelena' },
    { key: 'shadowColor', label: 'Shadow', description: 'Boja senke' },
    { key: 'shadowStrength', label: 'Shadow Strength', description: 'Jačina senke' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-popover border border-border rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Theme Customizer</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl px-2"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Ime teme
            </label>
            <input
              type="text"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
              placeholder="Unesite ime teme..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorFields.map(({ key, label, description }) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium">
                  {label}
                  <span className="text-xs text-muted-foreground block">
                    {description}
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={hslToHex(colors[key as keyof typeof colors])}
                    onChange={(e) => handleColorChange(key as keyof typeof colors, e.target.value)}
                    className="w-12 h-10 border border-border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={colors[key as keyof typeof colors]}
                    onChange={(e) => setColors(prev => ({ ...prev, [key]: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-xs font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent"
            >
              Otkaži
            </button>
            <button
              onClick={saveTheme}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Sačuvaj temu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
>>>>>>> 1dec103f1654c65550e3704a1fb8da634bb9dc80
