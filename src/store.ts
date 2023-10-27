import { freeze, produce } from 'immer';
import { useCallback, useSyncExternalStore } from 'react';

class IStore<T extends object> {
  private _store: T;
  private _keys: (keyof T)[];
  private _listeners: Map<keyof T, (() => void)[]>;

  get keys(): (keyof T)[] {
    return this._keys;
  }

  constructor(defaultValue: T) {
    this._store = defaultValue;
    this._keys = Object.keys(defaultValue) as (keyof T)[];
    this._listeners = new Map(this._keys.map((key) => [key, []]));
  }

  setValue(key: keyof T, value: any) {
    this._store[key] = value;
  }

  subscribe(key: keyof T, onStoreChange: () => void) {
    this._listeners.set(key, this._listeners.get(key)!.concat([onStoreChange]));
    return () => {
      this._listeners.set(
        key,
        this._listeners.get(key)!.filter((f) => f !== onStoreChange)
      );
    };
  }

  getSnapshot(key: keyof T) {
    return this._store[key];
  }

  emitChange(key: keyof T) {
    for (const listener of this._listeners.get(key)!) {
      listener();
    }
  }
}

export interface Store<T extends object> {
  get: <K extends keyof T>(key: K) => T[K];
  set: <K extends keyof T>(key: K, value: T[K] | ((draft: T[K]) => void), emitChange?: boolean) => void;
}

export function createStore<T extends object>(defaultValue: T): Store<T> {
  const store = new IStore<T>(defaultValue);

  return Object.assign(
    {
      get: (key) => store.getSnapshot(key),
      set: (key, value, emitChange = true) => {
        const val = typeof value === 'function' ? produce(store.getSnapshot(key), value) : freeze(value);
        store.setValue(key, val);
        if (emitChange) {
          store.emitChange(key);
        }
      },
    } as Store<T>,
    { _store: store }
  );
}

export function useStore<T extends object>(
  store: Store<T>,
  filter?: (keyof T)[]
): [{ [K in keyof T]: T[K] }, { [K in keyof T]: (value: T[K] | ((draft: T[K]) => void)) => void }] {
  const _store = (store as any)._store as IStore<T>;
  const res1 = {} as any;
  const res2 = {} as any;
  for (const key of _store.keys) {
    if (filter === undefined || filter.includes(key)) {
      const subscribe = useCallback<(onStoreChange: () => void) => () => void>((onStoreChange) => {
        return _store.subscribe(key, onStoreChange);
      }, []);
      const getSnapshot = useCallback(() => {
        return store.get(key);
      }, []);
      const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
      res1[key] = value;
      res2[key] = useCallback((value: any) => {
        store.set(key, value);
      }, []);
    }
  }
  return [res1, res2];
}
