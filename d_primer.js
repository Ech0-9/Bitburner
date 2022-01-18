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
		const CONFIG = getConfig(ns);
		const INTERVAL = CONFIG.interval;
		if(LBL.peek() != "NULL PORT DATA" && AZL.peek() != "NULL PORT DATA"){
			
			//upates priority target
			ptarget = JSON.parse(AZL.peek())[0];
			//sends true or false to probe and batcher
			PRS.read();
			PRS.write(JSON.stringifiy(ptarget.primed));
			//
			AZP = JSON.parse(AZL.peek())[2];
			servers = JSON.parse(LBL.peek());
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
					if(PRS.peek() != "NULL PORT DATA"){
						PRS.read();	
					}
					PRS.write(JSON.stringifiy(ptarget.primed));
					//increased interval to ensure Probe updates the primed field sent to analyzer which is sent to primer
					//this way we don't try an prime a primed server.
					await ns.sleep(INTERVAL * 5);
				}
			}
		}
	}
}
