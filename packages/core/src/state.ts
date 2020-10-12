import { Interceptor } from "./interceptor";
import { effectEvent, EventHandler, Event } from "./eventing";
import { coeffect, injectCofx } from "./coeffects";
import { regFx } from "./effects";

export type Wrap<S = any> = { value: S };

export type StateHandler<S> = (state: S, event: Event<any>) => S;
export type EffectHandler<S> = EventHandler<S>;

let internalState: Wrap;

coeffect("state", (coeffects) => ({
  ...coeffects,
  state: internalState.value
}))

export const init = <S>(state: Wrap<S>): Wrap<S> => {
  internalState = state
  return internalState
}

export const event = <S, C = {}>(
  id: string,
  interceptors: Array<Interceptor>,
  fn: EffectHandler<C & { state: S }>
) =>
  effectEvent(
    id,
    [injectCofx("state"), ...interceptors],
    fn
  );

export const stateEvent = <S>(
  id: string,
  interceptors: Array<Interceptor>,
  fn: StateHandler<S>
) =>
  event<S>(id, interceptors, (cofx, event) => ({
    state: fn(cofx.state, event),
  }));

regFx("state", function (value: any) {
  internalState.value = value;
});

/*
type StateHandler<S> = (state: S, event: Event<any>) => S;
type EffectHandler<S> = EventHandler<{ state: S }>;

type Wrap<S> = { value: S };

interface Module<S> {
  state: Wrap<S>;
  effectEvent: RegistrationFn<EffectHandler<S>>;
  stateEvent: RegistrationFn<StateHandler<S>>;
}

interface StateProvider<S = any> {
  initState(v: S): Wrap<S>;
}

const injectStateId = coeffect("inject-state", (cofx, value) => {
  return {
    ...cofx,
    state: value,
  };
});

let internalStateProvider: StateProvider;

export function init<T>(stateProvider: StateProvider<T>) {
  internalStateProvider = stateProvider;
}

export function createModule<S>(
  name: string,
  moduleInterceptors: Array<Interceptor>,
  initialState: S
): Module<S> {
  const state = internalStateProvider.initState(initialState);

  const modularizeId = (id: string) => `${name}/${id}`;
  const stateUpdateId = modularizeId("state");

  const moduleEffectEvent = (
    id: string,
    interceptors: Array<Interceptor>,
    fn: EffectHandler<S>
  ) =>
    effectEvent(
      modularizeId(id),
      [
        injectCofx(injectStateId, state.value),
        ...moduleInterceptors,
        ...interceptors,
      ],
      fn
    );

  const moduleStateEvent = (
    id: string,
    interceptors: Array<Interceptor>,
    fn: StateHandler<S>
  ) =>
    moduleEffectEvent(id, interceptors, (cofx, event) => ({
      [stateUpdateId]: fn(cofx.state, event),
    }));

  regFx(stateUpdateId, function (value: any) {
    state.value = value;
  });

  return {
    state: state,
    effectEvent: moduleEffectEvent,
    stateEvent: moduleStateEvent,
  };
}

*/
