/** @Param {NS} ns **/
export async function main(ns){
	const f = ns.flags([
		["target", ""],
		["delay", ""],
		["id", -1]
	]);
	let target = "";
	while(true){
		target = ns.read("TARGET.txt");
		await ns.weaken(target);
	}
}
