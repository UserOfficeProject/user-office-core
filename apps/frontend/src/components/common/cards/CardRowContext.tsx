import React, { createContext, useContext } from 'react';

export type CardRowRenderer = (data: never) => React.ReactNode;

const CardRowContext = createContext<CardRowRenderer | null>(null);

export const CardRowProvider = CardRowContext.Provider;

export const useCardRowRenderer = () => useContext(CardRowContext);
