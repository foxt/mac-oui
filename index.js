/**
 * Convert a MAC address to a bigint
 * @param {string | bigint | number} mac The MAC address as a string, bigint or number
 * @returns {bigint} The MAC address as a bigint
 */
function parse(mac) {
    if (typeof mac === "bigint") return mac;
    else if (typeof mac === "number") return BigInt(mac);
    // shortcut for MACs with no seperator (FFFFFFFFFFFF)
    if (mac.length === 12) {
        let number = parseInt(mac, 16);
        if (!isNaN(number)) return BigInt(number);
    }
    // absolutely unhinged shortcut for MACs with seperators and leading zeros (0F:0F:0F:0F:0F:0F)
    if (mac.length === 17) {
      let number = parseInt(mac[0]+mac[1]+mac[3]+mac[4]+mac[6]+mac[7]+mac[9]+mac[10]+mac[12]+mac[13]+mac[15]+mac[16], 16);
      if (!isNaN(number)) return BigInt(number);
    }
            
    if (mac.length > 17 || mac.length < 1) throw new Error("Invalid MAC address");


    let octets = mac.split(/[^A-F0-9]/i)
    let charPer = 12/octets.length 
    let str = "";
    for (var i = 0; i < octets.length; i++) str += octets[i].padStart(charPer,0)
    let parsed = parseInt(str,16)
    if (str.length !== 12 || isNaN(parsed)) throw new Error("Invalid MAC address");
    return BigInt(parsed);

}


/**
 * Convert a MAC address to a string, normalising to the format `XX:XX:XX:XX:XX:XX`
 * @param {number | string | bigint} macAddress MAC address as a number, string or bigint
 */
function toString(macAddress) {
    let mac = parse(macAddress).toString(16).toUpperCase().padStart(12,0);
    return mac.match(/.{2}/g).join(":");
}

/**
 * Get the OUI (first half) of a MAC address
 * @param {number | string | bigint} macAddress MAC address as a number, string or bigint
 * @returns {string} The OUI of the MAC address, in the format `XXXXXX`
 */
function getOui(macAddress) {
    return parse(parse(macAddress) >> 24n).toString(16).toUpperCase().padStart(6,0);
}

/**
 * Check if a MAC address is a multicast address
 * @param {number | string | bigint} macAddress MAC address as a number, string or bigint
 * @returns {boolean} True if the MAC address is a multicast address
 */
function getMulticast(macAddress) {
    return !!(parse(macAddress) & 0x10000000000n)
}
/**
 * Check if a MAC address is a locally administered address
 * @param {number | string | bigint} macAddress MAC address as a number, string or bigint
 * @returns {boolean} True if the MAC address is a locally administered address
 */
function getLAA(macAddress) {
  return !!(parse(macAddress) & 0x20000000000n)
}

/**
 * Checks if the MAC address is likely to be a Docker container MAC address (starts with 02:42)
 * @param {number | string | bigint} macAddress MAC address as a number, string or bigint
 * @returns {boolean} False if the MAC address is not a Docker container MAC address, or the container IP address if it is
 */
function isDocker(macAddress) {
    let parsed = parse(macAddress);
    return parsed >> 32n == 0x0242n;
}
/**
 * If the MAC address is a Docker container MAC address, returns the container IP address
 * @param {number | string | bigint} macAddress MAC address as a number, string or bigint
 * @returns {number
 */
function dockerIP(macAddress) {
    let ip = parse(macAddress) & 0xFFFFFFFFn;    
    return [ip >> 24n, ip >> 16n & 0xFFn, ip >> 8n & 0xFFn, ip & 0xFFn].join(".");
}




/**
 * Parsed the vendor information from the OUI file. 
 * You should download https://standards-oui.ieee.org/oui/oui.txt and pass the contents to this function.
 * @param {string} data The OUI data
 * @returns {Map<string, {name: string, address: string, region: string, country: string}>} A map of OUIs to their details
 */
function OUIDb(data) {
    const ouitxt = data.replace(/\r\n/g,"\n").replace(/\t\t\t\t/g, '\t\t');
    const lines = ouitxt.split('\n');
    lines.splice(0, 4)
    let ouis = new Map();
    let group = [];
    for (var line of lines) {
        if (line.length > 0) {
            group.push(line.split('\t\t'));
        } else {
            if (group.length < 2) continue;
            let oui = group[0][0].split(" ")[0].replace(/-/g, "");
            let name = group[0][1];
            if (!ouis.has(oui)) {
                ouis.set(oui, {
                    name,
                    address: group[2]?.[1],
                    region: group[3]?.[1],
                    country: group[4]?.[1]
                });
            }
            
            group = [];
        }
    }
    return ouis;
}


/**
 * Get the vendor of a MAC address
 * @param {number | string | bigint} macAddress MAC address as a number, string or bigint
 * @param {Map<string, {name: string, address: string, region: string, country: string}>} ouiDb The OUI database.
 * @see OUIDb
 * @returns {{name: string, address: string, region: string, country: string}} The vendor details
 */
function getVendor(macAddress, ouiDb) {
    return ouiDb.get(getOui(macAddress));
}


module.exports = {
    parse, toString, getOui, getLAA, getMulticast, getVendor, 
    isDocker, dockerIP,
    OUIDb
}
