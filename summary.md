# CAA Exciter — Technical Description

## 1. Purpose

This document gives a technical description of the CAA Exciter application. The application plays an audio file through a filter system. The filter system uses an RNBO device. The application shows the audio waveform on the screen. The user controls the audio through buttons, dropdown menus, and sliders.

## 2. System Components

The application has five main components:

- The HTML page (`index.html`)
- The control interface module (`deck.js`, `components.js`)
- The RNBO runtime module (`rnbo-runtime.js`, `rnbo-init.js`)
- The web audio module (`web-audio.js`, `audio-config.js`)
- The status module (`status.js`)

### 2.1 The HTML Page

The HTML page holds the structure of the user interface. The page has a top bar. The top bar shows the status text and the application title. The page has one deck. The deck holds the waveform displays and the control panel. The control panel holds the division buttons, the master controls, the filter controls, and a meter canvas.

The page loads the RNBO library from an external server before it loads the application code. The page loads the Wavesurfer library from an external server. The page loads the main application module last.

### 2.2 The RNBO Runtime Module

The RNBO runtime module sends data to the RNBO device. The RNBO device runs in the web audio context.

The function `setBuffer` loads audio data into the RNBO device. The function reports the load status through the status module.

The function `sendToInport` sends a message to a named inport on the RNBO device. The function checks the message type and the message format before it sends the message. The function supports eight inport names:

- `on_off_switch`, `window_toggle`, `sampler_toggle` — these inports accept a boolean value or the number 0 or 1.
- `sampler_tempo`, `division` — these inports accept a number greater than zero.
- `trigger_buffer_info`, `varispeed` — these inports accept any finite number.
- `selection_ms` — this inport accepts an array of three positive numbers: an index, a start time in milliseconds, and an end time in milliseconds.
- `filter_type` — this inport accepts an array of three numbers: an index, a stage index, and a type index. Negative numbers are not permitted.
- `filter_settings` — this inport accepts an array of four numbers: an index, a stage index, a control index, and a value.

If the message fails a check, the function raises an error. If the inport name is not on the list, the function raises an error.

### 2.3 The Web Audio Module

The web audio module creates and manages the web audio context.

The function `createContext` creates one audio context. The function fails if a context already exists. The function adds a click listener to the page body. The click listener resumes the audio context on the first user click. This method is necessary because browsers block audio until the user interacts with the page.

The function `loadNewAudioFile` fetches an audio file from a URL, decodes the audio data, sends the audio data to the RNBO device, and generates the waveform display.

The function `fetchAudioData` fetches the file and decodes it into an audio buffer. The function raises an error if the fetch fails or if the decode step returns no data.

The function `generateWaveform` reads the channel data from the audio buffer. The function creates two Wavesurfer instances: a selector waveform and a display waveform. The function first calls `clearWaveforms` to remove any previous waveform instances.

### 2.4 The Control Interface Module

The class `DeckController` builds and manages the on-screen controls for one deck.

The constructor requires a root DOM element. The constructor reads the deck ID from the root element or from the supplied options. The constructor calls the `init` method.

The `init` method finds the container elements inside the root element. The `init` method then builds four groups of controls:

1. **Division buttons.** The method creates eight buttons. Each button shows a power of two, from 1 to 128. A click on a button sends the value to the `division` inport.
2. **Audio select dropdown.** The method creates one dropdown menu. The menu lists the audio files defined in `AudioConfig.PC007URLS`. A selection loads the chosen audio file.
3. **Toggle buttons.** The method replaces the on/off, sequencer, and window buttons in the HTML with generated toggle buttons. Each toggle button sends its state to a named inport on each click.
4. **Filter panels.** The method builds one filter panel for each `filter-controls` element in the HTML. Each panel holds a filter-type dropdown and three range sliders: frequency, gain, and Q. A change to the dropdown or a slider sends a message to the RNBO device.

The `DeckController` class registers each dropdown menu in a list. A global click listener closes any open dropdown menu when the user clicks outside it.

The `destroy` method removes the global click listener and clears the content of the container elements. This method prevents duplicate event listeners if the controls are rebuilt.

The `ControlFunctions.initControlElements` function is the entry point for the control interface. The function destroys any existing controller on the given root element before it creates a new one.

### 2.5 The Status Module

The status module shows status messages to the user in the `#status-element` region of the page.

The function `updateStatus` accepts a status type and a message. Five status types are defined: `success`, `log`, `warn`, `error`, and `silent-error`. Each type has its own text color. The function also writes the message to the browser console, except for the `silent-error` type.

A status message clears from the screen one second after it appears.

## 3. Data Flow Summary

1. The main module creates the web audio context and builds the RNBO device.
2. The main module connects the RNBO device output to the audio context destination.
3. The main module builds the deck controller for the deck element in the page.
4. The user selects an audio file from the dropdown menu.
5. The application fetches and decodes the audio file.
6. The application sends the decoded audio data to the RNBO device buffer.
7. The application draws the waveform on the screen.
8. The user adjusts the buttons, the dropdown menus, and the sliders.
9. Each control action sends a message to the matching RNBO inport.
10. The RNBO device processes the audio and outputs the processed sound.

## 4. External Dependencies

- The RNBO runtime library, loaded from a Cycling '74 server.
- The Wavesurfer.js library, version 7, loaded from a CDN, with the Regions plugin.
- A patcher export file at `/Site/JS/RNBO/export/patch.export.json`.
- Sixteen audio files at `/Site/Media/Audio/PC-007-01.mp3` through `PC-007-16.mp3`.