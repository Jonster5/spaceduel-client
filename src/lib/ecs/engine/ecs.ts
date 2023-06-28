import { NumberAllocator } from 'number-allocator';
import { Entity } from './entity';
import { type QueryDef, type CompTypeMod, QueryHandler, QueryResults } from './query';
import { EventHandler, type ECSEvent, EventReader, type EventType, EventWriter } from './event';
import { TreeNode, type CompType, type Component, type ExtractComp } from './component';
import type { ResType, Resource } from './resource';
import type { AsyncSystem, System, SystemContext } from './system';
import type { ECSPlugin } from './plugin';

export class ECS {
	private components: Map<CompType, Component[]>;
	private nodes: Map<number, TreeNode>;
	private allocator: NumberAllocator;
	private entities: Set<number>;

	private startupSystems: SystemContext[];
	private mainSystems: SystemContext[];
	private shutdownSystems: SystemContext[];

	private resources: Map<ResType, Component>;

	private handlers: Map<EventType, EventHandler>;

	private queries: Map<QueryDef, QueryHandler>;

	private updater!: number | null;
	private frameCount: number;

	private context: SystemContext;
	private defaultContext: SystemContext;

	constructor() {
		this.components = new Map();
		this.allocator = new NumberAllocator(0, 4294967294);
		this.entities = new Set();
		this.nodes = new Map();

		this.startupSystems = [];
		this.mainSystems = [];
		this.shutdownSystems = [];

		this.resources = new Map();

		this.handlers = new Map();
		this.queries = new Map();

		this.updater = null;
		this.frameCount = 0;

		this.defaultContext = {
			executor: () => {},
			enabled: false,
			async: false,
			name: 'default',
			queries: new Map(),
			readers: new Map(),
			writers: new Map(),
			resources: new Map(),
		};

		this.context = this.defaultContext;
	}

	addComponentType<T extends Component>(type: CompType<T>) {
		this.components.set(type, []);

		return this;
	}

	addComponentTypes(...comps: CompType[]) {
		comps.forEach((c) => this.addComponentType(c));

		return this;
	}

	addEventType<T extends ECSEvent>(type: EventType<T>) {
		if (this.handlers.has(type)) {
			throw new Error(`Event type [${type.name}] already exists`);
		}

		const handler = new EventHandler(this, type);

		this.handlers.set(type, handler);

		return this;
	}

	addEventTypes<T extends ECSEvent>(...types: EventType<T>[]) {
		types.forEach((e) => this.addEventType(e));

		return this;
	}

	addMainSystem(system: System | AsyncSystem) {
		const enabled = true;
		const name = system.name;
		const executor = system;
		const async = system.constructor.name === 'AsyncFunction';
		const resources = new Map();
		const queries = new Map();
		const readers = new Map();
		const writers = new Map();

		this.mainSystems.push({
			name,
			executor,
			async,
			enabled,
			resources,
			queries,
			readers,
			writers,
		});

		return this;
	}

	addStartupSystem(system: System | AsyncSystem) {
		const enabled = true;
		const name = system.name;
		const executor = system;
		const async = system.constructor.name === 'AsyncFunction';
		const resources = new Map();
		const queries = new Map();
		const readers = new Map();
		const writers = new Map();

		this.startupSystems.push({
			name,
			executor,
			enabled,
			async,
			resources,
			queries,
			readers,
			writers,
		});

		return this;
	}

	addShutdownSystem(system: System | AsyncSystem) {
		const enabled = true;
		const name = system.name;
		const executor = system;
		const async = system.constructor.name === 'AsyncFunction';
		const resources = new Map();
		const queries = new Map();
		const readers = new Map();
		const writers = new Map();

		this.shutdownSystems.push({
			name,
			executor,
			enabled,
			async,
			resources,
			queries,
			readers,
			writers,
		});

		return this;
	}

	addMainSystems(...systems: System[]) {
		systems.forEach((s) => this.addMainSystem(s));

		return this;
	}

	addStartupSystems(...systems: System[]) {
		systems.forEach((s) => this.addStartupSystem(s));

		return this;
	}

	addShutdownSystems(...systems: System[]) {
		systems.forEach((s) => this.addShutdownSystem(s));

		return this;
	}

