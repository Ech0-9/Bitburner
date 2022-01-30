/** @param {NS} ns **/
import {getConfig} from "util.js";
export async function main(ns){
	const f = ns.flags([
		["host", ""],
		["batchNum", 1],
		["id", -1]
	]);
	const INTERVAL = getConfig(ns).interval;
	//const TDIF = 200;
	let target = "";
	let delay = 0;
	while(true){
		target = ns.read(`TARGET_${f.host}.txt`);
		delay = ns.getWeakenTime(target) - ns.getGrowTime(target);
		await ns.sleep(delay);
		await ns.grow(target);
		await ns.sleep(INTERVAL * 4 * f.batchNum);
	}
}
