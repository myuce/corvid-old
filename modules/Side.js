import Vector3 from "./Vector3.js";
import Vector2 from "./Vector2.js";

/**
 * @param {string} str
 */
const parseTriplets = (str) => {
	let res = [];
	let tok = str.split(" ");
	for (let i = 0; i < tok.length; i += 3) {
		res.push(new Vector3(parseFloat(tok[i]), parseFloat(tok[i + 1]), parseFloat(tok[i + 2])));
	}
	return res;
}
/**
 * @param {string} str
 */
const parseSinglet = (str) => {
	let res = [];
	let tok = str.split(" ");
	for (let i = 0; i < tok.length; i++) {
		res.push(parseFloat(tok[i]));
	}
	return res;
}

class Side {
	/**
	 * @param {{ id: string; plane: string; material: string; uaxis: any; vaxis: any; lightmapscale: string; dispinfo: any; }} data
	 */
	constructor(data) {
		this.id = parseInt(data.id);
		let plane = Array.from(data.plane.substring(1, data.plane.length - 1).split(") (")).map((tok) => {
			let r = tok.split(" ");
			return new Vector3(parseFloat(r[0]), parseFloat(r[1]), parseFloat(r[2]));
		});
		this.p1 = plane[0];
		this.p2 = plane[1];
		this.p3 = plane[2];

		this.material = data.material.toLowerCase();

		let uAxis = this.parseAxis(data.uaxis);
		this.uAxis = uAxis.axis;
		this.uOffset = uAxis.offset;
		this.uScale = uAxis.scale;

		let vAxis = this.parseAxis(data.vaxis);
		this.vAxis = vAxis.axis;
		this.vOffset = vAxis.offset;
		this.vScale = vAxis.scale;

		this.texSize = new Vector2(512, 512);
		this.lightmapscale = parseFloat(data.lightmapscale);

		this.points = [];

		this.hasDisplacement = typeof data.dispinfo != "undefined";
		this.dispinfo = typeof data.dispinfo ? this.processDisplacement(data.dispinfo) : false;
	}

	normal() {
		let ab = this.p2.subtract(this.p1);
		let ac = this.p3.subtract(this.p1);
		return ab.cross(ac);
	}

	center() {
		return this.p1.add(this.p2).add(this.p3).divide(3);
	}

	distance() {
		let normal = this.normal();
		return ((this.p1.x * normal.x) + (this.p1.y * normal.y) + (this.p1.z * normal.z)) / Math.sqrt(Math.pow(normal.x, 2) + Math.pow(normal.y, 2) + Math.pow(normal.z, 2));
	}

	/**
	 * @param {string} axis
	 */
	parseAxis(axis) {
		// [x y z o] s
		let res = axis.replace("[", "").replace("]", "0").trim().split(/[ ,]+/);
		return {
			'axis': new Vector3(parseFloat(res[0]), parseFloat(res[1]), parseFloat(res[2])),
			'offset': parseFloat(res[3]),
			'scale': parseFloat(res[4])
		}
	}

	pointCenter() {
		let center = new Vector3(0, 0, 0);
		for (let point of this.points) {
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

			if (normal.dot(caXcb) > 0) {
				return 1;
			}

			return -1;
		});

		let result = [];
		for (let point of points) {
			result.push({
				'pos': point,
				'uv': this.getUV(point)
			})
		}
		return result;
	}

	/**
	 * @param {{ p1: any; }} side
	 */
	equals(side) {
		return this.p1.equals(side.p1) && this.p1.equals(side.p1) && this.p1.equals(side.p1);
	}

	/**
	 * @param {{ dot: (arg0: Vector3) => number; }} vertex
	 */
	getUV(vertex) {
		let u = vertex.dot(this.uAxis) / (this.texSize.x * this.uScale) + (this.uOffset / this.texSize.x);
		let v = vertex.dot(this.vAxis) / (this.texSize.y * this.vScale) + (this.vOffset / this.texSize.y);
		return new Vector2(u, v);
	}


	/**
	 * @param {{ power: string; elevation: string; subdiv: string; startposition: string; normals: { [x: string]: string; }; distances: { [x: string]: string; }; offsets: { [x: string]: string; }; offset_normals: { [x: string]: string; }; alphas: { string }; triangle_tags: { string }; }} data
	 */
	processDisplacement(data) {
		if (typeof data == "undefined")
			return false;

		let result = {};
		result.power = parseInt(data.power);
		result.elevation = parseFloat(data.elevation);
		result.subdiv = data.subdiv == "1";
		result.startposition = parseTriplets(data.startposition.substring(1, data.startposition.length - 1))[0];
		/** @type {{ normals: Vector3[]; distances: number[]; offsets: Vector3[]; offset_normals: Vector3[]; alphas: number[]; triangle_tags: number[]; }[]} */
		result.row = [];
		for (let i = 0; i < Math.pow(2, result.power) + 1; i++) {
			result.row[i] = {
				'normals': parseTriplets(data.normals["row" + i]),
				'distances': parseSinglet(data.distances["row" + i]),
				'offsets': parseTriplets(data.offsets["row" + i]),
				'offset_normals': parseTriplets(data.offset_normals["row" + i]),
				'alphas': parseSinglet(data.alphas["row" + i]),
				'triangle_tags': i != Math.pow(2, result.power) ? parseSinglet(data.triangle_tags["row" + i]) : []
			};
		}
		return result;
	}
}

export default Side;
