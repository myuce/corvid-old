import Side from "./Side.js";
import Vector3 from "./Vector3.js";

const PI = 3.141592;
/**
 * @param {number} deg
 */
const deg2rad = (deg) => { return deg * (PI / 180); };
/**
 * @param {number} rad
 */
const rad2deg = (rad) => { return rad * (180 / PI); };

/**
 * @param {Side} side1
 * @param {Side} side2
 * @param {Side} side3
 */
const getPlaneIntersection = (side1, side2, side3) => {
	var normal1 = side1.normal().normalize();
	var normal2 = side2.normal().normalize();
	var normal3 = side3.normal().normalize();

	var determinant = (
		(
			normal1.x * normal2.y * normal3.z +
			normal1.y * normal2.z * normal3.x +
			normal1.z * normal2.x * normal3.y
		)
		-
		(
			normal1.z * normal2.y * normal3.x +
			normal1.y * normal2.x * normal3.z +
			normal1.x * normal2.z * normal3.y
		)
	);

	// can't intersect parallel planes
	if ((determinant <= 0.01 && determinant >= -0.01) || isNaN(determinant)) {
		return null;
	}

	return (
		normal2.cross(normal3).multiply(side1.distance()).add(
			normal3.cross(normal1).multiply(side2.distance())).add(
				normal1.cross(normal2).multiply(side3.distance()))
	).divide(determinant);
}

export {
	PI,
	deg2rad,
	rad2deg,
	getPlaneIntersection
}
