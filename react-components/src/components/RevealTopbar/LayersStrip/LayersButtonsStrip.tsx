import styled from 'styled-components';
import {
  CadModelHandler,
  Image360CollectionHandler,
  ModelHandler,
  PointCloudModelHandler
} from './ModelHandler';
import { ModelLayersButton } from './ModelLayersButton';
import {
  CogniteCadModel,
  CogniteModel,
  CognitePointCloudModel,
  Image360Collection
} from '@cognite/reveal';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from '../../i18n/I18n';
import { LayersUrlStateParam } from '../../../hooks/types';
import { useModelHandlers } from './useModelHandlers';
import { useSyncExternalLayersState } from './useSyncExternalLayersState';

export type LayersButtonStripProps = {
  externalLayersState?: LayersUrlStateParam;
  setExternalLayersState?: Dispatch<SetStateAction<LayersUrlStateParam>>;
};

export type ModelLayerHandlers = {
  cadHandlers: CadModelHandler[];
  pointCloudHandlers: PointCloudModelHandler[];
  image360Handlers: Image360CollectionHandler[];
};

export const LayersButtonStrip = ({
  externalLayersState,
  setExternalLayersState
}: LayersButtonStripProps) => {
  const { t } = useTranslation();
  const [modelLayerHandlers, update] = useModelHandlers();
  const { cadHandlers, pointCloudHandlers, image360Handlers } = modelLayerHandlers;

  useSyncExternalLayersState(
    modelLayerHandlers,
    externalLayersState,
    setExternalLayersState,
    update
  );

  return (
    <ButtonsContainer>
      <ModelLayersButton
        icon="Cube"
        label={t('CAD_MODELS', 'CAD models')}
        handlers={cadHandlers}
        update={update}
      />
      <ModelLayersButton
        icon="PointCloud"
        label={t('POINT_CLOUDS', 'Point clouds')}
        handlers={pointCloudHandlers}
        update={update}
      />
      <ModelLayersButton
        icon="View360"
        label={t('IMAGES_360', '360 images')}
        handlers={image360Handlers}
        update={update}
      />
    </ButtonsContainer>
  );
};

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
