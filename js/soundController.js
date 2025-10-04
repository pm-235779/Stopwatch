// Sound controller with volume and toggle controls
import { UI } from './ui.js';

export class SoundController {
    constructor(audioSrc = 'audio/sound_trim.mp3') {
        this.audio = new Audio();
        this.audio.src = audioSrc;
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
        this.volume = parseFloat(localStorage.getItem('soundVolume')) || 0.5;
        this.audio.volume = this.volume;
        this.init();
    }

    init() {
        // Create sound controls UI
        this.createSoundControls();
        
        // Setup keyboard shortcut
        document.addEventListener('keyup', (event) => {
            if (event.code === 'KeyK') {
                this.toggle();
            }
        });
    }

    createSoundControls() {
        const navbar = UI.$query('.navbar .container-fluid');
        if (!navbar) return;

        const soundControls = document.createElement('div');
        soundControls.id = 'sound-controls';
        soundControls.className = 'd-flex align-items-center me-3';
        soundControls.innerHTML = `
            <button id="sound-toggle" class="btn btn-sm btn-outline-secondary me-2" title="Toggle Sound (K)">
                <i class="fas ${this.enabled ? 'fa-volume-up' : 'fa-volume-mute'}"></i>
            </button>
            <input type="range" id="volume-slider" class="form-range" min="0" max="1" step="0.1" 
                   value="${this.volume}" style="width: 80px;" title="Volume">
        `;

        // Insert before theme toggle
        const themeToggle = UI.$id('switch-theme');
        if (themeToggle) {
            navbar.insertBefore(soundControls, themeToggle);
        } else {
            navbar.appendChild(soundControls);
        }

        // Setup event listeners
        const toggleBtn = UI.$id('sound-toggle');
        const volumeSlider = UI.$id('volume-slider');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(parseFloat(e.target.value));
            });
        }

        // Update initial state
        this.updateUI();
    }

    play() {
        if (!this.enabled) return;
        
        this.audio.currentTime = 0;
        this.audio.play().catch(() => {
            // Handle autoplay restrictions silently
        });
    }

    pause() {
        this.audio.pause();
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled.toString());
        this.updateUI();
        
        if (this.enabled) {
            this.play();
        } else {
            this.pause();
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
        localStorage.setItem('soundVolume', this.volume.toString());
        this.updateUI();
    }

    updateUI() {
        const toggleBtn = UI.$id('sound-toggle');
        const volumeSlider = UI.$id('volume-slider');

        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.className = `fas ${this.enabled ? 'fa-volume-up' : 'fa-volume-mute'}`;
            }
            toggleBtn.setAttribute('aria-pressed', this.enabled.toString());
        }

        if (volumeSlider) {
            volumeSlider.value = this.volume;
            volumeSlider.disabled = !this.enabled;
        }
    }

    isEnabled() {
        return this.enabled;
    }

    getVolume() {
        return this.volume;
    }
}
