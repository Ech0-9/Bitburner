import { allServers, getConfig, setConfig } from "util.js";

export async function main(ns) {
	//home not included in allservers search. will add after dynamic calculations are over. line 54.
	const ALL_SERVERS = allServers(ns, false);
	const EXECUTABLES = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
	let CONFIG = getConfig(ns);
	const INTERVAL = CONFIG.interval;
	let reserved = CONFIG.reservedRAM.home;
	const LBS = ns.getPortHandle(1);
	LBS.clear();
	const AZS = ns.getPortHandle(2);
	AZS.clear();
	const PRL = ns.getPortHandle(5);
	const LL = ns.getPortHandle(7);

	//will update the given list of servers mRam
	function updatePServers(csl, ups) {
		//update home max ram since it is not returned by ns.getPurchasedServers()
		csl[0].mRam = ns.getServerMaxRam("home") - reserved;
		let i = csl.findIndex(c => {
			return c.hostname == ups;
		});
		if (i >= 0) {
			csl[i].mRam = ups.mRam;
		}
		else {
			csl.push(ups);
		}
	}

	let hlvl = 0;
	let servers = [];
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
		let a = {
			"hostname": as,
			"root": ns.hasRootAccess(as),
			"mRam": ns.getServerMaxRam(as),
			"threads": "",
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

		if (LL.peek() != "NULL PORT DATA") {
			let pu = JSON.parse(LL.read());
			updatePServers(servers, pu);
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
				ns.nuke(servers[i].hostname);
				if (ns.hasRootAccess(servers[i].hostname)) {
					servers[i].root = true;
				}
			}

			//finds servers with root access
			let rootServers = servers.filter(s => {
				if (s.root) return s;
			});



			//make array with all unowned servers with rootAccess and personal servers
			//copy made due to max money sort later to find priority.
			let serverList = rootServers.map(rs => { return rs });

			//sorts list to highest max money server.
			let priority = rootServers.sort((a, b) => {
				return b.maxMoney - a.maxMoney;
			}).shift();

			priority.avaMoney = ns.getServerMoneyAvailable(priority.hostname);
			//priority primed check

			if (PRL.peek() != "NULL PORT DATA") {
				let p = JSON.parse(PRL.read());
				if (priority.hostname == p.hostname) {
					priority.primed = p.primed;
				}
			}
			//port writing section
			while (LBS.peek() == "NULL PORT DATA") {
				LBS.write(JSON.stringify(serverList));
				break;
			}
			while (AZS.peek() == "NULL PORT DATA") {
				AZS.write(JSON.stringify(priority));
				break;
			}
			if (!CONFIG.runLoadBalancer) await setConfig(ns, { "runLoadBalancer": true });
			if(!CONFIG.runAnalyzer) await setConfig(ns, {"runAnalyzer": true});
			await ns.sleep(INTERVAL);
		}
	}
}
