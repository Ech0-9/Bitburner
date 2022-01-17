import {getConfig} from "util.js";
import {batch} from "u_functions.js";

export async function main(ns) {
	
	const LBL = ns.getPortHandle(3);
	const AZL = ns.getPortHandle(4);
	const PRL = ns.getPortHandle(5);
	let servers = [];
	let AZB = "";
	let ptarget = {};
	
	function sum(a,b){
		return a.threads + b.threads;	
	}
	while(true){
		const CONFIG = getConfig(ns);
		const INTERVAL = CONFIG.interval;
		while(LBL.data[0] != "NULL PORT DATA" && AZL.data[0] != "NULL PORT DATA"){
			let primed = JSON.parse(PRL.data[0]);
			if(!primed){
				await ns.sleep(INTERVAL);
				continue;
			}
			ptarget = JSON.parse(AZL.data[0]);
			AZB = JSON.parse(AZL.data[1]);
			servers = JSON.parse(LBL.data[0]);
			
			let aRam = servers.reduce(sum, 0);	
			
			if(aRam < AZB.total) {
				await ns.sleep(INTERVAL);
				continue;
			}
			else{
				batch(ns, servers, AZB, ptarget.hostname);
				await ns.sleep(INTERVAL);
			}
			
		}
	}
	
}
