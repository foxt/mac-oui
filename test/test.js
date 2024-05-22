const mac = require("../");
const assert = require("assert");

assert(mac.parse("bc:24:11:cf:9a:4b") === 0xbc2411cf9a4bn, "Standard representation");
assert(mac.parse("bc2411cf9a4b") === 0xbc2411cf9a4bn,      "No separator");
assert(mac.parse("bc-24-11-cf-9a-4b") === 0xbc2411cf9a4bn, "Dash separator");
assert(mac.parse("bc24.11cf.9a4b") === 0xbc2411cf9a4bn,    "3 octets");
assert(mac.parse("bc2411.cf9a4b") === 0xbc2411cf9a4bn,     "2 octets");
assert(mac.parse("0:0:10:2:0:0") === 0x10020000n,         "No leading zeros");
let macAddr = mac.parse("bc:24:11:cf:9a:4b");
assert(mac.toString(macAddr) === "BC:24:11:CF:9A:4B", "Normalise to standard representation");
assert(mac.getOui(macAddr) === "BC2411", "Get OUI");
assert(!mac.getMulticast(macAddr), "Not multicast");
assert(mac.getMulticast("01:00:5e:00:00:16"), "Multicast");
assert(!mac.getLAA(macAddr), "Not LAA");
assert(mac.getLAA("02:00:00:00:00:00"), "LAA");
assert(!mac.isDocker(macAddr), "Not Docker MAC");
assert(mac.isDocker("02:42:ac:11:00:02"), "Docker MAC");
assert(mac.dockerIP("02:42:ac:11:00:02") === "172.16.0.2", "Docker IP");



let testOuiDb = new Map();
testOuiDb.set("BC2411", {name: "Proxmox Server Solutions GmbH"});
let vendor1 = mac.getVendor(macAddr, testOuiDb);
assert(vendor1.name === "Proxmox Server Solutions GmbH", "Test OUI database vendor lookup");

const fs = require("fs");
if (!fs.existsSync("./oui.sample")) {
    const sampleOuiTxt = require("fs").readFileSync("oui.txt", "utf8");
    const ouiDb = mac.OUIDb(sampleOuiTxt);
    assert(ouiDb.get("BC2411").name === "Proxmox Server Solutions GmbH", "OUI database test");
    let vendor2 = mac.getVendor(macAddr, ouiDb);
    assert(vendor2.name === "Proxmox Server Solutions GmbH", "OUI database vendor lookup");
}  else {
    console.warn("Skipping OUI database test as oui.sample isn't available");
}
console.log("All OK!")