export type NullableObject<T> = {
  [K in keyof T]: T[K] | null
};

export type MaybeArray<T> = T | T[];

export type UnionKeys<T> = T extends unknown ? keyof T : never;
