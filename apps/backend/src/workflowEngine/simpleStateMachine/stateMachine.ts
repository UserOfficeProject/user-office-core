export type Entity = { id: number };

export type GuardFn = (entity: Entity) => boolean | Promise<boolean>;
export type ActionFn = (entity: Entity) => void | Promise<void>;

export type TransitionConfig = {
  connectionId: number;
  target: string;
  guards: GuardFn[];
};

export type StateConfig = {
  on?: Record<string, TransitionConfig>;
  action?: ActionFn;
  meta?: Record<string, unknown>;
};

export type MachineSchema = {
  id?: string;
  initial: string;
  states: Record<string, StateConfig>;
};

export type Machine = {
  schema: MachineSchema;
};

export const createMachine = (schema: MachineSchema): Machine => {
  if (!schema.initial) {
    throw new Error('initial state is required');
  }

  if (!schema.states[schema.initial]) {
    throw new Error(`Unknown initial state "${schema.initial}"`);
  }

  return { schema };
};

export type Actor = {
  getState: () => string;
  event: (eventName: string) => Promise<{
    nextStateValue: string;
    connectionId: number;
    transitionPerformed: boolean;
  }>;
};

export const createActor = (
  machine: Machine,
  entity: Entity,
  startingState?: string
): Actor => {
  if (entity === undefined || entity === null) {
    throw new Error('entity is required');
  }

  const { schema } = machine;
  let currentState = startingState ?? schema.initial;

  if (!schema.states[currentState]) {
    throw new Error(`Unknown state "${currentState}"`);
  }

  // Status actions (e.g. emails, RabbitMQ, downloads) are handled by the
  // statusActionEngine, not here. See statusActionEngine/proposal.ts.

  const getState = () => currentState;

  const event = async (
    eventName: string
  ): Promise<{
    nextStateValue: string;
    connectionId: number;
    transitionPerformed: boolean;
  }> => {
    const stateConfig = schema.states[currentState];
    const transition = stateConfig?.on?.[eventName];

    if (!stateConfig || !transition) {
      return {
        nextStateValue: currentState,
        connectionId: -1,
        transitionPerformed: false,
      };
    }
    // all Guards from current state to target state must pass
    for await (const guardTransition of transition.guards) {
      const result = await guardTransition(entity);
      if (!result) {
        return {
          nextStateValue: currentState,
          connectionId: transition.connectionId,
          transitionPerformed: false,
        };
      }
    }

    if (!schema.states[transition.target]) {
      throw new Error(`Unknown target state "${transition.target}"`);
    }

    currentState = transition.target;

    return {
      nextStateValue: transition.target,
      connectionId: transition.connectionId,
      transitionPerformed: true,
    };
  };

  return { getState, event };
};
