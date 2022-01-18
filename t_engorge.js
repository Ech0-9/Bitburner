/** @param {NS} ns **/
export async function main(ns){
	const f = ns.flags([
		["target", ""],
		["delay", ""],
		["id", -1]
	]);
	await ns.sleep(f.delay);
	await ns.grow(f.target);
}
