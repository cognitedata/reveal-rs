import { Button, Tooltip, toast } from '@cognite/cogs.js';
import { ViewerState } from '@cognite/reveal';
import { getStateUrl } from 'app/containers/ThreeD/utils';

type ShareButtonProps = {
  viewState?: ViewerState;
  selectedAssetId?: number;
  assetDetailsExpanded?: boolean;
};

const ShareButton = ({
  viewState,
  selectedAssetId,
  assetDetailsExpanded,
}: ShareButtonProps): JSX.Element => {
  const handleShare = async () => {
    const path = getStateUrl({
      viewState,
      selectedAssetId,
      assetDetailsExpanded,
    });
    const link = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(`${link}`);
    toast.info(
      <div>
        <h4>URL in clipboard</h4>
        <p>
          Sharable link with viewer state is now available in your clipboard.
        </p>
      </div>,
      { toastId: 'url-state-clipboard' }
    );
  };

  return (
    <Tooltip content="Copy URL to current state" placement="right">
      <Button icon="Link" onClick={handleShare} type="ghost" />
    </Tooltip>
  );
};

export default ShareButton;
