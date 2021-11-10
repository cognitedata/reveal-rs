import { PinType, PinTypeIdentifier } from '@cognite/connect';

export const pinTypes: Record<PinTypeIdentifier, PinType> = {
  LINE_CHART: {
    id: 'LINE_CHART',
    title: 'LINE CHART',
    color: '#4A67FB',
  },
  TIMESERIES: {
    id: 'TIMESERIES',
    title: 'Time series',
    color: '#FF8746',
  },
  DATAPOINTS: {
    id: 'DATAPOINTS',
    title: 'Datapoints',
    color: '#FF8746',
  },
  CONSTANT: {
    id: 'CONSTANT',
    title: 'CONSTANT',
    color: '#C945DB',
  },
  CSV: {
    id: 'CSV',
    title: 'CSV',
    color: '#2ACF58',
  },
  FUNCTION: {
    id: 'FUNCTION',
    title: 'FUNCTION',
    color: '#FC2574',
  },
  ANY: {
    id: 'ANY',
    title: 'ANY',
    color: 'white',
  },
};
