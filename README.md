```js
const MAC = require("oui-mac");
const fs = require("fs");
```
or
```ts
import * as MAC from "oui-mac";
import * as fs from "fs";
```
then
```js
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
```