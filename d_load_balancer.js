import {getConfig, setConfig} from "util.js";

export async function main(ns) {
	const PBL = ns.getPortHandle(1);
	const PRBTS = ns.getPortHandle(3);
	const LS = ns.getPortHandle(6);
	const tSize = 1.75;
	
	function sum (a,b) {
		return a.threads + b.threads;	
	}
	function desc(a,b) {
		return 	b.threads - a.threads;
	}
	
	while(true){
		const CONFIG = getConfig(ns);
		const INTERVAL = CONFIG.interval;
		while(PBL.data[0] != "NULL PORT DATA"){
		
			let rootServers = PBL.data[0];
			rootServers.forEach(rs => {
				rs.threads = Math.floor((rs.mRam - ns.getServerUsedRam(rs.hostname)) / tSize);
			}).sort(desc);
			
			let down = LS.data[1];
			let dsi = rootServers.findIndex(fi => fi.hostname == down);
			if(dsi >= 0) rootServers.splice(dsi, 1);
			
			let total = rootServers.reduce(sum, 0);
			if(total < 1){
				LS.data[0] = true;	
			}
			PRBTS.data[0] = JSON.stringify(rootServers);
			
			if(!CONFIG.runBatcherLB) setConfig(ns, {"runBatcherLB": true});
			if(!CONFIG.runLogistics) setConfig(ns, {"runLogistics": true});
			await ns.sleep(INTERVAL);
			
		}
		await ns.sleep(INTERVAL);
	}
}
