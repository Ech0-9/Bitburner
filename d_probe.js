import { allServers, getConfig, setConfig } from "util.js";

export async function main(ns) {
	//home not included in allservers search. will add after dynamic calculations are over. line 54.
	const ALL_SERVERS = allServers(ns, false);
	const EXECUTABLES = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
	let CONFIG = getConfig(ns);
	const INTERVAL = CONFIG.interval;
	let reserved = CONFIG.reservedRAM.home;
	const port1 = ns.getPortHandle(1);
	const port2 = ns.getPortHandle(2);
	const port3 = ns.getPortHandle(3);
	const port4 = ns.getPortHandle(4);
	//clears ports on start up. Probe will always start first
	//kill all scripts befor starting probe back up if it is killed for some reason
	port1.clear();
	port2.clear();
	port3.clear();
	port4.clear();

	//will update the given list of servers mRam
	function updateServers(csl, ups) {
		//update home max ram since it is not returned by ns.getPurchasedServers()
		csl[0].mRam = ns.getServerMaxRam("home") - reserved;
		for(let i = 0; i < csl.length; i++){
			if(ups.hostname == csl[i].hostname){
				csl[i] = ups;
				break;
			}
			else{
				csl.push(ups);	
			}
		}
	}

	let hlvl = 0;
	let servers = [];
	let cluster = [];
	let home = {
		"hostname": "home",
		"root": true,
		"mRam": ns.getServerMaxRam("home") - reserved,
		"threads": "",
		"maxMoney": 0,
		"avaMoney": 0,
		"minSecurity": 0,
		"level": 0,
		"primed": false
	};

	for (let i = 0; i < ALL_SERVERS.length; i++) {
		let as = ALL_SERVERS[i];
		let mRam = ns.getServerMaxRam(as);
		let a = {
			"hostname": as,
			"root": ns.hasRootAccess(as),
			"mRam": mRam,
			"threads": Math.ceil(mRam/1.75),
			"maxMoney": ns.getServerMaxMoney(as),
			"avaMoney": 0,
			"minSecurity": ns.getServerMinSecurityLevel(as),
			"level": ns.getServerRequiredHackingLevel(as),
			"primed": false
		}
		servers.push(a);
	}
	//places home at the 0 index of servers
	servers.unshift(home);
	while (true) {
		CONFIG = getConfig(ns);

		//updates list of personal servers with new servers or updated max ram values

		if (port4.peek() != "NULL PORT DATA") {
			let pu = JSON.parse(port4.read());
			updateServers(servers, pu);
		}
		//try and rootAccess servers that are hackable (ie ports and level)
		let availableExe = EXECUTABLES.filter(ex => {
			return ns.fileExists(ex, "home");
		});

		hlvl = ns.getHackingLevel();

		for (let i = 0; i < servers.length; i++) {
			if (hlvl >= servers[i].level && !servers[i].root) {
				for (let j = 0; j < availableExe.length; j++) {
					switch (availableExe[i]) {
						case "BruteSSH.exe":
							ns.brutessh(servers[i].hostname);
							break;
						case "FTPCrack.exe":
							ns.ftpcrack(servers[i].hostname);
							break;
						case "relaySMTP.exe":
							ns.relaysmtp(servers[i].hostname);
							break;
						case "HTTPWorm.exe":
							ns.httpworm(servers[i].hostname);
							break;
						case "SQLInject.exe":
							ns.sqlinject(servers[i].hostname);
							break;
					}
				}
				if(ns.getServerNumPortsRequired(servers[i].hostname) <= availableExe.length){
					ns.nuke(servers[i].hostname);
				}
				if (ns.hasRootAccess(servers[i].hostname)) {
					servers[i].root = true;
				}
			}
		}

		//finds servers with root access
		cluster = servers.filter(s => {
			if (s.root && s.threads > 0) return s;
		});
			//make array with all unowned servers with rootAccess and personal servers
			//copy made due to max money sort later to find priority.
		let serverMoneyCopy = servers.filter(rs => { if(rs.root) return rs });

			//sorts list to highest max money server.
		let priority = serverMoneyCopy.sort((a, b) => {
			return b.maxMoney - a.maxMoney;
		}).shift();

		priority.avaMoney = ns.getServerMoneyAvailable(priority.hostname);
			//priority primed check

		if (port3.peek() != "NULL PORT DATA") {
			let p = JSON.parse(port3.peek());
			if (priority.hostname == p.hostname) {
				priority.primed = p.primed;
			}
		}
		//port writing section
		port1.write(JSON.stringify(cluster));
		port1.read();
		port2.write(JSON.stringify(priority));
		port2.read();
		if(!CONFIG.runPrimer) await setConfig(ns, {"runPrimer": true});
		await ns.sleep(INTERVAL);
			
	}
}
