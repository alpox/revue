import { Interceptor } from "./interceptor";

export type RegistrationFn<F> = (
  id: string,
  interceptors: Array<Interceptor>,
  fn: F
) => string;

export type EffectHandler = <T>(value: T) => void;

export interface EffectsMap {
  [key: string]: any;
}

const effects = new Map<string, EffectHandler>();

export function doFx(): Interceptor {
  return {
    id: "do-fx",
    after(ctx) {
      for (let effect in ctx.effects) {
        const effectHandler = effects.get(effect);
        if(!effectHandler) continue;

        effectHandler(ctx.effects[effect]);
      }

      return ctx;
    },
  };
}

export function regFx(id: string, fn: EffectHandler) {
  effects.set(id, fn);
  return id;
}
