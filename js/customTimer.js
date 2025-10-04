// Enhanced Custom Timer with better timing and celebration effects
import { UI } from './ui.js';
import { SoundController } from './soundController.js';

class CustomTimer {
    constructor() {
        this.totalTime = 0; // in milliseconds
        this.remainingTime = 0;
        this.isRunning = false;
        this.startTime = 0;
        this.animationId = null;
        this.alarmActive = false;
        
        this.soundController = new SoundController('../audio/sound_trim.mp3');
        this.init();
    }

    init() {
        // Setup accessibility
        const timerDisplay = UI.$query('.timer');
        if (timerDisplay) {
            UI.addAccessibilityAttributes(timerDisplay.parentElement, 'timer', 'Custom timer display', 'polite');
        }

        const controlBtn = UI.$id('timer-control');
        if (controlBtn) {
            UI.addAccessibilityAttributes(controlBtn, 'button', 'Start or pause custom timer');
        }

        // Load presets
        this.loadPresets();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Make functions globally available
        window.setCustomTime = (hours, minutes, seconds) => this.setTime(hours, minutes, seconds);
        window.startCustomTimerCounter = () => this.toggle();
        window.reset = () => this.reset();
        window.stopAlarm = () => this.stopAlarm();
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
                case 'Escape':
                    if (this.alarmActive) {
                        event.preventDefault();
                        this.stopAlarm();
                    }
                    break;
            }
        });
    }

    setTime(hours = 0, minutes = 0, seconds = 0) {
        // Validate inputs
        hours = Math.max(0, parseInt(hours) || 0);
        minutes = Math.max(0, parseInt(minutes) || 0);
        seconds = Math.max(0, parseInt(seconds) || 0);

        if (hours === 0 && minutes === 0 && seconds === 0) {
            UI.showModal('Invalid Time', 'Please enter a valid time greater than 0.', [
                { text: 'OK', class: 'btn-primary', dismiss: true }
            ]);
            return;
        }

        this.totalTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
        this.remainingTime = this.totalTime;
        this.isRunning = false;

        // Update display
        this.updateTimeDisplay();
        
        // Update UI state
        this.updateBackgroundState('active');
        
        const controlBtn = UI.$id('timer-control');
        if (controlBtn) {
            UI.updateButtonState(controlBtn, false,
                '<i class="fas fa-pause-circle"></i> Pause',
                '<i class="fas fa-play-circle"></i> Play'
            );
        }

        // Clear input fields
        const inputs = ['hoursInput', 'minutesInput', 'secondsInput'];
        inputs.forEach(id => {
            const input = UI.$id(id);
            if (input) input.value = '';
        });

        // Save as preset
        this.savePreset(hours, minutes, seconds);
    }

    toggle() {
        if (this.totalTime === 0) {
            UI.showModal('No Timer Set', 'Please set a timer duration first.', [
                { text: 'OK', class: 'btn-primary', dismiss: true }
            ]);
            return;
        }

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
        this.stopAlarm();
        this.stopCelebration();
        
        this.remainingTime = 0;
        this.totalTime = 0;
        
        // Update display
        this.updateTimeDisplay();
        
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

        // Hide stop alarm button
        const stopAlarmBtn = UI.$id('stop-alarm');
        if (stopAlarmBtn) {
            stopAlarmBtn.classList.add('hidden');
        }
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

        this.updateTimeDisplay();
    }

    updateTimeDisplay() {
        const totalSeconds = Math.ceil(this.remainingTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const hoursEl = UI.$id('hours');
        const minutesEl = UI.$id('minutes');
        const secondsEl = UI.$id('seconds');

        if (hoursEl) hoursEl.textContent = UI.formatTime(hours);
        if (minutesEl) minutesEl.textContent = UI.formatTime(minutes);
        if (secondsEl) secondsEl.textContent = UI.formatTime(seconds);
    }

    onTimerComplete() {
        this.isRunning = false;
        this.remainingTime = 0;
        this.alarmActive = true;
        
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

        // Show stop alarm button
        const stopAlarmBtn = UI.$id('stop-alarm');
        if (stopAlarmBtn) {
            stopAlarmBtn.classList.remove('hidden');
        }

        // Start alarm and celebration
        this.soundController.audio.loop = true;
        this.soundController.play();
        this.startCelebration();

        // Show completion notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Timer Complete!', {
                body: 'Your custom timer has finished.',
                icon: '../img/favicon.png'
            });
        }
    }

    stopAlarm() {
        this.alarmActive = false;
        
        // Stop sound
        this.soundController.audio.loop = false;
        this.soundController.pause();
        this.soundController.audio.currentTime = 0;

        // Hide stop alarm button
        const stopAlarmBtn = UI.$id('stop-alarm');
        if (stopAlarmBtn) {
            stopAlarmBtn.classList.add('hidden');
        }

        // Stop celebration
        this.stopCelebration();
    }

    startCelebration() {
        // Pulse timer digits
        const timers = UI.$queryAll('.timer');
        timers.forEach(timer => timer.classList.add('pulse'));

        // Create confetti
        const confettiContainer = UI.$id('confetti');
        if (!confettiContainer) return;

        confettiContainer.innerHTML = '';

        const colors = ['#FFD166', '#06D6A0', '#EF476F', '#118AB2', '#8338EC', '#FB5607'];
        const pieceCount = 120;
        const durationMin = 3000;
        const durationMax = 6000;

        for (let i = 0; i < pieceCount; i++) {
            const piece = document.createElement('span');
            piece.className = 'confetti';
            
            const left = Math.random() * 100;
            const size = 6 + Math.random() * 10;
            const delay = Math.random() * 400;
            const duration = durationMin + Math.random() * (durationMax - durationMin);

            piece.style.left = `${left}vw`;
            piece.style.background = colors[i % colors.length];
            piece.style.width = `${size}px`;
            piece.style.height = `${size * 1.4}px`;
            piece.style.animationDuration = `${duration}ms`;
            piece.style.animationDelay = `${delay}ms`;

            confettiContainer.appendChild(piece);

            // Clean up piece after animation
            setTimeout(() => {
                if (piece.parentNode) {
                    piece.remove();
                }
            }, duration + delay + 100);
        }
    }

    stopCelebration() {
        // Remove pulse effect
        const timers = UI.$queryAll('.timer');
        timers.forEach(timer => timer.classList.remove('pulse'));

        // Clear confetti
        const confettiContainer = UI.$id('confetti');
        if (confettiContainer) {
            confettiContainer.innerHTML = '';
        }
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
                focusEl.classList.remove('hidden');
            } else {
                focusEl.classList.add('hidden');
            }
        }
    }

    savePreset(hours, minutes, seconds) {
        const presets = this.getPresets();
        const preset = { hours, minutes, seconds, name: `${hours}h ${minutes}m ${seconds}s` };
        
        // Avoid duplicates
        const exists = presets.some(p => p.hours === hours && p.minutes === minutes && p.seconds === seconds);
        if (!exists) {
            presets.unshift(preset);
            // Keep only last 5 presets
            if (presets.length > 5) {
                presets.splice(5);
            }
            localStorage.setItem('custom-timer-presets', JSON.stringify(presets));
            this.updatePresetsUI();
        }
    }

    getPresets() {
        const saved = localStorage.getItem('custom-timer-presets');
        return saved ? JSON.parse(saved) : [];
    }

    loadPresets() {
        this.updatePresetsUI();
    }

    updatePresetsUI() {
        const presets = this.getPresets();
        if (presets.length === 0) return;

        // Create presets dropdown if it doesn't exist
        let presetsContainer = UI.$id('presets-container');
        if (!presetsContainer) {
            presetsContainer = document.createElement('div');
            presetsContainer.id = 'presets-container';
            presetsContainer.className = 'mt-3';
            
            const form = UI.$id('custom-timer-form');
            if (form) {
                form.appendChild(presetsContainer);
            }
        }

        presetsContainer.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-info dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    Quick Presets
                </button>
                <ul class="dropdown-menu">
                    ${presets.map((preset, index) => 
                        `<li><a class="dropdown-item" href="#" onclick="loadPreset(${index})">${preset.name}</a></li>`
                    ).join('')}
                </ul>
            </div>
        `;

        // Make loadPreset globally available
        window.loadPreset = (index) => {
            const preset = presets[index];
            if (preset) {
                this.setTime(preset.hours, preset.minutes, preset.seconds);
            }
        };
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Initialize custom timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.customTimerInstance = new CustomTimer();
});
