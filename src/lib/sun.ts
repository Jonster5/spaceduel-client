import { Component, ECS, With, Without } from './ecs/engine';
import { Vec2 } from './ecs/math';
import { Assets, loadImageFile, loadImages, loadJSON } from './ecs/plugins/assets';
import { Root, Sprite } from './ecs/plugins/graphics';
import { Time } from './ecs/plugins/time';
import { Transform } from './ecs/plugins/transform';
import { Mass } from './physics';

export class Sun extends Component {}

export async function loadSunData(ecs: ECS) {
	const assets = ecs.getResource(Assets);

	assets['sunimgs'] = await loadImages('sun.png');
	assets['sunpos'] = await loadJSON('sun.json');
}

export function spawnSun(ecs: ECS) {
	const root = ecs.query([], With(Root)).entity();
	const assets = ecs.getResource(Assets);

	const sun = ecs.spawn(
		new Sun(),
		new Mass(1e8),
		new Transform(new Vec2(500, 500), Vec2.from(assets['sunpos'][0])),
		new Sprite('image', assets['sunimgs'])
	);

	root.addChild(sun);
}

export function sunGravity(ecs: ECS) {
	!document.hasFocus();

	const [{ value: sm }, st] = ecs.query([Mass, Transform], With(Sun)).single();
	const objects = ecs.query([Mass, Transform], Without(Sun)).results();
	const { delta, speed } = ecs.getResource(Time);

	objects.forEach(([{ value: om }, ot]) => {
		const fg = st.pos
			.clone()
			.sub(ot.pos)
			.unit()
			.mul((sm * om) / Math.max(ot.pos.distanceToSq(st.pos), st.size.x / 2));

		ot.vel.add(fg.div(om).mul((delta * speed) / 1000));
	});
}

export function sunPlugin(ecs: ECS) {
	ecs.addComponentType(Sun).addStartupSystems(loadSunData, spawnSun).addMainSystem(sunGravity);
}
