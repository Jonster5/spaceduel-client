export type ResType<T extends Resource = Resource> = new (...args: any[]) => T;

export class Resource {
	getName(): string {
		return this.constructor.name;
	}

	getType(): ResType<this> {
		return this.constructor as ResType<this>;
	}
}
