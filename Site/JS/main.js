import { RnboSetup } from "./RNBO/rnbo-init.js";
import { ControlFunctions } from "./Interface/deck.js";
import { WebAudioSetup } from "./WebAudio/web-audio.js";

//setup web audio context and build RNBO device
const context = WebAudioSetup.createContext();
export const device = await RnboSetup.setupRnboDevice(context);
//connect device to main outs
device.node.connect(context.destination);
//initialize controls
const deckRoot = document.querySelector('[data-role="deck"]');
ControlFunctions.initControlElements(deckRoot);
