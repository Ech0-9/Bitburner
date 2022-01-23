import {allServers, getConfig, setConfig, getPserver} from "util.js";

export async function main(ns){
	const ALL_SERVERS = allServers(ns,true);
	const port1 = ns.getPortHandle(1);
	//need to be updated with any new pservers
	let serverList = ALL_SERVERS.concat([]);
	let clusterList = [];
	let serverIndex = 0;
	let cycle = 0;
	let oldptarget = getConfig(ns).oldPriority;
	let ptarget = getConfig(ns).priority.host;
	let primed = getConfig(ns).priority.primed;
	
	
	function threads(sv){
		const reserved = getConfig(ns).reservedRAM.home;
		if(sv == "home"){
			return Math.floor((ns.getServerMaxRam(sv) - reserved - ns.getServerUsedRam(sv)) / 1.75);
		}
		else{
			return Math.floor((ns.getServerMaxRam(sv) - ns.getServerUsedRam(sv)) / 1.75);
		}
	}
	function allThreads(svs){
		return svs.reduce((a,b) => {
			return threads(a) + threads(b);	
		}, 0);
	}
	function makeCluster(svs){
		return svs.filter(s => {
			if(ns.hasRootAccess(s) && ns.getServersRequiredHackingLevel(s) <= ns.getHackingLevel()) return s;		
		});
	}
	function serverPost(i){
		while(ns.peek(i) == "NULL PORT DATA"){
			let cs = "";
			let found = false;
			while(!found){
				if(threads(clusterList[serverIndex]) > 0){
					if(serverIndex + 1 != clusterList.length){
						cs = clusterList[serverIndex];
						serverIndex++;
						found = true;	
					}
					else{
						cs = clusterList[serverIndex];
						serverIndex = 0;
						found = true;
					}
				}
				else{
					if(serverIndex + 1 != clusterList.length){
						serverIndex++;	
					}
					else{
						serverIndex = 0;
						break;
					}
				}
						
			}
			if(cs != "") ns.writePort(i, cs);
		}
	}
	while(true){
		//update ptarget if changed
		ptarget = getConfig(ns).priority.host;
		if(ptarget != oldptarget){
			await setConfig(ns, {"priority": {"primed": false}});
			await setConfig(ns, {"oldPriority": ptarget});
		}
		//servers refresh every cycle through of the current cluster loops
		if(serverIndex == 0){
			serverList = allServers(ns, true);
			clusterList = makeCluster(serverList);
		}
		
		serverPost(1);
		
	}
	
}
