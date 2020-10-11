
export interface Queue<T> {
  enqueue(v: T): Queue<T>;
  dequeue(): [T, Queue<T>];
  length: number;
}

export class ArrayQueue<T> implements Queue<T> {
  constructor(private queue: Array<T> = []) {}

  get length() {
    return this.queue.length;
  }

  enqueue(v: T): Queue<T> {
    return new ArrayQueue(this.queue.slice().concat(v));
  }
  dequeue(): [T, Queue<T>] {
    return [this.queue[0], new ArrayQueue(this.queue.slice(1))];
  }
}
