import { Injectable, signal } from '@angular/core';

export type ThemeName = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';

interface ThemeConfig {
  name: ThemeName;
  label: string;
  isDark: boolean;
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themes: Record<ThemeName, ThemeConfig> = {
    light: {
      name: 'light',
      label: 'Clair',
      isDark: false,
      colors: {
        background: '#ffffff',
        text: '#0f172a',
        primary: '#0ea5e9',
        secondary: '#22d3ee'
      }
    },
    dark: {
      name: 'dark',
      label: 'Sombre',
      isDark: true,
      colors: {
        background: '#0b1224',
        text: '#cbd5e1',
        primary: '#22d3ee',
        secondary: '#06b6d4'
      }
    },
    blue: {
      name: 'blue',
      label: 'Bleu',
      isDark: true,
      colors: {
        background: '#0c1e3c',
        text: '#e0e7ff',
        primary: '#3b82f6',
        secondary: '#60a5fa'
      }
    },
    green: {
      name: 'green',
      label: 'Vert',
      isDark: true,
      colors: {
        background: '#0c2818',
        text: '#dcfce7',
        primary: '#10b981',
        secondary: '#34d399'
      }
    },
    purple: {
      name: 'purple',
      label: 'Violet',
      isDark: true,
      colors: {
        background: '#2d1b4e',
        text: '#f3e8ff',
        primary: '#a855f7',
        secondary: '#d946ef'
      }
    },
    orange: {
      name: 'orange',
      label: 'Orange',
      isDark: true,
      colors: {
        background: '#431407',
        text: '#fed7aa',
        primary: '#f97316',
        secondary: '#fb923c'
      }
    }
  };

  currentTheme = signal<ThemeName>(this.getInitialTheme());
  availableThemes = Object.values(this.themes).map(t => ({ name: t.name, label: t.label }));

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  /**
   * Récupère le thème initial depuis localStorage ou par défaut 'light'
   */
  private getInitialTheme(): ThemeName {
    const saved = localStorage.getItem('scolmali-theme');
    if (saved && this.themes[saved as ThemeName]) {
      return saved as ThemeName;
    }
    return 'light';
  }

  /**
   * Change le thème actuel
   */
  setTheme(themeName: ThemeName): void {
    if (!this.themes[themeName]) return;
    this.currentTheme.set(themeName);
    this.applyTheme(themeName);
    localStorage.setItem('scolmali-theme', themeName);
  }

  /**
   * Bascule entre light et dark
   */
  toggleDarkMode(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Applique le thème en définissant les variables CSS et les classes.
   * Pose aussi les dérivés (-rgb/-shade/-tint/-contrast, steps) que les
   * composants Ionic (ion-button, ion-badge, ion-progress-bar...) attendent
   * pour bien rendre en dehors du thème 'light' d'origine.
   */
  private applyTheme(themeName: ThemeName): void {
    const theme = this.themes[themeName];
    const root = document.documentElement;

    root.style.setProperty('--ion-background-color', theme.colors.background);
    root.style.setProperty('--ion-background-color-rgb', hexToRgbString(theme.colors.background));
    root.style.setProperty('--ion-text-color', theme.colors.text);
    root.style.setProperty('--ion-text-color-rgb', hexToRgbString(theme.colors.text));
    root.style.setProperty('--ion-toolbar-background', theme.colors.background);
    root.style.setProperty('--ion-item-background', theme.colors.background);
    root.style.setProperty('--ion-card-background', theme.colors.background);

    this.applyColorSet('primary', theme.colors.primary);
    this.applyColorSet('secondary', theme.colors.secondary);

    // Steps de gris dérivés du fond/texte (mélange linéaire), utilisés par
    // Ionic pour les séparateurs/placeholders (--ion-color-step-50 .. -950).
    for (let step = 50; step <= 950; step += 50) {
      root.style.setProperty(`--ion-color-step-${step}`, mix(theme.colors.background, theme.colors.text, step / 1000));
    }

    if (theme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange');
    if (themeName !== 'light' && themeName !== 'dark') {
      root.classList.add(`theme-${themeName}`);
    }
  }

  private applyColorSet(name: 'primary' | 'secondary', hex: string): void {
    const root = document.documentElement;
    const contrast = luminance(hex) > 0.55 ? '#000000' : '#ffffff';
    root.style.setProperty(`--ion-color-${name}`, hex);
    root.style.setProperty(`--ion-color-${name}-rgb`, hexToRgbString(hex));
    root.style.setProperty(`--ion-color-${name}-contrast`, contrast);
    root.style.setProperty(`--ion-color-${name}-contrast-rgb`, hexToRgbString(contrast));
    root.style.setProperty(`--ion-color-${name}-shade`, shade(hex, 0.12));
    root.style.setProperty(`--ion-color-${name}-tint`, tint(hex, 0.1));
  }

  /**
   * Récupère le thème actuel
   */
  getTheme(): ThemeConfig {
    return this.themes[this.currentTheme()];
  }
}

// --- Utilitaires couleur (pas de dépendance externe) ---

function clamp(v: number): number {
  return Math.max(0, Math.min(255, v));
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => clamp(Math.round(v)).toString(16).padStart(2, '0')).join('');
}

function hexToRgbString(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

/** Assombrit une couleur hex d'un ratio 0..1 (mélange vers le noir) */
function shade(hex: string, ratio: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - ratio), g * (1 - ratio), b * (1 - ratio));
}

/** Éclaircit une couleur hex d'un ratio 0..1 (mélange vers le blanc) */
function tint(hex: string, ratio: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (255 - r) * ratio, g + (255 - g) * ratio, b + (255 - b) * ratio);
}

/** Mélange linéaire entre deux couleurs hex, ratio 0 (a) .. 1 (b) */
function mix(hexA: string, hexB: string, ratio: number): string {
  const [ar, ag, ab] = hexToRgb(hexA);
  const [br, bg, bb] = hexToRgb(hexB);
  return rgbToHex(ar + (br - ar) * ratio, ag + (bg - ag) * ratio, ab + (bb - ab) * ratio);
}

/** Luminance relative approximative (0 = noir, 1 = blanc) pour choisir un contraste lisible */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
