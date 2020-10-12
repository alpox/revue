import { Interceptor } from "./interceptor";

export type CoeffectHandler<Cofx = any, Value = any> = <PrevCofx>(
  coeffects: PrevCofx,
  value: Value
) => PrevCofx & Cofx;

const coeffects = new Map<string, CoeffectHandler>();

export function injectCofx<Cofx>(cofx: string, value?: Cofx): Interceptor {
  const coeffectHandler = coeffects.get(cofx);
  return {
    id: "inject-cofx",
    before(ctx) {
      if (!coeffectHandler) return ctx;
      return {
        ...ctx,
        coeffects: coeffectHandler(ctx.coeffects, value),
      };
    },
  };
}

export function coeffect<V, Handler extends CoeffectHandler<V>>(
  id: string,
  fn: Handler
): string {
  coeffects.set(id, fn);
  return id;
}
