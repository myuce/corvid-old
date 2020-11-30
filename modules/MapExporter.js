import { readFileSync, writeFileSync } from "fs";
import { basename } from "path";
import readMap from "./MapReader.js";
import Vector2 from "./Vector2.js";
import Vector3 from "./Vector3.js";

function randomLightmap() {
	const lightmaps = ["blue", "cyan", "gray", "green", "purple", "red", "yellow"];
	return "lightmap_" + lightmaps[Math.floor(Math.random() * lightmaps.length)];
};

function getDispPoints(p1, p2, power) {
	res = [];
	let rowCount = Math.pow(2, power) + 1;
	for(let i = 0; i < rowCount; i++) {
		res.push({
			"pos": p1.pos.lerp(p2.pos, 1 / (rowCount - 1) * i),
			"uv": p1.uv.lerp(p2.uv, 1 / (rowCount - 1) * i)
		});
	}
	return res;
};

function convertSide (side) {
	let result = "";
	let points = side.points;
	if(points.length % 2 == 1) {
		points.push(points[points.length - 1]);
	}
	let rows = points.length / 2;

	result	+=	" {\n"
			+	"  mesh\n"
			+	"  {\n"
			//+	`  {side.material}\n`
			+	`  uvtest\n`
			+	`  ${randomLightmap()}\n`
			+	`  ${rows} 2 ${side.lightmapscale} 8\n`

	for(let i = 0; i < points.length / 2; i++) {
		let p1 = points[i];
		let p2 = points[points.length - 1 - i];
		p1 = {
			"pos": p1.pos,
			"uv": new Vector2(p1.uv.x * side.texSize.x, p1.uv.y * side.texSize.y),
			"lm": new Vector2(p1.uv.x * side.lightmapscale, p1.uv.y * side.lightmapscale)
		};
		p2 = {
			"pos": p2.pos,
			"uv": new Vector2(p2.uv.x * side.texSize.x, p2.uv.y * side.texSize.y),
			"lm": new Vector2(p2.uv.x * side.lightmapscale, p2.uv.y * side.lightmapscale)
		};

	result +=
			"   (\n"
			+`    v ${p1.pos.toStr()} t ${p1.uv.toStr()} ${p1.lm.toStr()}\n`
			+`    v ${p2.pos.toStr()} t ${p2.uv.toStr()} ${p2.lm.toStr()}\n`
			+"   )\n";

	}

	result	+=	"  }\n"
			+	" }\n";
	return result;
}

function convertDisplacement(side) {
	let points = side.points;
	let disp = side.dispinfo;
	let result = "";
	// find the index of disp.startposition in points
	let startIndex;
	for(let i = 0; i < 4; i++) { // displacements can only be created using a brush side side with 4 points
		if(points[i].pos.equals(disp.startposition)) {
			startIndex = i;
			break;
		}				
	}

	let a = points[startIndex]; // startpos					a -------> b
	let b = points[(startIndex + 1) % 4]; // adjacent		|
	let c = points[(startIndex + 3) % 4]; // adjacent		˅
	let d = points[(startIndex + 2) % 4]; // opposite		c -------> d

	if(typeof a == "undefined") {
		for(let i = 0; i < 4; i++) { // displacements can only be created using a brush side side with 4 points
			console.log(points[i].pos.subtract(disp.startposition).len());				
		}
		return "";
	}

	let ab = getDispPoints(a, b, disp.power);
	let cd = getDispPoints(c, d, disp.power);

	let rows = [];
	for(let i = 0; i < ab.length; i++) {
		rows[i] = getDispPoints(ab[i], cd[i], disp.power);
	}

	let alpha = false;

	result	+=	" {\n"
					+	"  mesh\n"
					+	"  {\n"
					//+	`  ${side.material}\n`
					+	`  berlin_ceilings_metal2\n`
					+	`  ${randomLightmap()}\n`
					+	`  ${rows[0].length} ${rows[0].length} ${side.lightmapscale} 8\n`

	for(let i = 0; i < rows.length; i++) {
		let row = rows[i];
		result += "   (\n";
		for (let j = 0; j < row.length; j++) {
			if(disp.row[j].alphas[i] != 0 && alpha != true)
				alpha = true;
			
			let col = row[j];

			let pos = col.pos.add(0,0,disp.elevation).add(disp.row[j].normals[i].multiply(disp.row[j].distances[i]));
			let uv = new Vector3(col.uv.x * side.texSize.x, col.uv.y * side.texSize.y);
			let lm = new Vector3(col.uv.x * side.lightmapscale, col.uv.y * side.lightmapscale);
			result += `    v ${pos.toStr()} t ${uv.toStr()} ${lm.toStr()}\n`;
		}
		result 		+= "   )\n";
	}
	result			+=	"  }\n"
					+	" }\n";

	if(!alpha)
		return result;
	// if the displacement has a blend textrue and is painted

	result	+=	" {\n"
					+	"  mesh\n"
					+	"  {\n"
					//+	`  {side.material}\n`
					+	`  okinawa_terrain_mud_puddledirt_blend\n`
					+	`  ${randomLightmap()}\n`
					+	`  ${rows[0].length} ${rows[0].length} ${side.lightmapscale} 8\n`

	for(let i = 0; i < rows.length; i++) {
		let row = rows[i];
		result += "   (\n";
		for (let j = 0; j < row.length; j++) {
			let col = row[j];
			let pos = col.pos.add(0,0,disp.elevation).add(disp.row[j].normals[i].multiply(disp.row[j].distances[i]));
			let uv = new Vector2(col.uv.x * side.texSize.x, col.uv.y * side.texSize.y);
			let lm = new Vector2(col.uv.x * side.lightmapscale, col.uv.y * side.lightmapscale);
				if(disp.row[j].alphas[i] == 0) {
					result += `    v ${pos.toStr()} t ${uv.toStr()} ${lm.toStr()}\n`;
				} else {
					let c = "255 255 255 " + (255 - disp.row[j].alphas[i]);
					result += `    v ${pos.toStr()} c ${c} t ${uv.toStr()} ${lm.toStr()}\n`;
				}

		}
		result 		+= "   )\n";
	}
	result			+=	"  }\n"
					+	" }\n";

	return result;
}

