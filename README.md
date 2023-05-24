# rcl-store

A state management library based on context for React.

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
    <GlobalStore.Provider>
      <Count1 />
      <Count2 />
    </GlobalStore.Provider>
  );
}
```
