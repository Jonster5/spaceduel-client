export function linear(x: number): number {
	return x;
}

export function SineIn(x: number): number {
	return 1 - Math.cos((x * Math.PI) / 2);
}

export function SineOut(x: number): number {
	return Math.sin((x * Math.PI) / 2);
}

export function SineInOut(x: number): number {
	return -(Math.cos(Math.PI * x) - 1) / 2;
}

export function QuadIn(x: number): number {
	return x * x;
}

export function QuadOut(x: number): number {
	return 1 - (1 - x) * (1 - x);
}

export function QuadInOut(x: number): number {
	return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export function CubicIn(x: number): number {
	return x * x * x;
}

export function CubicOut(x: number): number {
	return 1 - Math.pow(1 - x, 3);
}

export function CubicInOut(x: number): number {
	return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function QuartIn(x: number): number {
	return x * x * x * x;
}

export function QuartOut(x: number): number {
	return 1 - Math.pow(1 - x, 4);
}

export function QuartInOut(x: number): number {
	return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}

export function QuintIn(x: number): number {
	return x * x * x * x * x;
}

export function QuintOut(x: number): number {
	return 1 - Math.pow(1 - x, 5);
}

export function QuintInOut(x: number): number {
	return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

export function ExpoIn(x: number): number {
	return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

export function ExpoOut(x: number): number {
	return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

export function ExpoInOut(x: number): number {
	return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2;
}

export function CircIn(x: number): number {
	return 1 - Math.sqrt(1 - Math.pow(x, 2));
}

export function CircOut(x: number): number {
	return Math.sqrt(1 - Math.pow(x - 1, 2));
}

export function CircInOut(x: number): number {
	return x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

export function BackIn(x: number): number {
	const c1 = 1.70158;
	const c3 = c1 + 1;

	return c3 * x * x * x - c1 * x * x;
}

export function BackOut(x: number): number {
	const c1 = 1.70158;
	const c3 = c1 + 1;

	return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function BackInOut(x: number): number {
	const c1 = 1.70158;
	const c2 = c1 * 1.525;

	return x < 0.5
		? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
		: (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
}

export function ElasticIn(x: number): number {
	const c4 = (2 * Math.PI) / 3;

	return x === 0 ? 0 : x === 1 ? 1 : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
}

export function ElasticOut(x: number): number {
	const c4 = (2 * Math.PI) / 3;

	return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

export function ElasticInOut(x: number): number {
	const c5 = (2 * Math.PI) / 4.5;

	return x === 0
		? 0
		: x === 1
		? 1
		: x < 0.5
		? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
		: (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
}

export function BounceIn(x: number): number {
	return 1 - BounceOut(1 - x);
}

export function BounceOut(x: number): number {
	const n1 = 7.5625;
	const d1 = 2.75;

	if (x < 1 / d1) {
		return n1 * x * x;
	} else if (x < 2 / d1) {
		return n1 * (x -= 1.5 / d1) * x + 0.75;
	} else if (x < 2.5 / d1) {
		return n1 * (x -= 2.25 / d1) * x + 0.9375;
	} else {
		return n1 * (x -= 2.625 / d1) * x + 0.984375;
	}
}

export function BounceInOut(x: number): number {
	return x < 0.5 ? (1 - BounceOut(1 - 2 * x)) / 2 : (1 + BounceOut(2 * x - 1)) / 2;
}
