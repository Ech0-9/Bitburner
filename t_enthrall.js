/** @Param {NS} ns **/
const GATE_CRASHERS = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
export async function main(ns){
	const f = ns.flags([
		["target", ""]
		]);
	if(!hasRootAccess(f.target)){
		const availableCrashers = GATE_CRASHERS.filter((gc) => {
			return ns.fileExist(gc, "home");
		});
		availableCrashers.forEach((ac) => {
			switch(ac){
				case "BruteSSH.exe":
					ns.brutessh(f.target);
					break;
				case "FTPCrack.exe":
					ns.ftpcrack(f.target);
					break;
				case "relaySMTP.exe":
					ns.relaysmtp(f.target);
					break;
				case "HTTPWorm.exe": 
					ns.httpworm(f.target);
					break;
				case "SQLInject.exe":
					ns.sqlinject(f.target);
					break;					
			}
		});
		ns.nuke(f.target);
		
		//write to port# ?
}
