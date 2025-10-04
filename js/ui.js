// UI utility functions shared across all timer modules
export class UI {
    static $id(id) {
        return document.getElementById(id);
    }

    static $class(className) {
        return document.getElementsByClassName(className);
    }

    static $query(selector) {
        return document.querySelector(selector);
    }

    static $queryAll(selector) {
        return document.querySelectorAll(selector);
    }

    static formatTime(value, padLength = 2) {
        return String(value).padStart(padLength, '0');
    }

    static formatTimeDisplay(days, hours, minutes, seconds, centiseconds) {
        if (days > 0) {
            return `${UI.formatTime(days)}:${UI.formatTime(hours)}:${UI.formatTime(minutes)}:${UI.formatTime(seconds)}.${UI.formatTime(centiseconds)}`;
        }
        return `${UI.formatTime(hours)}:${UI.formatTime(minutes)}:${UI.formatTime(seconds)}.${UI.formatTime(centiseconds)}`;
    }

    static showModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'dynamicModal';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', 'dynamicModalLabel');
        modal.setAttribute('aria-hidden', 'true');

        const buttonHTML = buttons.map(btn => 
            `<button type="button" class="btn ${btn.class || 'btn-secondary'}" ${btn.dismiss ? 'data-bs-dismiss="modal"' : ''} onclick="${btn.onclick || ''}">${btn.text}</button>`
        ).join('');

        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="dynamicModalLabel">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        ${buttonHTML}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });

        return bootstrapModal;
    }

    static showKeyboardHelp() {
        const helpContent = `
            <div class="keyboard-shortcuts">
                <h6>Keyboard Shortcuts</h6>
                <div class="row">
                    <div class="col-6">
                        <strong>Space / P</strong><br>
                        <small>Start/Stop timer</small>
                    </div>
                    <div class="col-6">
                        <strong>Backspace / R</strong><br>
                        <small>Reset timer</small>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-6">
                        <strong>Enter</strong><br>
                        <small>Add lap (stopwatch)</small>
                    </div>
                    <div class="col-6">
                        <strong>Numpad 0</strong><br>
                        <small>Clear all laps</small>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-6">
                        <strong>K</strong><br>
                        <small>Toggle sound</small>
                    </div>
                    <div class="col-6">
                        <strong>?</strong><br>
                        <small>Show this help</small>
                    </div>
                </div>
            </div>
        `;

        UI.showModal('Keyboard Shortcuts', helpContent, [
            { text: 'Close', class: 'btn-primary', dismiss: true }
        ]);
    }

    static exportToCSV(data, filename) {
        const csv = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    static addAccessibilityAttributes(element, role, label, live = null) {
        if (role) element.setAttribute('role', role);
        if (label) element.setAttribute('aria-label', label);
        if (live) element.setAttribute('aria-live', live);
    }

    static updateButtonState(button, isActive, activeText, inactiveText) {
        button.innerHTML = isActive ? activeText : inactiveText;
        button.setAttribute('aria-pressed', isActive.toString());
    }
}

// Global keyboard shortcuts
document.addEventListener('keyup', (event) => {
    if (event.code === 'Slash' && event.shiftKey) { // ? key
        UI.showKeyboardHelp();
    }
});
