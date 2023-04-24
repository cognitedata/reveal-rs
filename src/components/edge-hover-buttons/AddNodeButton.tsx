import { Button, Menu } from '@cognite/cogs.js';
import { ProcessNode, ProcessType } from 'types';
import { Extend as AutomergeExtend, uuid } from '@automerge/automerge';
import { useWorkflowBuilderContext } from 'contexts/WorkflowContext';
import { Edge } from 'reactflow';
import { Dropdown, Space } from 'antd';

type Props = {
  className: string;
  xPos: number;
  yPos: number;
  id: string;
  source: string;
  target: string;
  visibleAddButton: boolean;
  setVisibleAddButton: (visible: boolean) => void;
};

const AddNodeButton = ({
  className,
  id,
  xPos,
  yPos,
  source,
  target,
  visibleAddButton,
  setVisibleAddButton,
}: Props) => {
  const { changeEdges, changeNodes } = useWorkflowBuilderContext();

  const handleAddNode = (
    processType: ProcessType,
    xPos: number,
    yPos: number
  ): void => {
    const node: AutomergeExtend<ProcessNode> = {
      id: uuid(),
      type: 'process',
      position: {
        x: xPos,
        y: yPos,
      },
      data: {
        processType,
        processProps: {},
      },
    };
    // FIXME: any
    const leftEdge: AutomergeExtend<Edge<any>> = {
      id: uuid(),
      source: source,
      target: node.id,
      type: 'customEdge',
    };
    const rightEdge: AutomergeExtend<Edge<any>> = {
      id: uuid(),
      source: node.id,
      target: target,
      type: 'customEdge',
    };
    const newEdges = [leftEdge, rightEdge];

    changeNodes((nodes) => {
      nodes.push(node);
    });
    changeEdges((edges) => {
      edges.push(...newEdges);
      const i = edges.findIndex((e) => e.id === id);
      edges.deleteAt(i);
    });
  };

  return (
    <Space>
      <Dropdown
        trigger={['click']}
        dropdownRender={() => (
          <Menu>
            <Menu.Item
              icon="Code"
              onClick={() => handleAddNode('transformation', xPos, yPos)}
            >
              Transformation
            </Menu.Item>
            <Menu.Item
              icon="FrameTool"
              onClick={() => handleAddNode('webhook', xPos, yPos)}
            >
              Webhook
            </Menu.Item>
            <Menu.Item
              icon="Pipeline"
              onClick={() => handleAddNode('workflow', xPos, yPos)}
            >
              Workflow
            </Menu.Item>
          </Menu>
        )}
      >
        <Button
          onClick={() => setVisibleAddButton(!visibleAddButton)}
          type="primary"
          icon="AddLarge"
          className={className}
          size="small"
        />
      </Dropdown>
    </Space>
  );
};

export default AddNodeButton;
