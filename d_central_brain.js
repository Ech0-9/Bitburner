import {getConfig, allServers} from "util.js";

export async function main(ns){
	const ME = ns.getHostname();
	const SCRIPTS = ["t_extract.js", "t_engorge.js", "t_enfeeble.js"];
	const INTERVAL = getConfig(ns).interval;
	const reserved = getConfig(ns).reservedRAM.home;
	const hr = 1.8;
	const gr = 1.85;
	const wr = 1.75;
	
	let servers = [];
	let ptargets = [];
	let aRam = 0;
	//let pservers = ["home"];
	function desc(a, b){
		return ns.getServerMaxMoney(b) - ns.getServerMaxMoney(a);	
	}
	async function batch(num, host, g, w){
		let arrArgs = [];
		for(let i = 0; i < num; i++){
			arrArgs = ["--host", host, "--batchNum", num, "--id", i];
			ns.exec("t_extract.js", host, 1, ...arrArgs);
			await ns.sleep(INTERVAL);
			ns.exec("t_engorge.js", host, g, ...arrArgs);
			await ns.sleep(INTERVAL);
			ns.exec("t_enfeeble.js", host, w, ...arrArgs);
			await ns.sleep(INTERVAL);
		}
	}
	async function primeToMin(host){
		let arrArgs = ["--host", host, "--batchNum", 1, "--id", 1];
		let hts = Math.floor(ns.getServerMaxRam(host) / 1.75);
		let cur = ns.getServerSecurityLevel(host);
		let min = ns.getServerMinSecurityLevel(host);
		let nts = Math.ceil((cur - min) / 0.05);
		let ts = hts - nts;
		let wt = ns.getWeakenTime(host);
		if(ts >= 0){
			ns.exec("t_enfeeble.js", host, hts, ...arrArgs);
			await ns.sleep(wt + (4 * INTERVAL));
		}
		else{
			ns.exec("t_enfeeble.js", host, hts, ...arrArgs);
			await ns.sleep(wt + (4 * INTERVAL));
			await primeToMin(ns, host);
		}
		
	}
	async function prime(num, host) {
		let arrArgs = [];
		for(let i = 0; i < num; i++){
			arrArgs = ["--host", host, "--batchNum", num, "--id", i];
			ns.exec("t_engorge.js", host, 12, ...arrArgs);
			await ns.sleep(INTERVAL);
			ns.exec("t_enfeeble.js", host, 1, ...arrArgs);
			await ns.sleep(INTERVAL);	
		}
	}
	while(true){
		let pservers = ns.getPurchasedServers();
		pservers.unshift("home");
		servers = allServers(ns, false);
		ptargets = servers.filter(f => {
			return ns.hasRootAccess(f) && f.substring(0, 7) != "p-cloud";
		}).sort(desc);
		if(ptargets.length > pservers.length){
			ptargets.length = pservers.length;
		}
		for(let i = 0; i < pservers.length; i++){
			await ns.write(`TARGET_${pservers[i]}.txt`, ptargets[i], "w");
			await ns.scp(`TARGET_${pservers[i]}.txt`, pservers[i]);
			
			let cur = ns.getServerSecurityLevel(ptargets[i]);
			let min = ns.getServerMinSecurityLevel(ptargets[i]);
			let maxMon = ns.getServerMaxMoney(ptargets[i]);
			let curMon = ns.getServerMoneyAvailable(ptargets[i]);
			
			if(cur != min){
				if(pservers[i] != "home"){
					ns.killAll(pservers[i]);				
					aRam = ns.getServerMaxRam(pservers[i]);
				}
				else{
					aRam = ns.getServerMaxRam(pservers[i]) - ns.getServerUsedRam(pservers[i]) - reserved;
				}
				let num = Math.ceil(aRam / 24);
				primeToMin(pservers[i]);
			}
			else if(maxMon != curMon && !ns.scriptRunning("t_enfeeble.js", pservers[i])){
				if(pservers[i] != "home"){				
					aRam = ns.getServerMaxRam(pservers[i]);
				}
				else{
					aRam = ns.getServerMaxRam(pservers[i]) - ns.getServerUsedRam(pservers[i]) - reserved;
				}
				let num = Math.ceil(aRam / 24);	
			}
			else if(!ns.scriptRunning("t_extract.js", pservers[i])){
				
				ns.scriptKill("t_engorge.js", pservers[i]);
				ns.scriptKill("t_enfeeble.js", pservers[i]);
				
				let cur = ns.getServerMaxMoney(ptargets[i]);
				let h = ns.hackAnalyze(ptargets[i]);
				let ncur = cur - (cur * h);
				let gmul = cur / ncur;
				let g = Math.ceil(ns.growthAnalyze(ptargets[i], gmul));
				let w = Math.ceil((0.002 + g) / 0.05);
				
				if(pservers[i] != "home"){
					aRam = ns.getServerMaxRam(pservers[i]);
				}
				else{
					aRam = ns.getServerMaxRam(pservers[i]) - ns.getServerUsedRam(pservers[i]) - reserved;
				}
				
				let batchSize = Math.ceil(hr + gr * g + wr * w);
				let bNum = Math.ceil(aRam / batchSize);
				
				batch(bNum, pservers[i], g, w);
			}
			
		}
		
	}
}