function convertBrush(brush) {
	let classnames = ["func_detail","func_brush","func_illusionary","func_breakable","func_breakable_surf","func_door","func_door_rotating",
					"func_ladder","func_door","func_movelinear","func_lod","func_lookdoor","func_physbox","func_physbox_multiplayer",
					"func_rotating","func_tank","func_tankairboatgun","func_tankapcrocket","func_tanklaser","func_tankmortar",
					"func_tankphyscannister","func_tankpulselaser","func_tankrocket","func_tanktrain","func_trackautochange","func_trackchange",
					"func_tracktrain","func_traincontrols","func_wall","func_wall_toggle","func_water_analog"];

	let tools = {
		"toolsnodraw":				"caulk",
		"toolsclip":				"clip",
		"toolsplayerclip":			"clip",
		"toolsinvisible":			"clip",
		"toolsinvisibleladder":		"clip",
		"toolsnpcclip":				"clip",
		"toolsgrenadeclip":			"clip_missile",
		"toolsblack":				"global_black",
		"toolsareaportal":			"portal_nodraw",
		"toolsblocklight":			"shadowcaster",
		"toolshint":				"hint",
		"toolsskip":				"skip",
		"toolsskybox":				"sky_berlin1"
	};

	let result = " {\n";
	if(classnames.includes(brush.entity)) {
		result += "  contents detail;\n"
	} else if(brush.entity == "func_illusionary") {
		result += "  contents nonColliding;\n"
	} else if(brush.entity == "world" || brush.entity == "func_areaportal") {
		// do nothing. structural brushes and portals don"t need to be specified
	} else {
		return "";
	}
	let material = "";
	for(let side of brush.sides) {
		if(side.material.startsWith("tools")) {
			let mat = basename(side.material);
			if(typeof tools[mat] == "undefined") {
				material = "caulk";
				console.log(mat);
			} else {
				material = tools[mat];
			}
		} else {
			material = "caulk";
		}
		result += `  ( ${side.p1.toStr()} ) ( ${side.p2.toStr()} ) ( ${side.p3.toStr()} ) ${material} 128 128 0 0 0 0 lightmap_gray 16384 16384 0 0 0 0\n`
	}
	result += " }\n";
	return result;
}

function convertEntity(entity) {
	let result = "{\n";
	for(const [key, value] of Object.entries(entity)) {
		result += ` "${key}" "${value}"\n`;
	}
	result += "}\n";
	return result;
}

function convertLight(entity) {
	// In Radiant, color value of light entities range between 0 and 1 whereas it varies between 0 and 255 in Source engine
	let color = (typeof entity._light == "string" ? new Vector3(entity._light) : new Vector3([255, 255, 255, 200])).divide(255);
	return convertEntity({
		"classname": "light",
		"origin": entity.origin,
		"radius": typeof color.Extra == "number" ? color.Extra : 200,
		"_color": color.toStr(),
		"def": "light_point_linear"
	});
}

function convertSpotlight(entity, count) {
	let color = (typeof entity._light == "string" ? new Vector3(entity._light) : new Vector3([255, 255, 255, 200])).divide(255);
	let origin = new Vector3(entity.origin);
	let angles = typeof entity.angles != "undefined" ? new Vector3(entity.angles) : new Vector3(0, 0, 0);
	let pitch = parseFloat(entity.pitch);
	angles = new Vector3(pitch, angles.z, angles.x);
	return convertEntity({
		"classname": "light",
		"origin": entity.origin,
		"radius": entity._cone,
		"_color": color.toStr(),
		"def": "light_point_linear",
		"target": `spotlight_${count}`
	})
		   + convertEntity({
		"classname": "info_null",
		// in order to place the info_null entity to point at the direction where the light entity should be looking at,
		// we need to rotate it around the light entity's axis
		"origin": origin.subtract(new Vector3(0, 0, parseInt(entity._cone))).rotateAround(origin, angles).toStr(),
		"targetname": `spotlight_${count}`
	});
}

