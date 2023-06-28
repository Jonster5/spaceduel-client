import type { ECS } from './ecs';

export class ECSEvent {
	getName(): string {
		return this.constructor.name;
	}

	getType(): EventType<this> {
		return this.constructor as EventType<this>;
	}

	clone(): ECSEvent {
		return JSON.parse(JSON.stringify(this)) as ECSEvent;
	}
}

export type EventType<T extends ECSEvent = any> = new (...args: any[]) => T;

export class EventHandler<T extends ECSEvent = any> {
	type: EventType<T>;
	ecs: ECS;

	deadline: number | undefined;
	data: ECSEvent | null | undefined;

	gen: number;

	readers: EventReader<T>[];
	writers: EventWriter<T>[];

	constructor(ecs: ECS, type: EventType<T>) {
		this.ecs = ecs;
		this.type = type;
		this.data = undefined;
		this.gen = 0;

		this.readers = [];
		this.writers = [];
	}

	write(data?: T) {
		if (data && !(data instanceof this.type)) {
			throw new Error(`data sent through event must match event type [${this.type.name}]`);
		}

		this.data = data ?? null;
		this.deadline = this.ecs.frame() + 2;

		this.gen++;
	}

	addReader(reader: EventReader<T>) {
		this.readers.push(reader);
	}

	addWriter(writer: EventWriter<T>) {
		this.writers.push(writer);
	}
}

export class EventWriter<T extends ECSEvent> {
	handler: EventHandler<T>;

	constructor(handler: EventHandler<T>) {
		this.handler = handler;
	}

	send(data?: T) {
		this.handler.write(data);
	}
}

export class EventReader<T extends ECSEvent> {
	private handler: EventHandler<T>;
	private gen: number;

	constructor(handler: EventHandler<T>) {
		this.handler = handler;

		this.gen = handler.gen;
	}

	available() {
		return this.gen < this.handler.gen && this.handler.data !== undefined;
	}

	get(): T | null {
		if (!this.available()) return undefined;

		this.gen = this.handler.gen;

		if (this.handler.data) return this.handler.data.clone() as T;
		else return null;
	}

	clear() {
		this.gen = this.handler.gen;
	}
}
