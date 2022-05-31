import React, { useState } from 'react';

import { Table } from '@cognite/cogs.js';

import { Modal } from 'components/Modal';
import { Treemap } from 'components/Treemap';

import { WellboreTableWrapper } from './elements';
import { NdsTreemapProps, NdsTreemapWellboreData } from './types';

export const NdsTreemap: React.FC<NdsTreemapProps> = ({ data }) => {
  const [otherWellbores, setOtherWellbores] = useState<
    NdsTreemapWellboreData[]
  >([]);

  return (
    <>
      <Treemap
        data={data}
        onTileClicked={(d) => {
          if (d.id === 'other') {
            setOtherWellbores(d.wellbores as any);
          }
        }}
      />

      {/* The modal needs to be implemented properly, there is no design right now for this view so it's improvised */}
      <Modal
        visible={!!otherWellbores.length}
        title="List of wellbores"
        width={1000}
        onOk={() => setOtherWellbores([])}
        onCancel={() => setOtherWellbores([])}
      >
        <WellboreTableWrapper>
          <Table<NdsTreemapWellboreData>
            dataSource={otherWellbores}
            columns={[
              {
                Header: 'Wellbore name',
                accessor: 'name',
              },
              {
                Header: 'Number of NDS events',
                accessor: 'numberOfEvents',
                width: 100,
              },
            ]}
            pagination={false}
            flexLayout={{
              minWidth: 100,
              width: 500,
              maxWidth: 500,
            }}
          />
        </WellboreTableWrapper>
      </Modal>
    </>
  );
};