function convertRope(entity) {
	let result = "";
	if(entity.classname == "move_rope") {
		result += convertEntity({
			"classname": "rope",
			"origin": entity.origin,
			"target": entity.NextKey,
			"length_scale": parseFloat(entity.Slack) / 127,
			"width": entity.Width
		});
		if(typeof entity.targetname != "undefined") {
			result += convertEntity({
				"classname": "info_null",
				"origin": entity.origin,
				"targetname": entity["targetname"]
			});
		}
	} else {
		result += convertEntity({
			"classname": "info_null",
			"origin": entity.origin,
			"targetname": entity.targetname
		});
		if(typeof entity.NextKey != "undefined") {
			result += convertEntity({
				"classname": "rope",
				"origin": entity.origin,
				"target": entity.NextKey,
				"length_scale": parseFloat(entity.Slack) / 125,
				"width": typeof entity.width != "undefined" ? entity.width : 1
			});
		}
	}
	return result;
}

function convertCorona(entity) {
	return convertEntity({
		"classname": "info_corona",
		"origin": entity.origin,
		// In Source, env_lightglow entities can have vertical and horizontal size values
		// In Cod, info_corona entites has radius property that affects both vertical and horizontal size of the lightflare effect
		"radius": (parseInt(entity.VerticalGlowSize) + parseInt(entity.HorizontalGlowSize)) / 2,
		"color": new Vector3(entity.rendercolor).divide(255).toStr()
	});
}

// create a cube 4 times smaller than the dimensions of the decal texture
// get the intersection points of the cube and the nearest brushes
// ???
// profit
function convertDecal(entity) {
	let textureSize = new Vector2(512, 512);
	let dim = 128; //textureSize.divide(4);
	let origin = new Vector3(entity.origin);

	let cube = [
		origin.add(dim, dim, dim),
		origin.add(dim, -dim, dim),
		origin.add(-dim, -dim, dim),
		origin.add(-dim, dim, dim),
		origin.add(dim, dim, -dim),
		origin.add(dim, -dim, -dim),
		origin.add(-dim, -dim, -dim),
		origin.add(-dim, dim, -dim),
	];
	return "";
}

function convertOverlay(entity) {
	return ""
}

export default function exportMap(vmfString) {
	const { worldBrushes, entities, entityBrushes} = readMap(vmfString);

	let mapPatches = "";
	let mapBrushes = "";
	let mapEnts = "";
	let spotLightCount = 0;
	const faces = {};

	// worldpsawn brushes
	for(let brush of worldBrushes) {
		if(!brush.hasDisplacement) {
			mapBrushes += convertBrush(brush);
		}
		for(let side of brush.sides) {
			faces[side.id] = side.points; // needed for decals/overlays later

			if(side.material.startsWith("tools"))
				continue;

			if(side.hasDisplacement) {
				mapPatches += convertDisplacement(side);
				continue;
			}

			if(brush.hasDisplacement)
				continue;

			mapPatches += convertSide(side);
		}
	}

	// entity brushes
	for(let brush of entityBrushes) {
		if(!brush.hasDisplacement) {
			mapBrushes += convertBrush(brush);
		}
		for(let side of brush.sides) {
			faces[side.id] = side.points; // needed for decals/overlays later

			if(side.material.startsWith("tools"))
				continue;

			if(side.hasDisplacement) {
				mapPatches += convertDisplacement(side);
				continue;
			}

			if(brush.hasDisplacement)
				continue;

			mapPatches += convertSide(side);
		}
	}

	// entites
	for(let entity of entities) {
		if(entity.classname == "env_cubemap") {
			mapEnts += convertEntity({
				"classname": "reflection_probe",
				"origin": new Vector3(entity.origin).toStr()
			});
		} else if(entity.classname == "light") {
			mapEnts += convertLight(entity);
		} else if(entity.classname == "move_rope" || entity.classname == "keyframe_rope") {
			mapEnts += convertRope(entity);
		} else if(entity.classname == "light_spot") {
			mapEnts += convertSpotlight(entity, spotLightCount++);
		} else if(entity.classname == "infodecal") {
			mapEnts += convertDecal(entity, faces);
		} else if(entity.classname == "info_overlay") {
			mapEnts += convertOverlay(entity, faces);
		}
	}

	let result = "iwmap 4\n"
	+"{\n"
	+' "classname" "worldspawn"\n'
	+mapPatches
	+mapBrushes
	+"}\n"
	+mapEnts
	+"{\n"
	+' "origin" "5168 5172 -823"\n' // temporary entity. will be deleted later.
	+' "angles" "0 180 0"\n'
	+' "classname" "info_player_start"\n'
	+"}\n";

	return result;
}
