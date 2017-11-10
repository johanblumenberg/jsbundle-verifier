import * as assert from 'assert';

export interface Statement extends Array<string | Statement> {};
export interface Property extends Array<any> {};
export type Object = Property[];

export function arrayValue(value: Statement): Statement[] {
    assert.equal(value.length, 2);
    assert.equal(value[0], 'array');
    return <Statement[]>value[1];
}

export function objectValue(value: Statement): Object {
    assert.equal(value.length, 2);
    assert.equal(value[0], 'object');
    return <Object>value[1];
}

export function propertyName(prop: Property): string {
    assert.equal(typeof prop[0], 'string');
    return prop[0];
}

export function propertyValue(prop: Property): Statement {
    return <Statement>prop[1];
}

export function isString(value: Statement): boolean {
    return value.length === 2 && value[0] === 'string';
}

export function stringValue(value: Statement): string {
    assert.equal(value.length, 2);
    assert.equal(value[0], 'string');
    return <string>value[1];
}

export function isBoolean(value: Statement): boolean {
    return value.length === 2 && value[0] === 'name' && (value[1] === 'true' || value[1] === 'false');
}

export function booleanValue(value: Statement): boolean {
    assert.equal(value.length, 2);
    assert.equal(value[0], 'name');
    assert(value[1] === 'true' || value[1] === 'false');
    return value[1] === 'true';
}

export function scalarValue(value: Statement): string|boolean {
    assert.equal(value.length, 2);
    if (value[0] === 'string') {
        return <string>value[1];
    } else if (value[0] === 'name') {
        if (value[1] === 'true') {
            return true;
        } else if (value[1] === 'false') {
            return false;
        } else {
            throw assert.fail(`Unknown constant ${value[1]}`);
        }
    } else {
        throw assert.fail(`Unknown type ${value[0]}`);
    }
}

export function isFunction(value: Statement): boolean {
    return value.length === 4 && value[0] === 'function';
}

export function callFunction(value: Statement): Statement {
    assert.equal(value.length, 3);
    assert.equal(value[0], 'call');
    return <Statement[]>value[0];
}

export function callArguments(value: Statement): Statement[] {
    assert.equal(value.length, 3);
    assert.equal(value[0], 'call');
    return <Statement[]>value[2];
}

export function callArgument(n: number, value: Statement): Statement {
    return callArguments(value)[n];
}

export function assignValue(value: Statement): Statement {
    assert.equal(value.length, 4);
    assert.equal(value[0], 'assign');
    return <Statement>value[3];
}
