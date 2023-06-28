import { ComponentProps, useState } from 'react';

import {
  ExpandIcon,
  ContentContainer,
  SidebarCollapse,
  SidebarHeaderActions,
  CollapsePanelTitle,
} from '@charts-app/components/Common/SidebarElements';
import TranslatedEditableText from '@charts-app/components/EditableText/TranslatedEditableText';
import ThresholdItem from '@charts-app/components/Thresholds/ThresholdItem';
import { ChartSource, ChartThreshold } from '@charts-app/models/chart/types';

import { Button, Collapse } from '@cognite/cogs.js';

interface Props
  extends Omit<ComponentProps<typeof ThresholdItem>, 'threshold'> {
  thresholds: ChartThreshold[];
  sources: ChartSource[];
  onUpdateThresholdName: (id: string, name: string) => void;
  onAddThreshold: () => void;
}

const Thresholds = ({
  thresholds,
  sources,
  onUpdateThresholdName,
  onAddThreshold,
  ...thresholdItemProps
}: Props) => {
  const [activeKey, setActiveKey] = useState(['1']);

  const onChange = (key: any) => {
    setActiveKey(key);
  };

  return (
    <ContentContainer>
      <SidebarHeaderActions>
        <Button
          icon="Plus"
          type="primary"
          size="small"
          aria-label="Add threshold"
          onClick={() => {
            onAddThreshold();
            setActiveKey((prevState) => [
              '1',
              ...prevState.map((k) => String(parseInt(k, 10) + 1)),
            ]);
          }}
        >
          Add new
        </Button>
      </SidebarHeaderActions>
      <SidebarCollapse
        activeKey={activeKey}
        onChange={onChange}
        expandIcon={({ isActive }) => (
          <ExpandIcon $active={Boolean(isActive)} type="ChevronDownLarge" />
        )}
      >
        {thresholds.map((threshold, index) => (
          <Collapse.Panel
            key={`${index + 1}`}
            header={
              <CollapsePanelTitle>
                <TranslatedEditableText
                  value={threshold.name}
                  onChange={(val) => onUpdateThresholdName(threshold.id, val)}
                  hideButtons
                />
              </CollapsePanelTitle>
            }
          >
            <ThresholdItem
              threshold={threshold}
              sources={sources}
              {...thresholdItemProps}
            />
          </Collapse.Panel>
        ))}
      </SidebarCollapse>
    </ContentContainer>
  );
};

Thresholds.translationKeys = ThresholdItem.translationKeys;

export default Thresholds;
