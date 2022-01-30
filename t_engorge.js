/** @param {NS} ns **/
export async function main(ns){
	const f = ns.flags([
		["target", ""],
		["delay", ""],
		["id", -1]
	]);
	const TDIF = 200;
	let target = "";
	let delay = 0;
	while(true){
		target = ns.read("TARGET.txt");
		delay = ns.getWeakenTime(target) - ns.getGrowTime(target) - TDIF;
		await ns.sleep(delay);
		await ns.grow(target);
}
