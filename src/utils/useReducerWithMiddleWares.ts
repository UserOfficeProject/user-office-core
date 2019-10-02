import { useState, Reducer, ReducerState, Dispatch, ReducerAction } from 'react'

function compose(...fns:any) {
  if (fns.length === 0) return (arg:any) => arg
  if (fns.length === 1) return fns[0]
  return fns.reduce((a:any, b:any) => (...args:any) => a(b(...args)))
}

function useReducerWithMiddleWares<R extends Reducer<any, any>>(reducer:R, initialState:ReducerState<R>, middlewares:Array<Function> = []):[ReducerState<R>, Dispatch<ReducerAction<R>>] {
  const hook = useState(initialState)
  let state = hook[0]
  const setState = hook[1]
  const dispatch = (action: any) => {
    state = reducer(state, action)
    setState(state)
    return action
  }
  let enhancedDispatch:any;
  const store = {
    getState: () => state,
    dispatch: (...args:any) => enhancedDispatch(...args)
  }
  const chain = middlewares.map(middleware => middleware(store))
  enhancedDispatch = compose.apply(void 0, chain)(dispatch)
  return [state, enhancedDispatch]
}

export default useReducerWithMiddleWares