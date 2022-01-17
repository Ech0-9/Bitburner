import { setConfig } from "util.js";

export async function main(ns){
	const daemons = ["runLoadBalancer", "runAnalyzer", "runLogistics", "runBatcherLB", "runBatcherAZ", "runPrimerLB", "runPrimerAZ"];
	daemons.forEach(d => {
		setConfig(ns, {d: false});	
	});
	ns.run("d_central_brain.js", 1);
	
}
