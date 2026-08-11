import React, { createContext, useContext } from 'react';

// `never` as the parameter type so any `(data: MyRow) => ReactNode` is assignable
// here without a cast; the single consumer casts on the way out instead.
export type CardRowRenderer = (data: never) => React.ReactNode;

// material-table merges `components` into a store that never reverts, so the Row
// component reference has to stay stable. The renderer travels by context instead.
const CardRowContext = createContext<CardRowRenderer | null>(null);

export const CardRowProvider = CardRowContext.Provider;

export const useCardRowRenderer = () => useContext(CardRowContext);
