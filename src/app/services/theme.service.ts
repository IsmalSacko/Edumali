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
    const saved = localStorage.getItem('edumali-theme');
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
    localStorage.setItem('edumali-theme', themeName);
  }

  /**
   * Bascule entre light et dark
   */
  toggleDarkMode(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Applique le thème en définissant les variables CSS et les classes
   */
  private applyTheme(themeName: ThemeName): void {
    const theme = this.themes[themeName];
    const root = document.documentElement;

    // Définir les variables CSS
    root.style.setProperty('--ion-background-color', theme.colors.background);
    root.style.setProperty('--ion-text-color', theme.colors.text);
    root.style.setProperty('--ion-color-primary', theme.colors.primary);
    root.style.setProperty('--ion-color-secondary', theme.colors.secondary);
    root.style.setProperty('--ion-toolbar-background', theme.colors.background);
    root.style.setProperty('--ion-item-background', theme.colors.background);
    root.style.setProperty('--ion-card-background', theme.colors.background);

    // Ajouter/retirer la classe dark pour Ionic
    if (theme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Retirer tous les thèmes spécifiques
    root.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-orange');

    // Ajouter la classe spécifique du thème (pour blue, green, purple, orange)
    if (themeName !== 'light' && themeName !== 'dark') {
      root.classList.add(`theme-${themeName}`);
    }
  }

  /**
   * Récupère le thème actuel
   */
  getTheme(): ThemeConfig {
    return this.themes[this.currentTheme()];
  }
}
