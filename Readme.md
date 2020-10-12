# Revue

Centralized State Management for Vue 3

## Caution! This repository is in Draft State. Everything can and will change.

## Description

Revue is very closely related to the awesome [re-frame](https://github.com/day8/re-frame) and is most of all an implementation of the [Dominoes 1-3](http://day8.github.io/re-frame/a-loop/#six-dominoes) while offloading the dominoes 4-6 to the [Composition API](https://v3.vuejs.org/guide/composition-api-introduction.html) of Vue 3.

If you are a bit versed in Clojure you can find a good graphics describing how revue works [here](http://day8.github.io/re-frame/event-handling-infographic/).


## Example

A very basic example of the usage:

```ts
import init, { dispatch, stateEvent } from "@revue/vue";
import { computed, ref, watch } from "vue";

// Define the layout of your state for later reference
interface State {
  foo?: string;
}

// initialize the initial state of revue and retrieve a readonly
// vue-3 ref representing your state
const state = init({ foo: "state 0" }, ref);

// Define an event handler.
// `change` will be the id of the event ("change-foo" here)
// this identifier is used later for dispatching the event
export const change = stateEvent<State>(
  "change-foo", // The id of the event
  [], // An array of interceptors which will execute in order
  (state, [_, value]) => ({ ...state, foo: value }) // A state handler function. Takes a state and an event-vector and returns a new state
);

// Create a computed value out of your ref
// You can build up a subscription-graph by combining multiple computed
// values. This is also useful for state-drilling.
export const foo = computed(() => state.value.foo);


// Watch changes on the computed value
watch(
  () => foo.value,
  (next, prev) => console.log(next, prev)
);

// Dispatch `change` events setting new values to `foo` in your state
setTimeout(() => dispatch([change, "state 1"]), 1000);
setTimeout(() => dispatch([change, "state 2"]), 2000);

// Logs:
// "state 1" "state 0"
// "state 2" "state 1"
```

## Effects

You can register new effects with `regFx`. You can define events which trigger
specific effects with defining an `event`.

The above `stateEvent` is only a variation on `event` which already triggers
the `state` effect with the result of the state handler function.

```ts
import {regFx, event} from '@revue/vue'

regFx("log", value => console.log(value))

const logBearEvent = event("log-bear", [], (cofx, [_]) => ({
    log: "bear"
}))

dispatch([logBearEvent])
```

## Interceptors

Interceptors are simple objects which define an optional id and a `before` and an `after` function. Both `before` and `after` take a context as argument and return a `new context`.

Say you want to know exactly what the context holds before and after
your event handler is reached you can create a `logInterceptor`:

```ts
function logInterceptor() {
    return {
        id: "log-interceptor",
        before(ctx) {
            console.log(ctx);
            return ctx;
        },
        after(ctx) {
            console.log(ctx);
            return ctx;
        }
    }
}
```

and apply it to your event handler definition:

```ts
stateEvent<State>(
  "my-state-event-handler",
  [logInterceptor()], // the added interceptor
  (state, [_]) => ({ ...state, someState: "updatedState" })
);
```

## Context

The context is a simple datastructure holding only 4 keys:

```ts
{
    effects: { },
    coeffects: { 
        event: [eventId, ...args],
        state: { myStateValue: "value" } 
    },
    queue: { queue(), dequeue() },
    stack: { push(), pop() }
}
```

The `event` and `state` properties on the `coeffects` are always defined if you use `event` or `stateEvent` to register an eventHandler.

In effect they are injected into the coeffects by simple intersectors inserted by `event`.

## Coeffects

Coeffects are values in a `coeffects` map in your context which represent data needed by your event handlers. This can be anything from values from a json file to values from your `localStorage`.

We use coeffects to keep our event handlers `pure`. The event handlers should be kept clean and not depend on any outer state / values and they should also not cause side-effects.

Coeffects can be defined with:

```ts
import { coeffect, injectCofx } from "@revue/vue";

// Define coeffect `random-number` which can be injected through
// interceptors (See below)
const randomNumber = coeffect("random-number", (cofx, n: number) => ({
  ...cofx,
  randomNumber: Math.random() * n,
}));

// Use `event` to create a state handler and still have access to
// the coeffects. 
const randomizer = event<State, { randomNumber: number }>(
  "my-state-event-handler",
  [injectCofx(randomNumber, 50)], // inject the coeffect with a randomizer for values between 0 and 50
  (cofx, [_]) => ({
    state: { ...cofx.state, randomNumberInState: cofx.randomNumber }, // Inject into state
  })
);

dispatch([randomizer])
```


## The API holds much more. Stay tuned on documentation updates