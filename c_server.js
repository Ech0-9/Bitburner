/** @param {NS} ns **/
export class MyServer {

	constructor(ns, host) {
		this.nns = ns;
		this.hostname = host;
		this.maxRam = ns.getServerMaxRam(host);
		//this.usedRam = ns.getServerUsedRam(host);
		this.maxMoney = ns.getServerMaxMoney(host);
		//this.avaMoney = ns.getServerMoneyAvailable(host);
		this.minSec = ns.getServerMinSecurityLevel(host);
		//this.curSec = ns.getServerSecurityLevel(host);
		this.root = false;
		this.portNum = ns.getServerNumPortsRequired(host);
		this.hlvl = ns.getServerRequiredHackingLevel(host);
	}
	get usedRam() {
		return this.nns.getServerUsedRam(this.hostname);
	}
	get avaMoney() {
		return this.nns.getServerMoneyAvailable(this.hostname);
	}
	get curSec() {
		return this.nns.getServerSecurityLevel(this.hostname);
	}
	get threads() {
		return Math.floor((this.maxRam - this.usedRam) / 1.75);
	}
	get gmul() {
		return (this.maxMoney / this.avaMoney);
	}
}
