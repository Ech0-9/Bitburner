import {getPserver, setPserver, setConfig, getConfig} from "util.js";

export async function main(ns){
	const CONFIG = getConfig(ns);
	const INTERVAL = CONFIG.interval;
	const PSERV = getPserver(ns);
	const port4 = ns.getPortHandle(4);
	
	let serv = "";
	if(PSERV.curRam == PSERV.maxRam && PSERV.upgraded == 25){
		ns.toast("MAX SERVER UPGRADES ACHIEVED!!", "success", 10000);
		setConfig(ns, {"runLogisticsFN": true});
	}
	if(PSERV.purchased < 25){
		do{
			serv = ns.purchaseServer(`${PSERV.prefix}-${PSERV.preIndex}`, PSERV.curRam);
			ns.toast(`Purchased New Server: ${serv} RAM: ${PSERV.curRam}`, "success", 4000);
			
		} while (serv != "");
		await ns.scp("t_engorge.js", "home", serv);
		await ns.scp("t_enfeeble.js", "home", serv);
		await ns.scp("t_extract.js", "home", serv);
		if(PSERV.purchased + 1 == 25){
			await setPserver(ns, {"curRam": Math.pow(2, PSERV.power)}); 
			await setPserver(ns, {"power": PSERV.power + 1});
			await setPserver(ns, {"purchased": PSERV.purchased + 1});
			await setPserver(ns, {"preIndex": PSERV.preIndex + 1});
			await setPserver(ns, {"preIndex": 0});
		}
		else{
			await setPserver(ns, {"purchased": PSERV.purchased + 1});
			await serPserver(ns, {"preIndex": PSERV.preIndex + 1});	
		}
	}
	else{
		while(ns.getServerUsedRam(`${PSERV.prefix}-${PSERV.preIndex}`) != 0){
			await ns.sleep(10000);
		}
		ns.deleteServer(`${PSERV.prefix}-${PSERV.preIndex}`);
		do{
			serv = ns.purchaseServer(`${PSERV.prefix}-${PSERV.preIndex}`, PSERV.curRam);
			ns.toast(`Upgraded Server: ${serv} RAM: ${PSERV.curRam}`, "success", 4000);
			
		} while (serv != "");
		await ns.scp("t_engorge.js", "home", serv);
		await ns.scp("t_enfeeble.js", "home", serv);
		await ns.scp("t_extract.js", "home", serv);
		if(PSERV.upgraded + 1 == 25){
			await setPserver(ns, {"curRam": Math.pow(2, PSERV.power)}); 
			await setPserver(ns, {"upgraded": PSERV.upgraded + 1});
			await serPserver(ns, {"preIndex": PSERV.preIndex + 1});
			await setPserver(ns, {"preIndex": 0});
			await setPserver(ns, {"power": PSERV.power + 1});
		}
		else{
			await setPserver(ns, {"purchased": PSERV.upgraded + 1});
			await serPserver(ns, {"preIndex": PSERV.preIndex + 1});	
		}
	}
	let ups = {
		"hostname": serv,
		"root": true,
		"mRam": PSERV.curRam,
		"threads": Math.ceil(PSERV.curRam / 1.75),
		"maxMoney": 0,
		"avaMoney": 0,
		"minSecurity": 0,
		"level": 0,
		"primed": false
	};
	while(!port4.tryWrite(JSON.stringify(ups))){
		await ns.sleep(INTERVAL);	
	}
}

