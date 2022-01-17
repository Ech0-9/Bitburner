/** @Param {NS} ns **/
export async function main(ns){
	const f = ns.flags([]);
	let result = await ns.weaken(f._[0]);
}
