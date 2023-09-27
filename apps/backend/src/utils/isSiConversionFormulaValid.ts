/**
 * Function check if the expression is valid
 * @param expression  The function expression to sanitize.
 * @returns  true if the expression is valid, false otherwise.
 */
export function isSiConversionFormulaValid(expression?: string): boolean {
  if (expression === undefined || expression === null) {
    return true;
  }

  return expression.match(/[^0-9\+\-\*\/\(\)\s\.x]/g) === null;
}
