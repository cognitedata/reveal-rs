import { useState } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { useDataElementConfig } from 'scarlet/hooks';
import { DataElement } from 'scarlet/types';

import { CardHeader, DataSourceList } from '..';

import * as Styled from './style';

type CardProps = {
  dataElement: DataElement;
};

enum CardTabs {
  DATA_SOURCES = 'data-sources',
  REMARKS = 'remarks',
}

export const Card = ({ dataElement }: CardProps) => {
  const dataElementConfig = useDataElementConfig(dataElement);
  const [currentTab, setCurrentTab] = useState(CardTabs.DATA_SOURCES);

  return (
    <Styled.Container>
      <CardHeader dataElement={dataElement} />
      <Styled.CategoryWrapper>
        <div className="cogs-body-1">{dataElementConfig?.label}</div>
        <div className="cogs-micro">Equipment</div>
      </Styled.CategoryWrapper>
      <Styled.Delimiter />
      <SegmentedControl
        fullWidth
        currentKey={currentTab}
        onButtonClicked={(value) => setCurrentTab(value as CardTabs)}
      >
        <SegmentedControl.Button key={CardTabs.DATA_SOURCES}>
          Data sources
        </SegmentedControl.Button>
        <SegmentedControl.Button key={CardTabs.REMARKS}>
          Remarks
        </SegmentedControl.Button>
      </SegmentedControl>
      {currentTab === CardTabs.DATA_SOURCES && (
        <DataSourceList dataElement={dataElement} />
      )}
    </Styled.Container>
  );
};
