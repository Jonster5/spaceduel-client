import type { Writable } from 'svelte/store';
import { ECS, Resource } from './ecs/engine';
import { Time } from './ecs/plugins/time';
import { RemovePlayerEvent } from './player';

export class UIData extends Resource {
	constructor(
		public view: Writable<'loading' | 'normal'>,
		public fps: Writable<number>,
		public ecount: Writable<number>
	) {
		super();
	}
}

export function setViewNormal(ecs: ECS) {
	const { view } = ecs.getResource(UIData);

	setTimeout(() => {
		view.set('normal');
	}, 0);
}

export function focusLoss(ecs: ECS) {
	if (document.hasFocus()) return;

	ecs.getEventWriter(RemovePlayerEvent).send();
}

export function updateUIData(ecs: ECS) {
	const { fps, ecount } = ecs.getResource(UIData);
	const time = ecs.getResource(Time);

	fps.set(Math.round(1000 / time.delta));
	ecount.set(ecs.entityCount());
}

export function uiPlugin(ecs: ECS) {
	ecs.addStartupSystem(setViewNormal).addMainSystems(updateUIData, focusLoss);
}
