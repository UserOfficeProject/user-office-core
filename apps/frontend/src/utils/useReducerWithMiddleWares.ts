/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, Dispatch } from 'react';

import { FunctionType } from './utilTypes';

function compose(
  ...fns: ((next: FunctionType<void, unknown[]>) => (action: any) => void)[]
): any {
  if (fns.length === 0) return (arg: any): any => arg;
  if (fns.length === 1) return fns[0];

  return fns.reduce(
    (a: any, b: any) =>
      (...args: any): any =>
        a(b(...args))
  );
}

//TODO: Learn more about this
// I agree idk what this is doing either
export function useReducerWithMiddleWares<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
  middlewares: Array<ReducerMiddleware<S, A>> = []
): [S, Dispatch<A>] {
  const hook = useState(initialState);
  let state = hook[0];
  const setState = hook[1];
  const dispatch = (action: A): A => {
    // eslint-disable-next-line react-hooks/immutability
    state = reducer(state, action);
    setState(state);

    return action;
  };
  // eslint-disable-next-line prefer-const
  let enhancedDispatch: any;
  const store = {
    getState: (): S => state,
    dispatch: (...args: any): Dispatch<A> => enhancedDispatch(...args),
  };
  const chain = middlewares.map((middleware) => middleware(store));
  enhancedDispatch = compose(...chain)(dispatch);

  return [state, enhancedDispatch];
}

export interface MiddlewareInputParams<S, A> {
  getState: () => S;
  dispatch: React.Dispatch<A>;
}
export type ReducerMiddleware<State, Action> = (
  params: MiddlewareInputParams<State, Action>
) => (next: FunctionType) => (action: Action) => void;
