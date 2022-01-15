import {allservers} from "utils.js";

export async function main(ns){
	const ALL_SERVERS = allservers(ns, true);
	const EXECUTABLES = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
	const port1 = ns.getPortHandle(1);
	const port2 = ns.getPortHandle(1);
	
	//will update the given list of servers mRam
	function updatePServers(cps){
		//update home max ram since it is not returned by ns.getPurchasedServers()
		cps[0].mRam = ns.getServerMaxRam("home");
		
		let nps = ns.getPurchasedServers();
		cps.forEach(c => {
			let i = nps.findIndex(fi => fi == c.hostname);
			if(i >= 0){
				c.mRam = ns.getServerMaxRam(c.hostname);
				//removes created servers from nps
				nps.splice(i,1);
			}
		});
		
		//creates servers if any still available
		if(!nps.empty()){
			nps.forEach(n => {
				cps.push({
					"hostname": n,
					"root": true,
					"mRam": ns.getServerMaxRam(n),
					"threads": ""
				});
			});
		}
	}
	
	let servers = [];
	let pservers = [{
			"hostname": "home",
			"root": true,
			"mRam": ns.getServerMaxRam("home"),
			"threads": "",
	}];
	
	servers = ALL_SERVERS.map((as) => {
		return {
			"hostname": as,
			"root": false,
			"mRam": ns.getServerMaxRam(as),
			"threads": "",
			"maxMoney": ns.getServerMaxMoney(as),
			"minSecurity": ns.getServerMinSecurityLevel(as),
			"level": ns.getServerRequiredHackingLevel(as)
		}
	});
	while(true){
		//updates list of personal servers with new servers or updated max ram values
		updatePServers(pservers);
		
		//try and rootAccess servers that are hackable (ie ports and level)
		let availableExe = EXECUTABLES.filter(ex => {
			return ns.fileExists(ex, "home");
		});
		
		servers.forEach((s) => {
			if(ns.getHackingLevel() >= s.level && !s.root) {
				availableExe.forEach((e) => {
					switch(e) {
						case "BruteSSH.exe":
							ns.brutessh(s);
							break;
						case "FTPCrack.exe":
							ns.ftpcrack(s);
							break;
						case "relaySMTP.exe":
							ns.relaysmtp(s);
							break;
						case "HTTPWorm.exe":
							ns.httpworm(s);
							break;
						case "SQLInject.exe":
							ns.sqlinject(s);
							break;
					}
				});
				ns.nuke(s);
				if(ns.hasRootAccess){
					s.root = true;
				}
			}
		});
		
		//finds servers with root access
		let rootServers = servers.filter(s => {
			return s.root);
		});
		
		//make array with all unowned servers with rootAccess and personal servers
		let serverList = rootServers.concat(pservers);
		
		//sorts list to highest max money server.
		let priority = rootServers.sort((a, b) => { 
			return b.maxMoney - a.maxMoney;
		}).shift();
		
		//port writing section
		ns.getPortHandle(1).data[0] = JSON.stringify(serverList);
		ns.getPortHandle(2).data[0] = JSON.stringify(priority);
		//ns.sleep(/*some interval maybe*/);j
	}
}
