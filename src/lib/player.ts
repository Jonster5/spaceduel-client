import { Component, ECSEvent, type ECS, With, Resource } from './ecs/engine';
import { Vec2 } from './ecs/math';
import { Assets, loadImageFile, loadSoundFile } from './ecs/plugins/assets';
import { SoundEffect, addAudio } from './ecs/plugins/audio';
import { Sound } from './ecs/plugins/audio/sound';
import { Canvas, Root, Sprite, startImageAnimation } from './ecs/plugins/graphics';
import { Inputs } from './ecs/plugins/input';
import { ParticleGenerator } from './ecs/plugins/particle';
import { Time } from './ecs/plugins/time';
import { Transform } from './ecs/plugins/transform';
import {
	DynamicTween,
	QuadIn,
	QuadOut,
	Tween,
	TweenBase,
	TweenManager,
	addTween,
	getTween,
	removeTween,
} from './ecs/plugins/tween';
import { FireLaserEvent } from './laser';
import { Mass } from './physics';

export class Player extends Component {
	constructor(
		public thrustSprites: {
			main: number;
		},
		public thrustOn: {
			main: boolean;
		} = {
			main: false,
		}
	) {
		super();
	}
}

export class PlayerShootTimer extends Resource {
	constructor(public tLeft: number) {
		super();
	}
}

export class SpawnPlayerEvent extends ECSEvent {}

export class RemovePlayerEvent extends ECSEvent {}

async function loadPlayerData(ecs: ECS) {
	const assets = ecs.getResource(Assets);

	assets['click'] = await loadSoundFile('click.mp3');
	assets['playerimg'] = await loadImageFile('fighter.png');
}

function spawnPlayer(ecs: ECS) {
	const sp = ecs.getEventReader(SpawnPlayerEvent);
	if (!sp.available()) return;
	if (!ecs.query([], With(Player)).empty()) return;
	const assets = ecs.getResource(Assets);
	const root = ecs.query([], With(Root)).entity();

	const pt = new Transform(new Vec2(96, 63), new Vec2(600, 0), 0, new Vec2(0, Math.sqrt(1e8 / 600)));

	const main = ecs.spawn(
		new Transform(new Vec2(1, 15), new Vec2(-26, 0)),
		new Sprite('none'),
		new ParticleGenerator(
			0,
			(p) => {
				const t = p.get(Transform);
				const s = p.get(Sprite);

				t.size.set(30, 3);
				t.vel.set(Math.random() * -1000, 400 * Math.random() - 200);
				t.angle = t.vel.angle();

				s.type = 'rectangle';

				const rc = Math.random();
				if (rc < 0.3) s.material = '#fa523c';
				else if (rc < 0.6) s.material = '#fa753c';
				else if (rc < 0.9) s.material = '#fab13c';
				else s.material = '#7e3cfa';

				addTween(p, 'fade', new Tween(s, { alpha: 0 }, 200));
			},
			200,
			30,
			true
		)
	);

	const player = ecs.spawn(
		new Player({ main: main.id() }),
		new Mass(100),
		pt,
		new Sprite('image', [assets['playerimg']])
	);

	player.addChildren(main);

	root.addChild(player);
}

function shoot(ecs: ECS) {
	if (!ecs.hasLocalResource(PlayerShootTimer)) ecs.insertLocalResource(new PlayerShootTimer(0));

	const time = ecs.getResource(Time);
	ecs.getLocalResource(PlayerShootTimer).tLeft -= time.delta;
	if (ecs.getLocalResource(PlayerShootTimer).tLeft > 0) return;

	const playerQuery = ecs.query([Transform], With(Player));
	if (playerQuery.empty()) return;

	const { keymap } = ecs.getResource(Inputs);

	if (keymap.get(' ').isUp) return;

	const fle = ecs.getEventWriter(FireLaserEvent);
	const [pt] = playerQuery.single();

	fle.send(new FireLaserEvent(pt.pos.clone(), pt.angle, pt.vel.clone()));
	ecs.getLocalResource(PlayerShootTimer).tLeft = 300;
}

