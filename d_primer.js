import {getConfig} from "util.js";
import {prime, analyze, scriptRunningAny} from "u_functions.js";

export async function main(ns){	
	const port1 = ns.getPortHandle(1);
	const port2 = ns.getPortHandle(2);
	const port3 = ns.getPortHandle(3);
	let oldPriority = {
		"hostname": "NOT A SERVER"
	};
	let cluster = [];
	let AZP = {};
	let ptarget = {};
	function sum(a,b){
		return a.threads + b.threads;	
	}
	while(true){
		const CONFIG = getConfig(ns);
		const INTERVAL = CONFIG.interval;
		let div = 0;
		if(port1.peek() != "NULL PORT DATA" && port2.peek() != "NULL PORT DATA"){
			
			//upates priority target
			ptarget = JSON.parse(port2.peek());
			//sends true or false to probe and batcher
			if(port3.peek() == "NULL PORT DATA"){
				port3.write(JSON.stringify(ptarget));
			}
			if(ptarget.hostname != oldPriority.hostname){
				port3.write(JSON.stringify(ptarget));
				port3.read();
			}
			oldPriority = ptarget;
			//
			AZP = analyze(ns, ptarget, "P");
			cluster = JSON.parse(port1.peek());
			//await ns.write("LOGSERVERS.txt", JSON.stringify(servers), "w");
			//let aRam = servers.reduce(sum, 0);
			let aRam = 0;
			for(let i = 0; i < cluster.length; i++){
				aRam += cluster[i].threads;	
			}
			if(!ptarget.primed){
				if(aRam != 0){
					div = Math.ceil(AZP.total/aRam);	
				}
				if(div <= 0){
					await ns.sleep(INTERVAL);
					continue;
				}
				else{
					//wait until all batches clear out
					if(scriptRunningAny(ns, "t_enfeeble.js", cluster)){
						await ns.sleep(INTERVAL * 10);
						//need to quit out of this loop and see if ptarget has changed
						continue;
					}
					//all ram available for priming and ptarget updated
					for(let i = 0,j = 0; i < div; i++){
						prime(ns, cluster, 0, AZP, ptarget.hostname, div, j);
						j++;
					}
					ptarget.primed = true;
					port3.write(JSON.stringify(ptarget.primed));
					port3.read();	
					//increased interval to ensure Probe updates the primed field sent to analyzer which is sent to primer
					//this way we don't try an prime a primed server.
					await ns.sleep(INTERVAL * 5);
				}
			}
		}
	}
}
