import type { ECS } from './ecs';
import type { EventType, EventReader, EventWriter } from './event';
import type { QueryDef, QueryResults } from './query';
import type { ResType } from './resource';

export type System = (ecs: ECS) => void;
export type AsyncSystem = (ecs: ECS) => Promise<any>;

export type SystemContext = {
	executor: System | AsyncSystem;
	async: boolean;
	name: string;
	enabled: boolean;

	resources: Map<ResType, any>;
	queries: Map<QueryDef, QueryResults>;

	readers: Map<EventType, EventReader<any>>;
	writers: Map<EventType, EventWriter<any>>;
};
