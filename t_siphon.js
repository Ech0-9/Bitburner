//will be the hack script
export async function main(ns){
	const f = ns.flags([
		["target", false],
		]);
	ns.hack(f.target);
}
