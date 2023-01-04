import configureMeasurements, {
  allMeasures,
  AllMeasures,
  AllMeasuresSystems,
  AllMeasuresUnits,
} from 'convert-units';
import React from 'react';

type UnitConverterProps = {
  symbol?: string;
  SIformula?: string;
};

/** 
  @desc Symbol conversion
  Decide what to display for symbol conversion, for both resolve and rejection. 

  @desc SIFormulaConversion
  1. Check what kinds of SIformulas is there
  2. Decide whether SIformulas needs to be seperated or not, e.g, x/100 - x and 100 should be seperated?
*/

/* 
    convert-units DOC: https://github.com/convert-units/convert-units#readme 
*/
const UnitConverter = (props: UnitConverterProps) => {
  const { symbol, SIformula } = props;
  const convert = configureMeasurements<
    AllMeasures,
    AllMeasuresSystems,
    AllMeasuresUnits
  >(allMeasures);

  const symbolConversion = (symbol: string) => {
    if (symbol?.length < 1) return;
    try {
      const result = convert()
        .from(symbol as AllMeasuresUnits)
        .possibilities();

      return JSON.stringify(result);
    } catch {
      return `${symbol} is not a valid symbol`;
    }
  };

  const SIFormulaConversion = (SIformula: string) => {
    if (SIformula.length < 1 || !SIformula) return;

    const makeSureThisIsNumber = parseFloat(SIformula);

    try {
      const result = convert(makeSureThisIsNumber)
        .from(SIformula as AllMeasuresUnits)
        .toBest();

      return JSON.stringify(result);
    } catch {
      return `${SIformula} is not a valid formula`;
    }
  };

  if (symbol) {
    return <>{symbolConversion(symbol)}</>;
  }

  if (SIformula) {
    return <>{SIFormulaConversion(SIformula)}</>;
  }

  return null;
};

export default UnitConverter;
