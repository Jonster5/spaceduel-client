export class Vec2 {
	x: number;
	y: number;

	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	static from(v: Vec2 | number[] | { x: number; y: number }): Vec2 {
		if (v instanceof Array) {
			return new Vec2(v[0], v[1]);
		} else {
			return new Vec2(v.x, v.y);
		}
	}

	static fromAngle(angle: number): Vec2 {
		return new Vec2(Math.cos(angle % (2 * Math.PI)), Math.sin(angle % (2 * Math.PI)));
	}

	static fromPolar(r: number, angle: number): Vec2 {
		return new Vec2(r * Math.cos(angle % (2 * Math.PI)), r * Math.sin(angle % (2 * Math.PI)));
	}

	static random(): Vec2 {
		return new Vec2(Math.random() * 2 - 1, Math.random() * 2 - 1);
	}

	add(v: Vec2 | number): Vec2 {
		if (typeof v === 'number') {
			this.x += v;
			this.y += v;

			return this;
		} else {
			this.x += v.x;
			this.y += v.y;

			return this;
		}
	}

	static add(a: Vec2, b: Vec2 | number): Vec2 {
		if (typeof b === 'number') return new Vec2(a.x + b, a.y + b);
		else return new Vec2(a.x + b.x, a.y + b.y);
	}

	sub(v: Vec2 | number): Vec2 {
		if (typeof v === 'number') {
			this.x -= v;
			this.y -= v;

			return this;
		} else {
			this.x -= v.x;
			this.y -= v.y;

			return this;
		}
	}

	static sub(a: Vec2, b: Vec2 | number): Vec2 {
		if (typeof b === 'number') return new Vec2(a.x - b, a.y - b);
		else return new Vec2(a.x - b.x, a.y - b.y);
	}

	mul(v: Vec2 | number): Vec2 {
		if (typeof v === 'number') {
			this.x *= v;
			this.y *= v;

			return this;
		} else {
			this.x *= v.x;
			this.y *= v.y;

			return this;
		}
	}

	static mul(a: Vec2, b: Vec2 | number): Vec2 {
		if (typeof b === 'number') return new Vec2(a.x * b, a.y * b);
		else return new Vec2(a.x * b.x, a.y * b.y);
	}

	div(v: Vec2 | number): Vec2 {
		if (typeof v === 'number') {
			this.x /= v;
			this.y /= v;

			return this;
		} else {
			this.x /= v.x;
			this.y /= v.y;

			return this;
		}
	}

	static div(a: Vec2, b: Vec2 | number): Vec2 {
		if (typeof b === 'number') return new Vec2(a.x / b, a.y / b);
		else return new Vec2(a.x / b.x, a.y / b.y);
	}

	dot(v: Vec2): number {
		return this.x * v.x + this.y * v.y;
	}

	get width(): number {
		return this.x;
	}

	set width(w: number) {
		this.x = w;
	}

	get height(): number {
		return this.y;
	}

	set height(h: number) {
		this.y = h;
	}

	perpRight() {
		const x = this.y;
		const y = -this.x;

		this.x = x;
		this.y = y;

		return this;
	}

	perpLeft() {
		const x = -this.y;
		const y = this.x;

		this.x = x;
		this.y = y;

		return this;
	}

	unit(): Vec2 {
		const m = this.mag();

		if (m > 0) {
			this.x /= m;
			this.y /= m;
		}

		return this;
	}

	static unit(v: Vec2): Vec2 {
		const m = v.mag();

		if (m > 0) {
			return new Vec2(v.x / m, v.y / m);
		}

		return new Vec2(0, 0);
	}

	angle(): number {
		return (2 * Math.PI + Math.atan2(this.y, this.x)) % (2 * Math.PI);
	}

	/**
	 * Returns the angle of the input vector relative to this vector
	 */
	angleTo(v: Vec2): number {
		return (2 * Math.PI + Math.atan2(v.y - this.y, v.x - this.x)) % (2 * Math.PI);
	}

	setAngle(angle: number): Vec2 {
		const m = this.mag();

		this.x = m * Math.cos(angle);
		this.y = m * Math.sin(angle);

		return this;
	}

	mag(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	magSq(): number {
		return this.x * this.x + this.y * this.y;
	}

	setMag(m: number): Vec2 {
		const m2 = this.mag();

		if (m2 > 0) {
			this.x *= m / m2;
			this.y *= m / m2;
		}

		return this;
	}

	set(x: number | [number, number] | { x: number; y: number }, y?: number): Vec2 {
		if (x instanceof Array) {
			this.x = x[0];
			this.y = x[0];
		} else if (typeof x === 'object') {
			this.x = x.x;
			this.y = x.y;
		} else if (typeof x === 'number' && y !== undefined) {
			this.x = x;
			this.y = y;
		}

		return this;
	}

	setFromAngle(angle: number): Vec2 {
		this.x = Math.cos(angle % (2 * Math.PI));
		this.y = Math.sin(angle % (2 * Math.PI));

		return this;
	}

	setFromPolar(r: number, angle: number): Vec2 {
		this.x = r * Math.cos(angle % (2 * Math.PI));
		this.y = r * Math.sin(angle % (2 * Math.PI));

		return this;
	}

	random(): Vec2 {
		this.x = Math.random() * 2 - 1;
		this.y = Math.random() * 2 - 1;

		return this;
	}

	clone(): Vec2 {
		return new Vec2(this.x, this.y);
	}

	toArray(): [number, number] {
		return [this.x, this.y];
	}

	toObject(): { x: number; y: number } {
		return { x: this.x, y: this.y };
	}

	toString(): string {
		return `Vec2(${this.x}, ${this.y})`;
	}

	fromString(s: string): Vec2 {
		const [x, y] = s.split(',');
		return new Vec2(parseFloat(x.slice(x.indexOf('(')! + 1)), parseFloat(y.slice(0, y.length - 1)));
	}

	clamp(min: Vec2 | number, max: Vec2 | number): Vec2 {
		if (typeof min === 'number') {
			this.x = Math.max(min, this.x);
			this.y = Math.max(min, this.y);
		} else if (min instanceof Vec2) {
			this.x = Math.max(min.x, this.x);
			this.y = Math.max(min.y, this.y);
		}

		if (typeof max === 'number') {
			this.x = Math.min(max, this.x);
			this.y = Math.min(max, this.y);
		} else if (max instanceof Vec2) {
			this.x = Math.min(max.x, this.x);
			this.y = Math.min(max.y, this.y);
		}

		return this;
	}

	static clamp(v: Vec2, min: Vec2 | number, max: Vec2 | number): Vec2 {
		const n = v.clone();

		if (typeof min === 'number') {
			n.x = Math.max(min, n.x);
			n.y = Math.max(min, n.y);
		} else if (min instanceof Vec2) {
			n.x = Math.max(min.x, n.x);
			n.y = Math.max(min.y, n.y);
		}

		if (typeof max === 'number') {
			n.x = Math.min(max, n.x);
			n.y = Math.min(max, n.y);
		} else if (max instanceof Vec2) {
			n.x = Math.min(max.x, n.x);
			n.y = Math.min(max.y, n.y);
		}

		return n;
	}

	clampMag(min: number, max: number): Vec2 {
		const m = this.mag();

		if (m > max) {
			this.setMag(max);
		} else if (m < min) {
			this.setMag(min);
		}

		return this;
	}

	static clampMag(v: Vec2, min: number, max: number): Vec2 {
		const m = v.mag();

		if (m > max) {
			return new Vec2((v.x * max) / m, (v.y * max) / m);
		} else if (m < min) {
			return new Vec2((v.x * min) / m, (v.y * min) / m);
		}

		return v;
	}

	lerp(v: Vec2, t: number): Vec2 {
		this.x += (v.x - this.x) * t;
		this.y += (v.y - this.y) * t;

		return this;
	}

	static lerp(a: Vec2, b: Vec2, t: number): Vec2 {
		return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
	}

	equals(v: Vec2): boolean {
		return this.x === v.x && this.y === v.y;
	}

	closeTo(v: Vec2, epsilon: number): boolean {
		return Math.abs(this.x - v.x) <= epsilon && Math.abs(this.y - v.y) <= epsilon;
	}

	distanceTo(v: Vec2): number {
		const dx = this.x - v.x;
		const dy = this.y - v.y;

		return Math.sqrt(dx * dx + dy * dy);
	}

	distanceToSq(v: Vec2): number {
		const dx = this.x - v.x;
		const dy = this.y - v.y;

		return dx * dx + dy * dy;
	}

	manhattan(): number {
		return Math.abs(this.x) + Math.abs(this.y);
	}

	manhattanDistanceTo(v: Vec2): number {
		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
	}

	round(): Vec2 {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);

		return this;
	}

	static round(v: Vec2): Vec2 {
		return new Vec2(Math.round(v.x), Math.round(v.y));
	}

	floor(): Vec2 {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);

		return this;
	}

	static floor(v: Vec2): Vec2 {
		return new Vec2(Math.floor(v.x), Math.floor(v.y));
	}

	ceil(): Vec2 {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);

		return this;
	}

	static ceil(v: Vec2): Vec2 {
		return new Vec2(Math.ceil(v.x), Math.ceil(v.y));
	}

	roundToZero(): Vec2 {
		this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
		this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);

		return this;
	}

	static roundToZero(v: Vec2): Vec2 {
		return new Vec2(v.x < 0 ? Math.ceil(v.x) : Math.floor(v.x), v.y < 0 ? Math.ceil(v.y) : Math.floor(v.y));
	}

	min(v: Vec2): Vec2 {
		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);

		return this;
	}

	static min(a: Vec2, b: Vec2): Vec2 {
		return new Vec2(Math.min(a.x, b.x), Math.min(a.y, b.y));
	}

	max(v: Vec2): Vec2 {
		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);

		return this;
	}

	static max(a: Vec2, b: Vec2): Vec2 {
		return new Vec2(Math.max(a.x, b.x), Math.max(a.y, b.y));
	}

	map(fn: (v: number) => number): Vec2 {
		this.x = fn(this.x);
		this.y = fn(this.y);

		return this;
	}

	static map(v: Vec2, fn: (v: number) => number): Vec2 {
		return new Vec2(fn(v.x), fn(v.y));
	}

	freeze(): Vec2 {
		Object.freeze(this);

		return this;
	}

	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
	}
}
