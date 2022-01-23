import { setConfig } from "util.js";

export async function main(ns) {
	ns.run("d_database.js", 1);
	ns.run("d_probe.js", 1);
	ns.run("d_executor.js", 1);
	ns.run("d_logistics.js", 1);
}
