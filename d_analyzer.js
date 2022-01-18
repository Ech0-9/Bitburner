import { getConfig, setConfig } from "util.js";

export async function main(ns) {
	const hst = 0.002;
	const gst = 0.004;
	const wst = 0.05;
	//percent increase to get back to 100% max money from 100% - CONFIG.percentage max money.
	const PBL = ns.getPortHandle(2);
	//sends data to both Primer and Batch. Format is [PT, BA, PA]
	const PRBTS = ns.getPortHandle(4);
	PRBTS.clear();
	function sum(a, b) {
		return a + b;
	}
	function batch_analyze(t1, w1, gm1, p, tg) {
		t1[0] = Math.floor(p / ns.hackAnalyze(tg));
		t1[1] = Math.ceil((hst * t1[0]) / w1);
		t1[2] = Math.ceil(ns.growthAnalyze(tg, gm1, 1));
		t1[3] = Math.ceil((gst * t1[2]) / w1);
		let total = t1.reduce(sum, 0);

		return {
			"hostname": tg,
			"hackTime": ns.getHackTime(tg),
			"growTime": ns.getGrowTime(tg),
			"weakTime": ns.getWeakenTime(tg),
			"hackThreads": t1[0],
			"h_weakThreads": t1[1],
			"growThreads": t1[2],
			"g_weakThreads": t1[3],
			"total": total,
		};
	}
	function prime_analyze(t1, w1, gm1, tg) {
		t1[0] = Math.ceil(ns.growthAnalyze(tg, gm1, 1));
		t1[1] = Math.ceil((gst * t1[0]) / w1);
		let total = t1.reduce(sum, 0);

		return {
			"hostname": tg,
			"growTime": ns.getGrowTime(tg),
			"weakTime": ns.getWeakenTime(tg),
			"growThreads": t1[0],
			"g_weakThreads": t1[1],
			"total": total,
		};
	}

	while (true) {
		const CONFIG = getConfig(ns);
		const INTERVAL = CONFIG.interval;
		const per = CONFIG.percentage / 100;
		const gmul = 1 / (1 - per);
		if (PBL.peek() != "NULL PORT DATA") {

			let priority = JSON.parse(PBL.read());
			let target = priority.hostname;

			//batch analysis section
			let threads = [0, 0, 0, 0];
			let batch_analysis = batch_analyze(threads, wst, gmul, per, target);

			//prime analysis section
			threads = [0, 0];
			let prime_analysis = prime_analyze(threads, wst, gmul, target);

			let load = [priority, batch_analysis, prime_analysis];
			
			PRBTS.read();
			PRBTS.write(JSON.stringify(load));
			if(!CONFIG.runPrimerAZ) await setConfig(ns, {"runPrimerAZ": true});
			if(!CONFIG.runBatcherAZ) await setConfig(ns, {"runBatcherAZ": true});
		}
		await ns.sleep(INTERVAL);
	}
}
