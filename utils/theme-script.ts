// utils/theme-script.ts (Za inline script u HTML head)
export const themeScript = `
(function() {
  try {
    const theme = localStorage.getItem('theme') || 'light';
    const customThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      // Custom theme
      const customTheme = customThemes.find(t => t.id === theme);
      if (customTheme) {
        Object.entries(customTheme.colors).forEach(([key, value]) => {
          const cssVarName = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
          document.documentElement.style.setProperty(cssVarName, value);
        });
        document.documentElement.classList.add('custom-theme');
      } else {
        document.documentElement.classList.add('light');
      }
    }
  } catch (e) {
    document.documentElement.classList.add('light');
  }
})();
`;