//will be the hack script
export async function main(ns){
	const f = ns.flags([
		["target", ""],
		["delay", ""],
		["id", -1]
	]);
	await ns.sleep(f.delay);
	let result =  ns.hack(f.target);
	ns.toast(`Hack Result on ${f.target}: ${result}`, "success", 3000);
}
