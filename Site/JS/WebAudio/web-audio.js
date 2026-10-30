import { StatusFunctions } from "../Interface/status.js";
import { RnboFunctions } from "../RNBO/rnbo-runtime.js";
import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js';
import RegionsPlugin from 'https://unpkg.com/wavesurfer.js@7/dist/plugins/regions.esm.js';


const WAVEFORM_OPTIONS = {
    barWidth: 2,
    height: 'auto',
    cursorColor: 'rgba(0,0,0,0)'
};

const STATE = {
    audioContext: null,
    currentAudio: null,
    selectorWaveform: null,
    displayWaveform: null
};

const SELECTOR_WAVEFORM_CONTAINER = document.querySelector('.selector-waveform');
const DISPLAY_WAVEFORM_CONTAINER = document.querySelector('.display-waveform');

function createWaveform(container, peaks, duration) {
    return WaveSurfer.create({
        container,
        peaks,
        duration,
        ...WAVEFORM_OPTIONS
    });
}

export const WebAudioSetup = {
    createContext() {
        if (state.audioContext) throw new Error('Web audio context is already created.');
        StatusFunctions.updateStatus('log', 'creating web audio context');

        const WAContext = window.AudioContext || window.webkitAudioContext;
        state.audioContext = new WAContext();

        document.body.addEventListener('click', WebAudioSetup.enableAudioContext);

        StatusFunctions.clearStatus();
        return state.audioContext;
    },

    disposeContext() {
        StatusFunctions.updateStatus('log', 'disposing web audio context');
        if (state.audioContext) state.audioContext.close();
        state.audioContext = null;
    },

    enableAudioContext() {
        if (!state.audioContext) throw new Error('Web audio context must be created before it is enabled');
        state.audioContext.resume();
        document.body.removeEventListener('click', WebAudioSetup.enableAudioContext);
        StatusFunctions.updateStatus('success', 'audio enabled');
    },

    clearWaveforms() {
        if (state.selectorWaveform) {
            state.selectorWaveform.destroy();
            state.selectorWaveform = null;
        }
        if (state.displayWaveform) {
            state.displayWaveform.destroy();
            state.displayWaveform = null;
        }
    }
};

export const WebAudioFunctions = {
    async loadNewAudioFile(url) {
        StatusFunctions.updateStatus('log', `loading ${url}`);
        state.currentAudio = await this.fetchAudioData(url);
        RnboFunctions.setBuffer(0, state.currentAudio);
        this.generateWaveform(state.currentAudio);
    },

    async fetchAudioData(url) {
        StatusFunctions.updateStatus('log', `fetching ${url}`);
        const result = await fetch(url);
        if (!result.ok) throw new Error(`HTTP ${result.status} fetching ${url}`);

        const arrayBuffer = await result.arrayBuffer();
        const audio = await state.audioContext.decodeAudioData(arrayBuffer); // <-- was missing await
        if (!audio) throw new Error(`Error creating/decoding array buffer from ${url}`);

        StatusFunctions.updateStatus('success', `loaded ${url}`);
        return audio;
    },

    subscribeToSelections() {
        // ... update waveform based on selection information coming from RNBO,
        // just going to subscribe waveform object to selections
    },

    generateWaveform(audioBuffer) {
        WebAudioSetup.clearWaveforms();

        const peaks = [];
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            peaks.push(audioBuffer.getChannelData(i));
        }

        state.selectorWaveform = createWaveform(SELECTOR_WAVEFORM_CONTAINER, peaks, audioBuffer.duration);
        state.displayWaveform = createWaveform(DISPLAY_WAVEFORM_CONTAINER, peaks, audioBuffer.duration);
    }
};