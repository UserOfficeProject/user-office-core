import { Dispatch, Reducer, ReducerState } from 'react';

import { Event as A } from 'models/SampleSubmissionModel';
import {
  ReducerMiddleware,
  useReducerWithMiddleWares,
} from 'utils/useReducerWithMiddleWares';

export class CombinedReducers {
  private dispatchRegistry: Dispatch<A>[] = [];

  public register<R extends Reducer<S, A>, S>(
    reducer: R,
    initialState: ReducerState<R>,
    middlewares: Array<ReducerMiddleware<S, A>> = []
  ) {
    const [state, dispatch] = useReducerWithMiddleWares<Reducer<S, A>>(
      reducer,
      initialState,
      middlewares || []
    );
    this.dispatchRegistry.push(dispatch);

    return state;
  }

  private dispatchAll(event: A) {
    this.dispatchRegistry.forEach(dispatch => dispatch(event));
  }

  public getDispatch() {
    return this.dispatchAll.bind(this);
  }
}
