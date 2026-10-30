const STATUS_ELEMENT = document.querySelector('#status-element');

const CLEAR_DELAY_MS = 1000;

const STATUS_CONFIG = {
    success: { color: '#23ce6b', log: console.log },
    log: { color: '#fafafa', log: console.log },
    warn: { color: '#fbe51f', log: console.warn },
    error: { color: '#f23030', log: console.error },
    'silent-error': { color: '#f23030', log: null },
};

export const StatusFunctions = {
    clearTimeoutId: null,

    updateStatus(statusType, message) {
        const config = STATUS_CONFIG[statusType];

        if (!config) {
            const errorMsg = `${statusType} is not a valid type of status update`;
            STATUS_ELEMENT.style.color = STATUS_CONFIG.error.color;
            STATUS_ELEMENT.textContent = errorMsg;
            console.error(errorMsg);
            return;
        }

        STATUS_ELEMENT.style.color = config.color;
        STATUS_ELEMENT.textContent = message;

        if (config.log) config.log(message);

        clearTimeout(this.clearTimeoutId);
        this.clearTimeoutId = setTimeout(() => this.clearStatus(), CLEAR_DELAY_MS);
    },

    clearStatus() {
        STATUS_ELEMENT.textContent = '';
    },
};