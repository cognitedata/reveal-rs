import {
  Operation,
  OperationInputsTypesEnum,
  OperationParametersTypeEnum,
} from '@cognite/calculation-backend';
import { Chart, ChartWorkflowV1, ChartWorkflowV2 } from 'models/chart/types';
import {
  getConfigFromDspFunction,
  getStepsFromWorkflowConnect,
  getStepsFromWorkflowReactFlow,
} from './transforms';

describe('getConfigFromDspFunction', () => {
  it('generates correct config from dsp function description (case 1)', () => {
    const dspFunctionDescription: Operation = {
      name: 'Saviztky-Golay Filter',
      category: 'SMOOTHERS',
      description: 'Data smoother - Saviztky-Golay Filter',
      inputs: [
        {
          param: 'a',
          types: [OperationInputsTypesEnum.Ts],
        },
      ],
      outputs: [
        {
          name: 'Result',
        },
      ],
      op: 'SG_SMOOTHER',
      parameters: [
        {
          name: 'Window Length',
          default_value: null,
          param: 'window_length',
          type: OperationParametersTypeEnum.Int,
        },
        {
          name: 'Polynomial Order',
          default_value: 1,
          param: 'polyorder',
          type: OperationParametersTypeEnum.Int,
        },
      ],
    };

    const config = getConfigFromDspFunction(dspFunctionDescription);

    expect(config).toEqual({
      input: [
        {
          name: 'Input 1',
          field: 'a',
          types: ['TIMESERIES'],
          pin: true,
        },
        {
          name: 'Window Length',
          field: 'window_length',
          types: ['CONSTANT'],
          pin: false,
        },
        {
          name: 'Polynomial Order',
          field: 'polyorder',
          types: ['CONSTANT'],
          pin: false,
        },
      ],
      output: [
        {
          name: 'Result',
          field: 'result',
          type: 'TIMESERIES',
        },
      ],
    });
  });

  it('generates correct config from dsp function description (case 1,5)', () => {
    const dspFunctionDescription: Operation = {
      name: 'Saviztky-Golay Filter',
      category: 'SMOOTHERS',
      description: 'Data smoother - Saviztky-Golay Filter',
      inputs: [
        {
          param: 'a',
          types: [OperationInputsTypesEnum.Ts],
        },
      ],
      outputs: [],
      op: 'SG_SMOOTHER',
      parameters: [
        {
          name: 'Window Length',
          default_value: null,
          param: 'window_length',
          type: OperationParametersTypeEnum.Int,
        },
        {
          name: 'Polynomial Order',
          default_value: 1,
          param: 'polyorder',
          type: OperationParametersTypeEnum.Int,
        },
      ],
    };

    const config = getConfigFromDspFunction(dspFunctionDescription);

    expect(config).toEqual({
      input: [
        {
          name: 'Input 1',
          field: 'a',
          types: ['TIMESERIES'],
          pin: true,
        },
        {
          name: 'Window Length',
          field: 'window_length',
          types: ['CONSTANT'],
          pin: false,
        },
        {
          name: 'Polynomial Order',
          field: 'polyorder',
          types: ['CONSTANT'],
          pin: false,
        },
      ],
      output: [
        {
          name: 'Output',
          field: 'result',
          type: 'TIMESERIES',
        },
      ],
    });
  });

  it('generates correct config from dsp function description (case 2)', () => {
    const dspFunctionDescription: Operation = {
      name: 'Saviztky-Golay Filter',
      category: 'SMOOTHERS',
      description: 'Maximum function (element-wise)',
      inputs: [
        {
          param: 'a',
          types: [OperationInputsTypesEnum.Ts, OperationInputsTypesEnum.Const],
        },
        {
          param: 'b',
          types: [OperationInputsTypesEnum.Ts, OperationInputsTypesEnum.Const],
        },
      ],
      outputs: [
        {
          name: 'Result',
        },
      ],
      op: 'MAX',
      parameters: [],
    };

    const config = getConfigFromDspFunction(dspFunctionDescription);

    expect(config).toEqual({
      input: [
        {
          name: 'Input 1',
          field: 'a',
          types: ['TIMESERIES', 'CONSTANT'],
          pin: true,
        },
        {
          name: 'Input 2',
          field: 'b',
          types: ['TIMESERIES', 'CONSTANT'],
          pin: true,
        },
      ],
      output: [
        {
          name: 'Result',
          field: 'result',
          type: 'TIMESERIES',
        },
      ],
    });
  });
});

