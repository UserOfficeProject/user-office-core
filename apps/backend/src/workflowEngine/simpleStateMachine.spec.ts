import { createActor, createMachine } from './simpleStateMachine';

describe('simpleStateMachine', () => {
  it('throws when the initial state is missing from the schema', () => {
    expect(() =>
      createMachine({
        initial: 'missing',
        states: {},
      })
    ).toThrow('Unknown initial state "missing"');
  });

  it('runs entry actions for the initial and target states', async () => {
    const initialAction = jest.fn().mockResolvedValue(undefined);
    const approvedAction = jest.fn().mockResolvedValue(undefined);
    const machine = createMachine({
      initial: 'pending',
      states: {
        pending: {
          action: initialAction,
          on: {
            APPROVE: { target: 'approved' },
          },
        },
        approved: {
          action: approvedAction,
        },
      },
    });

    const actor = createActor(machine, { id: 1 });
    await Promise.resolve();
    expect(initialAction).toHaveBeenCalledWith({ id: 1 });

    const nextState = await actor.event('APPROVE');
    expect(nextState).toBe('approved');
    expect(actor.getState()).toBe('approved');
    expect(approvedAction).toHaveBeenCalledWith({ id: 1 });
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
            SUBMIT: { target: 'submitted', guard },
          },
        },
        submitted: {},
      },
    });

    const actor = createActor(machine, { id: 2 });

    const firstAttempt = await actor.event('SUBMIT');
    expect(firstAttempt).toBe('draft');
    expect(actor.getState()).toBe('draft');

    const secondAttempt = await actor.event('SUBMIT');
    expect(secondAttempt).toBe('submitted');
    expect(actor.getState()).toBe('submitted');
    expect(guard).toHaveBeenCalledTimes(2);
    expect(guard).toHaveBeenLastCalledWith({ id: 2 });
  });

  it('throws when a transition targets an unknown state', async () => {
    const machine = createMachine({
      initial: 'start',
      states: {
        start: {
          on: {
            NEXT: { target: 'missing' },
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
