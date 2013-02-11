module $data {
    interface IPromise extends Object {
        then: { (handler: (args: any) => void): IPromise; (handler: (args: any) => any): IPromise; };
        fail: { (handler: (args: any) => void): IPromise; (handler: (args: any) => any): IPromise; };
        valueOf(): any;
    };

    class Base implements Object {
        getType: () => Function;
    };

    interface Event extends Object { 
        attach(eventHandler: (sender: any, event: any) => void ): void;
        detach(eventHandler: () => void): void;
        fire(e: any, sender: any): void;
    }

    class Entity extends Base {
        entityState: number;
        changedProperties: Array;

        propertyChanging: Event;
        propertyChanged: Event;
        propertyValidationError: Event;
        isValid: bool;
    };

    interface EntitySet extends Object {
        tableName: string;
        collectionName: string;
        
        add(initData: { }): Entity;
        add(item: Entity): Entity;

        attach(item: Entity): void;
        attach(item: { }): void;
        attachOrGet(item: Entity): Entity;
        attachOrGet(item: { }): Entity;

        detach(item: Entity): void;
        detach(item: { }): void;

        remove(item: Entity ): void;
        remove(item: { }): void;

        elementType: new () => Entity;
    }

    interface Queryable extends Object {
        filter(predicate:(it: any) => bool): Queryable;
        filter(predicate:(it: any) => bool, thisArg: any): Queryable;

        map(projection: (it: any) => any): Queryable;

        length(): $data.IPromise;
        length(handler: (result: number) => void): $data.IPromise;
        length(handler: { success?: (result: number) => void; error?: (result: any) => void; }): $data.IPromise;

        forEach(handler: (it: any) => void ): $data.IPromise;
    
        toArray(): $data.IPromise;
        toArray(handler: (result: any[]) => void): $data.IPromise;
        toArray(handler: { success?: (result: any[]) => void; error?: (result: any) => void; }): $data.IPromise;

        single(predicate: (it: any, params?: any) => bool, params?: any, handler?: (result: any) => void): $data.IPromise;
        single(predicate: (it: any, params?: any) => bool, params?: any, handler?: { success?: (result: any[]) => void; error?: (result: any) => void; }): $data.IPromise;

        take(amout: number): Queryable;
        skip(amout: number): Queryable;

        order(selector: string): Queryable;
        orderBy(predicate: (it: any) => any): Queryable;
        orderByDescending(predicate: (it: any) => any): Queryable;
    
        first(predicate: (it: any, params?: any) => bool, params?: any, handler?: (result: any) => void): $data.IPromise;
        first(predicate: (it: any, params?: any) => bool, params?: any, handler?: { success?: (result: any[]) => void; error?: (result: any) => void; }): $data.IPromise;
    
        include(selector: string): Queryable;

        removeAll(): $data.IPromise;
        removeAll(handler: (count: number) => void): $data.IPromise;
        removeAll(handler: { success?: (result: number) => void; error?: (result: any) => void; }): $data.IPromise;
    }

    class EntityContext implements Object {
        constructor (config: any);
        constructor (config: { name: string; oDataServiceHost: string; MaxDataServiceVersion: string; });
        constructor (config: { name: string; oDataServiceHost?: string; databaseName?: string; localStoreName?: string; user?: string; password?: string; });

        onReady(): $data.IPromise;
        onReady(handler: (context: EntityContext) => void): $data.IPromise;
        saveChanges(): $data.IPromise;
        saveChanges(handler: (result: number) => void ): $data.IPromise;
        saveChanges(cb: { success: (result: number) => void; error: (result: any) => void; }): $data.IPromise;

        add(item: Entity): Entity;
        attach(item: Entity): void;
        attachOrGet(item: Entity): Entity;
        detach(item: Entity): void;
        remove(item: Entity ): void;
    }

    export class Blob implements Object {
    
    };
    export class Guid implements Object {
        constructor (value: string);
        value: string;
    };


    export class SimpleBase implements Object {
        constructor (initData: any);
    };
    export class Geospatial extends SimpleBase { 
        constructor (initData: any);
        type: String;
    };
    export class Geography extends Geospatial { 
        constructor (initData: any);
    };

    export class GeographyPoint extends Geography {
        constructor (initData: any);
        constructor (coordinates: Array);
        constructor (longitude: number, latitude: number);
        longitude: number;
        latitude: number;
        coordinates: Array;
    };
    export class GeographyLineString extends Geography {
        constructor (initData: any);
        constructor (coordinates: Array);
        coordinates: Array;
    };
    export class GeographyPolygon extends Geography {
        constructor (initData: any);
        constructor (coordinates: Array);
        coordinates: Array;
    };
    export class GeographyMultiPoint extends Geography { 
        constructor (initData: any);
        constructor (coordinates: Array);
        coordinates: Array;
    }
    export class GeographyMultiLineString extends Geography { 
        constructor (initData: any);
        constructor (coordinates: Array);
        coordinates: Array;
    }
    export class GeographyMultiPolygon extends Geography { 
        constructor (initData: any);
        constructor (coordinates: Array);
        coordinates: Array;
    }
    export class GeographyCollection extends Geography { 
        constructor (initData: any);
    }

    export class Geometry extends Geospatial { 
        constructor (initData: any);
    };

    export class GeometryPoint extends Geometry {
        constructor (initData: any);
        constructor (coordinates: Array);
        constructor (x: number, y: number);
        x: number;
        y: number;
        coordinates: Array;
    };
    export class GeometryLineString extends Geometry {
        constructor (initData: any);
        constructor (coordinates: Array);
        coordinates: Array;
    };
    export class GeometryPolygon extends Geometry {
        constructor (initData: any);
        constructor (coordinates: Array);
        coordinates: Array;
    };
    export class GeometryMultiPoint extends Geometry { 
        constructor (initData: any);
        constructor (coordinates: Array);
        coordinates: Array;
    }
    export class GeometryMultiLineString extends Geometry { 
        constructor (initData: any);
        constructor (coordinates: Array);
        coordinates: Array;
    }
    export class GeometryMultiPolygon extends Geometry { 
        constructor (initData: any);
        constructor (coordinates: Array);
        coordinates: Array;
    }
    export class GeometryCollection extends Geography { 
        constructor (initData: any);
    }

};

module Q { 
    export var resolve: (p: any) => $data.IPromise;
    export var when: (p: $data.IPromise, then?: () => any, fail?: () => any) => $data.IPromise;
    export var all: (p: $data.IPromise[]) => $data.IPromise;
    export var allResolved: (p: $data.IPromise[]) => $data.IPromise;

    export var fcall: (handler: () => any) => $data.IPromise;
}

interface String { 
    contains(s: string): bool;
    startsWith(s: string): bool;
    endsWith(s: string): bool;
    strLength(): number;
    indexOf(s: string): number;
    concat(s: string): string;
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

