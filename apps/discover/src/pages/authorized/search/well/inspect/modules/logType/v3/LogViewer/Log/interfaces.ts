export type Domain = [number, number];
export type Tuplet = [number, number];

export type LogData = {
  [columnExternalId: string]: {
    measurementType: string;
    values: Tuplet[] | number[];
    unit: string;
    domain: Domain;
  };
};

export type EventData = {
  holeStartValue: number;
  holeEndValue: number;
  riskType?: string;
};
