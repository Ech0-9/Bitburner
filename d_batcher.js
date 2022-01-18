import {getConfig} from "util.js";
import {batch} from "u_functions.js";

export async function main(ns) {
	
	const LBL = ns.getPortHandle(3);
	const AZL = ns.getPortHandle(4);
	const PRL = ns.getPortHandle(5);
	let servers = [];
	let AZB = {};
	let ptarget = {};
	
	function sum(a,b){
		return a.threads + b.threads;	
	}
	while(true){
		const CONFIG = getConfig(ns);
		const INTERVAL = CONFIG.interval;
		if(LBL.peek() != "NULL PORT DATA" && AZL.peek() != "NULL PORT DATA"){
			let primed = false;
			if(PRL.peek() != "NULL PORT DATA"){
				primed = JSON.parse(PRL.peek());	
			}
			if(primed){
				ptarget = JSON.parse(AZL.peek())[0];
				AZB = JSON.parse(AZL.peek())[1];
				servers = JSON.parse(LBL.peek());

				let aRam = servers.reduce(sum, 0);
				let div = 0;
				if(aRam != 0){
					div = Math.ceil(AZB.total / aRam);
				}
				if(div > 2 || div == 0) {
					await ns.sleep(INTERVAL);
					continue;
				}
				else{
					batch(ns, servers, AZB, ptarget.hostname, div, 0);
					await ns.sleep(INTERVAL);
				}
			}
			
		}
	}
	
}
