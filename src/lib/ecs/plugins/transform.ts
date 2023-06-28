import { Component, ECS, type ECSPlugin } from '../engine';
import { Entity } from '../engine/entity';
import { Vec2 } from '../math/vec2';
import { Time } from './time';

export class Transform extends Component {
	constructor(
		public size: Vec2 = new Vec2(0, 0),
		public pos: Vec2 = new Vec2(0, 0),
		public angle: number = 0,
		public vel: Vec2 = new Vec2(0, 0),
		public avel: number = 0,
		public last: {
			pos: Vec2;
			angle: number;
		} = {
			pos: pos.clone(),
			angle,
		}
	) {
		super();
	}
}

export function updateTransform(ecs: ECS) {
	if (!document.hasFocus()) return;

	const time = ecs.getResource(Time);

	const transforms = ecs.query([Transform]).results(([x]) => x);

	transforms.forEach((t) => {
		t.last.pos.set(t.pos);
		t.last.angle = t.angle;

		t.pos.add(t.vel.clone().mul((time.delta * time.speed) / 1000));
		t.angle += ((time.delta * time.speed) / 1000) * t.avel;
	});
}

export function globalPos(e: Entity): Vec2 {
	if (!e.has(Transform)) throw new Error(`Entity ${e.id()} must have component [Transform]`);

	const t = e.get(Transform);

	if (e.parent() !== undefined && e.ecs.entity(e.parent()).has(Transform)) {
		return globalPos(e.ecs.entity(e.parent())).add(t.pos);
	} else {
		return new Vec2(0, 0);
	}
}

export function globalAngle(e: Entity): number {
	const t = e.get(Transform);

	if (e.parent() !== undefined && e.ecs.entity(e.parent()).has(Transform)) {
		return globalAngle(e.ecs.entity(e.parent())) + t.angle;
	} else {
		return 0;
	}
}

export function globalVel(e: Entity): Vec2 {
	const t = e.get(Transform);

	if (e.parent() !== undefined && e.ecs.entity(e.parent()).has(Transform)) {
		return globalVel(e.ecs.entity(e.parent())).add(t.vel);
	} else {
		return new Vec2(0, 0);
	}
}

export function globalAvel(e: Entity): number {
	const t = e.get(Transform);

	if (e.parent() !== undefined && e.ecs.entity(e.parent()).has(Transform)) {
		return globalAvel(e.ecs.entity(e.parent())) + t.avel;
	} else {
		return 0;
	}
}

export function checkTransformCompatibility(ecs: ECS) {
	const hasTime = !!ecs.getResource(Time);

	if (!hasTime) {
		throw new Error(`raxis-plugin-transform requires plugin [raxis-plugin-time]`);
	}
}

export function TransformPlugin(ecs: ECS) {
	ecs.addComponentType(Transform).addStartupSystem(checkTransformCompatibility).addMainSystem(updateTransform);
}
