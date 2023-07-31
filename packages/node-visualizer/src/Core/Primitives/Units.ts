export type ThreeDUnits = 'ft' | 'm';

export type UnitConversionType = {
  toUnit: ThreeDUnits;
  factor: number;
};

export const getUnitConversionDefault: () => UnitConversionType = () => {
  return {
    toUnit: 'm',
    factor: 1,
  };
};

export class Units {
  public static readonly Feet = 0.3048;
  public static readonly FeetToMetre = Units.Feet;
  public static readonly MetreToFeet = 3.28084;
  public static isMeter(unit: string): boolean {
    const comparator = unit.toLowerCase();
    return comparator === 'm' || comparator === 'meter';
  }

  public static isFeet(unit: string): boolean {
    const comparator = unit.toLowerCase();

    return comparator === 'ft' || comparator === 'feet';
  }

  public static covertMeterToFeetAndRounded(
    value: number,
    decimals = 2
  ): string {
    return this.convertMeterToFeet(value).toFixed(decimals);
  }

  public static covertFeetToMeterAndRounded(
    value: number,
    decimals = 2
  ): string {
    return this.convertFeetToMeter(value).toFixed(decimals);
  }

  public static convertMeterToFeet(value: number): number {
    return value / Units.FeetToMetre;
  }

  public static convertFeetToMeter(value: number): number {
    return value * Units.FeetToMetre;
  }

  /*
  // No need to use this function
  // because we are already getting 
  // converted data
  */
  public static convertFeetToUnit(
    unit: string | undefined,
    value: number,
    decimals?: number
  ): string {
    if (unit && this.isMeter(unit)) {
      return this.covertFeetToMeterAndRounded(value, decimals);
    }

    if (decimals) {
      return value.toFixed(decimals);
    }

    return `${value}`;
  }
}
