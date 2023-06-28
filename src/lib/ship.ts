import { Component, ECS } from './ecs/engine';
import { Assets, loadImages } from './ecs/plugins/assets';

export class Ship extends Component {}

export async function loadShipData(ecs: ECS) {
	const assets = ecs.getResource(Assets);

	assets['ionthrust'] = await loadImages('ionthrust0.png', 'ionthrust1.png', 'ionthrust2.png', 'ionthrust1.png');
}

export function shipPlugin(ecs: ECS) {
	ecs.addComponentType(Ship).addStartupSystem(loadShipData);
}
