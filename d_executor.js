import { getConfig, setConfig, generateId } from "util.js";
import { analyze } from "u_functions.js";
export async function main(ns) {
	const SCRIPTS = ["t_extract.js", "t_engorge.js", "t_enfeeble.js"];
	let analysis = {};
	let servs = [];
	let servsBack = [];
	let batchId = 0;
	let primed = false;
	function threads(sv) {
		const reserved = getConfig(ns).reservedRAM.home;
		if (sv == "home") {
			return Math.floor((ns.getServerMaxRam(sv) - reserved - ns.getServerUsedRam(sv)) / 1.75);
		}
		else {
			return Math.floor((ns.getServerMaxRam(sv) - ns.getServerUsedRam(sv)) / 1.75);
		}
	}
	async function serverQuery(i, rThreads, pb) {
		while (ns.peek(i) == "EMPTY") {
			await ns.sleep(100);
		}
		await ns.writePort(i, pb);
		await ns.writePort(i, rThreads);
		while (ns.peek(i) == rThreads || ns.peek(i) == pb) {
			await ns.sleep(100);
		}
		return JSON.parse(ns.readPort(i));
	}
	function hgw(ty, svs, hgwt, az, tg, id) {
		ns.print(svs);
		const TDIF = 200;
		if (svs.length != 0) {
			let s = svs.shift();
			let st = threads(s);
			let d = 0;
			let i = -1;
			let nt = 0;
			switch (ty) {
				case "HACK":
					i = 0;
					d = az.weakTime - az.hackTime - TDIF;
					break;
				case "GROW":
					i = 1;
					d = az.weakTime - az.growTime - TDIF;
					break;
				case "WEAK":
					i = 2;
					break;
			}
			let arrArgs = ["--target", tg, "--delay", d, "--id", id];
			if (hgwt - st == 0) {
				ns.exec(SCRIPTS[i], s, st, ...arrArgs);
			}
			else if (hgwt - st < 0) {
				ns.exec(SCRIPTS[i], s, hgwt, ...arrArgs);
				svs.unshift(s);
			}
			else {
				nt = hgwt - st;
				ns.print("new internal hgw");
				hgw(ty, svs, nt, az, tg, id);
				ns.print("back up a level");
				ns.exec(SCRIPTS[i], s, st, ...arrArgs);

			}
		}

	}
	function prime(s, az, tg, id, d) {
		ns.print(`Starting Grow: ${s}`);
		ns.print(`GrowThreads: ${az.growThreads / d}`)
		hgw("GROW", s, Math.ceil(az.growThreads / d), az, tg, id);
		ns.print(`Starting weak: ${s}`);
		hgw("WEAK", s, Math.ceil(az.g_weakThreads / d), az, tg, id);
	}
	function batch(s, az, tg, id) {
		hgw("HACK", s, az.hackThreads, az, tg, id);
		hgw("WEAK", s, az.h_weakThreads, az, tg, id);
		hgw("GROW", s, az.growThreads, az, tg, id);
		hgw("WEAK", s, az.g_weakThreads, az, tg, id);
	}
	while (true) {
		primed = getConfig(ns).priority.primed;
		ns.print(primed);
		let ptarget = getConfig(ns).priority.host;
		ns.print(ptarget);
		let total = 0;
		let div = 0;
		let aRam = 0;
		if (!primed) {
			analysis = analyze(ns, ptarget, "P");
			ns.print(analysis);
			total = analysis.total;
			servs = await serverQuery(1, total, "P");
			aRam = servs.shift();
			ns.print(aRam);
			servsBack = servs.concat([]);
			if (total / aRam > 0) {
				div = Math.ceil(total / aRam);
				ns.print(div);
			}
			for (let i = 0; i < div; i++) {
				prime(servs, analysis, ptarget, 0, div);
				servs = servsBack.concat([]);
			}
			await setConfig(ns, { "priority": { "primed": true } });
		}
		else {
			analysis = analyze(ns, ptarget, "B");
			total = analysis.total;
			servs = await serverQuery(1, total, "B");
			aRam = servs.shift();
			batchId = generateId(16);
			batch(serv, analysis, ptarget, batchId)

		}
		await ns.sleep(250);
	}

}
