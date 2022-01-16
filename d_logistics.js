import {getConfig, setConfig} from "util.js";

export async function main(ns){
	const marker = "unavailable_server.txt";
	const LBL = ns.getPortHandle(6);
	const PBS = ns.getPortHandle(7);
	const CONFIG = getConfig(ns);
	const INTERVAL = CONFIG.interval;
	let counter = 0;
	let cycle = 3;
	let pow = 4;
	let ram = CONFIG.pservers.minSize;
	
	while(true){
		if(cycle > 20){
			ns.toast("Max Server Upgrade acheived!!", "warning", 15000);
			setConfig(ns, {"runLogistics": false});
			ns.exit()
		}
		while(LBL.data[0] != "NULL PORT DATA"){
			let pserv = ns.getPurchasedServers();
			let purchased = "";
			let delay = 0;
			if(pserv.length < 25){
				do{
					if(delay != 0) await ns.sleep(delay);
					purchased = ns.purchaseServer(CONFIG.pservers.prefix, ram);
					delay = 10000;
				} while(purchased != "");
				
				await ns.scp("t_enthrall.js", "home", purchased);
				await ns.scp("t_engorge.js", "home", purchased);
				await ns.scp("t_enfeeble.js", "home", purchased);
				await ns.scp("t_extract.js", "home", purchased);
				LBL.data.shift();
			}
			else{
				
				await ns.scp(marker, "home", pserv[0]);
				while(ns.getServerUsedRam(pserv[0]) != 0){
					await ns.sleep(10000);
				}
				ns.deleteServer(pserv[0]);
				ram = Math.pow(2, pow);
				do{	
					if(delay != 0) await ns.sleep(delay);
					purchased = ns.purchaseServer(pserv[0], ram);
					delay = 10000;
				} while(purchased != "")
				counter++;
				if(counter == 25){
					counter = 0;
					cycle++;
					pow++;
				}
				await ns.scp("t_enthrall.js", "home", pserv[0]);
				await ns.scp("t_engorge.js", "home", pserv[0]);
				await ns.scp("t_enfeeble.js", "home", pserv[0]);
				await ns.scp("t_extract.js", "home", pserv[0]);
				LBL.data.shift();
				
			}
			let ups = {
				"hostname": purchased,
				"root": true,
				"mRam": ram,
				"threads": "",
				"maxMoney": 0,
				"avaMoney": 0,
				"minSecurity": 0,
				"level": 0,
				"personal": true,
				"primed": false
			};
			PBS.data[0] = JSON.stringify(ups);
			break;
		}
		await ns.sleep(INTERVAL);
	}
}

