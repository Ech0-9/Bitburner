function hgw(ns, ty, s, t, az, tg){
    	const TDIF = 200;
   	const SCRIPTS = ["t_extract.js", "t_engorge.js", "t_enfeeble.js"];
	let ss = s.shift();
	let d = 0;
	let i = -1;
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
	if(ss.threads - t == 0){
		ns.exec(SCRIPTS[i], ss.hostname, t, [tg, d]); 
	}
	else if(ss.threads - t > 0){
		//set ss.threads to new available and put it back on servers at the front
		ss.threads = ss.threads - t;
		s.unshift(ss);
		ns.exec(SCRIPTS[i], ss.hostname, t, [tg, d]);
	}
	else{
		let nt = t - ss.threads;
		hgw(ns, ty, s, nt, az ,tg);
		ns.exec(SCRIPTS[i], ss.hostname, ss.threads, [tg, d]);
	}
}
//i must be zero
export function batch(ns, s, azb, tg, d, i){
	hgw(ns, "HACK", s, Math.ceil(azb.hackThreads/d), azb, tg);
	hgw(ns, "WEAK", s, Math.ceil(azb.h_weakThreads/d), azb, tg);
	hgw(ns, "GROW", s, Math.ceil(azb.growThreads/d), azb, tg);
	hgw(ns, "WEAK", s, Math.ceil(azb.g_weakThreads/d), azb, tg);
	i++;
	if(i < d){
		batch(ns, s, azb, tg, d, i);	
	}
}
//i must be zero on initial call
export function prime(ns, s, azp, tg, d, i){
	hgw(ns, "GROW", s, Math.ceil(azp.growThreads/d), azp, tg);
	hgw(ns, "WEAK", s, Math.ceil(azp.g_weakThreads/d), azp, tg);
	i++;
	if(i < d){
		prime(ns, s, azp, tg, d, i);	
	}
}
