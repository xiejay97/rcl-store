import type React from 'react';

import { freeze, produce } from 'immer';
import { createElement, useCallback, useMemo, useState } from 'react';

import { ContextStore } from './vars';

export interface ProviderProps {
  children?: React.ReactNode;
}

export type Provider = (props: ProviderProps) => JSX.Element | null;

// eslint-disable-next-line @typescript-eslint/ban-types
export function createProvider<T extends {}>(id: number, defaultValue: T): Provider {
  const contextList = Object.entries(ContextStore.get(id)!);
  return (props) => {
    const states = {};
    for (const [key] of contextList) {
      const [value, updateValue] = useState(() => freeze(defaultValue[key], true));
      const setValue = useCallback((updater: any) => {
        if (typeof updater === 'function') updateValue(produce(updater));
        else updateValue(freeze(updater));
      }, []);

      states[key] = useMemo(() => [value, setValue], [value]);
    }

    const contextListCopy = ([] as [string, React.Context<any>][]).concat(contextList);
    const provider = (): any => {
      if (contextListCopy.length === 0) {
        return props.children;
      }

      const [key, Context] = contextListCopy.shift()!;
      return createElement(Context.Provider, { value: states[key] }, provider());
    };

    return provider();
  };
}