function playerMovement(ecs: ECS) {
	const playerQuery = ecs.query([Transform, Player]);
	if (playerQuery.empty()) return;

	const [transform, player] = playerQuery.single();
	const { keymap } = ecs.getResource(Inputs);
	const { delta, speed } = ecs.getResource(Time);

	let acc = new Vec2();
	let angleAcc = 0;

	if (keymap.get('w').isDown) {
		acc.x += 300;
		player.thrustOn.main = true;
	} else {
		player.thrustOn.main = false;
	}
	if (keymap.get('a').isDown) {
		angleAcc += Math.PI * 2;
	} else {
	}
	if (keymap.get('d').isDown) {
		angleAcc -= Math.PI * 2;
	} else {
	}

	acc.setAngle(transform.angle);

	transform.vel.add(acc.mul((delta * speed) / 1000));
	transform.avel += angleAcc * ((delta * speed) / 1000);

	transform.vel.clampMag(0, Math.sqrt(1e8 / 250) * 3);
	transform.avel = Math.min(Math.PI * 5, Math.max(-Math.PI * 5, transform.avel));
}

function playerDampeners(ecs: ECS) {
	const playerQuery = ecs.query([Transform, Player]);
	if (playerQuery.empty()) return;

	const { keymap } = ecs.getResource(Inputs);
	if (keymap.get('a').isDown || keymap.get('d').isDown) return;

	const { delta, speed } = ecs.getResource(Time);
	const [transform, player] = playerQuery.single();

	let angleAcc = 0;

	if (transform.avel > 0) {
		angleAcc -= Math.PI * 2;
	} else if (transform.avel < 0) {
		angleAcc += Math.PI * 2;
	}

	transform.avel += angleAcc * ((delta * speed) / 1000);

	if (Math.abs(transform.avel) < 0.05) transform.avel = 0;
}

function showPlayerThrust(ecs: ECS) {
	const playerQuery = ecs.query([Player]);
	if (playerQuery.empty()) return;

	const [player] = playerQuery.single();

	if (player.thrustOn.main) {
		const main = ecs.entity(player.thrustSprites.main);

		if (!getTween(main, 'inc-m')) {
			console.log(main.get(ParticleGenerator));

			removeTween(main, 'dec-m');
			addTween(main, 'inc-m', new Tween(main.get(ParticleGenerator), { amount: 20 }, 200, QuadIn));
		}
	} else {
		const main = ecs.entity(player.thrustSprites.main);

		if (!getTween(main, 'dec-m')) {
			removeTween(main, 'inc-m');
			addTween(main, 'dec-m', new Tween(main.get(ParticleGenerator), { amount: 0 }, 200, QuadOut));
		}
	}
}

function wrapPlayer(ecs: ECS) {
	const playerQuery = ecs.query([Transform], With(Player));
	if (playerQuery.empty()) return;

	const [canvas] = ecs.query([Canvas]).single();
	const [pt] = playerQuery.single();

	if (pt.pos.magSq() > (canvas.size.x / 2) ** 2) pt.pos.mul(-1);
}

function removePlayer(ecs: ECS) {
	const removePlayer = ecs.getEventReader(RemovePlayerEvent);
	if (!removePlayer.available()) return;

	const playerQuery = ecs.query([], With(Player));
	if (playerQuery.empty()) return;

	const player = playerQuery.entity();
	ecs.destroy(player.id());
}

export function PlayerPlugin(ecs: ECS) {
	ecs.addComponentTypes(Player)
		.addStartupSystem(loadPlayerData)
		.addMainSystems(spawnPlayer, playerMovement, playerDampeners, showPlayerThrust, wrapPlayer, removePlayer, shoot)
		.addEventTypes(SpawnPlayerEvent, RemovePlayerEvent);
}
