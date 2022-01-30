//will be the hack script
import {getConfig} from "util.js";
export async function main(ns){
	const f = ns.flags([
		["host", ""],
		["batchNum", 1],
		["id", -1]
	]);
	const INTERVAL = getConfig(ns).interval;
	let target = "";
	//let oldTarget = "";
	let delay = 0;
	while(true){
		target = ns.read(`TARGET_${f.host}.txt`);
		/*if(target != oldTarget){
			await ns.write("Profit.txt", 0, "w");
			oldTarget = target;
		}*/
		delay = ns.getWeakenTime(target) - ns.getHackTime(target);
		await ns.sleep(delay);
		let result =  ns.hack(target);
		await ns.sleep(INTERVAL * 4 * f.batchNum);
		/*let total = Number(ns.read("Profit.txt"));
		await ns.write("Profit.txt", total + result, "w");*/
		//ns.toast(`Hack Result on ${f.target}: ${result}`, "success", 3000);
	}
}
