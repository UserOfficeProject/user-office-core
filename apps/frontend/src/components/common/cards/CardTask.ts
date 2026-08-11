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
  label: string;
  helperText?: string;
};
