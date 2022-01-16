//will be the hack script
export async function main(ns){
	const f = ns.flags([]);
	ns.hack(f._[0]);
}
