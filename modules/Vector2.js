import { deg2rad } from "./Static.js";

class Vector2 {
	/**
	 * @param {string | number} x
	 * @param {number} y
	 */
	constructor(x, y) {
		if (typeof x == "string") {
			let points = x.split(" ");
			this.x = parseFloat(points[0]);
			this.y = parseFloat(points[1]);
		} else {
			this.x = x === undefined ? 0 : x;
			this.y = y === undefined ? 0 : y;
		}
	}

	/**
	 * @param {Vector2 | number} v
	 */
	add(v) {
		if (typeof v == "object") {
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

	/**
	 * @param {Vector2 | number} v
	 */
	subtract(v) {
		if (typeof v == "object") {
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

	/**
	 * @param {Vector2 | number} v
	 */
	multiply(v) {
		if (typeof v == "object") {
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


	/**
	 * @param {Vector2 | number} v
	 */
	divide(v) {
		if (typeof v == "object") {
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

	/**
	 * @param {Vector2} v
	 * @param {number} alpha
	 */
	lerp(v, alpha) {
		return new Vector2(
			this.x + (v.x - this.x) * alpha,
			this.y + (v.y - this.y) * alpha,
		);
	}

	/**
	 * @param {number} angle
	 */
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

	toStr() {
		return `${parseFloat(this.x.toFixed(6)).toString()} ${parseFloat(this.y.toFixed(6)).toString()}`;
	}
}

export default Vector2;
