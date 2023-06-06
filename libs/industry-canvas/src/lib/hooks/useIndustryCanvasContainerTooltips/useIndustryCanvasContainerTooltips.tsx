import { useEffect, useMemo, useState } from 'react';

import {
  ContainerType,
  getPdfCache,
  TooltipAnchorPosition,
  TooltipConfig,
} from '@cognite/unified-file-viewer';

import { IndustryCanvasContainerConfig } from '../../types';
import { UseManagedStateReturnType } from '../useManagedState';
import {
  OnUpdateTooltipsOptions,
  TooltipsOptions,
} from '../useTooltipsOptions';

import ContainerTooltip from './ContainerTooltip';
import useContainerOcrData from './useContainerOcrData';

const useIndustryCanvasContainerTooltips = ({
  selectedContainer,
  containers,
  tooltipsOptions,
  onUpdateTooltipsOptions,
  updateContainerById,
  removeContainerById,
  onAddSummarizationSticky,
}: {
  selectedContainer: IndustryCanvasContainerConfig | undefined;
  containers: IndustryCanvasContainerConfig[];
  tooltipsOptions: TooltipsOptions;
  onUpdateTooltipsOptions: OnUpdateTooltipsOptions;
  updateContainerById: UseManagedStateReturnType['updateContainerById'];
  removeContainerById: UseManagedStateReturnType['removeContainerById'];
  onAddSummarizationSticky: (
    container: IndustryCanvasContainerConfig,
    text: string,
    isMultiPageDocument: boolean
  ) => void;
}): TooltipConfig[] => {
  const [numberOfPages, setNumberOfPages] = useState<number | undefined>(
    undefined
  );
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const { isLoading: isOcrDataLoading, data: ocrData } =
    useContainerOcrData(selectedContainer);

  useEffect(() => {
    (async () => {
      if (selectedContainer === undefined) {
        return;
      }

      if (selectedContainer.type !== ContainerType.DOCUMENT) {
        return;
      }

      try {
        const numPages = await getPdfCache().getPdfNumPages(
          selectedContainer.url
        );
        setNumberOfPages(numPages);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [selectedContainer]);

  return useMemo(() => {
    if (selectedContainer === undefined) {
      return [];
    }

    const tooltipConfigs: TooltipConfig[] = [
      {
        targetId: selectedContainer.id,
        content: (
          <ContainerTooltip
            key={selectedContainer.id}
            selectedContainer={selectedContainer}
            containers={containers}
            onAddSummarizationSticky={onAddSummarizationSticky}
            tooltipsOptions={tooltipsOptions}
            onUpdateTooltipsOptions={onUpdateTooltipsOptions}
            onUpdateContainer={(
              containerConfig: IndustryCanvasContainerConfig
            ) => updateContainerById(containerConfig.id, containerConfig)}
            onRemoveContainer={() => removeContainerById(selectedContainer.id)}
            shamefulNumPages={numberOfPages}
            isLoadingSummary={isLoadingSummary}
            setIsLoadingSummary={setIsLoadingSummary}
            isOcrDataLoading={isOcrDataLoading}
            ocrData={ocrData}
          />
        ),
        anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        shouldPositionStrictly: true,
      },
    ];
    return tooltipConfigs;
  }, [
    containers,
    selectedContainer,
    removeContainerById,
    onAddSummarizationSticky,
    updateContainerById,
    numberOfPages,
    isLoadingSummary,
    isOcrDataLoading,
    ocrData,
    tooltipsOptions,
    onUpdateTooltipsOptions,
  ]);
};

export default useIndustryCanvasContainerTooltips;
