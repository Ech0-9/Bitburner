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
export function concat(a, b){
	let c = new Array(a.length + b.length);
	for(let i = 1, j = 1, k = 1; i <= c.length; i++){
		if(i < b.length){
			c[c.length-i] = b[b.length - j];
			j++;
		}
		else{
			c[c.length-i] = a[a.length-k];
			k++;
		}
	}
	return c;
}
