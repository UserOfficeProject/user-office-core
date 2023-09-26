import { Unit } from './../generated/sdk';
const expressionToFunction = (expression: string) =>
  new Function('x', `return ${expression}`);

export const convertToSi = (value: number, unit: Unit | null) =>
  unit ? expressionToFunction(unit.siConversionFormula)(value) : value;

export default expressionToFunction;
