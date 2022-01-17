import {getConfig} from "util.js";
import {prime} from "u_functions.js";

export async function main(ns){	
	const LBL = ns.getPortHandle(3);
	const AZL = ns.getPortHandle(4);
	const PRS = ns.getPortHandle(5);
	let servers = [];
	let AZP = {};
	let ptarget = {};
	function sum(a,b){
		return a.threads + b.threads;	
	}
	while(true){
		while(LBL.data[0] != "NULL PORT DATA" && AZL.data[0] != "NULL PORT DATA"){
			const CONFIG = getConfig(ns);
			const INTERVAL = CONFIG.interval;
			
			ptarget = JSON.parse(AZL.data[0]);
			PRS.data[0] = JSON.strigifiy(ptarget.primed);
			AZP = JSON.parse(AZL.data[2]);
			servers = JSON.parse(LBL.data[0]);
			let aRam = servers.reduce(sum, 0);
			if(!ptarget.primed){
				let div = 0;
				if(aRam != 0){
					div = Math.ceil(AZP.total/aRam);	
				}
				if(div > 5 || div <= 0){
					await ns.sleep(INTERVAL);
					continue;
				}
				else{
					prime(ns, servers, AZP, ptarget.hostname, Math.ceil(AZP.total/aRam), 0);
					ptarget.primed = true;
					PRS.data[0] = JSON.strigifiy(ptarget.primed);
					/*
						wait 5 seconds (INTERVAL: 100 times 50) for probe and analyzer to catch up.
						target primed is sent to batcher and probe
						probe will update the primed field if the priority has not changed
						which is then sent to analyzer which is sent back to primer
						this way primer does not try to prime the target again due to race conditions
					*/
					await ns.sleep(INTERVAL * 50);
				}
			}
		}
	}
}
