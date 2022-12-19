import React from 'react';
import { A, Body, Button, Dropdown, Flex, Menu } from '@cognite/cogs.js';
import groupBy from 'lodash/groupBy';

import {
  DetailedMapping,
  useDetailedMappingsByAssetIdQuery,
} from '@data-exploration-components/domain/threeD';
import { createLink } from '@cognite/cdf-utilities';
import { DASH } from '../../../utils';
import { TimeDisplay } from '@data-exploration-components/components/TimeDisplay/TimeDisplay';

export const ThreeDModelCellLink = ({
  assetId,
  mapping,
}: {
  assetId: number;
  mapping: DetailedMapping;
}) => {
  return (
    <A
      href={createLink(`/explore/threeD/${mapping.model.id}`, {
        selectedAssetId: assetId,
        revisionId: mapping.revisionId,
      })}
      onClick={(e) => e.stopPropagation()}
      as="a"
    >
      {mapping.model.name}
    </A>
  );
};

export const ThreeDModelCellDropdown = ({
  assetId,
  mappings,
}: {
  assetId: number;
  mappings: DetailedMapping[];
}) => {
  const mappingGroups = groupBy(
    mappings.sort((a, b) => a.model.name.localeCompare(b.model.name)),
    ({ model }) => model.id
  );
  return (
    <Dropdown
      content={
        <Menu onClick={(e) => e.stopPropagation()}>
          <Menu.Header>Models</Menu.Header>

          {Object.entries(mappingGroups).map(([id, mappings]) =>
            mappings.map((mapping) => (
              <Menu.Item
                key={id}
                href={createLink(`/explore/threeD/${id}`, {
                  selectedAssetId: assetId,
                  revisionId: mapping.revisionId,
                })}
              >
                {mapping.model.name} (
                <TimeDisplay
                  value={mapping.revision.createdTime}
                  relative
                />{' '}
                revision)
              </Menu.Item>
            ))
          )}
        </Menu>
      }
    >
      <Button
        icon="ChevronDown"
        iconPlacement="right"
        onClick={(e) => e.stopPropagation()}
        size="small"
        type="ghost"
      />
    </Dropdown>
  );
};

export const ThreeDModelCell = ({ assetId }: { assetId: number }) => {
  const { data: mappings, isFetched } =
    useDetailedMappingsByAssetIdQuery(assetId);

  if (!isFetched || !mappings?.length) {
    return <>{DASH}</>;
  }

  if (mappings.length === 1) {
    const mapping = mappings[0];
    return <ThreeDModelCellLink assetId={assetId} mapping={mapping} />;
  }

  return (
    <Flex alignItems="center" gap={8}>
      <Body level={2}>{mappings.length} models</Body>
      <ThreeDModelCellDropdown assetId={assetId} mappings={mappings} />
    </Flex>
  );
};