	toggleSystem(system: System | string) {
		const sysname = typeof system === 'string' ? system : system.name;

		const sys = this.mainSystems.find(({ name }) => name === sysname);

		if (sys === undefined) {
			throw new Error(`System [${sysname}] is not registered`);
		} else {
			sys.enabled = !sys.enabled;
		}
	}

	turnOnSystem(system: System | string) {
		const sysname = typeof system === 'string' ? system : system.name;

		const sys = this.mainSystems.find(({ name }) => name === sysname);

		if (sys === undefined) {
			throw new Error(`System [${sysname}] is not registered`);
		} else {
			sys.enabled = true;
		}
	}

	turnOffSystem(system: System | string) {
		const sysname = typeof system === 'string' ? system : system.name;

		const sys = this.mainSystems.find(({ name }) => name === sysname);

		if (sys === undefined) {
			throw new Error(`System [${sysname}] is not registered`);
		} else {
			sys.enabled = false;
		}
	}

	insertPlugin(plugin: ECSPlugin) {
		plugin(this);

		return this;
	}

	insertPlugins(...plugins: ECSPlugin[]) {
		plugins.forEach((plugin) => this.insertPlugin(plugin));

		return this;
	}

	hasComponent(type: CompType) {
		return this.components.has(type);
	}

	frame() {
		return this.frameCount;
	}

	spawn(...comps: Component[]) {
		const eid = this.allocator.alloc();

		if (eid === null) {
			throw new Error('Max Javascript Array size reached.');
		}

		this.entities.add(eid);
		this.nodes.set(eid, new TreeNode(null, []));

		const entity = new Entity(this, this.components, this.queries, this.nodes, eid);

		entity.insert(...comps);

		return entity;
	}

	entity(eid: number) {
		return new Entity(this, this.components, this.queries, this.nodes, eid);
	}

	destroy(eid: number, force?: boolean) {
		if (!this.entities.has(eid)) {
			if (!force) {
				console.warn(`Entity [${eid}] does not exist`);
				return;
			} else {
				console.warn(`Forcing deletion of Entity [${eid}]`);
			}
		}

		if (this.nodes.get(eid).children.length) {
			this.nodes.get(eid).children.forEach((c) => this.destroy(c));
		}

		this.entities.delete(eid);
		this.allocator.free(eid);

		this.nodes.get(eid).onDestroy(this, eid);

		for (let comps of this.components.values()) {
			if (comps[eid] && comps[eid].onDestroy) comps[eid].onDestroy!(this, eid);
		}

		for (let comps of this.components.values()) {
			delete comps[eid];
		}

		for (let handler of this.queries.values()) {
			if (handler.affectedBy(eid)) handler.removeEntity(eid);
		}

		return this;
	}

	hasResource<T extends Resource>(res: ResType<T>): boolean {
		return this.resources.has(res);
	}

	insertResource<T extends Resource>(res: T, replace?: boolean) {
		if (this.resources.has(res.getType()) && !replace) {
			throw new Error(`Resource of type [${res.getName()}] already exists`);
		}

		this.resources.set(res.getType(), res);

		return this;
	}

	hasLocalResource<T extends Resource>(res: ResType<T>): boolean {
		return this.context.resources.has(res);
	}

	insertLocalResource<T extends Resource>(res: T, replace?: boolean) {
		if (this.resources.has(res.getType()) && !replace) {
			throw new Error(`Resource of type [${res.getName()}] already exists on System(${this.context.name})`);
		}

		this.context.resources.set(res.getType(), res);

		return this;
	}

	getResource<T extends Resource>(type: ResType<T>): T {
		if (!this.resources.has(type)) {
			console.warn(`Resource of type [${type.name}] does not exist`);
			return;
		}

		return this.resources.get(type) as T;
	}

	getLocalResource<T extends Resource>(type: ResType<T>): T {
		if (!this.context.resources.has(type)) {
			console.warn(`Resource of type [${type.name}] does not exist on System(${this.context.name})`);
			return;
		}

		return this.context.resources.get(type);
	}

