import { allServers, getConfig, setConfig } from "util.js";

export async function main(ns) {
	const ALL_SERVERS = allServers(ns, true);
	//need to be updated with any new pservers
	let serverList = ALL_SERVERS.concat([]);
	let clusterList = [];
	let serverIndex = 0;
	let oldptarget = getConfig(ns).oldPriority;
	let ptarget = getConfig(ns).priority.host;


	function threads(sv) {
		const reserved = getConfig(ns).reservedRAM.home;
		if (sv == "home") {
			return Math.floor((ns.getServerMaxRam(sv) - reserved - ns.getServerUsedRam(sv)) / 1.75);
		}
		else {
			return Math.floor((ns.getServerMaxRam(sv) - ns.getServerUsedRam(sv)) / 1.75);
		}
	}
	function allThreads(svs) {
		return svs.map(sv => {
			return threads(sv);
			}).reduce((a, b) => {
			return a + b;
		});
	}
	function makeCluster(svs) {
		return svs.filter(s => {
			if (ns.hasRootAccess(s) && ns.getServerRequiredHackingLevel(s) <= ns.getHackingLevel()) return s;
		});
	}
	async function serverPost(i, ty) {
		ns.print(ty);
		if (ns.peek(i) != "NULL PORT DATA") {
			let found = false;
			let svs = [];
			let type = ty;
			let aRam = 0;
			if (ns.peek(i) == "P" || ns.peek(i) == "B") {
				type = ns.readPort(i);
			}
			ns.print(type);
			let total = ns.peek(i);
			for (let i = serverIndex, j = 0; j < clusterList.length; j++) {
				let t = threads(clusterList[i]);
				if (t > 0) {
					total -= threads(clusterList[i]);
					if (total < 0) {
						svs.push(clusterList[i]);
						serverIndex = i;
						found = true;
						break;
					}
					else if (total == 0) {
						svs.push(clusterList[i]);
						serverIndex = i++;
						found = true;
						break;
					}
					else {
						svs.push(clusterList[i]);
						i++;
					}
				}
				else {
					i++;
				}
				if (i > clusterList.length) {
					i = 0;
				}

			}
			if (type == "P") {
				aRam = allThreads(svs);
				ns.print(`line 75 aRam: ${aRam}`);
				svs.unshift(aRam);
				await ns.writePort(i, JSON.stringify(svs));
				ns.readPort(i);
				type = "";
				return type;
			}
			else {
				if (found) {
					aRam = allThreads(svs);
					ns.print(`line 85 aRam: ${aRam}`);
					svs.unshift(aRam);
					await ns.writePort(i, JSON.stringify(svs));
					ns.readPort(i);
					type = "";
					return type;
				}
				else {
					return type;
				}
			}
		}
	}
	while (true) {
		//update ptarget if changed
		ns.print("start of data");
		ptarget = getConfig(ns).priority.host;
		let type = "";
		if (ptarget != oldptarget) {
			await setConfig(ns, { "priority": { "primed": false } });
			await setConfig(ns, { "oldPriority": ptarget });
		}
		//servers refresh every cycle through of the current cluster loops
		if (serverIndex == 0) {
			serverList = allServers(ns, true);
			clusterList = makeCluster(serverList);
		}
		ns.print("trying to find");
		type = await serverPost(1, type);
		ns.print(`result: ${type}`);
		await ns.sleep(100);
		ns.print("endof data");

	}

}
