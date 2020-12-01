import React, { useState } from 'react';
import styled from 'styled-components';
import { Icon, Dropdown, Menu, Colors } from '@cognite/cogs.js';
import {
  useCollections,
  Collection,
  useCreateCollections,
  useUpdateCollections,
  CollectionSpec,
} from 'lib/hooks/CollectionsHooks';
import { ResourceType } from 'lib/types';
import CreateCollectionForm from 'app/components/CreateCollectionForm';
import { useCollectionFeature } from 'app/utils/featureFlags';
import { trackUsage } from 'app/utils/Metrics';

type Props = {
  type: ResourceType;
  items: { id: number }[];
  button: React.ReactElement;
};

export default function CollectionsDropdown({ type, items, button }: Props) {
  const showCollections = useCollectionFeature();
  const [formOpen, setFormOpen] = useState(false);
  const { data: collections } = useCollections();
  const [createCollections] = useCreateCollections();
  const [updateCollections] = useUpdateCollections();

  if (!showCollections) {
    return null;
  }

  const resourceCollections = (collections || []).filter(
    collection => collection.type === type
  );

  const addToCollection = (
    collection: Collection,
    currentItems: { id: number }[]
  ) => {
    // If the collection is not empty, concat the items in the collection
    // with the selected items, else set the items to the selected items
    const updatedItems = collection.operationBody.items
      ? collection.operationBody.items.concat(
          currentItems
            .filter(
              asset =>
                !collection.operationBody.items.some(
                  (item: any) => item.id === asset.id
                )
            )
            .map(({ id }) => ({ id }))
        )
      : currentItems;
    updateCollections([
      {
        id: collection.id,
        update: {
          operationBody: {
            items: updatedItems,
          },
        },
      },
    ]);

    trackUsage('Exploration.Action.AddToCollection', {
      type: collection.type,
      items: currentItems.length,
    });
  };

  const handleCreateCollection = async (
    collection: Omit<CollectionSpec, 'type'>
  ) => {
    const newCollection: CollectionSpec = { ...collection, type };
    const [createdCollection] = await createCollections([newCollection]);
    addToCollection(createdCollection, items);

    trackUsage('Exploration.Action.CreateCollection', {
      type: createdCollection.type,
      items: createdCollection.operationBody.items.length,
    });
  };

  const collectionContainsItems = (collection: Collection) =>
    items.every(item =>
      collection.operationBody.items?.some((el: any) => el.id === item.id)
    );

  return (
    <>
      <Dropdown
        content={
          <Menu>
            <Menu.Header>{type} Collections</Menu.Header>
            {resourceCollections.length === 0 && (
              <NoCollectionsMessage>
                You have no collections for this resource type
              </NoCollectionsMessage>
            )}
            {resourceCollections.map(collection => {
              const containsItems = collectionContainsItems(collection);
              return (
                <Menu.Item
                  key={collection.id}
                  disabled={containsItems}
                  onClick={() => addToCollection(collection, items)}
                >
                  <CollectionItem>
                    {collection.name}
                    {containsItems && <CheckIcon type="Check" />}
                  </CollectionItem>
                </Menu.Item>
              );
            })}
            {formOpen ? (
              <CreateCollectionForm
                onClose={() => setFormOpen(false)}
                onCreate={handleCreateCollection}
              />
            ) : (
              <Menu.Item onClick={() => setFormOpen(true)}>
                <Icon type="Plus" />
                New collection
              </Menu.Item>
            )}
          </Menu>
        }
      >
        {button}
      </Dropdown>
    </>
  );
}

const CollectionItem = styled.div`
  justify-content: space-between;
  text-align: left;
  width: 100%;
  display: flex;
`;

const NoCollectionsMessage = styled(Menu.Footer)`
  color: black;
  text-align: center;
`;

const CheckIcon = styled(Icon)`
  color: ${Colors.success.hex()};
  margin-left: 8px;
`;
