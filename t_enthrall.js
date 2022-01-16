/** @Param {NS} ns **/
export async function main(ns){
	const f = ns.flags([]);
	const EXECUTABLES = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
	if(!ns.hasRootAccess(f._[0])){
		const availableCrashers = EXECUTABLES.filter((ex) => {
			return ns.fileExist(ex, "home");
		});
		availableCrashers.forEach((ac) => {
			switch(ac){
				case "BruteSSH.exe":
					ns.brutessh(f._[0]);
					break;
				case "FTPCrack.exe":
					ns.ftpcrack(f._[0]);
					break;
				case "relaySMTP.exe":
					ns.relaysmtp(f._[0]);
					break;
				case "HTTPWorm.exe": 
					ns.httpworm(f._[0]);
					break;
				case "SQLInject.exe":
					ns.sqlinject(f._[0]);
					break;					
			}
		});
		ns.nuke(f._[0]);
		
		//write to port# ?
}
