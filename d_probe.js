import { allServers } from "util.js";

export async function main(ns) {
	
	const EXECUTABLES = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
	let servers = [];
	let hlvl = 0;
	while (true) {
		servers = allServers(ns, false);
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
					/*await ns.scp("t_extract.js", servers[i]);
					await ns.scp("t_engorge.js", servers[i]);
					await ns.scp("t_enfeeble.js", servers[i]);*/
				}
			}
		}
		await ns.sleep(1000);
	}
}
