import {getConfig} from "util.js";
import {analyze} from "u_functions.js";
export async function main(ns){
	const SCRIPTS = ["t_extract.js", "t_engorge.js", "t_enfeeble.js"];
	let analysis = {};
	let server = "";
	let neededServers = [];
	let batchId = 0;
	function threads(sv){
		const reserved = getConfig(ns).reservedRAM.home;
		if(sv == "home"){
			return Math.floor((ns.getServerMaxRam(sv) - reserved - ns.getServerUsedRam(sv)) / 1.75);
		}
		else{
			return Math.floor((ns.getServerMaxRam(sv) - ns.getServerUsedRam(sv)) / 1.75);
		}
	}
	async function serverQuery(i){
		while(ns.peek(i) == "NULL PORT DATA"){
			await ns.sleep(10);
		}
		return ns.readPort(i);
	}
	function hgw(ns, ty, s, hgwt, az, tg, id){
		const TDIF = 200;
		let st = threads(s);
		let d = 0;
		let i = -1;
		let pid = -1;
		//let cur;
		//let next;
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
		if(hgwt - st >= 0){
			pid = ns.exec(SCRIPTS[i], s, st, ...arrArgs);
		}
		else{
			pid = ns.exec(SCRIPTS[i], s, hgwt, ...arrArgs);

		}
		return hgwt - st;
	
}
	while(true){
		let primed = getConfig(ns).priority.primed;
		let ptarget = getConfig(ns).priority.host;
		if(!primed){
			analysis = analyze(ns, ptarget, "P");
			let g = analysis.growThreads;
			let w = analysis.g_weakThreads;
			server = serverQuery(1);
			while(g > 0 || w > 0){
				if(threads(server) < 1){
					server = serverQuery(1);	
				}
				if(g > 0){
					g = hgw(ns, "GROW", server, g, analysis, ptarget, 0);		
				}
				else{
					w = hgw(ns, "WEAK", server, w, analysis, ptarget, 0);
				}
			}
			await setConfig(ns, {"priority": {"primed": true}});
		}
		else{
			analysis = analyze(ns, ptarget, "B");
			let total = 0;
			if(ns.serverExists(neededServers[0])){
				total = threads(neededServers[0];
			}
			let h = analysis.hackThreads;
			let w1 = analysis.h_weakThreads;
			let g = analysis.growThreads;
			let w2 = analysis.g_weakThreads;
			while(total < analysis.total){
				server = serverQuery(1);
				total += threads(server);
				neededServers.push(server);
			}
			for(let i = 0; i < neededServers.length; i++){
				if(h > 0){
					h = hgw(ns, "HACK", neededServers[i], h, analysis, ptarget, batchId);
					if(h >= 0) continue;
				}
				if(w1 > 0){
					w1 = hgw(ns, "WEAK", neededServers[i], w1, analysis, ptarget, batchId);
					if(w1 >= 0) continue;
				}
				if(g > 0){
					g = hgw(ns, "GROW", neededServers[i], g, analysis, ptarget, batchId);
					if(g >= 0) continue;
				}
				if(w2 > 0){
					w2 = hgw(ns, "WEAK", neededServers[i], w2, analysis, ptarget, batchId);
					if(w2 >= 0) continue;
				}
			}
			//neededServers clean up
			if(threads(neededServers[neededServers.length - 1]) > 0){
				while(neededServers.length != 1){
					neededServers.shift();	
				}
			}
			else{
				neededServers = [];	
			}
		}
	}
}
