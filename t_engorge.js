/** @param {NS} ns **/
export async function main(ns){
	const f = ns.flags([]);
	await ns.sleep(f._[1]);
	await ns.grow(f._[0]);
}
