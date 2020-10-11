import { readonly } from "@vue/reactivity";
import { init, Wrap } from "@revue/core";

export * from "@revue/core";

type Initializer = <S>(s: S) => Wrap<S>

export default function initRevueState<S>(state: S, initializer: Initializer) {
  const wrappedState = initializer(state);
  init(wrappedState);
  return readonly(wrappedState);
}
