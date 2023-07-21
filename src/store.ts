import { freeze, produce } from 'immer';
import { useCallback, useSyncExternalStore } from 'react';

class IStore<T extends object, K extends keyof T = keyof T> {
  private _store: T;
  private _keys: K[];
  private _listeners: Map<K, (() => void)[]>;

  get keys(): K[] {
    return this._keys;
  }

  constructor(defaultValue: T) {
    this._store = defaultValue;
    this._keys = Object.keys(defaultValue) as K[];
    this._listeners = new Map(this._keys.map((key) => [key, []]));
  }

  setValue(key: K, value: any) {
    this._store[key] = value;
  }

  subscribe(key: K, onStoreChange: () => void) {
    this._listeners.set(key, this._listeners.get(key)!.concat([onStoreChange]));
    return () => {
      this._listeners.set(
        key,
        this._listeners.get(key)!.filter((f) => f !== onStoreChange)
      );
    };
  }

  getSnapshot(key: K) {
    return this._store[key];
  }

  emitChange(key: K) {
    for (const listener of this._listeners.get(key)!) {
      listener();
    }
  }
}

export interface Store<T extends object, K extends keyof T = keyof T> {
  get: (key: K) => T[K];
  set: (key: K, value: T[K] | ((draft: T[K]) => void)) => void;
}

export function createStore<T extends object, K extends keyof T = keyof T>(defaultValue: T): Store<T, K> {
  const store = new IStore<T, K>(defaultValue);

  return Object.assign(
    {
      get: (key) => store.getSnapshot(key),
      set: (key, value) => {
        const val = typeof value === 'function' ? produce(value) : freeze(value);
        store.setValue(key, val);
      },
    } as Store<T, K>,
    { _store: store }
  );
}

export function useStore<T extends object, K extends keyof T = keyof T>(
  store: Store<T, K>,
  filter?: K[]
): [{ [P in K]: T[P] }, { [P in K]: (value: T[P] | ((draft: T[P]) => void)) => void }] {
  const _store = (store as any)._store as IStore<T, K>;
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
        _store.emitChange(key);
      }, []);
    }
  }
  return [res1, res2];
}
