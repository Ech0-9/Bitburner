import {getConfig} from "util.js";

export async function main(ns){
	const ME = ns.getHostname();	
	const SCRIPTS = ["d_probe.js", "d_batcher.js", "d_primer.js"];
	while(true){
		const CONFIG = getConfig(ns);
		const INTERVAL = CONFIG.interval;
		//checks if Probe should/n't be running
		const SERVICE = [
			[CONFIG.runProbe, "d_probe.js"],
			[CONFIG.runBatcher, "d_batcher.js"],
			[CONFIG.runPrimer, "d_primer.js"]
		];
		for(let i = 0; i < SERVICE.length; i++){
			let a = SERVICE[i][0];
			let s = SERVICE[i][1];
			if(ns.scriptRunning(s, ME)){
				if(!a){
					ns.scriptKill(s, ME);
				}
			}
			else {
				if(a){
					ns.run(s, 1);
				}
			}
		}
		await ns.sleep(INTERVAL);
	}
}
