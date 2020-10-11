import { Queue, Stack } from "./util";

export interface Context<E, C> {
  effects: E;
  coeffects: C;
  queue: Queue<Interceptor>;
  stack: Stack<Interceptor>;
}

export type InterceptorFn<FxChange, CofxChange> = <
  NewFx,
  NewCofx,
  PrevFx extends NewFx & FxChange,
  PrevCofx extends NewCofx & CofxChange
>(
  ctx: Context<PrevFx, PrevCofx>
) => Context<NewFx, NewCofx>;

export interface Interceptor<
  FxBefore = {},
  CofxBefore = {},
  FxAfter = {},
  CofxAfter = {}
> {
  id?: string;
  before?: InterceptorFn<FxBefore, CofxBefore>;
  after?: InterceptorFn<FxAfter, CofxAfter>;
}

export default function execute<Fx, Cofx>(context: Context<Fx, Cofx>) {
  while (context.queue.length || context.stack.length) {
    if (context.queue.length) {
      const [interceptor, nextQueue] = context.queue.dequeue();

      if (interceptor.before) {
        if (typeof interceptor.before !== "function") {
          throw new Error(
            "the before method of an interceptor must be a function"
          );
        }
        context = interceptor.before(context);
      }

      context = {
        ...context,
        queue: nextQueue,
        stack: context.stack.push(interceptor),
      };
    } else if (context.stack.length) {
      const [interceptor, nextStack] = context.stack.pop();

      if (interceptor.after) {
        if (typeof interceptor.after !== "function") {
          throw new Error(
            "the after method of an interceptor must be a function"
          );
        }
        context = interceptor.after(context);
      }
      context = {
        ...context,
        stack: nextStack,
      };
    }
  }

  return context;
}
