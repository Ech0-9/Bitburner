import {getConfig, setConfig} from "util.js";

export async function main(ns){
	const marker = "unavailable_server.txt";
	const LBL = ns.getPortHandle(6);
	const LBS = ns.getPortHandle(8);
	const PBS = ns.getPortHandle(7);
	let counter = 0;
	let cycle = 3;
	let pow = 4;
	
	while(true){	
		const CONFIG = getConfig(ns);
		const INTERVAL = CONFIG.interval;
		let ram = CONFIG.pservers.minSize;
		let pserv = ns.getPurchasedServers();
		
		if(pserv.length == 25 && ns.getServerMaxRam(pserv[24]) == ns.getPurchasedServerMaxRam()){
			await setConfig(ns, {"runLogisticsFN": true});
			ns.exit()
		}
		if(cycle > 20){
			ns.toast("Max Server Upgrade acheived!!", "warning", 15000);
			await setConfig(ns, {"runLogisticsFN": true});
			ns.exit()
		}
		if(LBL.peek() != "NULL PORT DATA"){
			let purchased = "";
			let delay = 0;
			if(pserv.length < 25){
				do{
					if(delay != 0) await ns.sleep(delay);
					purchased = ns.purchaseServer(CONFIG.pservers.prefix, ram);
					delay = 10000;
				} while(purchased != "");
				ns.toast(`Purchased New Server: ${purchased} RAM: ${ram}`, "success", 4000);
				await ns.scp("t_engorge.js", "home", purchased);
				await ns.scp("t_enfeeble.js", "home", purchased);
				await ns.scp("t_extract.js", "home", purchased);
				LBL.read();
			}
			else{
				
				//await ns.scp(marker, "home", pserv[0]);
				LBS.write(JSON.stringify(pserv[0]));
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
				ns.toast(`Upgraded Server: ${purchased} RAM: ${ram}`, "success", 4000);
				counter++;
				if(counter == 25){
					counter = 0;
					cycle++;
					pow++;
				}
				await ns.scp("t_engorge.js", "home", pserv[0]);
				await ns.scp("t_enfeeble.js", "home", pserv[0]);
				await ns.scp("t_extract.js", "home", pserv[0]);
				LBS.read();
				LBL.read();
				
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
				"primed": false
			};
			while(PBS.peek() == "NULL PORT DATA"){
				PBS.write(JSON.stringify(ups));
			}
		}
		await ns.sleep(INTERVAL);
	}
}

