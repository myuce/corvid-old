const VDF = require("vdf-parser");
const Vector3 = require("./Vector3");
const Side = require("./Side");
const Brush = require("./Brush");

function readEntityBrush(entity) {
	let solid = entity.solid;
	entity.solid = [];
	for(let brush of solid) {
		let solids = [];
		for(let i = 0; i < brush.side.length; i++) {
			solids.push(new Side(brush.side[i]));
		}
		entity.solid.push(new Brush(solids));
	}
	return entity;
}

const readMap = (vmf) => {
	const mapData = VDF.parse(vmf);

	var worldBrushes = [];
	var entityBrushes = [];
	var entities = [];
	// create an array of Side objects to iterate through them later
	for(let solid of mapData.world.solid) {
		let sides = [];
		for(let side of solid.side) {
			sides.push(new Side(side));
		}
		worldBrushes.push(new Brush(sides));
	}


	for(let entity of mapData.entity) {
		if(typeof entity.solid == "object") {
			if(typeof entity.solid.length == "undefined") { // entity has one brush
				let sides = [];
				for(let side of entity.solid.side) {
					sides.push(new Side(side));
				}
				entityBrushes.push(new Brush(sides, entity.classname));
			} else { // entity has multiple brushes
				for(let solid of entity.solid) {
					let sides = [];
					for(let side of solid.side) {
						sides.push(new Side(side));
					}
					entityBrushes.push(new Brush(sides, entity.classname))
				}
			}
		} else {
			entities.push(entity);
		}
	}

	return {
		'worldBrushes': worldBrushes,
		'entityBrushes': entityBrushes,
		'entities': entities
	};
}

module.exports = readMap;