import { createActor, createMachine } from './stateMachine';

describe('simpleStateMachine', () => {
  it('throws when the initial state is missing from the schema', () => {
    expect(() =>
      createMachine({
        initial: 'missing',
        states: {},
      })
    ).toThrow('Unknown initial state "missing"');
  });

  it('transitions to the target state on event', async () => {
    const machine = createMachine({
      initial: 'pending',
      states: {
        pending: {
          on: {
            APPROVE: {
              target: 'approved',
              guards: [],
              connectionId: 0,
            },
          },
        },
        approved: {},
      },
    });

    const actor = createActor(machine, { id: 1 });
    expect(actor.getState()).toBe('pending');

    const nextState = await actor.event('APPROVE');
    expect(nextState.nextStateValue).toBe('approved');
    expect(nextState.transitionPerformed).toBe(true);
    expect(actor.getState()).toBe('approved');
  });

  it('prevents transitions when the guard resolves to false', async () => {
    const guard = jest
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const machine = createMachine({
      initial: 'draft',
      states: {
        draft: {
          on: {
            SUBMIT: {
              target: 'submitted',
              guards: [guard],
              connectionId: 0,
            },
          },
        },
        submitted: {},
      },
    });

    const actor = createActor(machine, { id: 2 });

    const firstAttempt = await actor.event('SUBMIT');
    expect(firstAttempt.nextStateValue).toBe('draft');
    expect(actor.getState()).toBe('draft');

    const secondAttempt = await actor.event('SUBMIT');
    expect(secondAttempt.nextStateValue).toBe('submitted');
    expect(actor.getState()).toBe('submitted');
    expect(guard).toHaveBeenCalledTimes(2);
    expect(guard).toHaveBeenLastCalledWith({ id: 2 });
  });

  it('returns transitionPerformed false when guards do not allow the transition', async () => {
    const guard = jest.fn().mockResolvedValue(false);
    const machine = createMachine({
      initial: 'draft',
      states: {
        draft: {
          on: {
            SUBMIT: {
              target: 'submitted',
              guards: [guard],
              connectionId: 0,
            },
          },
        },
        submitted: {},
      },
    });

    const actor = createActor(machine, { id: 3 });

    const result = await actor.event('SUBMIT');
    expect(result.transitionPerformed).toBe(false);
    expect(result.nextStateValue).toBe('draft');
    expect(actor.getState()).toBe('draft');
  });

  it('throws when a transition targets an unknown state', async () => {
    const machine = createMachine({
      initial: 'start',
      states: {
        start: {
          on: {
            NEXT: {
              target: 'missing',
              guards: [],
              connectionId: 0,
            },
          },
        },
      },
    });

    const actor = createActor(machine, { id: 1 });

    await expect(actor.event('NEXT')).rejects.toThrow(
      'Unknown target state "missing"'
    );
  });
});
