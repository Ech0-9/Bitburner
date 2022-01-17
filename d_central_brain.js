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
			[CONFIG.runLogistics, true, "d_logistics.js"]
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
		/*
		if(ns.scriptRunning("d_probe.js", ME)){
			if(!CONFIG.runProbe){
				ns.scriptKill("d_probe.js", ME);
			}
		}
		else {
			if(CONFIG.runProbe){
				ns.run("d_probe.js", 1);
			}
		}
		//checks if load_balancer should be running
		if(ns.scriptRunning("d_load_balancer.js", ME)){
			if(!CONFIG.runLoadBalancer){
				ns.scriptKill("d_load_balancer.js", ME);
			}
		}
		else {
			if(CONFIG.runLoadBalancer){
				ns.run("d_load_balancer.js", 1);
			}
		}
		//checks Analyzer
		if(ns.scriptRunning("d_analyzer.js", ME)){
			if(!CONFIG.runAnalyzer){
				ns.scriptKill("d_analyzer.js", ME);
			}
		}
		else {
			if(CONFIG.runAnalyzer){
				ns.run("d_analyzer.js", 1);
			}
		}
		//checks Batcher
		if(ns.scriptRunning("d_batcher.js", ME)){
			if(!CONFIG.runBatcherLB  || !CONFIG.runBatcherAZ){
				ns.scriptKill("d_batcher.js", ME);
			}
		}
		else {
			if(CONFIG.runBatcherLB && CONFIG.runBatcherAZ){
				ns.run("d_batcher.js", 1);
			}
		}
		
		if(ns.scriptRunning("d_primer.js", ME)){
			if(!CONFIG.runPrimerLB || !CONFIG.runPrimerAZ){
				ns.scriptKill("d_primer.js", ME);
			}
		}
		else {
			if(CONFIG.runPrimerLB && CONFIG.runPrimerAZ){
				ns.run("d_primer.js", 1);
			}
		}
		
		if(ns.scriptRunning("d_logistics.js", ME)){
			if(!CONFIG.runLogistics){
				ns.scriptKill("d_logistics.js", ME);
			}
		}
		else {
			if(CONFIG.runLogistics){
				ns.run("d_logistics.js", 1);
			}
		}
		await ns.sleep(INTERVAL * 10);
		*/
	}
}
