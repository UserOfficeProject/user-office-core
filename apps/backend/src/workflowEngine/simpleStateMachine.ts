export type Entity = { id: number };

export type GuardFn = (entity: Entity) => boolean | Promise<boolean>;
export type ActionFn = (entity: Entity) => void | Promise<void>;

export type TransitionConfig = {
  target: string;
  guard?: GuardFn;
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
  event: (eventName: string) => Promise<string>;
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

  const runAction = async (stateName: string) => {
    const action = schema.states[stateName]?.action;
    if (action) {
      await action(entity);
    }
  };

  void runAction(currentState);

  const getState = () => currentState;

  const event = async (eventName: string) => {
    const stateConfig = schema.states[currentState];
    const transition = stateConfig?.on?.[eventName];

    if (!transition) {
      return currentState;
    }

    if (transition.guard) {
      const result = await transition.guard(entity);
      if (!result) {
        return currentState;
      }
    }

    if (!schema.states[transition.target]) {
      throw new Error(`Unknown target state "${transition.target}"`);
    }

    currentState = transition.target;
    await runAction(currentState);

    return currentState;
  };

  return { getState, event };
};
