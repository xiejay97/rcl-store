# rcl-store

A state management library for React.

# Installation

```
npm install rcl-store
```

# Getting Started

```tsx
import { useEffect } from 'react';

import { createStore, useStore } from 'rcl-store';

const GlobalStore = createStore({ count1: 0, count2: 0 });

function Count1() {
  const [{ count1 }, { count1: setCount1 }] = useStore(GlobalStore, ['count1']);

  useEffect(() => {
    console.log('Only show when count1 change');
  });

  return (
    <>
      <button
        onClick={() => {
          setCount1((prev) => prev + 1);
        }}
      >
        Count1++
      </button>
      {count1}
    </>
  );
}

function Count2() {
  const [{ count2 }, { count2: setCount2 }] = useStore(GlobalStore);

  useEffect(() => {
    console.log('Always show when change');
  });

  return (
    <>
      <button
        onClick={() => {
          setCount2((prev) => prev + 1);
        }}
      >
        Count2++
      </button>
      {count2}
    </>
  );
}

export default function App() {
  return (
    <>
      <Count1 />
      <Count2 />
    </>
  );
}
```

# API

```ts
interface Store<T> {
  // Get the value by specified `key`, don't use it in the render pass because it won't subscribe to updates!
  get: <K extends keyof T>(key: K) => T[K];
  // Set the value by specified `key`, useful when you don't need to subscribe to the value.
  set: <K extends keyof T>(key: K, value: T[K] | ((draft: T[K]) => void)) => void;
}

// Create a store with the default value.
function createStore<T extends {}>(defaultValue: T): Store<T>;

// Get a store.
// You can pass `filter` parameter to subscribe specified values.
function useStore<T extends {}, K extends keyof T = keyof T>(
  store: Store<T>,
  filter?: K[]
): [
  {
    [P in K]: T[P];
  },
  {
    [P in K]: (value: T[P] | ((draft: T[P]) => void)) => void;
  }
];
```
