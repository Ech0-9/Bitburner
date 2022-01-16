//import * from "";

export async function main(ns) {
	const hst = 0.002;
	const gst = 0.004;
	const wst = 0.05;
	//percent increase to get back to 100% max money from 90% max money.
	const gmul = 1.12;
	while(true){
		let priority = JSON.parse(ns.getPortHandle(2).data[0]);
		let target = priority.hostname;
		let analysis = {
			"hostname": target,
			"hackThreads": 0,
			"weakThreads1": 0,
			"growThreads": 0,
			"weakThreads2": 0,
			"total": 0 
		};
		
		let threads= [0,0,0,0];
		//flooring the division make the taken pencentage 10% or just under 10%. never over 10%
		threads[0] = Math.floor(.1 / ns.hackAnalyze(target));
		threads[1] = (hst * threads[0]) / wst;
		threads[2] = Math.ceil(ns.growthAnalyze(target, gmul));
	}
}
