// Settings management for all timer applications
import { UI } from './ui.js';

export class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.createSettingsButton();
    }

    createSettingsButton() {
        const navbar = UI.$query('.navbar .container-fluid');
        if (!navbar) return;

        const settingsBtn = document.createElement('button');
        settingsBtn.id = 'settings-btn';
        settingsBtn.className = 'btn btn-sm btn-outline-secondary me-2';
        settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
        settingsBtn.title = 'Settings';
        settingsBtn.onclick = () => this.showSettingsModal();

        // Insert before sound controls
        const soundControls = UI.$id('sound-controls');
        if (soundControls) {
            navbar.insertBefore(settingsBtn, soundControls);
        } else {
            const themeToggle = UI.$id('switch-theme');
            if (themeToggle) {
                navbar.insertBefore(settingsBtn, themeToggle);
            } else {
                navbar.appendChild(settingsBtn);
            }
        }
    }

    showSettingsModal() {
        const currentPage = this.getCurrentPage();
        let settingsContent = this.getGeneralSettings();

        if (currentPage === 'pomodoro') {
            settingsContent += this.getPomodoroSettings();
        } else if (currentPage === 'custom-timer') {
            settingsContent += this.getCustomTimerSettings();
        } else if (currentPage === 'stopwatch') {
            settingsContent += this.getStopwatchSettings();
        }

        UI.showModal('Settings', settingsContent, [
            { text: 'Reset All', class: 'btn-outline-danger', onclick: 'resetAllSettings()' },
            { text: 'Export Settings', class: 'btn-outline-info', onclick: 'exportSettings()' },
            { text: 'Import Settings', class: 'btn-outline-warning', onclick: 'importSettings()' },
            { text: 'Save', class: 'btn-primary', onclick: 'saveSettings()', dismiss: true }
        ]);

        // Setup event listeners for settings
        this.setupSettingsListeners();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('pomodoro')) return 'pomodoro';
        if (path.includes('timer')) return 'custom-timer';
        return 'stopwatch';
    }

    getGeneralSettings() {
        return `
            <div class="settings-section">
                <h6>General Settings</h6>
                <div class="mb-3">
                    <label class="form-label">Default Theme</label>
                    <select class="form-select" id="default-theme">
                        <option value="system" ${this.settings.theme === 'system' ? 'selected' : ''}>System</option>
                        <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>Light</option>
                        <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                    </select>
                </div>
                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="notifications-enabled" 
                               ${this.settings.notifications ? 'checked' : ''}>
                        <label class="form-check-label" for="notifications-enabled">
                            Enable Notifications
                        </label>
                    </div>
                </div>
                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="keep-screen-awake" 
                               ${this.settings.keepScreenAwake ? 'checked' : ''}>
                        <label class="form-check-label" for="keep-screen-awake">
                            Keep Screen Awake During Timers
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    getPomodoroSettings() {
        return `
            <div class="settings-section">
                <h6>Pomodoro Settings</h6>
                <div class="row">
                    <div class="col-4">
                        <label class="form-label">Work Duration (min)</label>
                        <input type="number" class="form-control" id="pomodoro-work" 
                               value="${this.settings.pomodoro.workDuration}" min="1" max="60">
                    </div>
                    <div class="col-4">
                        <label class="form-label">Short Break (min)</label>
                        <input type="number" class="form-control" id="pomodoro-short-break" 
                               value="${this.settings.pomodoro.shortBreak}" min="1" max="30">
                    </div>
                    <div class="col-4">
                        <label class="form-label">Long Break (min)</label>
                        <input type="number" class="form-control" id="pomodoro-long-break" 
                               value="${this.settings.pomodoro.longBreak}" min="1" max="60">
                    </div>
                </div>
                <div class="mt-3">
                    <label class="form-label">Sessions until Long Break</label>
                    <input type="number" class="form-control" id="pomodoro-sessions" 
                           value="${this.settings.pomodoro.sessionsUntilLongBreak}" min="2" max="10">
                </div>
            </div>
        `;
    }

    getCustomTimerSettings() {
        return `
            <div class="settings-section">
                <h6>Custom Timer Settings</h6>
                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="auto-start-break" 
                               ${this.settings.customTimer.autoStartBreak ? 'checked' : ''}>
                        <label class="form-check-label" for="auto-start-break">
                            Auto-start break after timer completion
                        </label>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Default Break Duration (min)</label>
                    <input type="number" class="form-control" id="default-break-duration" 
                           value="${this.settings.customTimer.defaultBreakDuration}" min="1" max="30">
                </div>
            </div>
        `;
    }

    getStopwatchSettings() {
        return `
            <div class="settings-section">
                <h6>Stopwatch Settings</h6>
                <div class="mb-3">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="auto-lap" 
                               ${this.settings.stopwatch.autoLap ? 'checked' : ''}>
                        <label class="form-check-label" for="auto-lap">
                            Auto-lap every minute
                        </label>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Time Format</label>
                    <select class="form-select" id="time-format">
                        <option value="hms" ${this.settings.stopwatch.format === 'hms' ? 'selected' : ''}>HH:MM:SS.ms</option>
                        <option value="dhms" ${this.settings.stopwatch.format === 'dhms' ? 'selected' : ''}>DD:HH:MM:SS.ms</option>
                    </select>
                </div>
            </div>
        `;
    }

    setupSettingsListeners() {
        // Add any specific event listeners for settings inputs
    }

    saveSettingsFromModal() {
        // General settings
        const theme = UI.$id('default-theme')?.value || 'system';
        const notifications = UI.$id('notifications-enabled')?.checked || false;
        const keepScreenAwake = UI.$id('keep-screen-awake')?.checked || false;

        this.settings.theme = theme;
        this.settings.notifications = notifications;
        this.settings.keepScreenAwake = keepScreenAwake;

        // Page-specific settings
        const currentPage = this.getCurrentPage();
        
        if (currentPage === 'pomodoro') {
            this.settings.pomodoro.workDuration = parseInt(UI.$id('pomodoro-work')?.value) || 25;
            this.settings.pomodoro.shortBreak = parseInt(UI.$id('pomodoro-short-break')?.value) || 5;
            this.settings.pomodoro.longBreak = parseInt(UI.$id('pomodoro-long-break')?.value) || 15;
            this.settings.pomodoro.sessionsUntilLongBreak = parseInt(UI.$id('pomodoro-sessions')?.value) || 4;
        } else if (currentPage === 'custom-timer') {
            this.settings.customTimer.autoStartBreak = UI.$id('auto-start-break')?.checked || false;
            this.settings.customTimer.defaultBreakDuration = parseInt(UI.$id('default-break-duration')?.value) || 5;
        } else if (currentPage === 'stopwatch') {
            this.settings.stopwatch.autoLap = UI.$id('auto-lap')?.checked || false;
            this.settings.stopwatch.format = UI.$id('time-format')?.value || 'hms';
        }

        this.saveSettings();
        
        // Apply settings immediately
        this.applySettings();
    }

    applySettings() {
        // Apply theme
        if (this.settings.theme !== 'system' && window.themeController) {
            if (this.settings.theme === 'dark') {
                window.themeController.setDarkTheme();
            } else {
                window.themeController.setLightTheme();
            }
        }

        // Request notification permission if enabled
        if (this.settings.notifications && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Apply wake lock if supported and enabled
        if (this.settings.keepScreenAwake && 'wakeLock' in navigator) {
            this.requestWakeLock();
        }
    }

    async requestWakeLock() {
        try {
            if (this.wakeLock) {
                await this.wakeLock.release();
            }
            this.wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
            console.warn('Wake lock request failed:', err);
        }
    }

    loadSettings() {
        const defaultSettings = {
            theme: 'system',
            notifications: true,
            keepScreenAwake: false,
            pomodoro: {
                workDuration: 25,
                shortBreak: 5,
                longBreak: 15,
                sessionsUntilLongBreak: 4
            },
            customTimer: {
                autoStartBreak: false,
                defaultBreakDuration: 5
            },
            stopwatch: {
                autoLap: false,
                format: 'hms'
            }
        };

        const saved = localStorage.getItem('app-settings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('app-settings', JSON.stringify(this.settings));
    }

    resetSettings() {
        localStorage.removeItem('app-settings');
        this.settings = this.loadSettings();
        this.applySettings();
    }

    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stopwatch-settings.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const imported = JSON.parse(e.target.result);
                        this.settings = { ...this.settings, ...imported };
                        this.saveSettings();
                        this.applySettings();
                        
                        UI.showModal('Settings Imported', 'Settings have been successfully imported and applied.', [
                            { text: 'OK', class: 'btn-primary', dismiss: true }
                        ]);
                    } catch (err) {
                        UI.showModal('Import Error', 'Failed to import settings. Please check the file format.', [
                            { text: 'OK', class: 'btn-danger', dismiss: true }
                        ]);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    getSettings() {
        return this.settings;
    }
}

// Global functions for modal actions
window.saveSettings = () => {
    if (window.settingsManager) {
        window.settingsManager.saveSettingsFromModal();
    }
};

window.resetAllSettings = () => {
    UI.showModal('Reset Settings', 'Are you sure you want to reset all settings to defaults?', [
        { text: 'Cancel', class: 'btn-secondary', dismiss: true },
        { text: 'Reset', class: 'btn-danger', onclick: 'confirmResetSettings()', dismiss: true }
    ]);
};

window.confirmResetSettings = () => {
    if (window.settingsManager) {
        window.settingsManager.resetSettings();
    }
};

window.exportSettings = () => {
    if (window.settingsManager) {
        window.settingsManager.exportSettings();
    }
};

window.importSettings = () => {
    if (window.settingsManager) {
        window.settingsManager.importSettings();
    }
};

// Initialize settings manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});
