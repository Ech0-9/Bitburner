//will be the hack script
export async function main(ns){
	const f = ns.flags([]);
	await ns.sleep(f._[1]);
	let result =  ns.hack(f._[0]);
	ns.toast("Hack Result on ${_[0]}: ${result}", "success", 3000);
}
