import { ECS, Resource } from '../engine';

export class Time extends Resource {
	constructor(
		public elapsed: number = 0,
		public delta: number = 0,
		public last: number = 0,
		public speed: number = 1
	) {
		super();
	}
}

class TimeFocus extends Resource {
	constructor(public elapsed: number) {
		super();
	}
}

function startTime(ecs: ECS) {
	const time = ecs.getResource(Time);

	time.last = performance.now();
}

function updateTime(ecs: ECS) {
	const time = ecs.getResource(Time);
	const now = performance.now();

	if (!document.hasFocus()) {
		if (ecs.hasLocalResource(TimeFocus)) {
			ecs.getLocalResource(TimeFocus).elapsed = now - time.delta;
		} else {
			ecs.insertLocalResource(new TimeFocus(time.last));
		}
		return;
	}

	if (ecs.hasLocalResource(TimeFocus)) {
		time.last = ecs.getLocalResource(TimeFocus).elapsed;
		ecs.removeLocalResource(TimeFocus);
	}

	time.delta = now - time.last;
	time.elapsed += time.delta;
	time.last = now;
}

export function TimePlugin(ecs: ECS) {
	ecs.insertResource(new Time()).addStartupSystem(startTime).addMainSystem(updateTime);
}
