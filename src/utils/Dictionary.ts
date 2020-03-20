type KEY = string | number | symbol;

interface Dictionary<K extends KEY, V> {
  getKeys(): K[];
  getValues(): V[];
  get(key: K): V | null;
  put(key: K, val: V): void; // or boolean?
}

export default class JSDict<K extends KEY, V> implements Dictionary<K, V> {
  private dict: { [key in K]?: V };

  constructor() {
    this.dict = {};
  }

  public getKeys() {
    const keys: K[] = [];
    for (const key in this.dict) {
      keys.push(key);
    }

    return keys;
  }

  public getValues() {
    const vals: V[] = [];
    for (const key in this.dict) {
      const v = this.dict[key];

      if (this.exists(v)) {
        vals.push(v);
      }
    }

    return vals;
  }

  // Type predicate to ensure v exists
  private exists(v: V | undefined): v is V {
    return v != null && typeof v !== 'undefined';
  }

  public get(key: K) {
    const v = this.dict[key];

    return this.exists(v) ? v : null;
  }

  public put(key: K, val: V) {
    this.dict[key] = val;
  }

  static Create<Keys extends KEY, Values>() {
    return new JSDict<Keys, Values>();
  }
}
