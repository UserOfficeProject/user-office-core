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
  event: (
    eventName: string
  ) => Promise<{ nextStateValue: string; connectionId: number }>;
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
  const currentState = startingState ?? schema.initial;

  if (!schema.states[currentState]) {
    throw new Error(`Unknown state "${currentState}"`);
  }

  const runAction = async (stateName: string) => {
    const action = schema.states[stateName]?.action;
    if (action) {
      await action(entity);
    }
  };

  void runAction(currentState);

  const getState = () => currentState;

  const event = async (
    eventName: string
  ): Promise<{ nextStateValue: string; connectionId: number }> => {
    const stateConfig = schema.states[currentState];
    const transition = stateConfig?.on?.[eventName];

    if (!stateConfig || !transition) {
      return {
        nextStateValue: currentState,
        connectionId: -1,
      };
    }

    // all Guards from current state to target state must pass
    for (const guardTransition of transition.guards) {
      const result = await guardTransition(entity);
      if (!result) {
        return {
          nextStateValue: currentState,
          connectionId: transition.connectionId,
        };
      }
    }

    await runAction(transition.target);

    return {
      nextStateValue: transition.target,
      connectionId: transition.connectionId,
    };
  };

  return { getState, event };
};
