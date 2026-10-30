import { StatusFunctions } from "../Interface/status.js";
import { device } from "../main.js";
const BUFFER_NAMES = ['sample_1'];

export const RnboFunctions = {

    async setBuffer(bufferIndex, audioData) {
        StatusFunctions.updateStatus('log', 'Loading audio into RNBO device');
        await device.setDataBuffer(BUFFER_NAMES[bufferIndex], audioData);
        StatusFunctions.updateStatus('success', 'audio successfully loaded into RNBO device');
    },

    sendToInport(inportName, message) {
        let messageContent, arr;

        switch (inportName) {
            // expects bools (RNBO reads as 0 or 1) -  accepts a boolean or 0/1
            case 'on_off_switch':
            case 'window_toggle':
            case 'sampler_toggle':
                if (typeof message !== 'number') {
                    const b = Boolean(message);
                    messageContent = [b ? 1 : 0];
                } else if (!Number.isInteger(message) || (message !== 0 && message !== 1)) {
                    throw new Error(`${inportName} expects 0 or 1`);
                } else {
                    messageContent = [message];
                }
                break;
            
            // expects positive numbers
            case 'sampler_tempo':
            case 'division':
                if (typeof message !== 'number') {
                    const number = Number(message);
                    if (!Number.isFinite(number) || number <= 0) throw new Error(`${inportName} expects a number greater than zero`);
                    messageContent = [number];
                }
                else if (message >= 0) messageContent = [message];
                else throw new Error(`${inportName} expects a number greater than zero`)
                break;
            
            // expects any numbers
            case 'trigger_buffer_info':
            case 'varispeed':
                if (typeof message !== 'number') {
                    const number = Number(message);
                    if (!Number.isFinite(number)) throw new Error(`${inportName} expects a number`)
                    messageContent = [number];
                }
                else if (Number.isFinite(message)) messageContent = [message];
                else throw new Error(`${inportName} expects a finite number`);
                break;

            // expects a list of [index, start_ms, end_ms]
            case 'selection_ms':
                if (!Array.isArray(message) || message.length !== 3) throw new Error(`${inportName} expects an array of [index, startMs, endMs]`);
                arr = [];
                message.forEach((item) => { arr.push(Number(item)); });
                for (const num of arr) if (!Number.isFinite(num) || num <= 0) throw new Error(`${inportName} expects positive numbers`);
                messageContent = arr;
                break;
            
            // expects an array of [index, stage_index, type_index] (none can be negative)
            case 'filter_type':
                if (!Array.isArray(message) || message.length !== 3) throw new Error(`${inportName} expects an array of [index, stage_index, type_index]`);
                arr = [];
                message.forEach((item) => { arr.push(Number(item)); });
                for (const num of arr) if (!Number.isFinite(num) || num < 0) throw new Error(`${inportName} expects positive numbers: you sent ${num}`);
                messageContent = arr;
                break;

            //expects an array of [index, stage_index, control_index, value] (control index is 0 for freq, 1 for gain, 2 for q)
            case 'filter_settings':
                if (!Array.isArray(message) || message.length !== 4) throw new Error(`${inportName} expects an array of [index, stage_index, control_index, value]`);
                arr = [];
                message.forEach((item) => { arr.push(Number(item)); });
                for (const num of arr) if (!Number.isFinite(num)) throw new Error(`${inportName} expects finite numbers: you send ${num}`);
                messageContent = arr;
                break;

            default:
                throw new Error(`${inportName} is not a recognized inport (check both sendToInport switch and RNBO device).`);
        }

        const event = new RNBO.MessageEvent(RNBO.TimeNow, inportName, messageContent);
        console.log(`${messageContent} sent to ${inportName}`)
        device.scheduleEvent(event);
    }
}
