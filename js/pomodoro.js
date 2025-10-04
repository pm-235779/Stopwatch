// Enhanced Pomodoro Timer with better timing and settings
import { UI } from './ui.js';
import { SoundController } from './soundController.js';

class PomodoroTimer {
    constructor() {
        this.defaultDuration = 25; // minutes
        this.currentDuration = this.defaultDuration;
        this.remainingTime = 0;
        this.isRunning = false;
        this.startTime = 0;
        this.animationId = null;
        
        this.soundController = new SoundController('../audio/sound_trim.mp3');
        this.init();
    }

    init() {
        // Setup accessibility
        const timerDisplay = UI.$query('.timer');
        if (timerDisplay) {
            UI.addAccessibilityAttributes(timerDisplay.parentElement, 'timer', 'Pomodoro timer display', 'polite');
        }

        const controlBtn = UI.$id('timer-control');
        if (controlBtn) {
            UI.addAccessibilityAttributes(controlBtn, 'button', 'Start or pause pomodoro timer');
        }

        // Load settings
        this.loadSettings();
        
        // Initialize timer
        this.reset();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Make functions globally available
        window.startPomoCounter = () => this.toggle();
        window.reset = () => this.reset();
        window.setPomoTime = (minutes) => this.setDuration(minutes);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'Space':
                case 'KeyP':
                    event.preventDefault();
                    this.toggle();
                    break;
                case 'Backspace':
                case 'KeyR':
                    event.preventDefault();
                    this.reset();
                    break;
            }
        });
    }

    setDuration(minutes) {
        this.currentDuration = minutes || this.defaultDuration;
        this.remainingTime = this.currentDuration * 60 * 1000; // Convert to milliseconds
        this.updateDisplay();
        this.saveSettings();
    }

    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        if (!this.isRunning && this.remainingTime > 0) {
            this.startTime = performance.now();
            this.isRunning = true;
            this.soundController.play();
            
            // Update UI state
            this.updateBackgroundState('inactive');
            this.showFocusMessage(true);
            
            const controlBtn = UI.$id('timer-control');
            if (controlBtn) {
                UI.updateButtonState(controlBtn, true,
                    '<i class="fas fa-pause-circle"></i> Pause',
                    '<i class="fas fa-play-circle"></i> Play'
                );
            }

            this.updateDisplay();
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }

            // Update UI state
            this.updateBackgroundState('active');
            this.showFocusMessage(false);
            
            const controlBtn = UI.$id('timer-control');
            if (controlBtn) {
                UI.updateButtonState(controlBtn, false,
                    '<i class="fas fa-pause-circle"></i> Pause',
                    '<i class="fas fa-play-circle"></i> Play'
                );
            }
        }
    }

    reset() {
        this.pause();
        this.remainingTime = this.currentDuration * 60 * 1000;
        
        // Update UI state
        this.updateBackgroundState('active');
        this.showFocusMessage(false);
        
        const controlBtn = UI.$id('timer-control');
        if (controlBtn) {
            UI.updateButtonState(controlBtn, false,
                '<i class="fas fa-pause-circle"></i> Pause',
                '<i class="fas fa-play-circle"></i> Play'
            );
        }

        this.updateDisplay();
        this.soundController.play();
    }

    updateDisplay() {
        if (this.isRunning) {
            const elapsed = performance.now() - this.startTime;
            this.remainingTime = Math.max(0, this.remainingTime - elapsed);
            this.startTime = performance.now();

            if (this.remainingTime <= 0) {
                this.onTimerComplete();
                return;
            }

            this.animationId = requestAnimationFrame(() => this.updateDisplay());
        }

        // Update display elements
        const totalSeconds = Math.ceil(this.remainingTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const minutesEl = UI.$id('minutes');
        const secondsEl = UI.$id('seconds');

        if (minutesEl) minutesEl.textContent = UI.formatTime(minutes);
        if (secondsEl) secondsEl.textContent = UI.formatTime(seconds);
    }

    onTimerComplete() {
        this.isRunning = false;
        this.remainingTime = 0;
        
        // Update UI
        this.updateBackgroundState('active');
        this.showFocusMessage(false);
        
        const controlBtn = UI.$id('timer-control');
        if (controlBtn) {
            UI.updateButtonState(controlBtn, false,
                '<i class="fas fa-pause-circle"></i> Pause',
                '<i class="fas fa-play-circle"></i> Play'
            );
        }

        // Play completion sound
        this.soundController.audio.loop = true;
        this.soundController.play();

        // Show completion modal
        UI.showModal('Pomodoro Complete!', 
            `Great job! You've completed a ${this.currentDuration}-minute pomodoro session.`,
            [
                { 
                    text: 'Start Break', 
                    class: 'btn-success', 
                    onclick: 'startBreak()',
                    dismiss: true 
                },
                { 
                    text: 'Start Another', 
                    class: 'btn-primary', 
                    onclick: 'startAnother()',
                    dismiss: true 
                },
                { 
                    text: 'Stop Sound', 
                    class: 'btn-secondary', 
                    onclick: 'stopCompletionSound()',
                    dismiss: true 
                }
            ]
        );

        // Auto-stop sound after 10 seconds
        setTimeout(() => {
            this.soundController.audio.loop = false;
            this.soundController.pause();
        }, 10000);
    }

    updateBackgroundState(state) {
        const background = UI.$id('counter-background');
        if (!background) return;

        background.classList.remove('active', 'inactive');
        background.classList.add(state);

        // Apply theme-specific styles
        if (window.themeController && window.themeController.isDarkTheme()) {
            if (state === 'active') {
                background.style.background = '#191212';
                background.style.color = '#7fe9d4';
            } else {
                background.style.background = '#000000';
                background.style.color = '#ffffff';
            }
        } else {
            if (state === 'active') {
                background.style.background = 'linear-gradient(to right, #191654, #43C6AC)';
                background.style.color = '#333';
            } else {
                background.style.background = 'rgb(5, 30, 54)';
                background.style.color = 'rgb(169, 188, 214)';
            }
        }
    }

    showFocusMessage(show) {
        const focusEl = UI.$id('focus');
        if (focusEl) {
            if (show) {
                focusEl.classList.remove('hide');
            } else {
                focusEl.classList.add('hide');
            }
        }
    }

    saveSettings() {
        const settings = {
            defaultDuration: this.defaultDuration,
            currentDuration: this.currentDuration
        };
        localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('pomodoro-settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.defaultDuration = settings.defaultDuration || 25;
                this.currentDuration = settings.currentDuration || this.defaultDuration;
            } catch (e) {
                console.warn('Failed to load pomodoro settings:', e);
            }
        }
    }
}

// Global functions for modal actions
window.startBreak = () => {
    if (window.pomodoroInstance) {
        window.pomodoroInstance.setDuration(5); // 5-minute break
        window.pomodoroInstance.start();
    }
};

window.startAnother = () => {
    if (window.pomodoroInstance) {
        window.pomodoroInstance.reset();
        window.pomodoroInstance.start();
    }
};

window.stopCompletionSound = () => {
    if (window.pomodoroInstance) {
        window.pomodoroInstance.soundController.audio.loop = false;
        window.pomodoroInstance.soundController.pause();
    }
};

// Initialize pomodoro timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pomodoroInstance = new PomodoroTimer();
});
