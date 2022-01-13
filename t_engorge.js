/** @param {NS} ns **/
export async function main(ns){
	const f = ns.flags([
		["target", ""],
		]);
	await ns.grow(f.target);
}
