import { Component, ECS, Resource } from '../../engine';
import { Vec2 } from '../../math/vec2';
import { Time } from '../time';
import { Transform } from '../transform';
import { Sprite, Root } from './sprite';

export class Canvas extends Component {
	constructor(
		public target: HTMLElement,
		public element: HTMLCanvasElement,
		public ctx: CanvasRenderingContext2D,
		public aspect: number,
		public size: Vec2,
		public zoom: number,
		public def: DOMMatrix,
		public root: number | null,
		public last: {
			zoom: number;
			tcw: number;
			tch: number;
		}
	) {
		super();
	}
}

export class CanvasSettings extends Resource {
	constructor(
		public settings: {
			target: HTMLElement;
			width: number;
			rendering?: 'crisp-edges' | 'pixelated';
			extraStyling?: string;
		}
	) {
		super();
	}
}

export function setupCanvas(ecs: ECS) {
	let { target, width, rendering, extraStyling } = ecs.getResource(CanvasSettings).settings;

	target = target ?? document.body;
	width = width ?? 1000;
	rendering = rendering ?? 'crisp-edges';

	const element = document.createElement('canvas');
	const ctx = element.getContext('2d')!;

	const dpr = window.devicePixelRatio ?? 1;
	const aspect = target.clientHeight / target.clientWidth;
	const tcw = target.clientWidth,
		tch = target.clientHeight;

	const size = new Vec2(width, width * aspect).freeze();

	const zoom = 1;

	element.width = size.width * dpr;
	element.height = size.height * dpr;

	ctx.setTransform(dpr, 0, 0, -dpr, element.width / 2, element.height / 2);
	// ctx.imageSmoothingEnabled = false;

	const def = ctx.getTransform();

	element.setAttribute(
		'style',
		`display: block; width: 100%; height: 100%; border: none; background: transparent; image-rendering: ${rendering}; ${extraStyling}`
	);

	element.addEventListener('contextmenu', (e) => e.preventDefault());

	target.appendChild(element);

	const root = ecs.spawn(new Sprite('none'), new Transform(), new Root());

	const canvas = ecs.spawn(new Canvas(target, element, ctx, aspect, size, zoom, def, root.id(), { zoom, tcw, tch }));
}

export function updateCanvasZoom(ecs: ECS) {
	const [canvas] = ecs.query([Canvas]).single();
	const { target, element, ctx, size, zoom, last } = canvas;

	if (zoom === last.zoom) return;

	const zratio = zoom / last.zoom;

	const width = size.width / zratio;

	const dpr = window.devicePixelRatio ?? 1;
	const aspect = target.clientHeight / target.clientWidth;

	const nsize = new Vec2(width, width * aspect);

	element.width = nsize.width * dpr;
	element.height = nsize.height * dpr;
	ctx.setTransform(dpr, 0, 0, -dpr, element.width / 2, element.height / 2);

	canvas.aspect = aspect;
	canvas.size = nsize;
	canvas.def = ctx.getTransform();

	last.zoom = zoom;
}

export function updateCanvasDimensions(ecs: ECS) {
	const [canvas] = ecs.query([Canvas]).single();
	const { target, element, ctx, size, last } = canvas;

	if (target.clientWidth === last.tcw && target.clientHeight === last.tch) return;

	const dpr = window.devicePixelRatio ?? 1;
	const aspect = target.clientHeight / target.clientWidth;

	const nsize = new Vec2(size.width, size.width * aspect);

	element.width = nsize.width * dpr;
	element.height = nsize.height * dpr;
	ctx.setTransform(dpr, 0, 0, -dpr, element.width / 2, element.height / 2);

	canvas.size = nsize;
	canvas.last.tcw = target.clientWidth;
	canvas.last.tch = target.clientHeight;
	canvas.def = ctx.getTransform();
}

export function renderCanvas(ecs: ECS) {
	const [canvas] = ecs.query([Canvas]).single();
	const time: Time = ecs.getResource(Time);

	const { ctx } = canvas;

	canvas.ctx.setTransform(canvas.def);

	canvas.ctx.clearRect(-canvas.size.x, -canvas.size.y, canvas.size.x * 2, canvas.size.y * 2);

	draw(time, canvas.root!);

	function draw(time: Time, sid: number) {
		const e = ecs.entity(sid);
		const sprite = e.get(Sprite);
		const transform = e.get(Transform);

		if (!sprite || !transform) return;

		if (!sprite.visible) return;

		const { pos, angle, size } = transform;
		const { type, material, filter, alpha, borderColor, borderWidth, ci } = sprite;

		ctx.save();

		ctx.translate(pos.x, pos.y);
		ctx.rotate(angle);

		if (filter) ctx.filter = filter;
		ctx.globalAlpha = alpha;

		ctx.save();
		ctx.scale(1, -1);

		ctx.beginPath();

		if (type === 'rectangle') ctx.rect(-size.x / 2, -size.y / 2, size.x, size.y);
		else if (type === 'ellipse') ctx.ellipse(0, 0, size.x / 2, size.y / 2, 0, 0, 2 * Math.PI);

		if ((type === 'rectangle' || type === 'ellipse') && !(material instanceof Array)) {
			if (material) {
				ctx.fillStyle = material as string | CanvasGradient | CanvasPattern;
				ctx.fill();
			}
			if (borderColor && borderWidth) {
				ctx.strokeStyle = borderColor;
				ctx.lineWidth = borderWidth;
				ctx.stroke();
			}
		} else if (type === 'image' && material instanceof Array) {
			ctx.drawImage((material as CanvasImageSource[])[ci], -size.x / 2, -size.y / 2, size.x, size.y);
		}

		ctx.restore();

		if (e.children().length > 0) {
			for (let child of e.children()) draw(time, child);
		}

		ctx.restore();
	}
}
