import { ComponentProps } from 'react';
import { Meta, Story } from '@storybook/react';
import { fullListOfOperations } from 'models/operations/mocks';
import { SourceNodeData } from './Nodes/SourceNode';
import ReactFlowNodeEditor from './ReactFlowNodeEditor';

export default {
  component: ReactFlowNodeEditor,
  title: 'Components/Node Editor/v2',
} as Meta;

const Template: Story<ComponentProps<typeof ReactFlowNodeEditor>> = (args) => (
  <div style={{ width: 'calc(100vw - 30px)', height: 'calc(100vh - 30px)' }}>
    <ReactFlowNodeEditor {...args} />
  </div>
);

export const EmptyEditor = Template.bind({});

EmptyEditor.args = {
  flowElements: [],
  sources: [],
  operations: fullListOfOperations,
  settings: {
    autoAlign: true,
  },
  onSaveSettings: () => {},
  onElementsRemove: () => {},
  onConnect: () => {},
  onEdgeUpdate: () => {},
  onNodeDragStop: () => {},
  onAddSourceNode: () => {},
  onAddConstantNode: () => {},
  onAddFunctionNode: () => {},
  onAddOutputNode: () => {},
  onMove: () => {},
};

export const SimplePassthrough = Template.bind({});

SimplePassthrough.args = {
  flowElements: [
    {
      position: {
        x: 843,
        y: 143,
      },
      type: 'CalculationOutput',
      id: 'xDj7A-MswVQsXTyjvNI8U',
      data: {
        name: 'My Output',
        color: 'red',
        onOutputNameChange: () => {},
      },
    },
    {
      id: 'rzcuySUBWdmdMTF10ITFK',
      data: {
        type: 'workflow',
        selectedSourceId: '2M_k0eYSYiU0w7olxpxKy',
        sourceOptions: [
          {
            type: 'workflow',
            color: 'green',
            value: '2M_k0eYSYiU0w7olxpxKy',
            label: 'Calculation 1',
          },
        ],
        onSourceItemChange: () => {},
        onDuplicateNode: () => {},
        onRemoveNode: () => {},
      } as SourceNodeData,
      position: {
        y: 46,
        x: 91,
      },
      type: 'CalculationInput',
    },
    {
      sourceHandle: 'result',
      source: 'rzcuySUBWdmdMTF10ITFK',
      target: 'xDj7A-MswVQsXTyjvNI8U',
      id: 'reactflow__edge-rzcuySUBWdmdMTF10ITFKresult-xDj7A-MswVQsXTyjvNI8Udatapoints',
      targetHandle: 'datapoints',
    },
  ],
  sources: [],
  operations: [],
  settings: {
    autoAlign: true,
  },
  onSaveSettings: () => {},
  onElementsRemove: () => {},
  onConnect: () => {},
  onEdgeUpdate: () => {},
  onNodeDragStop: () => {},
  onAddSourceNode: () => {},
  onAddConstantNode: () => {},
  onAddFunctionNode: () => {},
  onAddOutputNode: () => {},
  onMove: () => {},
};

export const AutoAlignOff = Template.bind({});

AutoAlignOff.args = {
  ...SimplePassthrough.args,
  settings: { autoAlign: false },
};
