const { getPlaneIntersection } = require("./Static");

class Brush {
	constructor(sides, entity = "world") {
		this.sides = sides;
		this.hasDisplacement = false;
		this.entity = entity != "world" ? entity : "world";
		this.getIntersectionPoints();
	}

	getIntersectionPoints() {
		for(let i = 0; i < this.sides.length - 2; i++) {
			for(let j = i; j < this.sides.length - 1 ; j++) {
				for(let k = j; k < this.sides.length; k++) {
					if(i != j != k) {
						let intersectionPoint = getPlaneIntersection(this.sides[i], this.sides[j], this.sides[k]);
						if(intersectionPoint != null && intersectionPoint.isLegal(this.sides)) {
							this.sides[i].points.push(intersectionPoint);
							this.sides[j].points.push(intersectionPoint);
							this.sides[k].points.push(intersectionPoint);
						}
					}
				}
			}
		}
		for(let i = 0; i < this.sides.length; i++) {
			this.sides[i].points = this.sides[i].sortVertices();
			if(this.sides[i].hasDisplacement == true)
				this.hasDisplacement = true;
		}
	}

}

module.exports = Brush;