describe('getStepsFromWorkflowConnect', () => {
  it('generates correct steps (empty workflow)', () => {
    const chart: Chart = {
      id: 'chart-1',
      name: 'Chart 1',
      version: 1,
      user: 'abc@cognite.com',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      dateFrom: new Date().toJSON(),
      dateTo: new Date().toJSON(),
    };

    const workflow: ChartWorkflowV1 = {
      version: '',
      id: 'abc123',
      name: 'Empty workflow',
      nodes: [],
      connections: {},
      color: '#FFF',
      enabled: true,
    };

    const steps = getStepsFromWorkflowConnect(
      chart,
      workflow.nodes,
      workflow.connections
    );

    expect(steps).toEqual([]);
  });

  it('generates correct steps (missing output node)', () => {
    const chart: Chart = {
      id: 'chart-1',
      name: 'Chart 1',
      version: 1,
      user: 'abc@cognite.com',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      dateFrom: new Date().toJSON(),
      dateTo: new Date().toJSON(),
    };

    const workflow: ChartWorkflowV1 = {
      version: '',
      name: 'New Calculation',
      color: '#FFF',
      enabled: true,
      nodes: [
        {
          id: 'TIME SERIES-6TIY4YZcnjxIFv6pYjXEG',
          functionEffectReference: 'TIME_SERIES_REFERENCE',
          color: '#FC2574',
          selected: false,
          outputPins: [
            {
              id: 'result',
              x: 608.421875,
              type: 'TIMESERIES',
              y: -135.609375,
              title: 'Time Series',
            },
          ],
          x: 363,
          subtitle: 'TIME SERIES',
          title: 'Pressure well 1',
          inputPins: [],
          y: -155.609375,
          functionData: {
            timeSeriesExternalId: 'VAL_RESERVOIR_PT_well09',
          },
          width: 245.421875,
          icon: 'Function',
        },
        {
          color: '#FC2574',
          y: 32.390625,
          title: 'Pressure well 2',
          subtitle: 'TIME SERIES',
          selected: false,
          functionData: {
            timeSeriesExternalId: 'VAL_RESERVOIR_PT_well07',
          },
          outputPins: [
            {
              x: 634.421875,
              type: 'TIMESERIES',
              id: 'result',
              title: 'Time Series',
              y: 52.390625,
            },
          ],
          width: 245.421875,
          icon: 'Function',
          inputPins: [],
          id: 'TIME SERIES-B7TPWUsG22UkYz7skhLrI',
          x: 389,
          functionEffectReference: 'TIME_SERIES_REFERENCE',
        },
        {
          id: 'Constant-zVAk0aNDin5gSrYQo7RuG',
          functionEffectReference: 'CONSTANT',
          outputPins: [
            {
              type: 'CONSTANT',
              y: -90.609375,
              x: 950.046875,
              id: 'result',
              title: 'Constant',
            },
          ],
          title: '100',
          icon: 'Function',
          x: 816,
          selected: false,
          inputPins: [],
          functionData: {
            value: 100,
          },
          width: 134.046875,
          y: -110.609375,
          color: '#FC2574',
          subtitle: 'Constant',
        },
        {
          inputPins: [
            {
              types: ['TIMESERIES', 'CONSTANT'],
              id: 'input0',
              title: 'Input 1',
            },
            {
              title: 'Input 2',
              types: ['TIMESERIES', 'CONSTANT'],
              id: 'input1',
            },
          ],
          outputPins: [
            {
              type: 'TIMESERIES',
              title: 'Output',
              id: 'out-result',
            },
          ],
          selected: false,
          title: 'Addition',
          functionData: {
            toolFunction: {
              parameters: [],
              n_outputs: 1,
              op: 'ADD',
              n_inputs: 2,
              description: 'Addition',
            },
          },
          id: 'Toolbox Function-t5g8fe40UfwADRcDxepmm',
          width: 198.09375,
          color: '#9118af',
          icon: 'Function',
          y: 107.390625,
          subtitle: 'Toolbox Function',
          x: 774,
          functionEffectReference: 'TOOLBOX_FUNCTION',
        },
        {
          functionData: {
            toolFunction: {
              parameters: [],
              n_outputs: 1,
              description: 'Addition',
              n_inputs: 2,
              op: 'ADD',
            },
          },
          width: 198.09375,
          color: '#9118af',
          functionEffectReference: 'TOOLBOX_FUNCTION',
          icon: 'Function',
          title: 'Addition',
          outputPins: [
            {
              title: 'Output',
              type: 'TIMESERIES',
              id: 'out-result',
            },
          ],
          id: 'Toolbox Function-x9We6_hUdoYGNPOM5JHBK',
          subtitle: 'Toolbox Function',
          inputPins: [
            {
              title: 'Input 1',
              id: 'input0',
              types: ['TIMESERIES', 'CONSTANT'],
            },
            {
              id: 'input1',
              title: 'Input 2',
              types: ['TIMESERIES', 'CONSTANT'],
            },
          ],
          x: 1102,
          selected: false,
          y: 7.390625,
        },
      ],
      id: 'KuyBLR-_Bxx0ZZKUohLpo',
      connections: {
        o8HGzvbgKzjHeSxhGP8yR: {
          id: 'o8HGzvbgKzjHeSxhGP8yR',
          outputPin: {
            nodeId: 'TIME SERIES-B7TPWUsG22UkYz7skhLrI',
            pinId: 'result',
          },
          inputPin: {
            nodeId: 'Toolbox Function-t5g8fe40UfwADRcDxepmm',
            pinId: 'input1',
          },
        },
        'klxOGD-GI1ypKfEwWgVD-': {
          outputPin: {
            pinId: 'result',
            nodeId: 'Constant-zVAk0aNDin5gSrYQo7RuG',
          },
          id: 'klxOGD-GI1ypKfEwWgVD-',
          inputPin: {
            nodeId: 'Toolbox Function-x9We6_hUdoYGNPOM5JHBK',
            pinId: 'input0',
          },
        },
        fpTlQCgQltne1TeYD23Tj: {
          inputPin: {
            nodeId: 'Toolbox Function-t5g8fe40UfwADRcDxepmm',
            pinId: 'input0',
          },
          id: 'fpTlQCgQltne1TeYD23Tj',
          outputPin: {
            nodeId: 'TIME SERIES-6TIY4YZcnjxIFv6pYjXEG',
            pinId: 'result',
          },
        },
        NoorLUun7_wrBkzsX0cR7: {
          id: 'NoorLUun7_wrBkzsX0cR7',
          inputPin: {
            nodeId: 'Toolbox Function-x9We6_hUdoYGNPOM5JHBK',
            pinId: 'input1',
          },
          outputPin: {
            pinId: 'out-result',
            nodeId: 'Toolbox Function-t5g8fe40UfwADRcDxepmm',
          },
        },
      },
    };

    const steps = getStepsFromWorkflowConnect(
      chart,
      workflow.nodes,
      workflow.connections
    );

    expect(steps).toEqual([]);
  });

  it('generates correct steps (multistep computation)', () => {
    const chart: Chart = {
      id: 'chart-1',
      name: 'Chart 1',
      version: 1,
      user: 'abc@cognite.com',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      dateFrom: new Date().toJSON(),
      dateTo: new Date().toJSON(),
    };

    const workflow: ChartWorkflowV1 = {
      version: '',
      name: 'New Calculation',
      color: '#FFF',
      enabled: true,
      nodes: [
        {
          inputPins: [],
          width: 304.46875,
          y: -163.609375,
          functionData: {
            timeSeriesExternalId: 'VAL_RESERVOIR_PT_well01',
          },
          functionEffectReference: 'TIME_SERIES_REFERENCE',
          subtitle: 'TIME SERIES',
          outputPins: [
            {
              type: 'TIMESERIES',
              id: 'result',
              x: 486.46875,
              title: 'Time Series',
              y: -143.609375,
            },
          ],
          icon: 'Function',
          selected: false,
          id: 'TIME SERIES-krihrlBzGmwCbf9pRuM-r',
          color: '#FC2574',
          title: 'VAL_RESERVOIR_PT_well01',
          x: 182,
        },
        {
          functionData: {
            timeSeriesExternalId: 'VAL_RESERVOIR_PT_well07',
          },
          functionEffectReference: 'TIME_SERIES_REFERENCE',
          icon: 'Function',
          id: 'TIME SERIES-HJVu23hYmcUu4tOLjcVoF',
          color: '#FC2574',
          y: 134.390625,
          outputPins: [
            {
              y: 154.390625,
              type: 'TIMESERIES',
              x: 486.46875,
              title: 'Time Series',
              id: 'result',
            },
          ],
          width: 304.46875,
          inputPins: [],
          subtitle: 'TIME SERIES',
          title: 'VAL_RESERVOIR_PT_well07',
          x: 182,
          selected: false,
        },
        {
          color: '#9118af',
          inputPins: [
            {
              y: 9.390625,
              types: ['TIMESERIES'],
              x: 288,
              id: 'input0',
              title: 'Input 1',
            },
          ],
          y: -52.609375,
          selected: false,
          functionData: {
            toolFunction: {
              op: 'RESAMPLE',
              description: 'Resamples using aggregate & granularity',
              parameters: [],
              n_outputs: 1,
              n_inputs: 1,
            },
          },
          x: 288,
          outputPins: [
            {
              type: 'TIMESERIES',
              title: 'Output',
              y: 9.390625,
              id: 'out-result',
              x: 680.1875,
            },
          ],
          title: 'Resamples using aggregate & granularity',
          icon: 'Function',
          width: 392.1875,
          subtitle: 'Toolbox Function',
          functionEffectReference: 'TOOLBOX_FUNCTION',
          id: 'Toolbox Function-6o-nfvVU64nG5MrVlvCGI',
        },
        {
          color: '#9118af',
          selected: false,
          outputPins: [
            {
              y: 304.390625,
              type: 'TIMESERIES',
              x: 687.1875,
              id: 'out-result',
              title: 'Output',
            },
          ],
          icon: 'Function',
          width: 392.1875,
          inputPins: [
            {
              types: ['TIMESERIES'],
              title: 'Input 1',
              id: 'input0',
              x: 295,
              y: 304.390625,
            },
          ],
          x: 295,
          subtitle: 'Toolbox Function',
          id: 'Toolbox Function-NJ8GSsEP2JoEfVcBy1S4e',
          title: 'Resamples using aggregate & granularity',
          functionData: {
            toolFunction: {
              n_outputs: 1,
              n_inputs: 1,
              op: 'RESAMPLE',
              description: 'Resamples using aggregate & granularity',
              parameters: [],
            },
          },
          functionEffectReference: 'TOOLBOX_FUNCTION',
          y: 242.390625,
        },
        {
          subtitle: 'Toolbox Function',
          inputPins: [
            {
              x: 770,
              types: ['TIMESERIES', 'CONSTANT'],
              id: 'input0',
              title: 'Input 1',
              y: 126.390625,
            },
            {
              title: 'Input 2',
              types: ['TIMESERIES', 'CONSTANT'],
              y: 158.390625,
              x: 770,
              id: 'input1',
            },
          ],
          selected: false,
          width: 174.875,
          color: '#9118af',
          title: 'Subtraction',
          x: 770,
          functionData: {
            toolFunction: {
              description: 'Subtraction',
              n_outputs: 1,
              op: 'SUB',
              n_inputs: 2,
              parameters: [],
            },
          },
          functionEffectReference: 'TOOLBOX_FUNCTION',
          icon: 'Function',
          id: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
          y: 64.390625,
          outputPins: [
            {
              y: 126.390625,
              title: 'Output',
              type: 'TIMESERIES',
              id: 'out-result',
              x: 944.875,
            },
          ],
        },
        {
          color: '#4A67FB',
          selected: false,
          y: 72.390625,
          x: 1425,
          icon: 'Icon',
          inputPins: [
            {
              y: 134.390625,
              types: ['TIMESERIES'],
              title: 'Time Series',
              id: 'datapoints',
              x: 1425,
            },
          ],
          subtitle: 'TIMESERIES',
          width: 162,
          outputPins: [],
          functionEffectReference: 'OUTPUT',
          id: 'TIMESERIES-xalz43XcGFrlaP2-hngHN',
          title: 'Output',
        },
        {
          color: '#9118af',
          inputPins: [
            {
              y: -25.609375,
              id: 'input0',
              types: ['TIMESERIES'],
              x: 996,
              title: 'Input 1',
            },
          ],
          subtitle: 'Toolbox Function',
          selected: false,
          title: 'Data smoother - Saviztky-Golay Filter',
          width: 361.09375,
          x: 996,
          outputPins: [
            {
              type: 'TIMESERIES',
              x: 1357.09375,
              id: 'out-result',
              y: -25.609375,
              title: 'Output',
            },
          ],
          functionData: {
            window_length: 10,
            toolFunction: {
              n_outputs: 1,
              parameters: [
                {
                  param: 'window_length',
                  type: 'int',
                  default_value: null,
                },
                {
                  param: 'polyorder',
                  type: 'int',
                  default_value: 1,
                },
              ],
              description: 'Data smoother - Saviztky-Golay Filter',
              n_inputs: 1,
              op: 'SG_SMOOTHER',
            },
            polyorder: 2,
          },
          y: -87.609375,
          id: 'Toolbox Function-d7OWoHOWyiAjaICV-QkMh',
          functionEffectReference: 'TOOLBOX_FUNCTION',
          icon: 'Function',
        },
      ],
      id: 'EkIfFAKj7_PkZGyzJqrSG',
      connections: {
        TfhMeTGvtvUc2KZmw1BgY: {
          inputPin: {
            nodeId: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
            pinId: 'input1',
          },
          id: 'TfhMeTGvtvUc2KZmw1BgY',
          outputPin: {
            nodeId: 'Toolbox Function-NJ8GSsEP2JoEfVcBy1S4e',
            pinId: 'out-result',
          },
        },
        WqYUrjj9CStAzcQP49tDW: {
          id: 'WqYUrjj9CStAzcQP49tDW',
          inputPin: {
            nodeId: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
            pinId: 'input0',
          },
          outputPin: {
            nodeId: 'Toolbox Function-6o-nfvVU64nG5MrVlvCGI',
            pinId: 'out-result',
          },
        },
        qvdGMY4IKd9JpcTAJcXQ8: {
          outputPin: {
            pinId: 'result',
            nodeId: 'TIME SERIES-HJVu23hYmcUu4tOLjcVoF',
          },
          inputPin: {
            nodeId: 'Toolbox Function-NJ8GSsEP2JoEfVcBy1S4e',
            pinId: 'input0',
          },
          id: 'qvdGMY4IKd9JpcTAJcXQ8',
        },
        toKn95HQNvBpH_LPfkvkM: {
          outputPin: {
            nodeId: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
            pinId: 'out-result',
          },
          inputPin: {
            nodeId: 'Toolbox Function-d7OWoHOWyiAjaICV-QkMh',
            pinId: 'input0',
          },
          id: 'toKn95HQNvBpH_LPfkvkM',
        },
        Vq1rcwlTRkmGQJr4ltkbQ: {
          id: 'Vq1rcwlTRkmGQJr4ltkbQ',
          outputPin: {
            pinId: 'out-result',
            nodeId: 'Toolbox Function-d7OWoHOWyiAjaICV-QkMh',
          },
          inputPin: {
            pinId: 'datapoints',
            nodeId: 'TIMESERIES-xalz43XcGFrlaP2-hngHN',
          },
        },
        G4mvHmzd_QyUWH0lldbxg: {
          inputPin: {
            pinId: 'input0',
            nodeId: 'Toolbox Function-6o-nfvVU64nG5MrVlvCGI',
          },
          outputPin: {
            pinId: 'result',
            nodeId: 'TIME SERIES-krihrlBzGmwCbf9pRuM-r',
          },
          id: 'G4mvHmzd_QyUWH0lldbxg',
        },
      },
    };

    const steps = getStepsFromWorkflowConnect(
      chart,
      workflow.nodes,
      workflow.connections
    );

    expect(steps).toEqual([
      {
        step: 0,
        op: 'RESAMPLE',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_RESERVOIR_PT_well07',
          },
        ],
      },
      {
        step: 1,
        op: 'RESAMPLE',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_RESERVOIR_PT_well01',
          },
        ],
      },
      {
        step: 2,
        op: 'SUB',
        inputs: [
          {
            type: 'result',
            value: 1,
          },
          {
            type: 'result',
            value: 0,
          },
        ],
      },
      {
        step: 3,
        op: 'SG_SMOOTHER',
        inputs: [
          {
            type: 'result',
            value: 2,
          },
        ],
        params: {
          window_length: 10,
          polyorder: 2,
        },
      },
      {
        step: 4,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 3,
          },
        ],
      },
    ]);
  });

  it('generates correct steps (noop computation)', () => {
    const chart: Chart = {
      id: 'chart-1',
      name: 'Chart 1',
      version: 1,
      user: 'abc@cognite.com',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      dateFrom: new Date().toJSON(),
      dateTo: new Date().toJSON(),
    };

    const workflow: ChartWorkflowV1 = {
      version: '',
      color: '#FFF',
      enabled: true,
      nodes: [
        {
          inputPins: [],
          width: 304.46875,
          y: -163.609375,
          functionData: {
            timeSeriesExternalId: 'VAL_RESERVOIR_PT_well01',
          },
          functionEffectReference: 'TIME_SERIES_REFERENCE',
          subtitle: 'TIME SERIES',
          outputPins: [
            {
              type: 'TIMESERIES',
              id: 'result',
              x: 486.46875,
              title: 'Time Series',
              y: -143.609375,
            },
          ],
          icon: 'Function',
          selected: false,
          id: 'TIME SERIES-krihrlBzGmwCbf9pRuM-r',
          color: '#FC2574',
          title: 'VAL_RESERVOIR_PT_well01',
          x: 182,
        },
        {
          color: '#4A67FB',
          selected: false,
          y: 72.390625,
          x: 1425,
          icon: 'Icon',
          inputPins: [
            {
              y: 134.390625,
              types: ['TIMESERIES'],
              title: 'Time Series',
              id: 'datapoints',
              x: 1425,
            },
          ],
          subtitle: 'TIMESERIES',
          width: 162,
          outputPins: [],
          functionEffectReference: 'OUTPUT',
          id: 'TIMESERIES-xalz43XcGFrlaP2-hngHN',
          title: 'Output',
        },
      ],
      id: 'EkIfFAKj7_PkZGyzJqrSG',
      connections: {
        Vq1rcwlTRkmGQJr4ltkbQ: {
          id: 'Vq1rcwlTRkmGQJr4ltkbQ',
          outputPin: {
            pinId: 'result',
            nodeId: 'TIME SERIES-krihrlBzGmwCbf9pRuM-r',
          },
          inputPin: {
            pinId: 'datapoints',
            nodeId: 'TIMESERIES-xalz43XcGFrlaP2-hngHN',
          },
        },
      },
      name: 'New Calculation',
    };

    const steps = getStepsFromWorkflowConnect(
      chart,
      workflow.nodes,
      workflow.connections
    );

    expect(steps).toEqual([
      {
        step: 0,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_RESERVOIR_PT_well01',
          },
        ],
      },
    ]);
  });

  it('generates correct steps (dangling/unconnected nodes)', () => {
    const chart: Chart = {
      id: 'chart-1',
      name: 'Chart 1',
      version: 1,
      user: 'abc@cognite.com',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      dateFrom: new Date().toJSON(),
      dateTo: new Date().toJSON(),
    };

    const workflow: ChartWorkflowV1 = {
      version: '',
      name: 'New Calculation',
      color: '#FFF',
      enabled: true,
      nodes: [
        {
          functionData: {
            timeSeriesExternalId: 'VAL_RESERVOIR_PT_well01',
          },
          outputPins: [
            {
              id: 'result',
              type: 'TIMESERIES',
              x: 486.46875,
              title: 'Time Series',
              y: -143.609375,
            },
          ],
          subtitle: 'TIME SERIES',
          width: 304.46875,
          y: -163.609375,
          functionEffectReference: 'TIME_SERIES_REFERENCE',
          title: 'VAL_RESERVOIR_PT_well01',
          color: '#FC2574',
          inputPins: [],
          x: 182,
          icon: 'Function',
          id: 'TIME SERIES-krihrlBzGmwCbf9pRuM-r',
          selected: false,
        },
        {
          title: 'VAL_RESERVOIR_PT_well07',
          functionEffectReference: 'TIME_SERIES_REFERENCE',
          y: 134.390625,
          x: 182,
          outputPins: [
            {
              x: 486.46875,
              id: 'result',
              title: 'Time Series',
              type: 'TIMESERIES',
              y: 154.390625,
            },
          ],
          icon: 'Function',
          color: '#FC2574',
          width: 304.46875,
          inputPins: [],
          functionData: {
            timeSeriesExternalId: 'VAL_RESERVOIR_PT_well07',
          },
          id: 'TIME SERIES-HJVu23hYmcUu4tOLjcVoF',
          subtitle: 'TIME SERIES',
          selected: false,
        },
        {
          selected: false,
          color: '#9118af',
          title: 'Resamples using aggregate & granularity',
          functionEffectReference: 'TOOLBOX_FUNCTION',
          icon: 'Function',
          id: 'Toolbox Function-6o-nfvVU64nG5MrVlvCGI',
          width: 392.1875,
          inputPins: [
            {
              x: 288,
              title: 'Input 1',
              id: 'input0',
              y: 9.390625,
              types: ['TIMESERIES'],
            },
          ],
          subtitle: 'Toolbox Function',
          outputPins: [
            {
              id: 'out-result',
              title: 'Output',
              type: 'TIMESERIES',
              x: 680.1875,
              y: 9.390625,
            },
          ],
          functionData: {
            toolFunction: {
              n_inputs: 1,
              op: 'RESAMPLE',
              parameters: [],
              n_outputs: 1,
              description: 'Resamples using aggregate & granularity',
            },
          },
          x: 288,
          y: -52.609375,
        },
        {
          y: 242.390625,
          id: 'Toolbox Function-NJ8GSsEP2JoEfVcBy1S4e',
          color: '#9118af',
          functionEffectReference: 'TOOLBOX_FUNCTION',
          functionData: {
            toolFunction: {
              n_outputs: 1,
              parameters: [],
              op: 'RESAMPLE',
              n_inputs: 1,
              description: 'Resamples using aggregate & granularity',
            },
          },
          width: 392.1875,
          subtitle: 'Toolbox Function',
          icon: 'Function',
          selected: false,
          inputPins: [
            {
              y: 304.390625,
              types: ['TIMESERIES'],
              x: 295,
              id: 'input0',
              title: 'Input 1',
            },
          ],
          title: 'Resamples using aggregate & granularity',
          outputPins: [
            {
              y: 304.390625,
              type: 'TIMESERIES',
              id: 'out-result',
              x: 687.1875,
              title: 'Output',
            },
          ],
          x: 295,
        },
        {
          y: 64.390625,
          icon: 'Function',
          outputPins: [
            {
              y: 126.390625,
              title: 'Output',
              x: 944.875,
              id: 'out-result',
              type: 'TIMESERIES',
            },
          ],
          title: 'Subtraction',
          selected: false,
          functionData: {
            toolFunction: {
              parameters: [],
              op: 'SUB',
              n_inputs: 2,
              description: 'Subtraction',
              n_outputs: 1,
            },
          },
          subtitle: 'Toolbox Function',
          width: 174.875,
          id: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
          inputPins: [
            {
              x: 770,
              title: 'Input 1',
              y: 126.390625,
              id: 'input0',
              types: ['TIMESERIES', 'CONSTANT'],
            },
            {
              types: ['TIMESERIES', 'CONSTANT'],
              title: 'Input 2',
              y: 158.390625,
              id: 'input1',
              x: 770,
            },
          ],
          color: '#9118af',
          functionEffectReference: 'TOOLBOX_FUNCTION',
          x: 770,
        },
        {
          width: 162,
          selected: false,
          inputPins: [
            {
              types: ['TIMESERIES'],
              y: 134.390625,
              title: 'Time Series',
              id: 'datapoints',
              x: 1425,
            },
          ],
          subtitle: 'TIMESERIES',
          x: 1425,
          icon: 'Icon',
          outputPins: [],
          color: '#4A67FB',
          y: 72.390625,
          functionEffectReference: 'OUTPUT',
          title: 'Output',
          id: 'TIMESERIES-xalz43XcGFrlaP2-hngHN',
        },
        {
          color: '#9118af',
          functionEffectReference: 'TOOLBOX_FUNCTION',
          width: 361.09375,
          id: 'Toolbox Function-d7OWoHOWyiAjaICV-QkMh',
          functionData: {
            window_length: 10,
            polyorder: 2,
            toolFunction: {
              description: 'Data smoother - Saviztky-Golay Filter',
              n_inputs: 1,
              parameters: [
                {
                  type: 'int',
                  default_value: null,
                  param: 'window_length',
                },
                {
                  default_value: 1,
                  param: 'polyorder',
                  type: 'int',
                },
              ],
              op: 'SG_SMOOTHER',
              n_outputs: 1,
            },
          },
          title: 'Data smoother - Saviztky-Golay Filter',
          outputPins: [
            {
              y: -25.609375,
              type: 'TIMESERIES',
              x: 1357.09375,
              title: 'Output',
              id: 'out-result',
            },
          ],
          y: -87.609375,
          icon: 'Function',
          selected: false,
          inputPins: [
            {
              id: 'input0',
              y: -25.609375,
              x: 996,
              types: ['TIMESERIES'],
              title: 'Input 1',
            },
          ],
          x: 996,
          subtitle: 'Toolbox Function',
        },
        {
          id: 'Constant-8FZphpaT45r_og9UdsqoE',
          title: '100',
          subtitle: 'Constant',
          color: '#FC2574',
          icon: 'Function',
          inputPins: [],
          outputPins: [
            {
              id: 'result',
              title: 'Constant',
              type: 'CONSTANT',
              x: 1219.046875,
              y: 121.390625,
            },
          ],
          functionEffectReference: 'CONSTANT',
          functionData: {
            value: 100,
          },
          x: 1085,
          y: 101.390625,
          selected: false,
          width: 134.046875,
        },
        {
          id: 'Toolbox Function-hA608KiBik0OvlUb9U6-h',
          title: 'Multiplication',
          subtitle: 'Toolbox Function',
          color: '#9118af',
          icon: 'Function',
          inputPins: [
            {
              id: 'input0',
              title: 'Input 1',
              types: ['TIMESERIES', 'CONSTANT'],
            },
            {
              id: 'input1',
              title: 'Input 2',
              types: ['TIMESERIES', 'CONSTANT'],
            },
          ],
          outputPins: [
            {
              id: 'out-result',
              title: 'Output',
              type: 'TIMESERIES',
            },
          ],
          functionEffectReference: 'TOOLBOX_FUNCTION',
          functionData: {
            toolFunction: {
              description: 'Multiplication',
              n_inputs: 2,
              n_outputs: 1,
              op: 'MUL',
              parameters: [],
            },
          },
          x: 1108,
          y: 206.390625,
          selected: false,
          width: 198.09375,
        },
      ],
      id: 'EkIfFAKj7_PkZGyzJqrSG',
      connections: {
        G4mvHmzd_QyUWH0lldbxg: {
          outputPin: {
            pinId: 'result',
            nodeId: 'TIME SERIES-krihrlBzGmwCbf9pRuM-r',
          },
          inputPin: {
            pinId: 'input0',
            nodeId: 'Toolbox Function-6o-nfvVU64nG5MrVlvCGI',
          },
          id: 'G4mvHmzd_QyUWH0lldbxg',
        },
        qvdGMY4IKd9JpcTAJcXQ8: {
          outputPin: {
            pinId: 'result',
            nodeId: 'TIME SERIES-HJVu23hYmcUu4tOLjcVoF',
          },
          id: 'qvdGMY4IKd9JpcTAJcXQ8',
          inputPin: {
            pinId: 'input0',
            nodeId: 'Toolbox Function-NJ8GSsEP2JoEfVcBy1S4e',
          },
        },
        WqYUrjj9CStAzcQP49tDW: {
          outputPin: {
            nodeId: 'Toolbox Function-6o-nfvVU64nG5MrVlvCGI',
            pinId: 'out-result',
          },
          inputPin: {
            pinId: 'input0',
            nodeId: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
          },
          id: 'WqYUrjj9CStAzcQP49tDW',
        },
        Vq1rcwlTRkmGQJr4ltkbQ: {
          outputPin: {
            pinId: 'out-result',
            nodeId: 'Toolbox Function-d7OWoHOWyiAjaICV-QkMh',
          },
          id: 'Vq1rcwlTRkmGQJr4ltkbQ',
          inputPin: {
            pinId: 'datapoints',
            nodeId: 'TIMESERIES-xalz43XcGFrlaP2-hngHN',
          },
        },
        TfhMeTGvtvUc2KZmw1BgY: {
          id: 'TfhMeTGvtvUc2KZmw1BgY',
          outputPin: {
            pinId: 'out-result',
            nodeId: 'Toolbox Function-NJ8GSsEP2JoEfVcBy1S4e',
          },
          inputPin: {
            nodeId: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
            pinId: 'input1',
          },
        },
        toKn95HQNvBpH_LPfkvkM: {
          outputPin: {
            pinId: 'out-result',
            nodeId: 'Toolbox Function-j3rRv_uihGbwdW75WmD6t',
          },
          id: 'toKn95HQNvBpH_LPfkvkM',
          inputPin: {
            pinId: 'input0',
            nodeId: 'Toolbox Function-d7OWoHOWyiAjaICV-QkMh',
          },
        },
      },
    };

    const steps = getStepsFromWorkflowConnect(
      chart,
      workflow.nodes,
      workflow.connections
    );

    expect(steps).toEqual([
      {
        step: 0,
        op: 'RESAMPLE',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_RESERVOIR_PT_well07',
          },
        ],
      },
      {
        step: 1,
        op: 'RESAMPLE',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_RESERVOIR_PT_well01',
          },
        ],
      },
      {
        step: 2,
        op: 'SUB',
        inputs: [
          {
            type: 'result',
            value: 1,
          },
          {
            type: 'result',
            value: 0,
          },
        ],
      },
      {
        step: 3,
        op: 'SG_SMOOTHER',
        inputs: [
          {
            type: 'result',
            value: 2,
          },
        ],
        params: {
          window_length: 10,
          polyorder: 2,
        },
      },
      {
        step: 4,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 3,
          },
        ],
      },
    ]);
  });

  it('generates the correct steps when using referencing an existing calculation as input', () => {
    const chart: Chart = {
      timeSeriesCollection: [
        {
          createdAt: 123,
          statisticsCalls: [
            {
              callDate: 1621454563567,
              callId: '8389322454513388',
            },
          ],
          name: 'LOR_ARENDAL_WELL_21_Well_HYDROCARBON_BEST_DAY_PREDICTION',
          lineWeight: 1,
          id: 'GvO4-rxxb2IpOHuNkvDFa',
          unit: 'psi',
          enabled: false,
          tsId: 1199025179480785,
          tsExternalId:
            'LOR_ARENDAL_WELL_21_Well_HYDROCARBON_BEST_DAY_PREDICTION',
          preferredUnit: 'bar',
          lineStyle: 'solid',
          color: '#fa4d56',
          description: '-',
          originalUnit: 'BOE',
          displayMode: 'lines',
        },
        {
          createdAt: 123,
          originalUnit: 'M3',
          lineWeight: 1,
          enabled: false,
          color: '#009d9a',
          unit: 'M3',
          statisticsCalls: [
            {
              callDate: 1621454281932,
              callId: '3095317154202764',
            },
          ],
          tsExternalId: 'LOR_ARENDAL_WELL_21_Well_GROSS_PRODUCTION',
          displayMode: 'lines',
          name: 'LOR_ARENDAL_WELL_21_Well_GROSS_PRODUCTION',
          id: 'Ci-XF99sKEQXIyUo3lvOg',
          range: [433.82, 499.611],
          lineStyle: 'solid',
          preferredUnit: 'M3',
          tsId: 1822622045765216,
          description: '-',
        },
      ],
      user: 'eirik.vullum@cognite.com',
      updatedAt: 1621454300330,
      dateFrom: '2020-05-30T15:15:21.572Z',
      public: false,
      version: 1,
      dateTo: '2021-07-15T12:38:07.847Z',
      name: 'New chart',
      createdAt: 1619778109118,
      workflowCollection: [
        {
          version: '',
          connections: {
            AT6AsmkNvU9Ar78xSRsri: {
              inputPin: {
                pinId: 'datapoints',
                nodeId: 'V6aBOfCjZdD5XqUJ7S_Y3',
              },
              id: 'AT6AsmkNvU9Ar78xSRsri',
              outputPin: {
                pinId: 'result',
                nodeId: 'IPqAxFHiFqnJ3--lB-M8_',
              },
            },
          },
          preferredUnit: 'psi',
          name: 'Calculation 1',
          enabled: true,
          calls: [
            {
              callId: '1546401397992188',
              callDate: 1621454563745,
              hash: -1992684405,
            },
          ],
          id: 'dQybxvtQFpLzu4REvWsbA',
          lineWeight: 1,
          nodes: [
            {
              functionEffectReference: 'OUTPUT',
              inputPins: [
                {
                  title: 'Time Series',
                  types: ['TIMESERIES'],
                  id: 'datapoints',
                },
              ],
              calls: [],
              x: 834.75,
              y: 173,
              title: 'Output',
              outputPins: [],
              icon: 'Icon',
              id: 'V6aBOfCjZdD5XqUJ7S_Y3',
              subtitle: 'TIMESERIES',
              color: '#4A67FB',
            },
            {
              id: 'IPqAxFHiFqnJ3--lB-M8_',
              calls: [],
              y: 170,
              inputPins: [],
              outputPins: [
                {
                  id: 'result',
                  y: 190,
                  x: 674.59375,
                  title: 'Time Series',
                  type: 'TIMESERIES',
                },
              ],
              selected: false,
              color: '#FC2574',
              x: 140.75,
              functionEffectReference: 'SOURCE_REFERENCE',
              subtitle: 'Source',
              functionData: {
                sourceId: 'LOR_ARENDAL_WELL_21_Well_GROSS_PRODUCTION',
                type: 'timeseries',
              },
              title: 'LOR_ARENDAL_WELL_21_Well_GROSS_PRODUCTION',
              icon: 'Function',
              width: 533.84375,
            },
          ],
          unit: 'mm',
          color: '#6929c4',
          lineStyle: 'solid',
        },
        {
          version: '',
          lineStyle: 'solid',
          id: 'j9xhfVh8kvNU3pgq8PYPM',
          connections: {
            'QIfEea93SE7ZlXPhqS-J3': {
              id: 'QIfEea93SE7ZlXPhqS-J3',
              inputPin: {
                nodeId: 'MeCBQUq5iuPaRIWev-2F4',
                pinId: 'datapoints',
              },
              outputPin: {
                nodeId: 'Ink93Q8Zjal-XikqBN1LK',
                pinId: 'result',
              },
            },
          },
          enabled: true,
          lineWeight: 1,
          color: '#1192e8',
          calls: [
            {
              callId: '8725109662036577',
              callDate: 1621454563651,
              hash: -1770418272,
            },
          ],
          nodes: [
            {
              outputPins: [
                {
                  id: 'result',
                  title: 'Time Series',
                  x: 312.09375,
                  y: 130,
                  type: 'TIMESERIES',
                },
              ],
              subtitle: 'Source',
              id: 'Ink93Q8Zjal-XikqBN1LK',
              x: 146.03125,
              width: 166.0625,
              y: 110,
              icon: 'Function',
              inputPins: [],
              selected: false,
              functionEffectReference: 'SOURCE_REFERENCE',
              title: 'Calculation 1',
              functionData: {
                sourceId: 'dQybxvtQFpLzu4REvWsbA',
                type: 'workflow',
              },
              calls: [],
              color: '#FC2574',
            },
            {
              x: 631.03125,
              color: '#4A67FB',
              icon: 'Icon',
              inputPins: [
                {
                  id: 'datapoints',
                  title: 'Time Series',
                  types: ['TIMESERIES'],
                },
              ],
              title: 'Output',
              outputPins: [],
              id: 'MeCBQUq5iuPaRIWev-2F4',
              subtitle: 'TIMESERIES',
              calls: [],
              y: 85,
              functionEffectReference: 'OUTPUT',
            },
          ],
          name: 'New Calculation',
        },
      ],
      id: 'b1oGPx-NJNVpn34tksB2w',
      dirty: false,
    };

    const steps = getStepsFromWorkflowConnect(
      chart,
      (chart.workflowCollection?.[1] as ChartWorkflowV1).nodes,
      (chart.workflowCollection?.[1] as ChartWorkflowV1).connections
    );

    expect(steps).toEqual([
      {
        step: 0,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'ts',
            value: 'LOR_ARENDAL_WELL_21_Well_GROSS_PRODUCTION',
          },
        ],
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 0,
          },
        ],
      },
    ]);
  });

  it('generates the correct steps when using referencing an existing calculation as input (nested)', () => {
    const chart: Chart = {
      id: 'I_SiImvdXOKPr4SCGeXQw',
      user: 'eirik.vullum@cognite.com',
      userInfo: {
        id: 'eirik.vullum@cognite.com',
        email: 'eirik.vullum@cognite.com',
        displayName: 'eirik.vullum@cognite.com',
      },
      name: 'New chart',
      updatedAt: 1631797138912,
      createdAt: 1631797138912,
      timeSeriesCollection: [
        {
          id: 'kfanBbQHV_UdLvtgLgF5L',
          name: 'LOR_ARENDAL_WELL_19_Well_HYDROCARBON_BEST_DAY_PREDICTION',
          tsId: 679127532803421,
          tsExternalId:
            'LOR_ARENDAL_WELL_19_Well_HYDROCARBON_BEST_DAY_PREDICTION',
          unit: 'BOE',
          type: 'timeseries',
          originalUnit: 'BOE',
          preferredUnit: 'BOE',
          color: '#6929c4',
          lineWeight: 1,
          lineStyle: 'solid',
          displayMode: 'lines',
          enabled: false,
          description: '-',
          range: [24.8, 35.92661870503597],
          createdAt: 1631797145879,
        },
      ],
      workflowCollection: [
        {
          version: '',
          id: '0YWZdy2MeFv0ccqtO6c7q',
          name: 'Passthrough level 1',
          color: '#1192e8',
          lineWeight: 1,
          lineStyle: 'solid',
          enabled: false,
          nodes: [
            {
              id: 'nh2yBa91pMCXfHoW-6amy',
              title: 'LOR_ARENDAL_WELL_19_Well_HYDROCARBON_BEST_DAY_PREDICTION',
              subtitle: 'Time Series',
              color: '#FC2574',
              icon: 'Function',
              inputPins: [],
              outputPins: [
                {
                  id: 'result',
                  title: 'Time Series',
                  type: 'TIMESERIES',
                  x: 648.8125,
                  y: 103,
                },
              ],
              functionEffectReference: 'SOURCE_REFERENCE',
              functionData: {
                type: 'timeseries',
                sourceId:
                  'LOR_ARENDAL_WELL_19_Well_HYDROCARBON_BEST_DAY_PREDICTION',
              },
              x: -54.75,
              y: 83,
              calls: [],
              selected: false,
              width: 703.5625,
            },
            {
              id: '084Pu2fMWvCZDf3wyLHl0',
              title: 'Output',
              subtitle: 'CHART OUTPUT',
              color: '#4A67FB',
              icon: 'Icon',
              outputPins: [],
              inputPins: [
                {
                  id: 'datapoints',
                  title: 'Time Series',
                  types: ['TIMESERIES'],
                },
              ],
              functionEffectReference: 'OUTPUT',
              x: 781.25,
              y: 35,
              calls: [],
            },
          ],
          connections: {
            agLzZGSBvsfIf0q3nDnZD: {
              id: 'agLzZGSBvsfIf0q3nDnZD',
              outputPin: {
                nodeId: 'nh2yBa91pMCXfHoW-6amy',
                pinId: 'result',
              },
              inputPin: {
                nodeId: '084Pu2fMWvCZDf3wyLHl0',
                pinId: 'datapoints',
              },
            },
          },
          createdAt: 1631797165774,
          unit: '',
          preferredUnit: '',
          type: 'workflow',
          calls: [
            {
              callId: '14326244388381856236',
              callDate: 1631797963030,
              hash: -2059100973,
            },
          ],
          range: [22.989529137718534, 34.19063239524058],
        },
        {
          version: '',
          id: 'HSkEktNr8Mvj_qfNFJFko',
          name: 'Passthrough level 2',
          color: '#005d5d',
          lineWeight: 1,
          lineStyle: 'solid',
          enabled: false,
          nodes: [
            {
              id: 'i6RkowH4-l5w0gMz9Y5Dz',
              title: 'Passthrough level 1',
              subtitle: 'Calculation',
              color: '#FC2574',
              icon: 'Function',
              inputPins: [],
              outputPins: [
                {
                  id: 'result',
                  title: 'Time Series',
                  type: 'TIMESERIES',
                  x: 285.3125,
                  y: 55,
                },
              ],
              functionEffectReference: 'SOURCE_REFERENCE',
              functionData: {
                type: 'workflow',
                sourceId: '0YWZdy2MeFv0ccqtO6c7q',
              },
              x: 176.25,
              y: 35,
              calls: [],
              selected: false,
              width: 109.0625,
            },
            {
              id: 'zeT_JB_v8Z0lTD0kZCc6H',
              title: 'Output',
              subtitle: 'CHART OUTPUT',
              color: '#4A67FB',
              icon: 'Icon',
              outputPins: [],
              inputPins: [
                {
                  id: 'datapoints',
                  title: 'Time Series',
                  types: ['TIMESERIES'],
                },
              ],
              functionEffectReference: 'OUTPUT',
              x: 733.25,
              y: 47,
              calls: [],
            },
          ],
          connections: {
            bNlgWTVY0Na_A8B52G8oH: {
              id: 'bNlgWTVY0Na_A8B52G8oH',
              outputPin: {
                nodeId: 'i6RkowH4-l5w0gMz9Y5Dz',
                pinId: 'result',
              },
              inputPin: {
                nodeId: 'zeT_JB_v8Z0lTD0kZCc6H',
                pinId: 'datapoints',
              },
            },
          },
          createdAt: 1631797203555,
          unit: '',
          preferredUnit: '',
          type: 'workflow',
          calls: [
            {
              callId: '14323333345447973356',
              callDate: 1631797963014,
              hash: 1736938706,
            },
          ],
          range: [21.214651360265208, 31.295644292035046],
        },
        {
          version: '',
          id: 'VC7Q4qlNe92CTivk2Ww1N',
          name: 'Passthrough level 3',
          color: '#9f1853',
          lineWeight: 1,
          lineStyle: 'solid',
          enabled: true,
          nodes: [
            {
              id: 'uo9F0ECpJkrfBkqBwsS2I',
              title: 'Passthrough level 2',
              subtitle: 'Calculation',
              color: '#FC2574',
              icon: 'Function',
              inputPins: [],
              outputPins: [
                {
                  id: 'result',
                  title: 'Time Series',
                  type: 'TIMESERIES',
                  x: 286.3125,
                  y: 126,
                },
              ],
              functionEffectReference: 'SOURCE_REFERENCE',
              functionData: {
                type: 'workflow',
                sourceId: 'HSkEktNr8Mvj_qfNFJFko',
              },
              x: 177.25,
              y: 106,
              calls: [],
              selected: false,
              width: 109.0625,
            },
            {
              id: 'aNwdGmQqtYj_FHxmZWp1I',
              title: 'Output',
              subtitle: 'CHART OUTPUT',
              color: '#4A67FB',
              icon: 'Icon',
              outputPins: [],
              inputPins: [
                {
                  id: 'datapoints',
                  title: 'Time Series',
                  types: ['TIMESERIES'],
                  x: 757.25,
                  y: 156,
                },
              ],
              functionEffectReference: 'OUTPUT',
              x: 757.25,
              y: 94,
              calls: [],
              selected: false,
              width: 162,
            },
          ],
          connections: {
            hwHuAg2UxJRBtEuX56ZR7: {
              id: 'hwHuAg2UxJRBtEuX56ZR7',
              outputPin: {
                nodeId: 'uo9F0ECpJkrfBkqBwsS2I',
                pinId: 'result',
              },
              inputPin: {
                nodeId: 'aNwdGmQqtYj_FHxmZWp1I',
                pinId: 'datapoints',
              },
            },
          },
          createdAt: 1631797233541,
          unit: '',
          preferredUnit: '',
          type: 'workflow',
          calls: [
            {
              callId: '14322283655440830956',
              callDate: 1631797962909,
              hash: -360731468,
            },
          ],
          range: [-1, 4.9714285714285715],
        },
      ],
      dateFrom: '2020-09-02T16:56:37.588Z',
      dateTo: '2021-09-02T16:57:37.587Z',
      public: false,
      version: 1,
      settings: {
        showYAxis: true,
        showMinMax: false,
        showGridlines: true,
        mergeUnits: false,
      },
      dirty: true,
      sourceCollection: [
        {
          id: 'VC7Q4qlNe92CTivk2Ww1N',
          type: 'workflow',
        },
        {
          id: 'HSkEktNr8Mvj_qfNFJFko',
          type: 'workflow',
        },
        {
          id: '0YWZdy2MeFv0ccqtO6c7q',
          type: 'workflow',
        },
        {
          id: 'kfanBbQHV_UdLvtgLgF5L',
          type: 'timeseries',
        },
      ],
    };

    const firstLevelSteps = getStepsFromWorkflowConnect(
      chart,
      (chart.workflowCollection?.[1] as ChartWorkflowV1).nodes,
      (chart.workflowCollection?.[1] as ChartWorkflowV1).connections
    );

    expect(firstLevelSteps).toEqual([
      {
        step: 0,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'ts',
            value: 'LOR_ARENDAL_WELL_19_Well_HYDROCARBON_BEST_DAY_PREDICTION',
          },
        ],
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 0,
          },
        ],
      },
    ]);

    const secondLevelSteps = getStepsFromWorkflowConnect(
      chart,
      (chart.workflowCollection?.[2] as ChartWorkflowV1).nodes,
      (chart.workflowCollection?.[2] as ChartWorkflowV1).connections
    );

    expect(secondLevelSteps).toEqual([
      {
        step: 0,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'ts',
            value: 'LOR_ARENDAL_WELL_19_Well_HYDROCARBON_BEST_DAY_PREDICTION',
          },
        ],
      },
      {
        step: 1,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 0,
          },
        ],
      },
      {
        step: 2,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 1,
          },
        ],
      },
    ]);
  });
});

