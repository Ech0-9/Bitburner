//will be the hack script
export async function main(ns){
	const f = ns.flags([
		["target", ""],
		["delay", ""],
		["id", -1]
	]);
	const TDIF = 200;
	let target = "";
	let oldTarget = "";
	let delay = 0;
	while(true){
		target = ns.read("TARGET.txt");
		if(target != oldTarget){
			await ns.write("Profit.txt", 0, "w");
			oldTarget = target;
		}
		delay = ns.getWeakenTime(target) - ns.getHackTime(target) - TDIF;
		await ns.sleep(delay);
		let result =  ns.hack(target);
		let total = Number(ns.read("Profit.txt"));
		await ns.write("Profit.txt", total + result, "w");
		//ns.toast(`Hack Result on ${f.target}: ${result}`, "success", 3000);
	}
}
