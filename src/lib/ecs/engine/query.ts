import type { Component, CompType } from './component';
import type { ECS } from './ecs';
import type { Entity } from './entity';

export type CompTypeMod<T extends ModType = ModType, C extends Component = Component> = () => [T, CompType<C>];
export type ModType = 'With' | 'Without';

export const With = <T extends Component>(c: CompType<T>): CompTypeMod<'With', T> => {
	return () => ['With', c];
};

export const Without = <T extends Component>(c: CompType<T>): CompTypeMod<'Without', T> => {
	return () => ['Without', c];
};

export type ExtractCompList<T extends CompType<Component>[]> = {
	[K in keyof T]: T[K] extends CompType<infer C> ? C : never;
};

export type QueryDef<T extends [...CompType[]] = [...CompType[]], M extends [...CompTypeMod[]] = [...CompTypeMod[]]> = {
	types: T;
	mods: M;
};

export class QueryHandler<
	T extends [...CompType[]] = [...CompType[]],
	M extends [...CompTypeMod[]] = [...CompTypeMod[]]
> {
	def: QueryDef<T, M>;

	private compRef: Map<CompType, Component[]>;

	components: Map<CompType, Component[]>;
	entities: Set<number>;

	results: QueryResults<T, M>[];

	constructor(compRef: Map<CompType, Component[]>, def: QueryDef<T, M>) {
		this.def = def;

		this.compRef = compRef;

		this.results = [];

		this.components = new Map();

		this.def.types.forEach((t) => this.components.set(t, []));

		this.entities = new Set();
	}

	affectedBy(type: CompType | number): boolean {
		if (typeof type === 'number') {
			return this.entities.has(type);
		} else {
			return this.def.types.includes(type) || this.def.mods.map((m) => m()[1]).includes(type);
		}
	}

	validateEntity(eid: number) {
		if (this.def.mods.length > 0) {
			for (let mod of this.def.mods) {
				const [type, comp] = mod();

				if (type === 'With') {
					if (this.compRef.get(comp)[eid] === undefined) {
						if (this.entities.has(eid)) this.removeEntity(eid);
						return false;
					}
				} else {
					if (this.compRef.get(comp)[eid] !== undefined) {
						if (this.entities.has(eid)) this.removeEntity(eid);
						return false;
					}
				}
			}
		}

		if (this.def.types.length > 0) {
			for (let type of this.def.types) {
				if (this.compRef.get(type)[eid] !== undefined) continue;

				if (this.entities.has(eid)) this.removeEntity(eid);
				return false;
			}
		}

		if (!this.entities.has(eid)) this.addEntity(eid);
		return true;
	}

	addEntity(eid: number) {
		this.entities.add(eid);

		for (let type of this.def.types) {
			this.components.get(type)[eid] = this.compRef.get(type)[eid];
		}
	}

	removeEntity(eid: number) {
		this.entities.delete(eid);

		for (let type of this.def.types) {
			delete this.components.get(type)[eid];
		}
	}

	match(query: QueryDef) {
		if (this.def.types.length !== query.types.length) return false;

		for (let i = 0; i < this.def.types.length; i++) {
			if (this.def.types[i] !== query.types[i]) return false;
		}

		if (this.def.mods.length !== query.mods.length) return false;

		if (this.def.mods.length > 0) {
			for (let m1 of this.def.mods) {
				if (query.mods.every((m2) => m1()[0] !== m2()[0] || m1()[1] !== m2()[1])) return false;
			}
		}

		return true;
	}

	toString() {
		return `{${this.def.types.map((t) => t.name).join(', ')}}|{${this.def.mods
			.map((m) => `${m()[0]}(${m()[1].name})`)
			.join(', ')}}`;
	}

	addResult(q: QueryResults<T, M>) {
		this.results.push(q);
	}
}

export class QueryResults<
	T extends [...CompType[]] = [...CompType[]],
	M extends [...CompTypeMod[]] = [...CompTypeMod[]]
> {
	private handler: QueryHandler<T, M>;
	private ecs: ECS;

	constructor(ecs: ECS, handler: QueryHandler<T, M>) {
		this.handler = handler;
		this.ecs = ecs;
		this.handler.addResult(this);
	}

	size() {
		return this.handler.entities.size;
	}

	empty() {
		return this.handler.entities.size < 1;
	}

	results<R = ExtractCompList<T>>(cb: (v: ExtractCompList<T>) => R = (k) => k as R): R[] {
		let ret: ExtractCompList<T>[] = [];
		for (let eid of this.handler.entities.values()) {
			let out = [] as ExtractCompList<T>;
			this.handler.components.forEach((comps) => out.push(comps[eid]));
			ret.push(out as ExtractCompList<T>);
		}

		return ret.map(cb);
	}

	single(): ExtractCompList<T> {
		for (let eid of this.handler.entities.values()) {
			let out = [] as ExtractCompList<T>;
			this.handler.components.forEach((comps) => out.push(comps[eid]));
			return out as ExtractCompList<T>;
		}

		return null;
	}

	entities(): number[] {
		return Array.from(this.handler.entities);
	}

	entity(): Entity {
		if (this.handler.entities.size > 1) {
			console.warn(
				`QueryResults.prototype.single() will only act on the first entity available despite there being ${this.handler.entities.size}`
			);
		}

		for (let eid of this.handler.entities.values()) {
			return this.ecs.entity(eid);
		}

		return null;
	}
}
