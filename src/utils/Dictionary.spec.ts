import JSDict from './Dictionary';

class User {
  constructor(public id: number, public name: string) {}
}

let globalDictionary: JSDict<number, User>;

function createDictionary() {
  globalDictionary = JSDict.Create();
  globalDictionary.put(1, new User(1, 'Rafael'));
  globalDictionary.put(2, new User(2, 'Roger'));
  globalDictionary.put(3, new User(3, 'Alexander'));
}

beforeEach(() => {
  createDictionary();
});

test('Can add new item', () => {
  globalDictionary.put(4, new User(4, 'Maria'));

  return expect(globalDictionary.getValues().length).toBe(4);
});

test('Can get item', () => {
  return expect(globalDictionary.get(1)?.name).toBe('Rafael');
});
