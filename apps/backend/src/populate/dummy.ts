import { faker } from '@faker-js/faker';

export function word() {
  return faker.random.word().split(' ').join().split('-').join();
}

export function positiveNumber(max: number) {
  return faker.datatype.number(max - 1) + 1;
}

export function title() {
  return Math.random() > 0.5 ? 'Mr.' : 'Ms.';
}

export function gender() {
  return Math.random() > 0.5 ? 'male' : 'female';
}
