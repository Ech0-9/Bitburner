/** @Param {NS} ns **/
import {getConfig} from "util.js";
export async function main(ns){
	const f = ns.flags([
		["host", ""],
		["batchNum", 1],
		["id", -1]
	]);
	const INTERVAL = getConfig(ns).interval;
	let target = "";
	while(true){
		target = ns.read(`TARGET_${f.host}.txt`);
		await ns.weaken(target);
		await ns.sleep(INTERVAL * 4 * f.batchNum);
	}
}
