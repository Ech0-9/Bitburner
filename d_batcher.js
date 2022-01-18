import {getConfig} from "util.js";
import {batch} from "u_functions.js";

export async function main(ns) {
	
	const LBL = ns.getPortHandle(3);
	const AZL = ns.getPortHandle(4);
	const PRL = ns.getPortHandle(5);
	let servers = [];
	let AZB = {};
	let ptarget = {};
	let id = -1;
	let host = "home";
	
	function sum(a,b){
		return a.threads + b.threads;	
	}
	while(true){
		const CONFIG = getConfig(ns);
		const INTERVAL = CONFIG.interval;
		if(LBL.peek() != "NULL PORT DATA" && AZL.peek() != "NULL PORT DATA"){
			let primed = false;
			if(PRL.peek() != "NULL PORT DATA"){
				primed = JSON.parse(PRL.peek()).primed;	
			}
			if(primed){
				ptarget = JSON.parse(AZL.peek())[0];
				AZB = JSON.parse(AZL.peek())[1];
				servers = JSON.parse(LBL.peek());

				let aRam = 0;
				for(let i = 0; i < servers.length; i++){
					aRam += servers.threads;	
				}
				let div = 0;
				if(aRam != 0){
					div = Math.ceil(AZB.total / aRam);
				}
				if(div > 2 || div == 0) {
					await ns.sleep(INTERVAL);
					continue;
				}
				else{
					if (id != 0 && !ns.isRunning("t_enfeeble.js", host, ...[host, 0, 0])) {
						id = 0;
						let temp = await batch(ns, servers, AZB, ptarget.hostname, div, 0, id);
						host = temp[3].hostname;
						id++;
						await ns.sleep(INTERVAL);
					}
					else{
						await batch(ns, servers, AZB, ptarget.hostname, div, 0, id);
						id++;
						await ns.sleep(INTERVAL);
					}
				}
			}
			else{
				await ns.sleep(INTERVAL * 10);	
			}
			
		}
	}
	
}
