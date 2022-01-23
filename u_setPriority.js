import {setConfig} from "util.js";
export async function main(ns){
	const f = ns.flags([
		["priority", ""]
		]);
	setConfig(ns, {"priority": {"host": f.priority}});
}
