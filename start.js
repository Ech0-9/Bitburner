import { setConfig } from "util.js";

export async function main(ns) {
	const daemons = ["runLoadBalancer", "runAnalyzer", "runLogisticsST", "runBatcherLB", "runBatcherAZ", "runPrimerLB", "runPrimerAZ"];
	for (let i = 0; i < daemons.length; i++) {
		let d = daemons[i];
		await setConfig(ns, { d: false });
	}
	await setConfig(ns, {"runLogisticsFN": false});
	ns.run("d_central_brain.js", 1);

}
