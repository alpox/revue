import { Interceptor } from "./interceptor";

export type CoeffectHandler<Cofx = any> = <Value, PrevCofx>(
  coeffects: PrevCofx,
  value: Value
) => PrevCofx & Cofx;

type CoeffectRegistry = Map<string, CoeffectHandler>;

const coeffects: CoeffectRegistry = new Map();

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

export function coeffect<Handler extends CoeffectHandler>(
  id: string,
  fn: Handler
): string {
  coeffects.set(id, fn);
  return id;
}
