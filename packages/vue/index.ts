import { ref, readonly } from "@vue/reactivity";
import { init } from "@revue/core";

export * from "@revue/core";

export default function initRevueState<S>(state: S) {
  const wrappedState = ref(state);
  init(wrappedState);
  return readonly(wrappedState);
}
