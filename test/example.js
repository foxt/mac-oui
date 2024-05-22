const MAC = require("../index.js");
const fs = require("fs");
// Download it from https://standards-oui.ieee.org/oui/oui.txt
const ouitxt = fs.readFileSync("oui.txt", "utf8");
const OUIDb = MAC.OUIDb(ouitxt);
console.log("Read", OUIDb.size, "OUIs from the database");

function printMac(mac) {
    console.log(`${mac}:`);
    let parsed = MAC.parse(mac);
    console.log(`  - Normalised: ${MAC.toString(parsed)}`);
    console.log(`  - OUI: ${MAC.getOui(parsed)}`);
    console.log(`  - Multicast: ${MAC.getMulticast(parsed)}`);
    console.log(`  - LAA: ${MAC.getLAA(parsed)}`);
    console.log(`  - Docker: ${MAC.isDocker(parsed) ? "Likely" : "Unlikely"} (converted to IP: ${MAC.dockerIP(parsed)})`);
    let vendor = MAC.getVendor(parsed, OUIDb);
    if (vendor) {
        console.log(`  - Vendor: ${vendor.name}`);
        console.log(`            ${vendor.address}`);
        console.log(`            ${vendor.region}`);
        console.log(`            ${vendor.country}`);
    }
}
printMac("bc:24:11:cf:9a:4b")

console.log ("Running ARP scan...")
let foundMacs = new Map();
const { execSync } = require("child_process");
const arp = execSync("arp -a").toString();
const lines = arp.split("\n");
for (var line of lines) {
    let parts = line.trim().split(' ');
    if (parts.length < 4) continue;
    const name = parts[0];
    let ip = parts[1].substring(1, parts[1].length - 1);
    let mac = parts[3];
    if (!mac.includes(":")) continue;
    if (!foundMacs.has(mac)) foundMacs.set(mac, []);
    foundMacs.get(mac).push({name, ip});
}
console.log("Found MACs:");
for (var [mac, devices] of foundMacs) {
    printMac(mac);
    console.log("  - Devices:");
    for (var device of devices) {
        console.log(`    - ${device.name} (${device.ip})`);
    }
}