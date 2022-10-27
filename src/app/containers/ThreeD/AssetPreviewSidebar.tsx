import styled from 'styled-components';
import { AssetPreview } from 'app/containers/Asset/AssetPreview';
import { Tooltip, Button } from '@cognite/cogs.js';
import { trackUsage } from 'app/utils/Metrics';

export const AssetPreviewSidebar = ({
  assetId,
  setVisible,
}: {
  assetId: number;
  setVisible: (visible: boolean) => void;
}) => {
  const closePreviewButton = (
    <Tooltip content="Close preview">
      <Button
        icon="Close"
        onClick={() => {
          setVisible(false);
          trackUsage('Exploration.Preview.ThreeDModel', { assetId });
        }}
      />
    </Tooltip>
  );

  return (
    <PreviewWrapper>
      <AssetPreview
        assetId={assetId}
        actions={closePreviewButton}
        hideDefaultCloseActions
      />
    </PreviewWrapper>
  );
};

const PreviewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #fff;
  overflow: hidden;
`;
