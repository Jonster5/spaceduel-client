import type { ECS } from './ecs/engine';
import { Vec2 } from './ecs/math';
import { Canvas, Root, Sprite } from './ecs/plugins/graphics';
import { ParticleGenerator } from './ecs/plugins/particle';
import { Transform } from './ecs/plugins/transform';

export function createStarfield(ecs: ECS) {
	const root = ecs.query([Root]).entity();
	const [canvas] = ecs.query([Canvas]).single();

	const sf1 = ecs.spawn(
		new Transform(canvas.size.clone(), new Vec2(), 0, new Vec2(), 0.005),
		new Sprite('none'),
		new ParticleGenerator(200, (p) => {
			const rsize = Math.random() * 10;
			p.get(Transform).size.set(rsize, rsize);

			p.get(Sprite).material = '#222222';
		})
	);

	const sf2 = ecs.spawn(
		new Transform(canvas.size.clone(), new Vec2(), 0, new Vec2(), 0.01),
		new Sprite('none'),
		new ParticleGenerator(50, (p) => {
			const rsize = Math.random() * 10 + 5;
			p.get(Transform).size.set(rsize, rsize);

			p.get(Sprite).material = '#dddddd';
		})
	);

	root.addChildren(sf1, sf2);
}

export function BackgroundPlugin(ecs: ECS) {
	ecs.addStartupSystem(createStarfield);
}
