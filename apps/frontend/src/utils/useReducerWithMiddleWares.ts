/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useState,
  Reducer,
  ReducerState,
  Dispatch,
  ReducerAction,
} from 'react';

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

export function useReducerWithMiddleWares<R extends Reducer<any, any>>(
  reducer: R,
  initialState: ReducerState<R>,
  middlewares: Array<ReducerMiddleware<any, any>> = []
): [ReducerState<R>, Dispatch<ReducerAction<R>>] {
  const hook = useState(initialState);
  let state = hook[0];
  const setState = hook[1];
  const dispatch = (action: any): ReducerAction<R> => {
    state = reducer(state, action);
    setState(state);

    return action;
  };
  // eslint-disable-next-line prefer-const
  let enhancedDispatch: any;
  const store = {
    getState: (): ReducerState<R> => state,
    dispatch: (...args: any): Dispatch<ReducerAction<R>> =>
      enhancedDispatch(...args),
  };
  const chain = middlewares.map((middleware) => middleware(store));
  enhancedDispatch = compose(...chain)(dispatch);

  return [state, enhancedDispatch];
}

export interface MiddlewareInputParams<S, A> {
  getState: () => S;
  dispatch: React.Dispatch<A>;
}
export type ReducerMiddleware<S, A> = (
  params: MiddlewareInputParams<S, A>
) => (next: FunctionType) => (action: A) => void;
