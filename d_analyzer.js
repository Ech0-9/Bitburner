import {getConfig} from "util.js";

export async function main(ns) {
	const CONFIG = getConfig(ns);
	const hst = 0.002;
	const gst = 0.004;
	const wst = 0.05;
	//percent increase to get back to 100% max money from 90% max money.
	const gmul = 1.12;
	const PBL = ns.getPortHandle(2);
	//sends data to both Primer and Batch. Format is [PT, [BA, BH] , [PA, PH]].
	const PrBtS = ns.getPortHandle(4);
	function sum(a,b) {
		return a + b;	
	}
	function batch_analyze(t, w, c, tg){
		t[0] = Math.floor(.1 / ns.hackAnalyze(tg));
		t[1] = Math.ceil((hst * t[0]) / w);
		t[2] = ns.growthAnalyze(tg, gmul, c);
		t[3] = Math.ceil((gst * t[2]) / w);
		let total = t.reduce(sum, 0);
		
		return {
			"hostname": tg,
			"hackThreads": t[0],
			"weakThreads1": t[1],
			"growThreads": t[2],
			"weakThreads2": t[3],
			"total": total 
		};
	}
	function prime_analyze(t, w, c, tg, gm){
		t[0] = ns.growthAnalyze(tg, gm, c);
		t[1] = Math.ceil((gst * t[0]) / w);
		let total = t.reduce(sum,0);
		
		return {
			"hostname": tg,
			"growThreads": t[0],
			"weakThreads": t[1],
			"total": total 
		};
	}
	
	while(true){
		let priority = JSON.parse(PBL.data[0]);
		let target = priority.hostname;
		let wsth = ns.weakenAnalyze(1, 2);
		let gpmul = priority.maxMoney / priority.avaMoney
		
		//batch analysis section
		let threads = [0,0,0,0];
		let batch_analysis = batch_analyze(threads, wst, 1, target);
		
		//batch Home analysis section
		threads = [0,0,0,0];
		let batch_home = batch_analyze(threads, wsth, 2, target);
		
		let batch = [batch_analysis, batch_home];
		
		//prime analysis section
		threads = [0,0];
		let prime_analysis = prime_analyze(threads, wst, 1, target, gmul);
		
		//prime home section
		threads = [0,0];
		let prime_home = prime_analyze(threads, wsth, 2, target, gpmul);
		
		let prime = [prime_analysis, prime_home];
		
		PrBtS.data[0] = JSON.stringify(priority);
		PrBtS.data[1] = JSON.stringify(batch);
		PrBtS.data[2] = JSON.stringify(prime);
		//ns.sleep(some interval?);
	
	}
}
