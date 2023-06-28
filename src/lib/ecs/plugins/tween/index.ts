import type { ECS } from '../../engine';
import { TweenManager, updateTweens } from './tween';

export * from './easings';
export * from './tween';
export * from './tweenbase';
export * from './activetween';
export * from './basictween';
export * from './dynamictween';

export function TweenPlugin(ecs: ECS) {
	ecs.addComponentType(TweenManager).addMainSystem(updateTweens);
}
