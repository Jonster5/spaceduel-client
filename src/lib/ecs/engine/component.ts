import type { ECS } from './ecs';

export type CompType<T extends Component = Component> = new (...args: any[]) => T;

export type ExtractComp<T extends CompType<Component>, C extends Component> = C extends CompType<infer C> ? C : never;

export class Component {
	getName(): string {
		return this.constructor.name;
	}

	getType(): CompType<this> {
		return this.constructor as CompType<this>;
	}

	onDestroy?(ecs: ECS, eid: number): void;
}

export class TreeNode extends Component {
	constructor(public parent: number | null = null, public children: number[] = []) {
		super();
	}

	onDestroy(ecs: ECS, eid: number) {
		this.children.forEach((child) => ecs.destroy(child));
		if (this.parent === undefined) return;

		ecs.entity(this.parent).removeChild(eid);
	}
}
