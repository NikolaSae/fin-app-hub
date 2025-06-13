// components/theme-provider.tsx
"use client";

import React, { useEffect, useState, useLayoutEffect, createContext, useContext } from "react";

// Podrazumevane vrednosti iz vašeg globals.css (možete ih importovati ako su u zasebnoj datoteci)
// NAPOMENA: Ovaj objekt će biti serijaliziran u inline skriptu, pa pazite na njegovu veličinu.
const defaultColors = {
  light: {
    background: "0 0% 100%",
    foreground: "240 10% 3.9%",
    card: "0 0% 100%",
    "card-foreground": "150 8% 12%",
    popover: "0 0% 100%",
    "popover-foreground": "240 10% 3.9%",
    primary: "240 5.9% 10%",
    "primary-foreground": "0 0% 98%",
    secondary: "240 4.8% 95.9%",
    "secondary-foreground": "240 5.9% 10%",
    muted: "240 4.8% 95.9%",
    "muted-foreground": "240 3.8% 46.1%",
    accent: "240 4.8% 95.9%",
    "accent-foreground": "240 5.9% 10%",
    destructive: "0 84.2% 60.2%",
    "destructive-foreground": "0 0% 98%",
    border: "240 5.9% 90%",
    input: "240 5.9% 90%",
    ring: "240 5.9% 10%",
    "chart-1": "12 76% 61%",
    "chart-2": "173 58% 39%",
    "chart-3": "197 37% 24%",
    "chart-4": "43 74% 66%",
    "chart-5": "27 87% 67%",
    "shadow-color": "330 100% 71%",
  },
  dark: {
    background: "240 10% 3.9%",
    foreground: "0 0% 98%",
    card: "240 10% 3.9%",
    "card-foreground": "0 0% 98%",
    popover: "240 10% 3.9%",
    "popover-foreground": "0 0% 98%",
    primary: "0 0% 98%",
    "primary-foreground": "240 5.9% 10%",
    secondary: "240 3.7% 15.9%",
    "secondary-foreground": "240 3.7% 15.9%",
    muted: "240 3.7% 15.9%",
    "muted-foreground": "240 5% 64.9%",
    accent: "240 3.7% 15.9%",
    "accent-foreground": "0 0% 98%",
    destructive: "0 62.8% 30.6%",
    "destructive-foreground": "0 0% 98%",
    border: "240 3.7% 15.9%",
    input: "240 3.7% 15.9%",
    ring: "240 4.9% 83.9%",
    "chart-1": "220 70% 50%",
    "chart-2": "160 60% 45%",
    "chart-3": "30 80% 55%",
    "chart-4": "280 65% 60%",
    "chart-5": "340 75% 55%",
    "shadow-color": "330 100% 71%",
  }
};

