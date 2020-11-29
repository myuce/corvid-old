const { deg2rad } = require("./Static");

class Vector2 {
	constructor(x, y) {
		if(typeof x == "string") {
			let points = x.split(" ");
			this.x = parseFloat(points[0]);
			this.y = parseFloat(points[1]);
		} else {
			this.x = x === undefined ? 0 : x;
			this.y = y === undefined ? 0 : y;
		}
	}

	add(v) {
		if(typeof v == "object") {
			return new Vector2(
				this.x + v.x,
				this.y + v.y,
			);
		} else {
			return new Vector2(
				this.x + v,
				this.y + v,
			);
		}
	}
	
	subtract(v) {
		if(typeof v == "object") {
			return new Vector2(
				this.x - v.x,
				this.y - v.y,
			);
		} else {
			return new Vector2(
				this.x - v,
				this.y - v,
			);
		}
	}
	
	multiply(v) {
		if(typeof v == "object") {
			return new Vector2(
				this.x * v.x,
				this.y * v.y,
			);
		} else {
			return new Vector2(
				this.x * v,
				this.y * v,
			);
		}
	}
	
	divide(v) {
		if(typeof v == "object") {
			return new Vector2(
				this.x / v.x,
				this.y / v.y,
			);
		} else {
			return new Vector2(
				this.x / v,
				this.y / v,
			);
		}
	}
	
	absolute() {
		return new Vector2(
			Math.abs(this.x),
			Math.abs(this.y),
		);
	}

	
	equals(obj) {
		if(obj instanceof Vector2) {
			return this.subtract(obj).len() < 0.01;
		}
		return false;
	}

	lerp(v, alpha) {
		return new Vector2(
			this.x + (v.x - this.x) * alpha,
			this.y + (v.y - this.y) * alpha,
		);
	}

	rotate(angle) {
		let c = Math.cos(deg2rad(angle));
		let s = Math.sin(deg2rad(angle));
		return new Vector2(
			this.x * c - this.y * s,
			this.x * s + this.y * c
		);
	}

	flip() {
		return new Vector2(this.y, this.x);
	}

	toFixed(num) {
		return new Vector2(this.x.toFixed(num), this.y.toFixed(num));
	}

	toStr() {
		return `${parseFloat(this.x.toFixed(6)).toString()} ${parseFloat(this.y.toFixed(6)).toString()}`;
	}
}

module.exports = Vector2;