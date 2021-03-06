const CONF_FILE_NAME = "config.json.txt";
const PSERV_FILE_NAME = "pserver.json.txt";
const BASE_URL = "https://raw.githubusercontent.com/Ech0-9/Bitburner/v3";
const INSTALL_FILES = [
  "config.default.json.txt",
  "pserver.default.json.txt",
  "unavailable_server.txt",
  "d_executor.js",
  "d_probe.js",
  "d_logistics.js",
  "d_database.js",
  "r_money.js",
  "r_servers.js",
  "start.js",
  "t_engorge.js",
  "t_extract.js",
  "t_enfeeble.js",
  "u_set_priority.js",
  "u_functions.js",
  "u_move_files.js",
  "u_files.js",
  "u_deploy.js",
  "u_find.js",
  "u_lud_speed.js",
  "u_max-threads.js",
  "u_peek.js",
  "u_server-buy.js",
  "u_rm-all.js",
  "util.js",
  "util.TextTable.js"
];

const INSTALL_ALIAS = [
  `alias nuke="run NUKE.exe"`,
  `alias priority="run u_set_priority.js --priority"`,
  `alias check-priority="run r_servers.js"`,
  `alias goto-plaid="run u_lud_speed.js"`,
  `alias start="run start.js"`,
  `alias editconf="nano config.json.txt"`,
  `alias peek="run peek.js --port"`,
  `alias makeDir="run u_move_files.js --create true --ext"`,
  `alias deleteDir="run u_move_files.js --delete true --ext"`,
  `alias update="run install.js"`,
  `alias install="run install.js"`
];

function merge(source, target) {
  for (const [key, val] of Object.entries(source)) {
    if (val !== null && typeof val === `object`) {
      if (target[key] === undefined) {
        target[key] = new val.__proto__.constructor();
      }
      merge(val, target[key]);
    } else {
      target[key] = val;
    }
  }
  return target; // we're replacing in-situ, so this is more for chaining than anything else
}

async function downloadFiles(ns){
  let filesImported = true;
  for (let file of INSTALL_FILES) {
    let remoteFileName = `${BASE_URL}/${file}`;
    let result = await ns.wget(remoteFileName, `${file}`);
    filesImported = filesImported && result;
    ns.tprint(`File: ${file}: ${result ? '✔️' : '❌'}`);
  }
  return filesImported;
}

export async function main(ns){

  ns.tprint(`Downloading ${INSTALL_FILES.length} files ...`);
  ns.tprint("=".repeat(20));
  await downloadFiles(ns);
  ns.tprint("=".repeat(20));
  ns.tprint(`Merging Config ...`);
  let existingConfig = {};
  let existingPserv = {};
  let defaultConfig = JSON.parse(ns.read("config.default.json.txt"));
  let defaultPserv = JSON.parse(ns.read("pserver.default.json.txt"));
  if(ns.fileExists(CONF_FILE_NAME)){
    existingConfig = JSON.parse(ns.read(CONF_FILE_NAME));
  }
  else{
    ns.tprint(`Could not find ${CONF_FILE_NAME}, using defaults.`)
  }
  if(ns.fileExists(PSERV_FILE_NAME)){
    existingConfig = JSON.parse(ns.read(PSERV_FILE_NAME));
  }
  else{
    ns.tprint(`Could not find ${PSERV_FILE_NAME}, using defaults.`)
  }
  let config = merge(defaultConfig, {});
  config = merge(existingConfig, config);
  ns.print(config);
  await ns.write(CONF_FILE_NAME, JSON.stringify(config, null, "  "), "w");
  let pserv = merge(defaultPserv, {});
  pserv = merge(existingPserv, pserv);
  ns.print(pserv);
  await ns.write(PSERV_FILE_NAME, JSON.stringify(pserv, null, "  "), "w");
  ns.tprint("=".repeat(20));
  ns.tprint("Setting up aliases ...");
  let doc = eval("document");
  let terminal = doc.getElementById("terminal-input");
  let cmd = INSTALL_ALIAS.join("; ");
  terminal.value = cmd;
  const h = Object.keys(terminal)[1];
  terminal[h].onChange({target:terminal});
  terminal[h].onKeyDown({keyCode:13,preventDefault:()=>null});
  ns.tprint("All Done!  Try running \"start\" ...");
}
