import { Component, ECS } from './ecs/engine';

export class Mass extends Component {
	constructor(public value: number) {
		super();
	}
}

export class Hitbox extends Component {}

export function physicsPlugin(ecs: ECS) {
	ecs.addComponentTypes(Mass, Hitbox);
}