// === Pomoćne funkcije za konverziju boja (sada izvan komponente za inline skriptu) ===
function hslStringToHex(hslStr) {
  if (!hslStr) return "#000000";
  const parts = hslStr.match(/\d+(\.\d+)?/g);
  if (!parts || parts.length < 3) return "#000000";
  const [h, s, l] = parts.map(Number);
  const sNormalized = s / 100;
  const lNormalized = l / 100;
  const a = sNormalized * Math.min(lNormalized, 1 - lNormalized);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = lNormalized - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHslString(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
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
}

// Funkcija za primenu CSS varijabli (koristit će je React komponenta)
function applyColorsToDocument(colorsObj) {
  if (typeof document !== 'undefined') { // Provjera da smo na klijentskoj strani
    Object.entries(colorsObj).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }
}

// Kreirajte Context za dijeljenje stanja teme
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [colors, setColors] = useState(defaultColors.light);
  const [isClient, setIsClient] = useState(false);

  // === Inline skripta za inicijalnu primjenu teme (protiv FOUC) ===
  const initialThemeScript = `
    (function() {
      try {
        const savedTheme = localStorage.getItem('theme') || 'light';
        let initialColors = {};
        // Default colors se ugrade direktno u skriptu
        const dc = ${JSON.stringify(defaultColors)};
        
        if (savedTheme === 'custom') {
          const savedCustomColors = localStorage.getItem('customThemeColors');
          const customColors = savedCustomColors ? JSON.parse(savedCustomColors) : {};
          initialColors = { ...dc.light, ...customColors };
        } else {
          initialColors = dc[savedTheme] || dc.light;
        }

        for (const key in initialColors) {
          document.documentElement.style.setProperty(\`--\${key}\`, initialColors[key]);
        }
        document.documentElement.setAttribute('data-theme', savedTheme);
      } catch (e) {
        console.error("Failed to set initial theme via inline script:", e);
      }
    })();
  `;

  // useLayoutEffect se pokreće sinkrono nakon svih DOM mutacija,
  // ali prije nego što preglednik preboja. Ovo se koristi za
  // ažuriranja teme NAKON inicijalnog učitavanja.
  useLayoutEffect(() => {
    setIsClient(true); // Označite da smo na klijentskoj strani

    // OVAJ DIO SE SADA KORISTI ZA SINKRONIZACIJU NAKON INICIJALNOG UČITAVANJA
    // Inline skripta je već postavila početne boje.
    // Ovdje se samo sinkronizira React stanje s onim što je već postavljeno
    // i rukuje se daljnjim promjenama.
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    let currentColors = {};
    if (savedTheme === 'custom') {
      const savedColors = JSON.parse(localStorage.getItem('customThemeColors') || '{}');
      currentColors = { ...defaultColors.light, ...savedColors };
    } else {
      currentColors = defaultColors[savedTheme] || defaultColors.light;
    }
    setColors(currentColors);

    // Nema potrebe za applyColorsToDocument ovdje pri mountu,
    // jer je inline skripta to već uradila za početno stanje.
    // Ali je i dalje korisno za osiguravanje da se React stanje poklapa.
  }, []);

  // useEffect za praćenje promjena `colors` stanja i primjenu na DOM
  // Ovo će se pokrenuti kada korisnik mijenja boje preko UI-a.
  useEffect(() => {
    if (isClient) { // Samo primijeni ako smo na klijentskoj strani
      applyColorsToDocument(colors);
    }
  }, [colors, isClient]);


  const saveCustomTheme = () => {
    localStorage.setItem('theme', 'custom');
    localStorage.setItem('customThemeColors', JSON.stringify(colors));
    setTheme('custom');
    // Možete koristiti custom modal umjesto alert()
    // alert("Vaša prilagođena tema je sačuvana!");
  };

  const setAppTheme = (newTheme) => {
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
    if (newTheme !== 'custom') {
      localStorage.removeItem('customThemeColors');
    }
    // Osvježavanje stranice osigurava da se globalni CSS ponovno učita
    // i primijeni s novom temom.
    window.location.reload();
  };

  const resetCustomColors = (sourceTheme) => {
    const defaultThemeColors = defaultColors[sourceTheme];
    setColors(defaultThemeColors);
    // Funkcija applyColorsToDocument će se pozvati putem useEffect(koji prati colors)
  }

  // Vrijednosti koje će biti dostupne putem Contexta
  const themeContextValue = {
    theme,
    colors,
    hexColors: React.useMemo(() => {
      return Object.fromEntries(
        Object.entries(colors).map(([key, hsl]) => [key, hslStringToHex(hsl)])
      );
    }, [colors]),
    handleColorChange: (key, value, type = "hsl") => {
      const newHslValue = type === 'hex' ? hexToHslString(value) : value;
      const newColors = { ...colors, [key]: newHslValue };
      setColors(newColors);
    },
    saveCustomTheme,
    setAppTheme,
    resetCustomColors,
    defaultColors, // Dodajte defaultColors u context
    customizableColors: { // Dodajte customizableColors u context
      background: "Pozadina",
      foreground: "Tekst",
      card: "Boja kartice",
      "card-foreground": "Tekst na kartici",
      primary: "Primarna",
      "primary-foreground": "0 0% 98%", // Pretpostavljamo da su ovi fiksni za UI
      secondary: "Sekundarna",
      "secondary-foreground": "240 5.9% 10%", // Pretpostavljamo da su ovi fiksni za UI
      border: "Ivica (border)",
      ring: "Prsten (ring)",
      "chart-1": "Grafikon 1",
      "chart-2": "Grafikon 2",
      "chart-3": "Grafikon 3",
      "chart-4": "Grafikon 4",
      "chart-5": "Grafikon 5",
      "shadow-color": "Boja senke"
    }
  };

  return (
    <>
      {/* Ovo je ključni dio! Inline skripta koja se izvršava na samom početku. */}
      {/* Koristite dangerouslySetInnerHTML jer se radi o dinamičkom JavaScriptu. */}
      <script dangerouslySetInnerHTML={{ __html: initialThemeScript }} />
      <ThemeContext.Provider value={themeContextValue}>
        {children}
      </ThemeContext.Provider>
    </>
  );
}

// Hook za korištenje teme iz contexta
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
