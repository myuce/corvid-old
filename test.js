const { readFileSync, writeFileSync } = require("fs")
const exportMap = require("./modules/MapExporter");

const mapString = readFileSync("maps/test.vmf").toString();
writeFileSync("test.map", exportMap(mapString));