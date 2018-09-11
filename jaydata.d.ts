declare module $data {

    export class Base implements Object {
        constructor(...params: any[]);
        getType: () => Base;
        memberDefinitions: any[];
    }

    interface Event extends Object {
        attach(eventHandler: (sender: any, event: any) => void ): void;
        detach(eventHandler: () => void ): void;
        fire(e: any, sender: any): void;
    }

    export class Entity extends Base {
        constructor();
        constructor(initData: {});

        entityState: number;
        changedProperties: any[];

        propertyChanging: Event;
        propertyChanged: Event;
        propertyValidationError: Event;
        isValid: () => boolean;
        resetChanges: () => void;
        refresh(): () => Promise<void>;
        save(): () => Promise<void>;
        uid?: string;
    }

    export enum EntityState {
        Added,
        Deleted,
        Detached,
        Modified,
        Unchanged
    }

    export enum EntityAttachMode {
        AllChanged,
        Default,
        KeepChanges
    }

    export class Queryable<T> implements Object {
        filter(predicate: string): Queryable<T>;
        filter(predicate: string, thisArg: any): Queryable<T>;
        filter(predicate: (it: T) => boolean): Queryable<T>;
        filter(predicate: (it: T) => boolean, thisArg: any): Queryable<T>;
        filter(predicate: (it: T, ...args: Array<any>) => boolean, params?: any): Queryable<T>;

        map(projection: string): Queryable<any>;
        map(projection: (it: T) => any): Queryable<any>;

        length(): Promise<Number>;
        length(handler: (result: number) => void ): Promise<Number>;
        length(handler: { success?: (result: number) => void; error?: (result: any) => void; }): Promise<Number>;

        forEach(handler: (it: any) => void ): Promise<T>;

        toArray(): Promise<T[]>;
        toArray(handler: (result: T[]) => void ): Promise<T[]>;
        toArray(handler: { success?: (result: T[]) => void; error?: (result: any) => void; }): Promise<T[]>;

        single(predicate: (it: T) => boolean, params?: any, handler?: (result: T) => void ): Promise<T>;
        single(predicate: (it: T) => boolean, params?: any, handler?: { success?: (result: T) => void; error?: (result: any) => void; }): Promise<T>;

        take(amout: number): Queryable<T>;
        skip(amout: number): Queryable<T>;

        order(selector: string): Queryable<T>;
        orderBy(predicate: (it: any) => any): Queryable<T>;
        orderBy(predicate: (it: T) => any): Queryable<T>;
        orderByDescending(predicate: (it: any) => any): Queryable<T>;

        first(predicate: (it: T) => boolean, params?: any, handler?: (result: T) => void ): Promise<T>;
        first(predicate: (it: T) => boolean, params?: any, handler?: { success?: (result: T) => void; error?: (result: any) => void; }): Promise<T>;
        first(predicate: (it: T, ...args: Array<any>) => boolean, params?: any): Promise<T>;
        first(): Promise<T>;

        getValue(): Promise<T>;

        include(selector: string): Queryable<T>;

        removeAll(): Promise<Number>;
        removeAll(handler: (count: number) => void ): Promise<Number>;
        removeAll(handler: { success?: (result: number) => void; error?: (result: any) => void; }): Promise<Number>;

        find(...ids: Array<any>): Promise<T>;

        single(): Promise<T>;

        count(): Promise<number>;

        include(selector: (it: T) => any): Queryable<T>;

        some(): boolean;

        every(): boolean;

        withInlineCount(): Queryable<T>;
    }

    export class EntitySet<T extends Entity> extends Queryable<T> {
        tableName: string;
        collectionName: string;
        
        add(item: T): T;
        add(initData: {}): T;

        addMany(item: T[]): T[];
        addMany(initData: {}[]): T[];

        createNew(item: T): T;
        createNew(initData: {}): T;

        attach(item: T): void;
        attach(item: {}): void;
        attachOrGet(item: T): T;
        attachOrGet(item: {}): T;

        detach(item: T): void;
        detach(item: {}): void;

        remove(item: T): void;
        remove(item: {}): void;

        elementType: T;
    }

    export class EntityContext implements Object {
        constructor(config: any);
        constructor(config: { name: string; oDataServiceHost: string; MaxDataServiceVersion: string; });
        constructor(config: { name: string; oDataServiceHost?: string; databaseName?: string; localStoreName?: string; user?: string; password?: string; });

        onReady(): Promise<EntityContext>;
        onReady(handler: (currentContext: EntityContext) => void ): Promise<EntityContext>;
        saveChanges(): Promise<Number>;
        saveChanges(handler: (result: number) => void ): Promise<Number>;
        saveChanges(cb: { success?: (result: number) => void; error?: (result: any) => void; }): Promise<Number>;

        add(item: Entity): Entity;
        attach(item: Entity): void;
        attachOrGet(item: Entity): Entity;
        detach(item: Entity): void;
        remove(item: Entity): void;
        trackChanges: boolean;
        attach(item: Entity, mode?: EntityAttachMode): void;
        batchExecuteQuery(queries: Array<$data.Queryable<$data.Entity>>): Promise<Array<Array<any>>>;
    }

    export class Blob implements Object {

    }
    export class Guid implements Object {
        constructor(value: string);
        value: string;
    }


    export class SimpleBase implements Object {
        constructor(initData: any);
    }
    export class Geospatial extends SimpleBase {
        constructor(initData: any);
        type: String;
    }
    export class Geography extends Geospatial {
        constructor(initData: any);
    }

    export class GeographyPoint extends Geography {
        constructor(initData: any);
        constructor(coordinates: any[]);
        constructor(longitude: number, latitude: number);
        longitude: number;
        latitude: number;
        coordinates: any[];
    }
    export class GeographyLineString extends Geography {
        constructor(initData: any);
        constructor(coordinates: any[]);
        coordinates: any[];
    }
    export class GeographyPolygon extends Geography {
        constructor(initData: any);
        constructor(coordinates: any[]);
        coordinates: any[];
    }
    export class GeographyMultiPoint extends Geography {
        constructor(initData: any);
        constructor(coordinates: any[]);
        coordinates: any[];
    }
    export class GeographyMultiLineString extends Geography {
        constructor(initData: any);
        constructor(coordinates: any[]);
        coordinates: any[];
    }
    export class GeographyMultiPolygon extends Geography {
        constructor(initData: any);
        constructor(coordinates: any[]);
        coordinates: any[];
    }
    export class GeographyCollection extends Geography {
        constructor(initData: any);
        constructor(geometries: any[]);
        geometries: any[];
    }

    export class Geometry extends Geospatial {
        constructor(initData: any);
    }

    export class GeometryPoint extends Geometry {
        constructor(initData: any);
        constructor(coordinates: any[]);
        constructor(x: number, y: number);
        x: number;
        y: number;
        coordinates: any[];
    }
    export class GeometryLineString extends Geometry {
        constructor(initData: any);
        constructor(coordinates: any[]);
        coordinates: any[];
    }
    export class GeometryPolygon extends Geometry {
        constructor(initData: any);
        constructor(coordinates: any[]);
        coordinates: any[];
    }
    export class GeometryMultiPoint extends Geometry {
        constructor(initData: any);
        constructor(coordinates: any[]);
        coordinates: any[];
    }
    export class GeometryMultiLineString extends Geometry {
        constructor(initData: any);
        constructor(coordinates: any[]);
        coordinates: any[];
    }
    export class GeometryMultiPolygon extends Geometry {
        constructor(initData: any);
        constructor(coordinates: any[]);
        coordinates: any[];
    }
    export class GeometryCollection extends Geography {
        constructor(initData: any);
        constructor(geometries: any[]);
        geometries: any[];
    }

}

declare module Q {
    export var resolve: (p: any) => Promise<any>;
    export var when: (p: Promise<any>, then?: () => any, fail?: () => any) => Promise<any>;
    export var all: (p: Promise<any>[]) => Promise<any>;
    export var allResolved: (p: Promise<any>[]) => Promise<any>;

    export var fcall: (handler: () => any) => Promise<any>;
}

interface String {
    strLength(): number;
}

interface Date {
    day(): number;
    hour(): number;
    minute(): number;
    month(): number;
    second(): number;
    year(): number;
}

interface Number {
    round(): number;
    floor(): number;
    ceiling(): number;
}

