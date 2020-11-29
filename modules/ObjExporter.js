const { readFileSync, writeFileSync } = require("fs");
const Vector3 = require("./Vector3");
const Vector2 = require("./Vector2");
const readMap = require("./MapReader");

const mapFile = readFileSync("./maps/test.vmf").toString();
const { worldBrushes, entities, entityBrushes} = readMap(mapFile);

const getDispPoints = (p1, p2, power) => {
	res = [];
	let rowCount = Math.pow(2, power) + 1;
	for(let i = 0; i < rowCount; i++) {
		res.push({
			'pos': p1.pos.lerp(p2.pos, 1 / (rowCount - 1) * i),
			'uv': p1.uv.lerp(p2.uv, 1 / (rowCount - 1) * i)
		});
	}
	return res;
};

const convertSide = (side) => {
	let result = [];
	let points = side.points;
	// how should the tris be formed?
	// 0 1 2, 0 2 3, 0 3 4 etc
	// vertex normals? what are those??? gotta find a way to calculate them
	for(i = 2; i < points.length; i++) {
		let p1 = points[0];
		let p2 = points[i - 1];
		let p3 = points[i];
		result.push({'v': p1.pos, 'vn': p1.pos.normalize(), 'vt': p1.uv});
		result.push({'v': p2.pos, 'vn': p2.pos.normalize(), 'vt': p2.uv});
		result.push({'v': p3.pos, 'vn': p3.pos.normalize(), 'vt': p3.uv});
	}
	return result;
}

const convertDisplacement = (side) => {

}

let obj = [];

let worldPatches = "";
let worldSolids = "";
let pointEnts = "";
for(let brush of worldBrushes) {
	for(let side of brush.sides) {
		if(side.material.startsWith("tools"))
			continue;

		if(side.hasDisplacement) {
			//worldPatches += convertDisplacement(side);
			continue;
		}

		if(brush.hasDisplacement)
			continue;

		obj.push(convertSide(side));

	}
}

for(let brush of entityBrushes) {
	for(let side of brush.sides) {
		if(side.material.startsWith("tools"))
			continue;

		if(side.hasDisplacement) {
			//worldPatches += convertDisplacement(side);
			continue;
		}

		if(brush.hasDisplacement)
			continue;

		obj.push(convertSide(side));
	}
}

let result = `iwmap 4
{
"classname" "worldspawn"
${worldPatches}
}
{
"origin" "1656.0 1024.0 -64.0"
"angles" "0 180 0"
"classname" "info_player_start"
}
${pointEnts}
`;

let v = "";
let vn = "";
let vt = "";

var total = 0;
for(let i = 0; i < obj.length; i++) {
	for(let j = 0; j < obj[i].length; j++) {
		let o = obj[i][j];
		v += `v ${o.v.toStr()}\n`;
		vt += `vt ${(o.vt.x)} ${(o.vt.y)}\n`;
		vn += `vn ${o.vn.toStr()}\n`;
		total++;
	}
}

let mtl =  "newmtl uvtest\n"
			+"Ka 1.000000 1.000000 1.000000\n"
			+"Kd 1.000000 1.000000 1.000000\n"
			+"Ks 0.000000 0.000000 0.000000\n"
			+"d 1.0\n"
			+"illum 2\n"
			+"map_Kd uvtest.tga\n"

let res =	"mtllib a.mtl\n"
			+"o test\n"
			+v+vt+vn
			+"usemtl uvtest\n"
			+"s off\n";

for(let i = 1; i < total; i += 3) {
	res += `f ${i}/${i}/${i} ${i + 1}/${i + 1}/${i + 1} ${i + 2}/${i + 2}/${i + 2}\n`;
}

writeFileSync("C:/Users/Mehmet/Desktop/a.obj", res);
writeFileSync("C:/Users/Mehmet/Desktop/a.mtl", mtl);