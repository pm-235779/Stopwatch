// Enhanced stopwatch with accurate timing and lap management
import { UI } from './ui.js';
import { SoundController } from './soundController.js';

class Stopwatch {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.animationId = null;
        this.laps = [];
        this.lapCounter = 1;
        
        this.soundController = new SoundController();
        this.init();
    }

    init() {
        // Setup accessibility
        const timeDisplay = UI.$id('time');
        if (timeDisplay) {
            UI.addAccessibilityAttributes(timeDisplay, 'timer', 'Stopwatch display', 'polite');
        }

        const startBtn = UI.$id('start');
        if (startBtn) {
            UI.addAccessibilityAttributes(startBtn, 'button', 'Start or pause stopwatch');
        }

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Setup date display
        this.updateDateDisplay();
        setInterval(() => this.updateDateDisplay(), 1000);

        // Load saved laps
        this.loadLaps();

        // Make functions globally available for onclick handlers
        window.start = () => this.toggle();
        window.reset = () => this.reset();
        window.lap = () => this.addLap();
        window.clearLap = () => this.clearLaps();
        window.deleteLap = (index) => this.deleteLap(index);
        window.exportLaps = () => this.exportLaps();
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
                case 'Enter':
                    event.preventDefault();
                    this.addLap();
                    break;
                case 'Numpad0':
                    event.preventDefault();
                    this.clearLaps();
                    break;
            }
        });
    }

    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        if (!this.isRunning) {
            this.startTime = performance.now() - this.elapsedTime;
            this.isRunning = true;
            this.soundController.play();
            this.updateDisplay();
            
            const startBtn = UI.$id('start');
            if (startBtn) {
                UI.updateButtonState(startBtn, true, 
                    '<i class="fas fa-pause-circle"></i> Pause',
                    '<i class="fas fa-play-circle"></i> Start'
                );
            }
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            
            const startBtn = UI.$id('start');
            if (startBtn) {
                UI.updateButtonState(startBtn, false,
                    '<i class="fas fa-pause-circle"></i> Pause',
                    '<i class="fas fa-play-circle"></i> Start'
                );
            }
        }
    }

    reset() {
        this.pause();
        this.elapsedTime = 0;
        this.soundController.play();
        
        // Reset display
        this.updateTimeDisplay(0, 0, 0, 0, 0);
        
        // Clear laps
        this.clearLaps();
        
        // Hide record container
        const recordContainer = UI.$id('record-container');
        if (recordContainer) {
            recordContainer.style.display = 'none';
        }

        const startBtn = UI.$id('start');
        if (startBtn) {
            UI.updateButtonState(startBtn, false,
                '<i class="fas fa-pause-circle"></i> Pause',
                '<i class="fas fa-play-circle"></i> Start'
            );
        }
    }

    updateDisplay() {
        if (this.isRunning) {
            this.elapsedTime = performance.now() - this.startTime;
            
            const totalCentiseconds = Math.floor(this.elapsedTime / 10);
            const days = Math.floor(totalCentiseconds / (24 * 60 * 60 * 100));
            const hours = Math.floor((totalCentiseconds % (24 * 60 * 60 * 100)) / (60 * 60 * 100));
            const minutes = Math.floor((totalCentiseconds % (60 * 60 * 100)) / (60 * 100));
            const seconds = Math.floor((totalCentiseconds % (60 * 100)) / 100);
            const centiseconds = totalCentiseconds % 100;

            this.updateTimeDisplay(days, hours, minutes, seconds, centiseconds);
            
            this.animationId = requestAnimationFrame(() => this.updateDisplay());
        }
    }

    updateTimeDisplay(days, hours, minutes, seconds, centiseconds) {
        // Update display elements
        const hrEl = UI.$id('hr');
        const minEl = UI.$id('min');
        const secEl = UI.$id('sec');
        const countEl = UI.$id('count');

        if (days > 0) {
            // Show days when needed
            if (hrEl) hrEl.innerHTML = UI.formatTime(days * 24 + hours);
        } else {
            if (hrEl) hrEl.innerHTML = UI.formatTime(hours);
        }
        
        if (minEl) minEl.innerHTML = UI.formatTime(minutes);
        if (secEl) secEl.innerHTML = UI.formatTime(seconds);
        if (countEl) countEl.innerHTML = UI.formatTime(centiseconds);

        // Update labels if days are shown
        const hrLabel = UI.$query('#time .txt');
        if (hrLabel && days > 0) {
            hrLabel.textContent = days > 0 ? 'Days+Hr' : 'Hr';
        }
    }

    addLap() {
        if (!this.isRunning) return;

        const currentTime = this.elapsedTime;
        const previousTime = this.laps.length > 0 ? this.laps[this.laps.length - 1].totalTime : 0;
        const lapTime = currentTime - previousTime;

        const lap = {
            number: this.lapCounter++,
            totalTime: currentTime,
            lapTime: lapTime,
            timestamp: new Date().toISOString()
        };

        this.laps.push(lap);
        this.soundController.play();
        this.updateLapDisplay();
        this.saveLaps();

        // Show record container
        const recordContainer = UI.$id('record-container');
        if (recordContainer) {
            recordContainer.style.display = 'block';
        }
    }

    updateLapDisplay() {
        const tableBody = UI.$id('record-table-body');
        if (!tableBody) return;

        // Clear existing rows
        tableBody.innerHTML = '';

        // Add header if not exists
        this.ensureLapTableHeader();

        // Add laps in reverse order (newest first)
        this.laps.slice().reverse().forEach((lap, index) => {
            const row = tableBody.insertRow(0);
            
            const numberCell = row.insertCell(0);
            const totalTimeCell = row.insertCell(1);
            const lapTimeCell = row.insertCell(2);
            const actionsCell = row.insertCell(3);

            numberCell.innerHTML = lap.number;
            totalTimeCell.innerHTML = this.formatLapTime(lap.totalTime);
            lapTimeCell.innerHTML = this.formatLapTime(lap.lapTime);
            actionsCell.innerHTML = `
                <button class="btn btn-sm btn-outline-danger" onclick="deleteLap(${this.laps.length - 1 - index})" title="Delete lap">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        });
    }

    ensureLapTableHeader() {
        const table = UI.$id('record-table');
        if (!table) return;

        const existingHeader = table.querySelector('thead');
        if (existingHeader) return;

        const header = table.createTHead();
        const headerRow = header.insertRow();
        
        ['Lap #', 'Total Time', 'Lap Time', 'Actions'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
    }

    formatLapTime(timeMs) {
        const totalCentiseconds = Math.floor(timeMs / 10);
        const hours = Math.floor(totalCentiseconds / (60 * 60 * 100));
        const minutes = Math.floor((totalCentiseconds % (60 * 60 * 100)) / (60 * 100));
        const seconds = Math.floor((totalCentiseconds % (60 * 100)) / 100);
        const centiseconds = totalCentiseconds % 100;

        return `${UI.formatTime(hours)}:${UI.formatTime(minutes)}:${UI.formatTime(seconds)}.${UI.formatTime(centiseconds)}`;
    }

    deleteLap(index) {
        if (index >= 0 && index < this.laps.length) {
            UI.showModal('Delete Lap', 
                `Are you sure you want to delete lap ${this.laps[index].number}?`,
                [
                    { text: 'Cancel', class: 'btn-secondary', dismiss: true },
                    { 
                        text: 'Delete', 
                        class: 'btn-danger', 
                        onclick: `confirmDeleteLap(${index})`,
                        dismiss: true 
                    }
                ]
            );
        }
    }

    confirmDeleteLap(index) {
        this.laps.splice(index, 1);
        this.updateLapDisplay();
        this.saveLaps();
        
        if (this.laps.length === 0) {
            const recordContainer = UI.$id('record-container');
            if (recordContainer) {
                recordContainer.style.display = 'none';
            }
        }
    }

    clearLaps() {
        if (this.laps.length === 0) return;

        UI.showModal('Clear All Laps', 
            'Are you sure you want to clear all laps? This action cannot be undone.',
            [
                { text: 'Cancel', class: 'btn-secondary', dismiss: true },
                { 
                    text: 'Clear All', 
                    class: 'btn-danger', 
                    onclick: 'confirmClearLaps()',
                    dismiss: true 
                }
            ]
        );
    }

    confirmClearLaps() {
        this.laps = [];
        this.lapCounter = 1;
        this.soundController.play();
        
        const tableBody = UI.$id('record-table-body');
        if (tableBody) {
            tableBody.innerHTML = '';
        }

        const recordContainer = UI.$id('record-container');
        if (recordContainer) {
            recordContainer.style.display = 'none';
        }

        this.saveLaps();
    }

    exportLaps() {
        if (this.laps.length === 0) {
            UI.showModal('No Laps', 'No laps to export.', [
                { text: 'OK', class: 'btn-primary', dismiss: true }
            ]);
            return;
        }

        const csvData = [
            ['Lap Number', 'Total Time', 'Lap Time', 'Timestamp']
        ];

        this.laps.forEach(lap => {
            csvData.push([
                lap.number,
                this.formatLapTime(lap.totalTime),
                this.formatLapTime(lap.lapTime),
                new Date(lap.timestamp).toLocaleString()
            ]);
        });

        const filename = `stopwatch-laps-${new Date().toISOString().split('T')[0]}.csv`;
        UI.exportToCSV(csvData, filename);
    }

    saveLaps() {
        localStorage.setItem('stopwatch-laps', JSON.stringify(this.laps));
        localStorage.setItem('stopwatch-lap-counter', this.lapCounter.toString());
    }

    loadLaps() {
        const savedLaps = localStorage.getItem('stopwatch-laps');
        const savedCounter = localStorage.getItem('stopwatch-lap-counter');
        
        if (savedLaps) {
            try {
                this.laps = JSON.parse(savedLaps);
                this.updateLapDisplay();
                
                if (this.laps.length > 0) {
                    const recordContainer = UI.$id('record-container');
                    if (recordContainer) {
                        recordContainer.style.display = 'block';
                    }
                }
            } catch (e) {
                console.warn('Failed to load saved laps:', e);
            }
        }

        if (savedCounter) {
            this.lapCounter = parseInt(savedCounter) || 1;
        }
    }

    updateDateDisplay() {
        const dateEl = UI.$id('d1');
        if (!dateEl) return;

        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 
                       'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

        const dayName = days[now.getDay()];
        const monthName = months[now.getMonth()];
        const date = now.getDate();
        const year = now.getFullYear();

        dateEl.innerHTML = `${dayName}, ${monthName} ${date}, ${year}`;
    }
}

// Make functions globally available
window.confirmDeleteLap = (index) => {
    if (window.stopwatchInstance) {
        window.stopwatchInstance.confirmDeleteLap(index);
    }
};

window.confirmClearLaps = () => {
    if (window.stopwatchInstance) {
        window.stopwatchInstance.confirmClearLaps();
    }
};

// Initialize stopwatch when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.stopwatchInstance = new Stopwatch();
});
