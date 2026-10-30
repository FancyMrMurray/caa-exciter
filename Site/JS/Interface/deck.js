import { AudioConfig } from "../WebAudio/audio-config.js";
import { WebAudioFunctions } from "../WebAudio/web-audio.js";
import { RnboFunctions } from "../RNBO/rnbo-runtime.js";
import { createDropdownControl, createFilterPanel, createToggleButton } from "./components.js";

const FILTER_TYPES = [
    'lowpass', 'highpass', 'bandpass', 'bandstop', 'peaknotch',
    'low shelf', 'high shelf', 'resonant', 'allpass',
    'gainlpass', 'gainhpass', 'gainbpass', 'gainbstop',
    'gaingainresonant', 'gainapass', 'bypass'
];

const DEFAULT_SLIDER_CONFIG = [
    { key: 'freq', min: '50', max: '20000', step: '1', value: '1000', paramIndex: 0 },
    { key: 'gain', min: '-12', max: '12', step: '0.1', value: '0', paramIndex: 1 },
    { key: 'q', min: '0.5', max: '5', step: '0.1', value: '1', paramIndex: 2 },
];

export class DeckController {
    constructor(rootElement, options = {}) {
        this.rootElement = rootElement;
        this.deckId = options.deckId ?? rootElement?.dataset.deckId ?? 'deck';
        this.dom = {};
        this.toggleHandlers = new Map();
        this.destroyed = false;

        if (!this.rootElement) {
            throw new Error('DeckController requires a root element');
        }

        this.init();
    }

    init() {
        this.dom.divisionsContainer = this.rootElement.querySelector('[data-role="divisions"]');
        this.dom.audioSelectContainer = this.rootElement.querySelector('[data-role="audio-select-container"]');
        this.dom.mainToggle = this.rootElement.querySelector('[data-role="master-toggle"]');
        this.dom.sequencerToggle = this.rootElement.querySelector('[data-role="sequencer-toggle"]');
        this.dom.windowToggle = this.rootElement.querySelector('[data-role="window-toggle"]');
        this.dom.filterPanels = Array.from(this.rootElement.querySelectorAll('[data-role="filter-controls"]'));
        this.dom.dropdowns = [];
    
        this.initDivisionButtons();
        this.initAudioSelect();
        this.initToggles();
        this.initFilters();
    
        this.boundHideDropdowns = this.hideDropdowns.bind(this);
        window.addEventListener('click', this.boundHideDropdowns);
    }

    registerDropdown(dropdown) {
        this.dom.dropdowns.push({ wrapper: dropdown.element, menu: dropdown.menu });
    }
    

    initDivisionButtons() {
        if (!this.dom.divisionsContainer) return;

        this.dom.divisionsContainer.innerHTML = '';
        for (let btn = 0; btn < 8; btn++) {
            const newBtn = document.createElement('button');
            newBtn.classList.add('division', 'button');
            newBtn.textContent = String(Math.pow(2, btn));
            newBtn.addEventListener('click', () => {
                RnboFunctions.sendToInport('division', Math.pow(2, btn));
            });

            this.dom.divisionsContainer.appendChild(newBtn);
        }
    }

    initAudioSelect() {
        if (!this.dom.audioSelectContainer) return;
    
        this.dom.audioSelectContainer.innerHTML = '';
    
        const audioDropdown = createDropdownControl({
            buttonLabel: '-select-audio-',
            items: AudioConfig.PC007URLS.map((url) => ({ label: url.toString().split('/').at(-1), value: url })),
            onSelect: (item) => {
                WebAudioFunctions.loadNewAudioFile(item.value);
            }
        });
    
        this.dom.audioSelectContainer.appendChild(audioDropdown.element);
        this.registerDropdown(audioDropdown);
    }

    hideDropdowns(event) {
        this.dom.dropdowns.forEach(({ wrapper, menu }) => {
            if (!wrapper.contains(event.target) && menu.classList.contains('show')) {
                menu.classList.remove('show');
            }
        });
    }

    initToggles() {
        const toggleConfigs = [
            { element: this.dom.mainToggle, label: 'on/off', inport: 'on_off_switch', role: 'master-toggle' },
            { element: this.dom.sequencerToggle, label: 'sequencer', inport: 'sampler_toggle', role: 'sequencer-toggle' },
            { element: this.dom.windowToggle, label: 'window', inport: 'window_toggle', role: 'window-toggle' },
        ];

        toggleConfigs.forEach((config) => {
            if (!config.element) return;

            const toggle = createToggleButton({
                label: config.element.textContent.trim() || config.label,
                initialValue: config.element.dataset.value === 'true',
                inport: config.element.dataset.inport || config.inport,
                role: config.element.dataset.role || config.role,
                onToggle: ({ next, inport }) => {
                    RnboFunctions.sendToInport(inport, next);
                }
            });

            config.element.replaceWith(toggle);

            if (config.role === 'master-toggle') this.dom.mainToggle = toggle;
            if (config.role === 'sequencer-toggle') this.dom.sequencerToggle = toggle;
            if (config.role === 'window-toggle') this.dom.windowToggle = toggle;
        });
    }

    initFilters() {
        this.dom.filterPanels.forEach((container, panelIndex) => {
            container.innerHTML = '';
    
            const panel = createFilterPanel({
                panelIndex,
                filterTypes: FILTER_TYPES,
                sliderConfig: DEFAULT_SLIDER_CONFIG,
                onFilterTypeChange: (index, typeIndex) => {
                    RnboFunctions.sendToInport('filter_type', [0, index, typeIndex]);
                },
                onFilterSettingChange: (index, paramIndex, value) => {
                    RnboFunctions.sendToInport('filter_settings', [1, index, paramIndex, value]);
                }
            });
    
            container.appendChild(panel.element);
            this.registerDropdown(panel.dropdown);
        });
    }

    destroy() {
        if (this.destroyed) return;
    
        if (this.boundHideDropdowns) {
            window.removeEventListener('click', this.boundHideDropdowns);
        }
    
        if (this.dom.divisionsContainer) this.dom.divisionsContainer.innerHTML = '';
        if (this.dom.audioSelectContainer) this.dom.audioSelectContainer.innerHTML = '';
        if (this.dom.filterPanels?.length) {
            this.dom.filterPanels.forEach((container) => {
                container.innerHTML = '';
            });
        }
        this.dom.dropdowns = [];
    
        this.destroyed = true;
    }
}

export const ControlFunctions = {
    initControlElements(rootElement = document.querySelector('[data-role="deck"]')) {
        if (!rootElement) return null;

        if (rootElement.__deckController) {
            rootElement.__deckController.destroy();
        }

        const controller = new DeckController(rootElement);
        rootElement.__deckController = controller;
        return controller;
    }
};