import type { ECS } from './ecs';

export type ECSPlugin = (ecs: ECS) => void;
