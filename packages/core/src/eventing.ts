import { doFx, EffectsMap } from "./effects";
import execute, { Interceptor } from "./interceptor";
import { ArrayQueue, ArrayStack } from "./util";

export type Event<Args> = [string, ...Args[]];

export type EventHandler<CoeffectExtension = {}> = <EventArgs, Coeffects>(
  coeffects: Coeffects & CoeffectExtension,
  event: Event<EventArgs>
) => EffectsMap;

const events = new Map<string, Array<Interceptor>>();

function wrapHandler<T>(
  fn: EventHandler
): Interceptor<{}, { event: Event<T> }> {
  return {
    id: "handler-wrapper",
    before(ctx) {
      return {
        ...ctx,
        effects: {
          ...ctx.effects,
          ...fn(ctx.coeffects, ctx.coeffects.event),
        },
      };
    },
  };
}

export function effectEvent(
  id: string,
  interceptors: Array<Interceptor>,
  fn: EventHandler
) {
  events.set(id, [doFx(), ...interceptors, wrapHandler(fn)]);
  return id;
}

export function dispatch<T>(event: Event<T>) {
  const interceptors = events.get(event[0]) || []

  let context = {
    coeffects: { event },
    effects: {},
    queue: new ArrayQueue(interceptors),
    stack: new ArrayStack<Interceptor>(),
  };

  execute(context);
}
