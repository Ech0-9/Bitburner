
function makeFileData(fs, ex, dp){
	ex.forEach((e, i) => {
		let fext = fs.filter(f => f.extension == e);
		dp.push("=".repeat(20) + "/n");
		dp.push("${e}/n");
		dp.push("=".repeat(20) + "/n");
		fext.forEach((fe, i) => {
			if(i/5 == 1){
				dp.push("${fe.filename}/n");
			}
			else{
				dp.push("${fe.filename} ");
			}
		});
	});
}

export async function main(ns){
	const arr = ns.flags([
		["target", ""],
		["ext", false]
		]);
	
	let files = ns.ls(arr.target).map((f) => {
			let split = f.split(".");
			return file = {
				"filename": "${split[0]}.${split[1]}",
				"extension" : split[1].toUpperCase();
			}
	})
	let extensions = [];
	let display = [];
	if(!arr.ext){
		files.forEach((f, i) => {
			if(!extensions.includes(f.extension)) extensions.push(f.extension);
		});
		display.push("Displaying ALL files on ${arr.target}/n");
		makeFileDate(files, extensions, display);
		ns.alert(display);
	}
	else{
		display.push("Displaying ${arr.ext.toUpperCase()} files on ${arr.target}/n");
		extensions.push(arr.ext.toUpperCase());
		makeFileDate(files, extensions, display);
		ns.alert(display);
	}
}	
