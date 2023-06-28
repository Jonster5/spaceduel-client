import { Component, ECS, Entity, With } from '../engine';
import { Vec2 } from '../math';
import { Sprite } from './graphics';
import { Time } from './time';
import { Transform } from './transform';

export class Particle extends Component {
	constructor(public tleft: number) {
		super();
	}
}

export class ParticleGenerator extends Component {
	constructor(
		public amount: number,
		public onGenerate: (p: Entity) => void = () => null,
		public duration: number = Infinity,
		public delay: number = 0,
		public repeat: boolean = false,
		public done: boolean = false,
		public tleft: number = 0
	) {
		super();
	}
}

function generateParticles(ecs: ECS) {
	const generators = ecs.query([ParticleGenerator, Transform], With(Sprite));
	const time = ecs.getResource(Time);

	generators.entities().forEach((genID) => {
		const gen = ecs.entity(genID);
		const g = gen.get(ParticleGenerator);
		const t = gen.get(Transform);

		if (g.done) return;

		g.tleft -= time.delta;
		if (g.tleft > 0) return;

		const b1 = t.pos.clone().sub(t.size.clone().div(2));
		const b2 = t.pos.clone().add(t.size.clone().div(2));

		for (let i = 0; i < g.amount; i++) {
			const rx = Math.random() * (b2.x - b1.x) + b1.x;
			const ry = Math.random() * (b2.y - b1.y) + b1.y;

			const e = ecs.spawn(
				new Particle(g.duration),
				new Transform(new Vec2(10, 10), new Vec2(rx, ry)),
				new Sprite('ellipse', 'white')
			);

			gen.addChild(e);

			g.onGenerate(e);
		}

		g.tleft = g.delay;
		if (!g.repeat) g.done = true;
	});
}

function destroyParticles(ecs: ECS) {
	const time = ecs.getResource(Time);
	const particles = ecs.query([Particle]).entities();

	particles.forEach((pid) => {
		const p = ecs.entity(pid).get(Particle);

		p.tleft -= time.delta;
		if (p.tleft > 0) return;

		ecs.destroy(pid);
	});
}

export function ParticlePlugin(ecs: ECS) {
	ecs.addComponentTypes(Particle, ParticleGenerator).addMainSystems(generateParticles, destroyParticles);
}
