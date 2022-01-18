import {getConfig} from "util.js";

export async function main(ns){
	const ME = ns.getHostname();	
	const SCRIPTS = ["d_probe.js", "d_load_balancer.js", "d_analyzer.js", "d_batcher.js", "d_primer.js", "d_logistics.js"];
	while(true){
		const CONFIG = getConfig(ns);
		const INTERVAL = CONFIG.interval;
		//checks if Probe should/n't be running
		const SERVICE = [
			[CONFIG.runProbe, true, "d_probe.js"],
			[CONFIG.runLoadBalancer, true, "d_load_balancer.js"],
			[CONFIG.runAnanlyzer, true, "d_analyzer.js"],
			[CONFIG.runBatcherLB, CONFIG.runBatcherAZ, "d_batcher.js"],
			[CONFIG.runPrimerLB, CONFIG.runPrimerAZ, "d_primer.js"],
			[CONFIG.runLogisticsST, true, "d_logistics.js"]
		];
		for(let i = 0; i < SERVICE.length; i++){
			let a = SERVICE[i][0];
			let b = SERVICE[i][1];
			let s = SERVICE[i][2];
			if(ns.scriptRunning(s, ME)){
				if(!a || !b){
					ns.scriptKill(s, ME);
				}
			}
			else {
				if(a && b){
					ns.run(s, 1);
				}
			}
		}
		await ns.sleep(INTERVAL);
	}
}
