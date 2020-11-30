class Vector3 {
	constructor(x, y, z) {
		if(typeof x == "string") {
			let points = x.split(" ");
			this.x = parseFloat(points[0]);
			this.y = parseFloat(points[1]);
			this.z = parseFloat(points[2]);
		} else if(typeof x == "object") {
			this.x = parseFloat(x[0]),
			this.y = parseFloat(x[1]),
			this.z = parseFloat(x[2]),
			this.Extra = typeof x[3] != "undefined" ? parseFloat(x[3]) : ""
		} else {
			this.x = x === undefined ? 0 : x;
			this.y = y === undefined ? 0 : y;
			this.z = z === undefined ? 0 : z;
		}
	}

	// arithmetics
	add(v) {
		if(typeof v == "object") {
			return new Vector3(
				this.x + v.x,
				this.y + v.y,
				this.z + v.z
			);
		} else {
			return new Vector3(
				this.x + v,
				this.y + v,
				this.z + v
			);
		}
	}
	
	subtract(v) {
		if(typeof v == "object") {
			return new Vector3(
				this.x - v.x,
				this.y - v.y,
				this.z - v.z
			);
		} else {
			return new Vector3(
				this.x - v,
				this.y - v,
				this.z - v
			);
		}
	}
	
	multiply(v) {
		if(typeof v == "object") {
			return new Vector3(
				this.x * v.x,
				this.y * v.y,
				this.z * v.z
			);
		} else {
			return new Vector3(
				this.x * v,
				this.y * v,
				this.z * v
			);
		}
	}
	
	divide(v) {
		if(typeof v == "object") {
			return new Vector3(
				this.x / v.x,
				this.y / v.y,
				this.z / v.z
			);
		} else {
			return new Vector3(
				this.x / v,
				this.y / v,
				this.z / v
			);
		}
	}
	
	absolute() {
		return new Vector3(
			Math.abs(this.x),
			Math.abs(this.y),
			Math.abs(this.z)
		);
	}
	
	dot(v) {
		return (this.x * v.x) + (this.y * v.y) + (this.z * v.z);
	}
	
	sqrLen() {
		return this.dot(this);
	}
	
	len() {
		return Math.sqrt(this.sqrLen());
	}
	
	normalize() {
		return this.divide(this.len());
	}
	
	cross(v) {
		return new Vector3(
			this.y * v.z - this.z * v.y,
			this.z * v.x - this.x * v.z,
			this.x * v.y - this.y * v.x
		);
	}
	
	distance(v) {
		return Math.sqrt(
			Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2) + Math.pow(this.z - v.z, 2)
		);
	}
	
	equals(obj) {
		if(obj instanceof Vector3) {
			return this.subtract(obj).len().toFixed(2) <= 0.01;
		}
		return false;
	}

	lerp(v, alpha) {
		return new Vector3(
			this.x + (v.x - this.x) * alpha,
			this.y + (v.y - this.y) * alpha,
			this.z + (v.z - this.z) * alpha,
		);
	}
	
	// some intersection points are out of the boundaries of the convex shape we aim to create using intersecting planes
	// this method is used to detect and get rid of those illegal vertices
	isLegal(sides) {
		for(let side of sides) {
			let facing = this.subtract(side.center()).normalize();
			if(facing.dot(side.normal().normalize()) < -0.01) {
				return false;
			}
		}
		return true;
	}

	round() {
		return new Vector3(Math.round(this.x), Math.round(this.z), Math.round(this.z));
	}

	exec(func) { // for callbacks and stuff if needed
		return new Vector3(
			func(this.x),
			func(this.y),
			func(this.z)
		);
	}

	toQuat() {
		let c1 = Math.cos(this.y / 2);
		let c2 = Math.cos(this.x / 2);
		let c3 = Math.cos(this.z / 2);

		let s1 = Math.sin(this.y / 2);
		let s2 = Math.sin(this.x / 2);
		let s3 = Math.sin(this.z / 2);

		return {
			"x": s1 * c2 * c3 + c1 * s2 * s3,
			"y": c1 * s2 * c3 - s1 * c2 * s3,
			"z": c1 * c2 * s3 + s1 * s2 * c3,
			"w": c1 * c2 * c3 - s1 * s2 * s3
		};
	}

	multiplyQuat(quat) {
		let num = quat.x * 2;
		let num2 = quat.y * 2;
		let num3 = quat.z * 2;
		let num4 = quat.x * num;
		let num5 = quat.y * num2;
		let num6 = quat.z * num3;
		let num7 = quat.x * num2;
		let num8 = quat.x * num3;
		let num9 = quat.y * num3;
		let num10 = quat.w * num;
		let num11 = quat.w * num2;
		let num12 = quat.w * num3;

		return new Vector3(
			(1 - (num5 + num6)) * this.x + (num7 - num12) * this.y + (num8 + num11) * this.z,
			(num7 + num12) * this.x + (1 - (num4 + num6)) * this.y + (num9 - num10) * this.z,
			(num8 - num11) * this.x + (num9 + num10) * this.y + (1 - (num4 + num5)) * this.z
		);
	}

	rotateAround(pivot, angles) {
		return this.subtract(pivot).multiplyQuat(angles.toQuat()).add(pivot);
	}

	toStr() {
		return `${parseFloat(this.x.toFixed(6)).toString()} ${parseFloat(this.y.toFixed(6)).toString()} ${parseFloat(this.z.toFixed(6)).toString()}`;
	}
}

export default Vector3;
