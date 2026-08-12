import { ReactNode } from 'react';

export type CardTaskId =
  | 'formTeam'
  | 'finishEsi'
  | 'registerVisit'
  | 'declareShipment'
  | 'giveFeedback';

export type CardTaskStatus = 'done' | 'todo' | 'waiting' | 'locked';

export type CardTask = {
  id: CardTaskId;
  status: CardTaskStatus;
  /** The desktop tooltip text, without its parenthesised state reason. */
  label: string;
  /** The state reason the desktop tooltip puts in parentheses. */
  helperText?: string;
  /** The desktop action icon in its status badge. */
  icon: ReactNode;
};
