import {getPserver, setPserver} from "util.js";

function hgw(ns, ty, s, t, az, tg, id){
    	const TDIF = 200;
   	const SCRIPTS = ["t_extract.js", "t_engorge.js", "t_enfeeble.js"];
	let ss = s.shift();
	let d = 0;
	let i = -1;
	let pid = -1;
	let cur;
	let next;
	switch(ty){
		case "HACK":
			i = 0;
			d = az.weakTime - az.growTime - TDIF;
			break;
		case "GROW":
			i = 1;
			d = az.weakTime - az.growTime - TDIF;
			break;
		case "WEAK":
			i = 2;
			break;
	}
	let arrArgs = ["--target", tg, "--delay", d, "--id", id];
	if(ss.threads - t == 0){
		pid = ns.exec(SCRIPTS[i], ss.hostname, t, ...arrArgs); 
	}
	else if(ss.threads - t > 0){
		//set ss.threads to new available and put it back on servers at the front
		ss.threads = ss.threads - t;
		s.unshift(ss);
		pid ns.exec(SCRIPTS[i], ss.hostname, t, ...arrArgs);
	}
	else{
		let nt = t - ss.threads;
		next = hgw(ns, ty, s, nt, az ,tg);
		pid = ns.exec(SCRIPTS[i], ss.hostname, ss.threads, ...arrArgs);
	}
	cur = {"pid": pid, "hostname": ss.hostname};
	return cur;
}
//i must be zero
export function batch(ns, s, azb, tg, d, i, id){
	let sub = [];
	let h = hgw(ns, "HACK", s, Math.ceil(azb.hackThreads/d), azb, tg, id);
	let w1 = hgw(ns, "WEAK", s, Math.ceil(azb.h_weakThreads/d), azb, tg, id);
	let g = hgw(ns, "GROW", s, Math.ceil(azb.growThreads/d), azb, tg, id);
	let w2 = hgw(ns, "WEAK", s, Math.ceil(azb.g_weakThreads/d), azb, tg, id);
	sub = [h.,w1,g,w2];
	i++;
	ns.toast(`Batch ${i} of ${d} Started`, "info", 3000);
	if(i < d){
		batch(ns, s, azb, tg, d, i, id);	
	}
	
}
//i must be zero on initial call
export function prime(ns, s, azp, tg, d, i){
	const int = 200;
	let s2 = s.map(a => {return a});
	let g = hgw(ns, "GROW", s, Math.ceil(azp.growThreads/d), azp, tg, i + 1);
	let w = hgw(ns, "WEAK", s, Math.ceil(azp.g_weakThreads/d), azp, tg, i + 1);
	i++;
	ns.toast(`Prime ${i} of ${d} Started`, "info", 10000);
	while(ns.isRunning(g.pid, g.hostname) || ns.isRunning(w.pid, w.hostname)){
		await ns.sleep(int);
	}
	if(i < d){
		prime(ns, s2, azp, tg, d, i);	
	}
}
export function analyze(ns, pt, pb){
	const hst = 0.002;
	const gst = 0.004;
	const wst = 0.05;
	const CONFIG = getConfig(ns);
	const INTERVAL = CONFIG.interval;
	const per = CONFIG.percentage / 100;
	
	function sum(a, b) {
		return a + b;
	}
	
	let gmul = 1 / (1 - per);
	let target = pt.hostname;
	let gprime = pt.maxMoney / pt.avaMoney;
	//batch analysis section
	let t1 = [];
	let analysis = {};
	switch(pb){
		case "B":
			t1 = [0,0,0,0];
			t1[0] = Math.floor(per / ns.hackAnalyze(target));
			t1[1] = Math.ceil((hst * t1[0]) / wst);
			t1[2] = Math.ceil(ns.growthAnalyze(target, gmul, 1));
			t1[3] = Math.ceil((gst * t1[2]) / wst);
			let total = t1.reduce(sum, 0);

			analysis = {
				"hostname": target,
				"hackTime": ns.getHackTime(target),
				"growTime": ns.getGrowTime(target),
				"weakTime": ns.getWeakenTime(target),
				"hackThreads": t1[0],
				"h_weakThreads": t1[1],
				"growThreads": t1[2],
				"g_weakThreads": t1[3],
				"total": total,
			};
			break;
		case "P":
			t1 = [0,0];
			t1[0] = Math.ceil(ns.growthAnalyze(target, gmul, 1));
			t1[1] = Math.ceil((gst * t1[0]) / wst);
			let total = t1.reduce(sum, 0);
			analysis = {
				"hostname": target,
				"growTime": ns.getGrowTime(target),
				"weakTime": ns.getWeakenTime(target),
				"growThreads": t1[0],
				"g_weakThreads": t1[1],
				"total": total,
			};
			break;
	}
	return analysis;
}