	removeResource<T extends Resource>(type: ResType<T>) {
		if (!this.resources.delete(type)) {
			console.warn(`Resource of type [${type.name}] can't be remove because it does not exist`);
			return false;
		}
		return true;
	}

	removeLocalResource<T extends Resource>(type: ResType<T>) {
		if (!this.context.resources.delete(type)) {
			console.warn(`Resource of type [${type.name}] can't be remove because it does not exist`);
			return false;
		}
		return true;
	}

	getEventWriter<T extends ECSEvent>(type: EventType<T>): EventWriter<T> {
		if (!this.handlers.has(type)) {
			throw new Error(`Event type ${type.name} does not exist`);
		}

		if (!this.context) {
			const w = new EventWriter(this.handlers.get(type));

			this.handlers.get(type).addWriter(w);

			return w;
		}

		if (!this.context.writers.has(type)) {
			const w = new EventWriter(this.handlers.get(type));

			this.handlers.get(type).addWriter(w);

			this.context.writers.set(type, w);
		}

		return this.context.writers.get(type);
	}

	getEventReader<T extends ECSEvent>(type: EventType<T>): EventReader<T> {
		if (!this.handlers.has(type)) {
			throw new Error(`Event type ${type.name} does not exist`);
		}

		if (!this.context) {
			const r = new EventReader(this.handlers.get(type)!);

			this.handlers.get(type)!.addReader(r);

			return r;
		}

		if (!this.context.readers.has(type)) {
			const r = new EventReader(this.handlers.get(type)!);

			this.handlers.get(type)!.addReader(r);

			this.context.readers.set(type, r);
		}

		return this.context.readers.get(type)!;
	}

	query<
		T extends [...CompType[]] = CompType[],
		M extends [...CompTypeMod[]] = CompTypeMod[],
		Q extends QueryDef<T, M> = QueryDef<T, M>
	>(types: [...T], ...mods: [...M]): QueryResults<T, M> {
		const input: Q = { types, mods: mods ?? new Array<CompTypeMod>() } as unknown as Q;

		let query: Q;

		for (let [def, handler] of this.queries.entries()) {
			if (handler.match(input)) {
				query = def as Q;
				break;
			}
		}

		if (!query) {
			const q = new QueryHandler(this.components, input);

			this.queries.set(input, q);

			this.entities.forEach((eid) => q.validateEntity(eid));

			query = input;
		}

		if (!this.context.queries.has(query)) {
			const r = new QueryResults<T, M>(this, this.queries.get(query) as QueryHandler<T, M>);

			this.context.queries.set(query, r);
		}

		return this.context.queries.get(query) as QueryResults<T, M>;
	}

	async run() {
		await this.startup();
		await this.loop();

		return this;
	}

	async startup() {
		for (let i = 0; i < this.startupSystems.length; i++) {
			if (!this.startupSystems[i].enabled) continue;

			this.context = this.startupSystems[i];

			await this.startupSystems[i].executor(this);
		}

		this.context = this.defaultContext;

		return this;
	}

	private async loop() {
		await this.update.call(this);

		this.updater = requestAnimationFrame(this.loop.bind(this));
	}

	entityCount() {
		return this.entities.size;
	}

	async update() {
		for (let [, handler] of this.handlers) {
			if (handler.deadline === undefined || handler.deadline >= this.frame()) continue;

			handler.data = undefined;
			handler.deadline = undefined;
			handler.readers.forEach((reader) => {
				reader.clear();
			});
		}

		this.frameCount++;

		for (let i = 0; i < this.mainSystems.length; i++) {
			if (!this.mainSystems[i].enabled) continue;

			this.context = this.mainSystems[i];

			await this.mainSystems[i].executor(this);
		}

		this.context = this.defaultContext;

		return this;
	}

	async shutdown() {
		for (let i = 0; i < this.shutdownSystems.length; i++) {
			if (!this.shutdownSystems[i].enabled) continue;

			this.context = this.shutdownSystems[i];

			await this.shutdownSystems[i].executor(this);
		}

		this.context = this.defaultContext;

		return this;
	}

	stop() {
		if (!this.updater) {
			throw new Error(`ECS is not running`);
		}

		cancelAnimationFrame(this.updater);

		this.updater = null;

		return this;
	}
}
