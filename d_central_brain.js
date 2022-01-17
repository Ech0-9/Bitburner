import {getConfig} from "util.js";

export async function main(ns){
	const ME = ns.getHostname();	
	while(true){
		const CONFIG = getConfig(ns);
		//checks if Probe should/n't be running
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
			if(!CONFIG.runBatcher){
				ns.scriptKill("d_batcher.js", ME);
			}
		}
		else {
			if(CONFIG.runBatcher){
				ns.run("d_batcher.js", 1);
			}
		}
		
		if(ns.scriptRunning("d_primer.js", ME)){
			if(!CONFIG.runPrimer){
				ns.scriptKill("d_primer.js", ME);
			}
		}
		else {
			if(CONFIG.runPrimer){
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
	}
}
