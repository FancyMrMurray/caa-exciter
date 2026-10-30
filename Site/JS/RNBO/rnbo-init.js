import { StatusFunctions } from "../Interface/status.js";

const PATCH_URL = "/Site/JS/RNBO/export/patch.export.json";

export const RnboSetup = {
    async setupRnboDevice(context) {
        StatusFunctions.updateStatus('log', 'beginning RNBO setup');
        let response, patcher;
        
        StatusFunctions.updateStatus('log', 'fetching patcher');
        try {
            response = await fetch(PATCH_URL);
            patcher = await response.json();

            if (!window.RNBO) {
                // this can be skipped by knowing the version of the RNBO patch and including it using a <script> tag.
                await this.loadRnboScript(patcher.desc.meta.rnboversion);
            }
        } catch (err) {
            throw StatusFunctions.updateStatus('error', `Failed to load RNBO patch: ${err}`);
        }

        let device;

        StatusFunctions.updateStatus('log', 'building RNBO device');
        try {
            device = await window.RNBO.createDevice({context, patcher});
        } catch (err) {
            throw StatusFunctions.updateStatus('error', `Failed to create RNBO device: ${err}`);
        }

        StatusFunctions.updateStatus('success', 'RNBO device built');
        return device;
    },

    loadRnboScript(version) {
        return new Promise((resolve, reject) => {
            if (/^\d+\.\d+\.\d+-dev$/.test(version)) {
                throw new Error("Patcher exported with a Debug Version!\nPlease specify the correct RNBO version to use in the code.");
            }
            const el = document.createElement("script");
            el.src = "https://c74-public.nyc3.digitaloceanspaces.com/rnbo/" + encodeURIComponent(version) + "/rnbo.min.js";
            el.onload = resolve;
            el.onerror = function(err) {
                console.log(err);
                reject(new Error("Failed to load rnbo.js v" + version));
            };
            document.body.append(el);
        });
    }
}