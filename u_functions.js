import {getConfig} from "util.js";
export async function scriptRunningAny(ns, scr, c){
	let run = false;
	let i = 0;
	while(!run){
		run = ns.scriptRunning(scr, c[i].hostname);
		i++;
	}
	return run;
	
}
export function analyze(ns, pt, pb) {
	const hst = 0.002;
	const gst = 0.004;
	const wst = 0.05;
	const CONFIG = getConfig(ns);
	const per = CONFIG.percentage / 100;

	function sum(a, b) {
		return a + b;
	}

	let secDif = 0;
	let gmul = 1 / (1 - per);
	let gprime = ns.getServerMaxMoney(pt) / ns.getServerMoneyAvailable(pt);
	//batch analysis section
	let t1 = [];
	let analysis = {};
	let total = 0;
	switch (pb) {
		case "B":
			t1 = [0, 0, 0, 0];
			t1[0] = Math.floor(per / ns.hackAnalyze(pt));
			t1[1] = Math.ceil((hst * t1[0]) / wst);
			t1[2] = Math.ceil(ns.growthAnalyze(pt, gmul, 1));
			t1[3] = Math.ceil((gst * t1[2]) / wst);
			total = t1.reduce(sum, 0);
			analysis = {
				"hostname": pt,
				"hackTime": ns.getHackTime(pt),
				"growTime": ns.getGrowTime(pt),
				"weakTime": ns.getWeakenTime(pt),
				"hackThreads": t1[0],
				"h_weakThreads": t1[1],
				"growThreads": t1[2],
				"g_weakThreads": t1[3],
				"total": total
			};
			break;
		case "P":
			secDif = ns.getServerSecurityLevel(pt) - ns.getServerMinSecurityLevel(pt);
			t1 = [0, 0];
			t1[0] = Math.ceil(ns.growthAnalyze(pt, gprime, 1));
			t1[1] = Math.ceil(((gst * t1[0]) + secDif) / wst);
			total = t1.reduce(sum, 0);
			analysis = {
				"hostname": pt,
				"growTime": ns.getGrowTime(pt),
				"weakTime": ns.getWeakenTime(pt),
				"growThreads": t1[0],
				"g_weakThreads": t1[1],
				"total": total
			};
			break;
	}
	return analysis;
}
