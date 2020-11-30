import { readFileSync, writeFileSync } from "fs";
import exportMap from "./modules/MapExporter.js";

const mapString = readFileSync("maps/test.vmf").toString();
writeFileSync("test.map", exportMap(mapString));