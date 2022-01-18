import { getConfig, setConfig } from "util.js";

export async function main(ns) {
	const PBL = ns.getPortHandle(1);
	const PRBTS = ns.getPortHandle(3);
	PRBTS.clear();
	const LS = ns.getPortHandle(6);
	LS.clear();
	const LOL = ns.getPortHandle(8);
	const tSize = 1.75;

	function sum(a, b) {
		return a.threads + b.threads;
	}
	function desc(a, b) {
		return b.threads - a.threads;
	}

	while (true) {
		const CONFIG = getConfig(ns);
		const INTERVAL = CONFIG.interval;
		while (PBL.peek() != "NULL PORT DATA") {
			let rootServers = JSON.parse(PBL.read());
			for (let i = 0; i < rootServers.length; i++) {
				let rs = rootServers[i];
				rs.threads = Math.floor((rs.mRam - ns.getServerUsedRam(rs.hostname)) / tSize);
			}

			rootServers.sort(desc);
			
			if (LOL.peek() != "NULL PORT DATA") {
				let down = JSON.parse(LOL.peek());
				let dsi = rootServers.findIndex(fi => fi.hostname == down);
				if (dsi >= 0) rootServers.splice(dsi, 1);
			}
			let total = rootServers.reduce(sum, 0);
			if (total < 1 && LS.peek() == "NULL PORT DATA") {
				LS.write(JSON.stringify(true));
			}
			PRBTS.read();
			PRBTS.write(JSON.stringify(rootServers));

			//if(!CONFIG.runBatcherLB) await setConfig(ns, {"runBatcherLB": true});
			//if(!CONFIG.runPrimerLB) await setConfig(ns, {"runPrimerLB": true});
			//if(!CONFIG.runLogisticsST && !CONFIG.runLogisticsFN) await setConfig(ns, {"runLogistics": true});

			await ns.sleep(INTERVAL);

		}
		await ns.sleep(INTERVAL);
	}
}
