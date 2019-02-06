class Observable {
  constructor () {
    this.observers = [];
    this.data = null;
  }

  subscribe (fn) {
    this.observers.push(fn);
  }

  unsubscribe(fn) {
    this.observers = this.observers.filter((subscriber) => subscriber !== fn);
  }

  getValue () {
    return this.data;
  }

  setValue (dat) {
    this.data = dat;

    this.observers.forEach((subscriber) => subscriber(this.data));
  }
}
