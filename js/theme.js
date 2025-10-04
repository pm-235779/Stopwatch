// Unified theme controller for all pages
import { UI } from './ui.js';

export class ThemeController {
    constructor() {
        this.darkTheme = false;
        this.init();
    }

    init() {
        // Check system preference and localStorage
        const prefersDarkThemeMql = window.matchMedia("(prefers-color-scheme: dark)");
        
        if (localStorage.getItem("darkmode") == "true" || 
            (localStorage.getItem("darkmode") === null && prefersDarkThemeMql.matches)) {
            this.setDarkTheme();
        } else {
            this.setLightTheme();
        }

        // Listen for system theme changes
        prefersDarkThemeMql.addEventListener("change", (mql) => {
            if (localStorage.getItem("darkmode") === null && mql.matches) {
                this.setDarkTheme();
            } else if (localStorage.getItem("darkmode") === null) {
                this.setLightTheme();
            }
        });

        // Setup theme toggle
        const themeToggle = UI.$id('light');
        if (themeToggle) {
            themeToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.setDarkTheme();
                    localStorage.setItem("darkmode", "true");
                } else {
                    this.setLightTheme();
                    localStorage.setItem("darkmode", "false");
                }
            });
        }
    }

    setLightTheme() {
        this.darkTheme = false;
        document.documentElement.setAttribute('data-theme', 'light');
        
        // Update CSS custom properties
        document.documentElement.style.setProperty('--bg-primary', '#ffffff');
        document.documentElement.style.setProperty('--bg-secondary', 'linear-gradient(to right, #191654, #43C6AC)');
        document.documentElement.style.setProperty('--text-primary', '#000000');
        document.documentElement.style.setProperty('--text-secondary', '#ffffff');
        document.documentElement.style.setProperty('--navbar-bg', '#ffffff');
        document.documentElement.style.setProperty('--timer-color', '#ffffff');
        document.documentElement.style.setProperty('--footer-bg', '#ffffff');

        // Update specific elements
        const navbar = UI.$query('.navbar');
        if (navbar) {
            navbar.style.backgroundColor = '#ffffff';
        }

        const body = document.body;
        if (body) {
            body.style.background = 'linear-gradient(to right, #191654, #43C6AC)';
        }

        const digits = UI.$queryAll('.digit, .timer');
        digits.forEach(digit => {
            digit.style.color = '#ffffff';
        });

        const title = UI.$id('title1');
        if (title) {
            title.style.color = '#000000';
        }

        const footer = UI.$query('.foot');
        if (footer) {
            footer.style.background = '#ffffff';
        }

        const themeToggle = UI.$id('light');
        if (themeToggle) {
            themeToggle.checked = false;
        }

        // Page-specific updates
        this.updatePageSpecificLight();
    }

    setDarkTheme() {
        this.darkTheme = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        
        // Update CSS custom properties
        document.documentElement.style.setProperty('--bg-primary', '#191212');
        document.documentElement.style.setProperty('--bg-secondary', '#000000');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#7fe9d4');
        document.documentElement.style.setProperty('--navbar-bg', '#000000');
        document.documentElement.style.setProperty('--timer-color', 'rgb(216, 137, 31)');
        document.documentElement.style.setProperty('--footer-bg', '#a7a7a7');

        // Update specific elements
        const navbar = UI.$query('.navbar');
        if (navbar) {
            navbar.style.backgroundColor = '#000000';
        }

        const body = document.body;
        if (body) {
            body.style.background = '#191212';
        }

        const digits = UI.$queryAll('.digit, .timer');
        digits.forEach(digit => {
            digit.style.color = 'rgb(216, 137, 31)';
        });

        const title = UI.$id('title1');
        if (title) {
            title.style.color = '#ffffff';
        }

        const footer = UI.$query('.foot');
        if (footer) {
            footer.style.background = '#a7a7a7';
        }

        const buttons = UI.$queryAll('.buttons');
        buttons.forEach(button => {
            button.style.borderColor = '#ffffff';
        });

        const themeToggle = UI.$id('light');
        if (themeToggle) {
            themeToggle.checked = true;
        }

        // Page-specific updates
        this.updatePageSpecificDark();
    }

    updatePageSpecificLight() {
        // Pomodoro and Custom Timer specific updates
        const active = UI.$queryAll('.active');
        active.forEach(el => {
            el.style.background = 'linear-gradient(to right, #191654, #43C6AC)';
            el.style.color = '#333';
        });

        const inactive = UI.$queryAll('.inactive');
        inactive.forEach(el => {
            el.style.background = 'rgb(5, 30, 54)';
            el.style.color = 'rgb(169, 188, 214)';
        });
    }

    updatePageSpecificDark() {
        // Pomodoro and Custom Timer specific updates
        const active = UI.$queryAll('.active');
        active.forEach(el => {
            el.style.background = '#191212';
            el.style.color = '#7fe9d4';
        });

        const inactive = UI.$queryAll('.inactive');
        inactive.forEach(el => {
            el.style.background = '#000000';
            el.style.color = '#ffffff';
        });
    }

    isDarkTheme() {
        return this.darkTheme;
    }
}

// Initialize theme controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeController = new ThemeController();
});
