export type EmptyObject = Record<string | number | symbol, never>;

export interface AnyObject {
  [key: string]: Anything;
}

export type Anything = any;

export type Fn = (...args: Anything[]) => Anything;

export interface SomeObject {
  [key: string]: string | number | boolean | object | SomeObject;
}
