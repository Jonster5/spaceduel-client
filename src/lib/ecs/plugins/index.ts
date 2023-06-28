import type { ECSPlugin } from '../engine';
import { AssetsPlugin } from './assets';
import { AudioPlugin } from './audio';
import { GraphicsPlugin } from './graphics';
import { InputPlugin } from './input';
import { ParticlePlugin } from './particle';
import { TimePlugin } from './time';
import { TransformPlugin } from './transform';
import { TweenPlugin } from './tween';

export const defaultPlugins: ECSPlugin[] = [
	AssetsPlugin,
	TimePlugin,
	TransformPlugin,
	GraphicsPlugin,
	AudioPlugin,
	InputPlugin,
	TweenPlugin,
	ParticlePlugin,
];
