import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import React, { useEffect } from 'react';
import sdk from '@cognite/cdf-sdk-singleton';
import {
  PropertyFilterNodeCollection,
  CogniteCadModel,
  NodeOutlineColor,
} from '@cognite/reveal';
import {
  setNodeFilterLoadingState,
  setNodePropertyFilter,
} from 'store/modules/toolbar/toolbarActions';
import { assignOrUpdateStyledNodeCollection } from 'utils/sdk/3dNodeStylingUtils';

export function useFilteredNodesHighlights({
  model,
}: {
  model: CogniteCadModel;
}) {
  const dispatch = useDispatch();
  const { value: filter } = useSelector(
    ({ toolbar }: RootState) => toolbar.nodePropertyFilter
  );

  const filteredNodes = React.useRef<PropertyFilterNodeCollection>(
    new PropertyFilterNodeCollection(sdk as any, model, {
      requestPartitions: 10,
    })
  );

  // bind filteredNodes to model
  useEffect(() => {
    const filteredNodesSet = filteredNodes.current;
    assignOrUpdateStyledNodeCollection(model, filteredNodesSet, {
      outlineColor: NodeOutlineColor.Cyan,
      renderInFront: true,
      renderGhosted: false,
    });
    return () => {
      model.unassignStyledNodeCollection(filteredNodesSet);
      if (filteredNodesSet) {
        filteredNodesSet.clear();
      }
      dispatch(setNodePropertyFilter(null));
    };
  }, [dispatch, model]);

  // filter execution and loading state updates
  useEffect(() => {
    if (!filter) {
      filteredNodes.current.clear();
    } else {
      dispatch(setNodeFilterLoadingState(true));

      const currentFilter = filter;
      filteredNodes.current.executeFilter(filter).finally(() => {
        if (currentFilter === filter) {
          dispatch(setNodeFilterLoadingState(false));
        }
      });
    }

    return () => {
      dispatch(setNodeFilterLoadingState(false));
    };
  }, [dispatch, filter]);
}
