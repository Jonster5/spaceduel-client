import { Component, ECS, Entity } from '../../engine';
import { Sound } from './sound';
import { SoundEffect } from './soundeffect';

export class SoundManager extends Component {
	constructor(public sounds: Map<string, Sound | SoundEffect> = new Map()) {
		super();
	}

	onDestroy(ecs: ECS, eid: number): void {
		this.sounds.forEach((s) => s.onDestroy());
	}
}

export function addAudio<T extends Sound | SoundEffect>(entity: Entity, label: string, sound: T): T {
	if (!entity.has(SoundManager)) entity.insert(new SoundManager());

	entity.get(SoundManager).sounds.set(label, sound);

	return sound;
}

export function getSound(entity: Entity, label: string): Sound {
	if (!entity.has(SoundManager)) return;

	const sound = entity.get(SoundManager).sounds.get(label);

	if (sound === undefined) return;

	if (sound instanceof SoundEffect) throw new Error(`${label} is a SoundEffect not a Sound`);

	return sound;
}

export function getSoundEffect(entity: Entity, label: string): SoundEffect {
	if (!entity.has(SoundManager)) return;

	const soundEffect = entity.get(SoundManager).sounds.get(label);

	if (soundEffect === undefined) return;

	if (soundEffect instanceof Sound) throw new Error(`${label} is a Sound not a SoundEffect`);

	return soundEffect;
}

export function removeAudio(entity: Entity, label: string) {
	if (!entity.has(SoundManager)) return;

	entity.get(SoundManager).sounds.delete(label);
}
