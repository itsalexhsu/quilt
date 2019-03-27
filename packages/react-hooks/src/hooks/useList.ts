import * as React from 'react';

export interface Operations<T> {
  set: (list: T[]) => void;
  updateAt: (index: number, item: T) => void;
  remove: (index: number) => void;
  push: (item: T) => void;
  filter: (filterFunction: (value: T) => boolean) => void;
  sort: (sortFunction?: (a: T, b: T) => number) => void;
}

export default function useList<T>(
  initialList: T[] = [],
): [T[], Operations<T>] {
  const [list, set] = React.useState<T[]>(initialList);

  return [
    list,
    {
      set,
      updateAt: (index, entry) =>
        set([...list.slice(0, index), entry, ...list.slice(index + 1)]),
      remove: index => set([...list.slice(0, index), ...list.slice(index + 1)]),
      push: entry => set([...list, entry]),
      filter: filterFunction => set(list.filter(filterFunction)),
      sort: (sortFunction?) => set([...list].sort(sortFunction)),
    },
  ];
}
