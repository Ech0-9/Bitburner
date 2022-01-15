
function makeDir(fs, ex){
	ex.forEach((e, i) => {
		let fext = fs.filter(f => f.extension == e);
		fext.forEach((fe, i) => {
			if(fe.dir == ""){
				let fd = read(fe.filename);
				ns.write("/${fe.extension}/${fe.filename}", fd, "w");
				ns.rm(fe.filename, fe.host);
			}
		});
	});
}

function deleteDir(fs, ex){
	ex.forEach((e, i) => {
		let fext = fs.filter(f => f.extension == e);
		fext.forEach((fe, i) => {
			if(fe.dir != ""){
				let fd = read("/${fe.dir}/${fe.filename}");
				ns.write("${fe.filename}", fd, "w");
				ns.rm("/${fe.dir}/${fe.filename}", fe.host);
			}
		});
	});
}

export async function main(ns){
	const arr = ns.flags([
		["target", "home"],
		["ext", false],
		["create", false],
		["delete", false]
		]);
	
	let files = ns.ls(arr.target).map((f) => {
			let path = f.split(".");
			let dir = path[0].split("/");
			if(dir[0] == path[0]){
				return {
					"host": arr.target,
					"filename": "${dir[0]}.${path[1]}",
					"dir": "",
					"extension" : path[1].toUpperCase();
				}
			}
			else{
				return {
					"filename": "${dir[1]}.${path[1]}",
					"dir": "${dir[0]}",
					"extension" : path[1].toUpperCase();
				}
			}
	})
	let extensions = [];
	let display = [];
	if(!arr.ext){
		files.forEach((f, i) => {
			if(!extensions.includes(f.extension)) { if(f.extension != "EXE") extensions.push(f.extension);}
		});
		if(arr.create){
			makeDir(files, extensions);
		}
		else if(arr.delete){
			deleteDir(files, extensions);	
		}
		else{
			ns.tprint("set flags --create or --delete to true");
		}
	}
	else{
		extensions.push(arr.ext.toUpperCase());
		if(arr.create){
			makeDir(files, extensions);	
		}
		else if(arr.delete){
			deleteDir(files, extensions);	
		}
		else{
			ns.tprint("set flags --create or --delete to true");
		}
	}
}	
