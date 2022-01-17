import { setConfig } from "util.js";

export async function main(ns){
	const daemons = ["runLoadBalancer", "runAnalyzer", "runLogistics", "runBatcherLB", "runBatcherAZ", "runPrimerLB", "runPrimerAZ"];
	async function set(d){
		await setConfig(ns, {d: false});	
	}
	daemons.forEach(set);
	ns.run("d_central_brain.js", 1);
	
}
