import { ECSEvent, type ECS, Component, With } from './ecs/engine';
import { Vec2 } from './ecs/math';
import { Canvas, Root, Sprite } from './ecs/plugins/graphics';
import { Time } from './ecs/plugins/time';
import { Transform } from './ecs/plugins/transform';

export class Laser extends Component {
	constructor(public tLeft: number) {
		super();
	}
}

export class FireLaserEvent extends ECSEvent {
	constructor(public pos: Vec2, public angle: number, public vel: Vec2) {
		super();
	}
}

function fireLaser(ecs: ECS) {
	const fireLaser = ecs.getEventReader(FireLaserEvent);
	if (!fireLaser.available()) return;

	const { pos, angle, vel } = fireLaser.get();
	const root = ecs.query([Root]).entity();

	const nvel = Vec2.from(vel).add(new Vec2(2000, 0).setAngle(angle));

	const laser = ecs.spawn(
		new Laser(2000),
		new Transform(new Vec2(30, 10), Vec2.from(pos), angle, nvel),
		new Sprite('rectangle', 'red')
	);

	root.addChild(laser);
}

function rotateLasers(ecs: ECS) {
	const laserQuery = ecs.query([Transform], With(Laser));
	if (laserQuery.empty()) return;

	const lasers = laserQuery.results(([t]) => t);

	lasers.forEach((l) => {
		l.angle = l.vel.angle();
	});
}

function wrapLasers(ecs: ECS) {
	const laserQuery = ecs.query([Transform], With(Laser));
	if (laserQuery.empty()) return;

	const [canvas] = ecs.query([Canvas]).single();
	const lasers = laserQuery.results(([t]) => t);

	lasers.forEach((l) => {
		if (l.pos.magSq() > (canvas.size.x / 2) ** 2) l.pos.mul(-1);
	});
}

function destroyLasers(ecs: ECS) {
	const laserQuery = ecs.query([Transform], With(Laser));
	if (laserQuery.empty()) return;

	const time = ecs.getResource(Time);
	laserQuery
		.entities()
		.map((e) => ecs.entity(e))
		.forEach((l) => {
			l.get(Laser).tLeft -= time.delta;
			if (l.get(Laser).tLeft < 0) l.destroy();
		});
}

export function LaserPlugin(ecs: ECS) {
	ecs.addComponentType(Laser)
		.addEventType(FireLaserEvent)
		.addMainSystems(fireLaser, rotateLasers, wrapLasers, destroyLasers);
}
