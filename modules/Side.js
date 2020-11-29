const Vector3 = require("./Vector3");
const Vector2 = require("./Vector2");

const parseTriplets = (str) => {
	let res = [];
	let tok = str.split(" ");
	for(let i = 0; i < tok.length; i += 3) {
		res.push(new Vector3(`${tok[i]} ${tok[i + 1]} ${tok[i + 2]}`));
	}
	return res;
}
const parseSinglet = (str) => {
	let res = [];
	let tok = str.split(" ");
	for(let i = 0; i < tok.length; i++) {
		res.push(parseFloat(tok[i]));
	}
	return res;
}

class Side {
	constructor(data) {
		this.id = parseInt(data.id);
		var plane = data.plane.substring(1, data.plane.length -1).split(") (");
		this.p1 = new Vector3(plane[0]);
		this.p2 = new Vector3(plane[1]);
		this.p3 = new Vector3(plane[2]);

		this.material = data.material.toLowerCase();
		
		var uAxis = this.parseAxis(data.uaxis);
		this.uAxis = uAxis.axis;
		this.uOffset = uAxis.offset;
		this.uScale = uAxis.scale;
		
		var vAxis = this.parseAxis(data.vaxis);
		this.vAxis = vAxis.axis;
		this.vOffset = vAxis.offset;
		this.vScale = vAxis.scale;

		this.texSize = {"x": 512 * 2, "y": 512 * 2};
		this.lightmapscale = parseFloat(data.lightmapscale);

		this.points = [];

		this.hasDisplacement = typeof data.dispinfo != "undefined";
		this.dispinfo = typeof data.dispinfo ? this.processDisplacement(data.dispinfo) : false;
	}

	normal() {
		var ab = this.p2.subtract(this.p1);
		var ac = this.p3.subtract(this.p1);
		return ab.cross(ac);
	}

	center() {
		return this.p1.add(this.p2).add(this.p3).divide(3);
	}

	distance() {
		var normal = this.normal();
		return ((this.p1.x * normal.x) + (this.p1.y * normal.y) + (this.p1.z * normal.z)) / Math.sqrt(Math.pow(normal.x, 2) + Math.pow(normal.y, 2) + Math.pow(normal.z, 2));
	}

	parseAxis(axis) {
		// [x y z o] s
		axis = axis.replace("[","").replace("]","0").trim().split(/[ ,]+/);
		return {
			'axis': new Vector3(parseFloat(axis[0]), parseFloat(axis[1]), parseFloat(axis[2])),
			'offset': parseFloat(axis[3]),
			'scale': parseFloat(axis[4])
		}
	}

	pointCenter() {
		let center = new Vector3(0, 0, 0);
		for(let point of this.points) {
			center = center.add(point);
		}
		return center.divide(this.points.length);
	}

	sortVertices() {
		let center = this.pointCenter();
		let normal = this.normal();
		let points = Array.from(this.points).sort((a, b) => {
			let ca = new Vector3(a.x - center.x, a.y - center.y, a.z - center.z);
			let cb = new Vector3(b.x - center.x, b.y - center.y, b.z - center.z);
			let caXcb = ca.cross(cb);

			if(normal.dot(caXcb) > 0) {
				return 1;
			}

			return -1;
		});

		let result = [];
		for(let point of points) {
			result.push({
				'pos': point,
				'uv': this.getUV(point, {'x': 512, 'y': 512})
			})
		}
		return result;
	}

	equals(side) {
		return this.p1.equals(side.p1) && this.p1.equals(side.p1) && this.p1.equals(side.p1);
	}

	getUV(vertex, texSize = {'x': 512, 'y': 512}) {
		let u = vertex.dot(this.uAxis) / (texSize.x * this.uScale) + (this.uOffset / texSize.x);
		let v = vertex.dot(this.vAxis) / (texSize.y * this.vScale) + (this.vOffset / texSize.y);
		return new Vector2(u, v);
	}


	processDisplacement(data) {
		if(typeof data == "undefined")
			return false;

		let result = {};
		result.power = parseInt(data.power);
		result.elevation = parseFloat(data.elevation);
		result.subdiv = data.subdiv == "1";
		result.startposition = new Vector3(data.startposition.substring(1, data.startposition.length -1));
		result.row = [];
		for(let i = 0; i < Math.pow(2,result.power) + 1; i++) {
			result.row[i] = {
				'normals': parseTriplets(data.normals["row" + i]),
				'distances': parseSinglet(data.distances["row" + i]),
				'offsets': parseTriplets(data.offsets["row" + i]),
				'offset_normals': parseTriplets(data.offset_normals["row" + i]),
				'alphas': parseSinglet(data.alphas["row" + i]),
				'triangle_tags': i != Math.pow(2,result.power) ? parseSinglet(data.triangle_tags["row" + i]) : []
			};
		}
		return result;
	}
}

module.exports = Side;