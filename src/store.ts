import type { Provider } from './provider';

import { createContext, useContext } from 'react';

import { createProvider } from './provider';
import { ContextStore, getId } from './vars';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Store<T> {
  Provider: Provider;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function createStore<T extends {}>(defaultValue: T): Store<T> {
  const id = getId();
  const context = {};
  for (const key of Object.keys(defaultValue)) {
    context[key] = createContext(defaultValue[key]);
  }
  ContextStore.set(id, context);

  return {
    __id: id,
    Provider: createProvider(id, defaultValue),
  } as Store<T>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function useStore<T extends {}, K extends keyof T = keyof T>(
  store: Store<T>,
  filter?: K[]
): [{ [P in K]: T[P] }, { [P in K]: (value: T[P] | ((draft: T[P]) => void)) => void }] {
  const res1 = {} as any;
  const res2 = {} as any;
  for (const [key, Context] of Object.entries(ContextStore.get(store['__id'])!)) {
    if (filter === undefined || filter.includes(key as K)) {
      const [value, setValue] = useContext(Context);
      res1[key] = value;
      res2[key] = setValue;
    }
  }
  return [res1, res2];
}
