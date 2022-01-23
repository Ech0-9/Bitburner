import { allServers } from "util.js";

export async function main(ns) {
	//home not included in allservers search. will add after dynamic calculations are over. line 54.
	const ALL_SERVERS = allServers(ns, false);
	const EXECUTABLES = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
	//clears ports on start up. Probe will always start first
	//kill all scripts befor starting probe back up if it is killed for some reason

	//will update the given list of servers mRam
	let servers = [];
	let hlvl = 0;
	//places home at the 0 index of servers
	while (true) {
		servers = allServers(ns, false);
		//updates list of personal servers with new servers or updated max ram values
		//try and rootAccess servers that are hackable (ie ports and level)
		let availableExe = EXECUTABLES.filter(ex => {
			return ns.fileExists(ex, "home");
		});

		hlvl = ns.getHackingLevel();

		for (let i = 0; i < servers.length; i++) {
			if (hlvl >= ns.getServerRequiredHackingLevel(servers[i]) && !ns.hasRootAccess(servers[i])) {
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
				if(ns.getServerNumPortsRequired(servers[i]) <= availableExe.length){
					ns.nuke(servers[i]);
				}
			}
		}
		await ns.sleep(1000);
	}
}
