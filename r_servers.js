/** @param {NS} ns **/
import { TextTable, allServers } from "util.TextTable.js";

const MAX_SIZE = 20;

function ramToSize(ram){
  let size = 1;
  for(size; size < MAX_SIZE + 1; size++){
    if(Math.pow(2, size) == ram){
      break;
    }
  }
  return size;
}

function sizeToRam(size){
  return Math.pow(2, size);
}

export async function main(ns) {
  let s = allServers(ns, false);
  let ps = ns.getPurchasedServers();
  let fs = s.filter(f => {
    if(ns.hasRootAccess(f) && ns.getServerRequiredHackingLevel(f) <= ns.getHackingLevel() && !ps.includes(f)){
      return f;
    }
  });
  let report = fs.map((h) => {
   let money = ns.getServerMaxMoney(h);
    return [
      h, money
    ]
  });

  report.unshift(["Host", "Money"])

  ns.tprint("\n"+TextTable(report, {hsep: "  |  "}))
}
