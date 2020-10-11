
export interface Stack<T> {
  push(v: T): Stack<T>;
  pop(): [T, Stack<T>];
  length: number;
}

export class ArrayStack<T> implements Stack<T> {
  constructor(private stack: Array<T> = []) {}

  get length() {
    return this.stack.length;
  }

  push(v: T): Stack<T> {
    return new ArrayStack(this.stack.slice().concat(v));
  }
  pop(): [T, Stack<T>] {
    return [
      this.stack[this.stack.length - 1],
      new ArrayStack(this.stack.slice(0, this.stack.length - 1)),
    ];
  }
}