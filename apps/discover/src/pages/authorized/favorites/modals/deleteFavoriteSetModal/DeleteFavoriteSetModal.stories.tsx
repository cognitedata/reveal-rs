import { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { getMockFavoriteSummary } from '__test-utils/fixtures/favorite';
import { FavoriteSummary } from 'modules/favorite/types';

import DeleteFavoriteSetModal from './index';

export default {
  title: 'Components / Modals / delete-favorite-set-modal',
  component: DeleteFavoriteSetModal,
  decorators: [
    (storyFn: any) => (
      <div style={{ position: 'relative', height: 200 }}>{storyFn()}</div>
    ),
  ],
};

export const Basic = () => {
  const [isOpen, setIsOpen] = useState(false);

  const item: FavoriteSummary = getMockFavoriteSummary();

  const handleOnConfirm = () => {
    // Do something with the item!.
    setIsOpen(false);
  };

  return (
    <div>
      <Button aria-label="Open modal" onClick={() => setIsOpen(true)}>
        Open modal
      </Button>
      <DeleteFavoriteSetModal
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
        onConfirm={handleOnConfirm}
        item={item}
      />
    </div>
  );
};