describe('getStepsFromWorkflowReactFlow', () => {
  it('generates correct steps (empty workflow)', () => {
    const chart: Chart = {
      id: 'chart-1',
      name: 'Chart 1',
      version: 1,
      user: 'abc@cognite.com',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      dateFrom: new Date().toJSON(),
      dateTo: new Date().toJSON(),
    };

    const workflow: ChartWorkflowV2 = {
      version: 'v2',
      id: 'abc123',
      name: 'Empty workflow',
      color: '#FFF',
      flow: { elements: [], position: [0, 0], zoom: 1 },
      enabled: true,
    };

    const steps = getStepsFromWorkflowReactFlow(chart, workflow.flow);

    expect(steps).toEqual([]);
  });

  it('generates correct steps (only output node)', () => {
    const chart: Chart = {
      id: 'chart-1',
      name: 'Chart 1',
      version: 1,
      user: 'abc@cognite.com',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      dateFrom: new Date().toJSON(),
      dateTo: new Date().toJSON(),
    };

    const workflow: ChartWorkflowV2 = {
      version: 'v2',
      id: 'abc123',
      name: 'Empty workflow',
      color: '#FFF',
      flow: {
        elements: [
          {
            data: {
              color: '#1192e8',
              name: 'New Calculation',
            },
            type: 'CalculationOutput',
            position: {
              x: 394,
              y: 127,
            },
            id: 'DJ57sdlcczCoc9--uOF2_',
          },
        ],
        position: [0, 0],
        zoom: 1,
      },
      enabled: true,
    };

    const steps = getStepsFromWorkflowReactFlow(chart, workflow.flow);
    expect(steps).toEqual([{ step: 0, op: 'PASSTHROUGH', inputs: [] }]);
  });

  it('generates correct steps (multistep computation)', () => {
    const chart: Chart = {
      id: 'chart-1',
      name: 'Chart 1',
      version: 1,
      user: 'abc@cognite.com',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      dateFrom: new Date().toJSON(),
      dateTo: new Date().toJSON(),
      timeSeriesCollection: [
        {
          id: 'j350Z4nwnOfk212Nu3bks',
          type: 'timeseries',
          name: 'Pressure 1019',
          tsExternalId: 'VAL_21_PT_1019_04:Z.X.Value',
          tsId: 4470513466595936,
          enabled: true,
          createdAt: 1635243072437,
          color: '#1192e8',
        },
        {
          id: 'RvXihRaJJujRDDFKC4D1-',
          tsExternalId: 'VAL_21_PT_1017_04:Z.X.Value',
          name: 'Pressure 1017',
          type: 'timeseries',
          tsId: 1561976339625775,
          enabled: true,
          createdAt: 1635243072437,
          color: '#1192e8',
        },
      ],
    };

    const workflow: ChartWorkflowV2 = {
      version: 'v2',
      id: 'abc123',
      name: 'Empty workflow',
      color: '#FFF',
      flow: {
        elements: [
          {
            id: 'w5ivU9w58jxfUz7htTPUe',
            type: 'CalculationOutput',
            data: {
              color: '#6929c4',
              name: 'New Calculation',
            },
            position: {
              x: 1031,
              y: 108,
            },
          },
          {
            id: 'ZNyEwM0gqzMpXaSd_GPKW',
            type: 'CalculationInput',
            position: {
              x: 96,
              y: 84,
            },
            data: {
              type: 'timeseries',
              sourceOptions: [],
              selectedSourceId: 'j350Z4nwnOfk212Nu3bks',
            },
          },
          {
            data: {
              sourceOptions: [],
              type: 'timeseries',
              selectedSourceId: 'RvXihRaJJujRDDFKC4D1-',
            },
            id: 'x1Psfywpu3O2BXwHkqH-K',
            type: 'CalculationInput',
            position: {
              x: 99,
              y: 228,
            },
          },
          {
            type: 'ToolboxFunction',
            data: {
              functionData: {
                granularity: '1h',
                aggregate: 'mean',
              },
              toolFunction: {
                name: 'Resample to granularity',
                op: 'resample_to_granularity',
              },
            },
            position: {
              x: 517,
              y: 74,
            },
            id: 'a_HOVHQ71v5pXYvV7usq_',
          },
          {
            position: {
              x: 517.3818181818183,
              y: 220.9057851239669,
            },
            id: '9-RiktpSALNrlmwqoUPkt',
            type: 'ToolboxFunction',
            data: {
              toolFunction: {
                name: 'Resample to granularity',
                op: 'resample_to_granularity',
              },
              functionData: {
                granularity: '1h',
                aggregate: 'mean',
              },
            },
          },
          {
            type: 'ToolboxFunction',
            data: {
              toolFunction: {
                name: 'Subtraction',
                op: 'sub',
              },
              functionData: {},
            },
            id: 'I3ezdixmgmf1ux-DRVZvs',
            position: {
              x: 806.6793388429753,
              y: 112.2545454545454,
            },
          },
          {
            id: 'fBeMz6erfK4zd0FnJDO9M',
            type: 'ToolboxFunction',
            data: {
              toolFunction: {
                name: 'Saviztky-Golay',
                op: 'sg',
              },
              functionData: {
                polyorder: 1,
              },
            },
            position: {
              x: 903,
              y: 229,
            },
          },
          {
            type: 'default',
            id: 'reactflow__edge-ZNyEwM0gqzMpXaSd_GPKWresult-a_HOVHQ71v5pXYvV7usq_series',
            target: 'a_HOVHQ71v5pXYvV7usq_',
            source: 'ZNyEwM0gqzMpXaSd_GPKW',
            sourceHandle: 'result',
            targetHandle: 'series',
          },
          {
            type: 'default',
            id: 'reactflow__edge-x1Psfywpu3O2BXwHkqH-Kresult-9-RiktpSALNrlmwqoUPktseries',
            target: '9-RiktpSALNrlmwqoUPkt',
            sourceHandle: 'result',
            source: 'x1Psfywpu3O2BXwHkqH-K',
            targetHandle: 'series',
          },
          {
            type: 'default',
            target: 'I3ezdixmgmf1ux-DRVZvs',
            sourceHandle: 'out-result',
            id: 'reactflow__edge-9-RiktpSALNrlmwqoUPktout-result-I3ezdixmgmf1ux-DRVZvsb',
            source: '9-RiktpSALNrlmwqoUPkt',
            targetHandle: 'b',
          },
          {
            id: 'reactflow__edge-a_HOVHQ71v5pXYvV7usq_out-result-I3ezdixmgmf1ux-DRVZvsa',
            sourceHandle: 'out-result',
            source: 'a_HOVHQ71v5pXYvV7usq_',
            type: 'default',
            target: 'I3ezdixmgmf1ux-DRVZvs',
            targetHandle: 'a',
          },
          {
            source: 'I3ezdixmgmf1ux-DRVZvs',
            sourceHandle: 'out-result',
            target: 'fBeMz6erfK4zd0FnJDO9M',
            targetHandle: 'data',
            id: 'reactflow__edge-I3ezdixmgmf1ux-DRVZvsout-result-fBeMz6erfK4zd0FnJDO9Mdata',
            type: 'default',
          },
          {
            source: 'fBeMz6erfK4zd0FnJDO9M',
            sourceHandle: 'out-result',
            target: 'w5ivU9w58jxfUz7htTPUe',
            targetHandle: 'datapoints',
            id: 'reactflow__edge-fBeMz6erfK4zd0FnJDO9Mout-result-w5ivU9w58jxfUz7htTPUedatapoints',
            type: 'default',
          },
        ],
        position: [0, 0],
        zoom: 1,
      },
      enabled: true,
    };

    const steps = getStepsFromWorkflowReactFlow(chart, workflow.flow);
    expect(steps).toEqual([
      {
        step: 0,
        op: 'resample_to_granularity',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_21_PT_1017_04:Z.X.Value',
          },
        ],
        params: {
          granularity: '1h',
          aggregate: 'mean',
        },
      },
      {
        step: 1,
        op: 'resample_to_granularity',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_21_PT_1019_04:Z.X.Value',
          },
        ],
        params: {
          granularity: '1h',
          aggregate: 'mean',
        },
      },
      {
        step: 2,
        op: 'sub',
        inputs: [
          {
            type: 'result',
            value: 1,
          },
          {
            type: 'result',
            value: 0,
          },
        ],
      },
      {
        step: 3,
        op: 'sg',
        inputs: [
          {
            type: 'result',
            value: 2,
          },
        ],
        params: {
          polyorder: 1,
        },
      },
      {
        step: 4,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 3,
          },
        ],
      },
    ]);
  });

  it('generates correct steps (noop computation)', () => {
    const chart: Chart = {
      id: 'chart-1',
      name: 'Chart 1',
      version: 1,
      user: 'abc@cognite.com',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      dateFrom: new Date().toJSON(),
      dateTo: new Date().toJSON(),
      timeSeriesCollection: [
        {
          id: 'j350Z4nwnOfk212Nu3bks',
          type: 'timeseries',
          name: 'Pressure 1019',
          tsExternalId: 'VAL_21_PT_1019_04:Z.X.Value',
          tsId: 4470513466595936,
          enabled: true,
          createdAt: 1635243072437,
          color: '#1192e8',
        },
        {
          id: 'RvXihRaJJujRDDFKC4D1-',
          tsExternalId: 'VAL_21_PT_1017_04:Z.X.Value',
          name: 'Pressure 1017',
          type: 'timeseries',
          tsId: 1561976339625775,
          enabled: true,
          createdAt: 1635243072437,
          color: '#1192e8',
        },
      ],
    };

    const workflow: ChartWorkflowV2 = {
      version: 'v2',
      id: 'abc123',
      name: 'Empty workflow',
      color: '#FFF',
      flow: {
        elements: [
          {
            id: 'KCTPlxTWTiTDsYFn3GOhK',
            type: 'CalculationOutput',
            data: {
              color: '#6929c4',
              name: 'New Calculation',
            },
            position: {
              x: 588,
              y: 268,
            },
          },
          {
            id: 'w1qgICaIFEShPAyEow5lz',
            type: 'CalculationInput',
            data: {
              type: 'timeseries',
              selectedSourceId: 'RvXihRaJJujRDDFKC4D1-',
              sourceOptions: [],
            },
            position: {
              x: 82,
              y: 149,
            },
          },
          {
            source: 'w1qgICaIFEShPAyEow5lz',
            sourceHandle: 'result',
            target: 'KCTPlxTWTiTDsYFn3GOhK',
            targetHandle: 'datapoints',
            id: 'reactflow__edge-w1qgICaIFEShPAyEow5lzresult-KCTPlxTWTiTDsYFn3GOhKdatapoints',
            type: 'default',
          },
        ],
        position: [0, 0],
        zoom: 1,
      },
      enabled: true,
    };

    const steps = getStepsFromWorkflowReactFlow(chart, workflow.flow);
    expect(steps).toEqual([
      {
        step: 0,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_21_PT_1017_04:Z.X.Value',
          },
        ],
      },
    ]);
  });

  it('generates correct steps (dangling nodes)', () => {
    const chart: Chart = {
      id: 'chart-1',
      name: 'Chart 1',
      version: 1,
      user: 'abc@cognite.com',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      dateFrom: new Date().toJSON(),
      dateTo: new Date().toJSON(),
      timeSeriesCollection: [
        {
          id: 'j350Z4nwnOfk212Nu3bks',
          type: 'timeseries',
          name: 'Pressure 1019',
          tsExternalId: 'VAL_21_PT_1019_04:Z.X.Value',
          tsId: 4470513466595936,
          enabled: true,
          createdAt: 1635243072437,
          color: '#1192e8',
        },
        {
          id: 'RvXihRaJJujRDDFKC4D1-',
          tsExternalId: 'VAL_21_PT_1017_04:Z.X.Value',
          name: 'Pressure 1017',
          type: 'timeseries',
          tsId: 1561976339625775,
          enabled: true,
          createdAt: 1635243072437,
          color: '#1192e8',
        },
      ],
    };

    const workflow: ChartWorkflowV2 = {
      version: 'v2',
      id: 'abc123',
      name: 'Empty workflow',
      color: '#FFF',
      flow: {
        elements: [
          {
            id: 'w5ivU9w58jxfUz7htTPUe',
            data: {
              name: 'New Calculation',
              color: '#6929c4',
            },
            type: 'CalculationOutput',
            position: {
              x: 1031,
              y: 108,
            },
          },
          {
            data: {
              type: 'timeseries',
              sourceOptions: [],
              selectedSourceId: 'j350Z4nwnOfk212Nu3bks',
            },
            id: 'ZNyEwM0gqzMpXaSd_GPKW',
            position: {
              x: 96,
              y: 84,
            },
            type: 'CalculationInput',
          },
          {
            data: {
              selectedSourceId: 'RvXihRaJJujRDDFKC4D1-',
              sourceOptions: [],
              type: 'timeseries',
            },
            id: 'x1Psfywpu3O2BXwHkqH-K',
            position: {
              x: 99,
              y: 228,
            },
            type: 'CalculationInput',
          },
          {
            position: {
              x: 517,
              y: 74,
            },
            data: {
              toolFunction: {
                name: 'Resample to granularity',
                op: 'resample_to_granularity',
              },
              functionData: {
                granularity: '1h',
                aggregate: 'mean',
              },
            },
            type: 'ToolboxFunction',
            id: 'a_HOVHQ71v5pXYvV7usq_',
          },
          {
            data: {
              functionData: {
                aggregate: 'mean',
                granularity: '1h',
              },
              toolFunction: {
                op: 'resample_to_granularity',
                name: 'Resample to granularity',
              },
            },
            id: '9-RiktpSALNrlmwqoUPkt',
            position: {
              x: 517.3818181818183,
              y: 220.9057851239669,
            },
            type: 'ToolboxFunction',
          },
          {
            id: 'I3ezdixmgmf1ux-DRVZvs',
            data: {
              toolFunction: {
                op: 'sub',
                name: 'Subtraction',
              },
              functionData: {},
            },
            position: {
              x: 806.6793388429753,
              y: 112.2545454545454,
            },
            type: 'ToolboxFunction',
          },
          {
            id: 'I-2qBwiQJP4ZRtuKauySd',
            type: 'ToolboxFunction',
            data: {
              toolFunction: {
                name: 'Saviztky-Golay',
                op: 'sg',
              },
              functionData: {
                polyorder: 1,
              },
            },
            position: {
              x: 911.5,
              y: 1,
            },
          },
          {
            id: 'CxTLwnn3oXdVWOMWfxrSt',
            type: 'CalculationInput',
            data: {
              type: 'timeseries',
              selectedSourceId: 'j350Z4nwnOfk212Nu3bks',
              sourceOptions: [],
            },
            position: {
              x: 467.5,
              y: 347,
            },
          },
          {
            id: 'riQbFoJDGKLu_Rth60WVF',
            type: 'ToolboxFunction',
            data: {
              toolFunction: {
                name: 'Add',
                op: 'add',
              },
              functionData: {},
            },
            position: {
              x: 837.5,
              y: 323,
            },
          },
          {
            id: 'reactflow__edge-ZNyEwM0gqzMpXaSd_GPKWresult-a_HOVHQ71v5pXYvV7usq_series',
            target: 'a_HOVHQ71v5pXYvV7usq_',
            targetHandle: 'series',
            type: 'default',
            source: 'ZNyEwM0gqzMpXaSd_GPKW',
            sourceHandle: 'result',
          },
          {
            type: 'default',
            target: '9-RiktpSALNrlmwqoUPkt',
            id: 'reactflow__edge-x1Psfywpu3O2BXwHkqH-Kresult-9-RiktpSALNrlmwqoUPktseries',
            sourceHandle: 'result',
            targetHandle: 'series',
            source: 'x1Psfywpu3O2BXwHkqH-K',
          },
          {
            target: 'I3ezdixmgmf1ux-DRVZvs',
            type: 'default',
            targetHandle: 'b',
            id: 'reactflow__edge-9-RiktpSALNrlmwqoUPktout-result-I3ezdixmgmf1ux-DRVZvsb',
            source: '9-RiktpSALNrlmwqoUPkt',
            sourceHandle: 'out-result',
          },
          {
            type: 'default',
            source: 'a_HOVHQ71v5pXYvV7usq_',
            targetHandle: 'a',
            sourceHandle: 'out-result',
            target: 'I3ezdixmgmf1ux-DRVZvs',
            id: 'reactflow__edge-a_HOVHQ71v5pXYvV7usq_out-result-I3ezdixmgmf1ux-DRVZvsa',
          },
          {
            targetHandle: 'data',
            type: 'default',
            source: 'I3ezdixmgmf1ux-DRVZvs',
            target: 'I-2qBwiQJP4ZRtuKauySd',
            sourceHandle: 'out-result',
            id: 'reactflow__edge-I3ezdixmgmf1ux-DRVZvsout-result-I-2qBwiQJP4ZRtuKauySddata',
          },
          {
            source: 'I-2qBwiQJP4ZRtuKauySd',
            sourceHandle: 'out-result',
            target: 'w5ivU9w58jxfUz7htTPUe',
            targetHandle: 'datapoints',
            id: 'reactflow__edge-I-2qBwiQJP4ZRtuKauySdout-result-w5ivU9w58jxfUz7htTPUedatapoints',
            type: 'default',
          },
          {
            source: 'CxTLwnn3oXdVWOMWfxrSt',
            sourceHandle: 'result',
            target: 'riQbFoJDGKLu_Rth60WVF',
            targetHandle: 'a',
            id: 'reactflow__edge-CxTLwnn3oXdVWOMWfxrStresult-riQbFoJDGKLu_Rth60WVFa',
            type: 'default',
          },
        ],
        position: [0, 0],
        zoom: 1,
      },
      enabled: true,
    };

    const steps = getStepsFromWorkflowReactFlow(chart, workflow.flow);
    expect(steps).toEqual([
      {
        step: 0,
        op: 'resample_to_granularity',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_21_PT_1017_04:Z.X.Value',
          },
        ],
        params: {
          granularity: '1h',
          aggregate: 'mean',
        },
      },
      {
        step: 1,
        op: 'resample_to_granularity',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_21_PT_1019_04:Z.X.Value',
          },
        ],
        params: {
          granularity: '1h',
          aggregate: 'mean',
        },
      },
      {
        step: 2,
        op: 'sub',
        inputs: [
          {
            type: 'result',
            value: 1,
          },
          {
            type: 'result',
            value: 0,
          },
        ],
      },
      {
        step: 3,
        op: 'sg',
        inputs: [
          {
            type: 'result',
            value: 2,
          },
        ],
        params: {
          polyorder: 1,
        },
      },
      {
        step: 4,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 3,
          },
        ],
      },
    ]);
  });

  it('generates correct steps (another calculation as input)', () => {
    const chart: Chart = {
      id: 'chart-1',
      name: 'Chart 1',
      version: 1,
      user: 'abc@cognite.com',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      dateFrom: new Date().toJSON(),
      dateTo: new Date().toJSON(),
      timeSeriesCollection: [
        {
          id: 'j350Z4nwnOfk212Nu3bks',
          type: 'timeseries',
          name: 'Pressure 1019',
          tsExternalId: 'VAL_21_PT_1019_04:Z.X.Value',
          tsId: 4470513466595936,
          enabled: true,
          createdAt: 1635243072437,
          color: '#1192e8',
        },
        {
          id: 'RvXihRaJJujRDDFKC4D1-',
          tsExternalId: 'VAL_21_PT_1017_04:Z.X.Value',
          name: 'Pressure 1017',
          type: 'timeseries',
          tsId: 1561976339625775,
          enabled: true,
          createdAt: 1635243072437,
          color: '#1192e8',
        },
      ],
      workflowCollection: [
        {
          version: 'v2',
          type: 'workflow',
          name: 'ΔP',
          createdAt: 1635243137501,
          color: '#005d5d',
          flow: {
            elements: [
              {
                id: 'w5ivU9w58jxfUz7htTPUe',
                data: {
                  name: 'New Calculation',
                  color: '#6929c4',
                },
                type: 'CalculationOutput',
                position: {
                  x: 1031,
                  y: 108,
                },
              },
              {
                data: {
                  type: 'timeseries',
                  sourceOptions: [],
                  selectedSourceId: 'j350Z4nwnOfk212Nu3bks',
                },
                id: 'ZNyEwM0gqzMpXaSd_GPKW',
                position: {
                  x: 96,
                  y: 84,
                },
                type: 'CalculationInput',
              },
              {
                data: {
                  selectedSourceId: 'RvXihRaJJujRDDFKC4D1-',
                  sourceOptions: [],
                  type: 'timeseries',
                },
                id: 'x1Psfywpu3O2BXwHkqH-K',
                position: {
                  x: 99,
                  y: 228,
                },
                type: 'CalculationInput',
              },
              {
                position: {
                  x: 517,
                  y: 74,
                },
                data: {
                  toolFunction: {
                    name: 'Resample to granularity',
                    op: 'resample_to_granularity',
                  },
                  functionData: {
                    granularity: '1h',
                    aggregate: 'mean',
                  },
                },
                type: 'ToolboxFunction',
                id: 'a_HOVHQ71v5pXYvV7usq_',
              },
              {
                data: {
                  functionData: {
                    aggregate: 'mean',
                    granularity: '1h',
                  },
                  toolFunction: {
                    op: 'resample_to_granularity',
                    name: 'Resample to granularity',
                  },
                },
                id: '9-RiktpSALNrlmwqoUPkt',
                position: {
                  x: 517.3818181818183,
                  y: 220.9057851239669,
                },
                type: 'ToolboxFunction',
              },
              {
                id: 'I3ezdixmgmf1ux-DRVZvs',
                data: {
                  toolFunction: {
                    op: 'sub',
                    name: 'Subtraction',
                  },
                  functionData: {},
                },
                position: {
                  x: 806.6793388429753,
                  y: 112.2545454545454,
                },
                type: 'ToolboxFunction',
              },
              {
                id: 'reactflow__edge-ZNyEwM0gqzMpXaSd_GPKWresult-a_HOVHQ71v5pXYvV7usq_series',
                target: 'a_HOVHQ71v5pXYvV7usq_',
                targetHandle: 'series',
                type: 'default',
                source: 'ZNyEwM0gqzMpXaSd_GPKW',
                sourceHandle: 'result',
              },
              {
                type: 'default',
                target: '9-RiktpSALNrlmwqoUPkt',
                id: 'reactflow__edge-x1Psfywpu3O2BXwHkqH-Kresult-9-RiktpSALNrlmwqoUPktseries',
                sourceHandle: 'result',
                targetHandle: 'series',
                source: 'x1Psfywpu3O2BXwHkqH-K',
              },
              {
                target: 'I3ezdixmgmf1ux-DRVZvs',
                type: 'default',
                targetHandle: 'b',
                id: 'reactflow__edge-9-RiktpSALNrlmwqoUPktout-result-I3ezdixmgmf1ux-DRVZvsb',
                source: '9-RiktpSALNrlmwqoUPkt',
                sourceHandle: 'out-result',
              },
              {
                type: 'default',
                source: 'a_HOVHQ71v5pXYvV7usq_',
                targetHandle: 'a',
                sourceHandle: 'out-result',
                target: 'I3ezdixmgmf1ux-DRVZvs',
                id: 'reactflow__edge-a_HOVHQ71v5pXYvV7usq_out-result-I3ezdixmgmf1ux-DRVZvsa',
              },
              {
                source: 'I3ezdixmgmf1ux-DRVZvs',
                sourceHandle: 'out-result',
                target: 'w5ivU9w58jxfUz7htTPUe',
                targetHandle: 'datapoints',
                id: 'reactflow__edge-I3ezdixmgmf1ux-DRVZvsout-result-w5ivU9w58jxfUz7htTPUedatapoints',
                type: 'default',
              },
            ],
            position: [-17.75, 111.5],
            zoom: 0.5,
          },
          enabled: false,
          id: 'gAYbR4eVz12AwuTvLeIxR',
        },
      ],
    };

    const workflow: ChartWorkflowV2 = {
      version: 'v2',
      id: 'abc123',
      name: 'Empty workflow',
      color: '#FFF',
      flow: {
        elements: [
          {
            position: {
              x: 1682,
              y: 262,
            },
            type: 'CalculationOutput',
            data: {
              name: 'New Calculation',
              color: '#9f1853',
            },
            id: 'JrFD5yxRA9dJcnpAs48pp',
          },
          {
            position: {
              x: 964.75,
              y: 252.37890625,
            },
            data: {
              selectedSourceId: 'gAYbR4eVz12AwuTvLeIxR',
              type: 'workflow',
              sourceOptions: [],
            },
            id: 'rg-495YhO5rAAqjyD1X-Z',
            type: 'CalculationInput',
          },
          {
            type: 'ToolboxFunction',
            id: 'Tzcchda282s2PTA-84dMa',
            data: {
              toolFunction: {
                name: 'Saviztky-Golay',
                category: 'Smooth',
                op: 'sg',
              },
              functionData: {
                window_length: 3,
                polyorder: 50,
              },
            },
            position: {
              x: 1374.042894261608,
              y: 247.5634556695561,
            },
          },
          {
            target: 'Tzcchda282s2PTA-84dMa',
            targetHandle: 'data',
            sourceHandle: 'result',
            source: 'rg-495YhO5rAAqjyD1X-Z',
            type: 'default',
            id: 'reactflow__edge-rg-495YhO5rAAqjyD1X-Zresult-Tzcchda282s2PTA-84dMadata',
          },
          {
            sourceHandle: 'out-result',
            id: 'reactflow__edge-Tzcchda282s2PTA-84dMaout-result-JrFD5yxRA9dJcnpAs48ppdatapoints',
            type: 'default',
            source: 'Tzcchda282s2PTA-84dMa',
            targetHandle: 'datapoints',
            target: 'JrFD5yxRA9dJcnpAs48pp',
          },
        ],
        position: [0, 0],
        zoom: 1,
      },
      enabled: true,
    };

    const steps = getStepsFromWorkflowReactFlow(chart, workflow.flow);
    expect(steps).toEqual([
      {
        step: 0,
        op: 'resample_to_granularity',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_21_PT_1017_04:Z.X.Value',
          },
        ],
        params: {
          granularity: '1h',
          aggregate: 'mean',
        },
      },
      {
        step: 1,
        op: 'resample_to_granularity',
        inputs: [
          {
            type: 'ts',
            value: 'VAL_21_PT_1019_04:Z.X.Value',
          },
        ],
        params: {
          granularity: '1h',
          aggregate: 'mean',
        },
      },
      {
        step: 2,
        op: 'sub',
        inputs: [
          {
            type: 'result',
            value: 1,
          },
          {
            type: 'result',
            value: 0,
          },
        ],
      },
      {
        step: 3,
        op: 'sg',
        inputs: [
          {
            type: 'result',
            value: 2,
          },
        ],
        params: {
          polyorder: 50,
          window_length: 3,
        },
      },
      {
        step: 4,
        op: 'PASSTHROUGH',
        inputs: [
          {
            type: 'result',
            value: 3,
          },
        ],
      },
    ]);
  });
});
