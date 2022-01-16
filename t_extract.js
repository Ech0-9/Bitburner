//will be the hack script
export async function main(ns){
	const f = ns.flags([]);
	await ns.sleep(f._[1]);
	ns.hack(f._[0]);
}
