export enum ModelSource {
  PROSPER = 'PROSPER',
}

export enum UnitSystem {
  OilField = 'Oil field units',
  NorSI = 'Norwegian SI units',
  CanSI = 'Canadian SI units',
  GerSI = 'German SI units',
  FreSI = 'French SI units',
  LatSI = 'Latin SI units',
}

export enum BoundaryCondition {
  ResPress = 'Reservoir pressure',
  CGR = 'Condensate gas ratio',
  WGR = 'Water gas ratio',
  Skin = 'Skin',
  N2 = 'Nitrogen content',
  ResTemp = 'Reservoir temperature',
  WellLen = 'Well length',
  ResPerm = 'Reservoir permeability',
  ResThick = 'Reservoir thickness',
}

export const DEFAULT_MODEL_SOURCE: keyof typeof ModelSource = 'PROSPER';
export const DEFAULT_UNIT_SYSTEM: keyof typeof UnitSystem = 'OilField';
export const DATA_TYPE_FILE = 'Simulator File';
export const DATA_TYPE_SEQUENCE = 'Boundary Condition Time Series Map';
