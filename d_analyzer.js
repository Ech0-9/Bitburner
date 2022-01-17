import {getConfig, setConfig} from "util.js";

export async function main(ns) {
	const hst = 0.002;
	const gst = 0.004;
	const wst = 0.05;
	//percent increase to get back to 100% max money from 100% - CONFIG.percentage max money.
	const PBL = ns.getPortHandle(2);
	//sends data to both Primer and Batch. Format is [PT, [BA, BH] , [PA, PH]].
	const PrBtS = ns.getPortHandle(4);
	function sum(a,b) {
		return a + b;	
	}
	function batch_analyze(t1, w1, gm1, tg){
		t1[0] = Math.floor(.1 / ns.hackAnalyze(tg));
		//t2[0] = t1[0];
		t1[1] = Math.ceil((hst * t1[0]) / w1);
		//t2[1] = Math.ceil((hst * t1[0]) / w2);
		t1[2] = ns.growthAnalyze(tg, gm1, 1);
		//t2[2] = ns.growthAnalyze(tg, gm2, c);
		t1[3] = Math.ceil((gst * t1[2]) / w1);
		//t2[3] = Math.ceil((gst * t2[2]) / w2);
		let total = t1.reduce(sum, 0);
		//let total_home = t2.reduce(sum, 0);
		
		return {
			"hostname": tg,
			"hackTime": ns.getHackTime(tg),
			"growTime": ns.getGrowTime(tg),
			"weakTime": ns.getWeakTime(tg),
			"hackThreads": t1[0],
			"h_weakThreads": t1[1],
			//"h_weakThreads_home": t2[1],
			"growThreads": t1[2],
			//"growThreads_home": t2[2],
			"g_weakThreads": t1[3],
			//"g_weakThreads_home": t2[3],
			"total": total,
			//"total_home": total_home
		};
	}
	function prime_analyze(t1, w1, gm1, tg){
		t1[0] = ns.growthAnalyze(tg, gm1, 1);
		//t2[0] = ns.growthAnalyze(tg, gm2, c);
		t1[1] = Math.ceil((gst * t1[0]) / w1);
		//t2[1] = Math.ceil((gst * t2[0]) / w2);
		let total = t1.reduce(sum,0);
		//let total_home = t2.reduce(sum,0);
		
		return {
			"hostname": tg,
			"growTime": ns.getGrowTime(tg),
			"weakTime": ns.getWeakTime(tg),
			"growThreads": t1[0],
			//"growThreads_home": t2[0],
			"g_weakThreads": t1[1],
			//"g_weakThreads_home": t2[1],
			"total": total,
			//"total_home": total_home
		};
	}
	
	while(true){
		const CONFIG = getConfig(ns);
		const INTERVAL = CONFIG.interval;
		const gmul = 1 / (1 - CONFIG.percentage);
		let priority = JSON.parse(PBL.data[0]);
		let target = priority.hostname;
		//let wsth = ns.weakenAnalyze(1, 2);
		//let gpmul = priority.maxMoney / priority.avaMoney
		
		//batch analysis section
		let threads = [0,0,0,0];
		//let threads_home = [0,0,0,0];
		let batch_analysis = batch_analyze(threads, wst,  gmul, target);
	
		//prime analysis section
		threads = [0,0];
		//threads_home = [0,0];
		let prime_analysis = prime_analyze(threads, wst, gmul, target);
		
		
		PrBtS.data[0] = JSON.stringify(priority);
		PrBtS.data[1] = JSON.stringify(batch_analysis);
		PrBtS.data[2] = JSON.stringify(prime_analysis);
		if(!CONFIG.runPrimer) setConfig(ns, {"runPrimer": true});
		if(!CONFIG.runBatcher) setConfig(ns, {"runBatcher": true});
		await ns.sleep(INTERVAL);
	
	}
}
