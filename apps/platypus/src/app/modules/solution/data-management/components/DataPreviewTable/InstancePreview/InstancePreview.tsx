import React, { useMemo } from 'react';

import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { usePreviewData } from '@platypus-app/modules/solution/data-management/hooks/usePreviewData';

import { CogDataList } from '@cognite/cog-data-grid';
import { Body } from '@cognite/cogs.js';

export const InstancePreview = (props: {
  dataModelExternalId: string;
  dataModelType: DataModelTypeDefsType;
  dataModelSpace: string;
  externalId: string;
  instanceSpace: string;
}) => {
  const {
    dataModelExternalId,
    dataModelSpace,
    dataModelType,
    externalId,
    instanceSpace,
  } = props;

  const { data: previewData } = usePreviewData({
    dataModelExternalId,
    dataModelSpace,
    dataModelType,
    externalId,
    instanceSpace,
    nestedLimit: 2,
  });

  const nonRelationshipValues = useMemo(() => {
    if (!dataModelType) {
      return [];
    }
    return dataModelType.fields.filter(
      (el) => !el.type.list && !el.type.custom
    );
  }, [dataModelType]);

  if (!externalId) {
    return null;
  }

  return (
    <>
      {previewData ? (
        <CogDataList
          data-cy="instance-values"
          listData={[{ name: 'externalId' }, ...nonRelationshipValues].map(
            (key) => `${key.name}: ${previewData[key.name]}`
          )}
        />
      ) : (
        <Body level={2}>Loading...</Body>
      )}
    </>
  );
};
