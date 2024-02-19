/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useEffect, useState, SetStateAction, useCallback } from 'react';

import { SegmentedControl, Tooltip as CogsTooltip, type IconType, Button } from '@cognite/cogs.js';
import { useReveal } from '../RevealCanvas/ViewerContext';
import {
  type CameraManager,
  FlexibleControlsType,
  type IFlexibleCameraManager
} from '@cognite/reveal';

import { useTranslation } from '../i18n/I18n';
import styled from 'styled-components';

type CustomSettingsProps = {
  includeOrbitInCenter?: boolean;
  topbarLayout?: boolean;
};

type TranslateDelegate = (key: string, fallback?: string) => string;

type ControlTypeSelectionProps = {
  selectedControlsType: FlexibleControlsType;
  setSelectedControlsType: (controlsType: FlexibleControlsType) => void;
  options: FlexibleControlsType[];
  translateDelegate: TranslateDelegate;
};

export function SetOrbitOrFirstPersonControlsType(
  props: Omit<CustomSettingsProps, 'includeOrbitInCenter'>
): ReactElement {
  return SetFlexibleControlsType({ ...props, includeOrbitInCenter: false });
}

export function SetFlexibleControlsType({
  includeOrbitInCenter,
  topbarLayout
}: CustomSettingsProps): ReactElement {
  const viewer = useReveal();
  const flexibleCameraManager = asFlexibleCameraManager(viewer.cameraManager);
  const { t: translate } = useTranslation();

  // This value is redunant (react force me to do it)
  const [selectedControlsType, setSelectedControlsType] = useState<FlexibleControlsType>(
    getDefaultValue(flexibleCameraManager)
  );

  const setSelectedControlsTypeAndUpdateCameraManager = useCallback(
    (controlsType: FlexibleControlsType) => {
      setSelectedControlsType(controlsType);
      if (flexibleCameraManager !== undefined) {
        flexibleCameraManager.controlsType = controlsType;
      }
    },
    [flexibleCameraManager]
  );

  useListenToCameraManagerUpdate(flexibleCameraManager, setSelectedControlsType);

  if (flexibleCameraManager === undefined) {
    return <></>;
  }

  const options = [FlexibleControlsType.Orbit, FlexibleControlsType.FirstPerson];

  if (includeOrbitInCenter ?? false) {
    options.push(FlexibleControlsType.OrbitInCenter);
  }

  const controlsTypeParameters: ControlTypeSelectionProps = {
    selectedControlsType,
    setSelectedControlsType: setSelectedControlsTypeAndUpdateCameraManager,
    options,
    translateDelegate: translate
  };

  return topbarLayout ?? false ? (
    <SegmentedControlTypeSelector {...controlsTypeParameters} />
  ) : (
    <ButtonsControlTypeSelector {...controlsTypeParameters} />
  );
}

const useListenToCameraManagerUpdate = (
  cameraManager: IFlexibleCameraManager | undefined,
  setSelectedControlsType: (controlsType: FlexibleControlsType) => void
) => {
  useEffect(() => {
    if (cameraManager === undefined) {
      return;
    }

    const update = (newControlsType: FlexibleControlsType): void => {
      setSelectedControlsType(newControlsType);
    };

    cameraManager.addControlsTypeChangeListener(update);
    return () => {
      if (cameraManager !== undefined) {
        cameraManager.removeControlsTypeChangeListener(update);
      }
    };
  }, []); // Should only be called once
};

const ButtonsControlTypeSelector = ({
  options,
  selectedControlsType,
  setSelectedControlsType,
  translateDelegate
}: ControlTypeSelectionProps) => {
  return (
    <ButtonsContainer>
      {options.map((controlType) => (
        <CogsTooltip
          content={getLabel(translateDelegate, controlType)}
          placement="right"
          appendTo={document.body}>
          <Button
            type="ghost"
            icon={getIcon(controlType)}
            toggled={selectedControlsType === controlType}
            aria-label={getLabel(translateDelegate, controlType)}
            onClick={() => setSelectedControlsType(controlType)}></Button>
        </CogsTooltip>
      ))}
    </ButtonsContainer>
  );
};

const SegmentedControlTypeSelector = ({
  options,
  selectedControlsType,
  setSelectedControlsType,
  translateDelegate
}: ControlTypeSelectionProps) => (
  <CogsTooltip
    content={translateDelegate('CONTROLS_TYPE_TOOLTIP', 'Set Camera to Orbit or Fly mode')}
    placement="right"
    appendTo={document.body}>
    <SegmentedControl
      onButtonClicked={(controlsType: FlexibleControlsType) =>
        setSelectedControlsType(controlsType)
      }
      currentKey={selectedControlsType}
      fullWidth>
      {options.map((controlsType) => (
        <SegmentedControl.Button key={controlsType} icon={getIcon(controlsType)}>
          {getLabel(translateDelegate, controlsType)}
        </SegmentedControl.Button>
      ))}
    </SegmentedControl>
  </CogsTooltip>
);

function getLabel(translate: TranslateDelegate, controlsType: FlexibleControlsType): string {
  switch (controlsType) {
    case FlexibleControlsType.FirstPerson:
      return translate('CONTROLS_TYPE_FIRST_PERSON', 'Fly');
    case FlexibleControlsType.Orbit:
      return translate('CONTROLS_TYPE_ORBIT', 'Orbit');
    case FlexibleControlsType.OrbitInCenter:
      return translate('CONTROLS_TYPE_ORBIT_IN_CENTER', 'Center Orbit');
    default:
      return 'Undefined';
  }
}

function getDefaultValue(manager: IFlexibleCameraManager | undefined): FlexibleControlsType {
  return manager !== undefined ? manager.controlsType : FlexibleControlsType.Orbit;
}

function getIcon(controlsType: FlexibleControlsType): IconType {
  switch (controlsType) {
    case FlexibleControlsType.FirstPerson:
      return 'Plane';
    case FlexibleControlsType.Orbit:
      return 'Circle';
    case FlexibleControlsType.OrbitInCenter:
      return 'Coordinates';
    default:
      return 'Error';
  }
}

function asFlexibleCameraManager(manager: CameraManager): IFlexibleCameraManager | undefined {
  // instanceof don't work within React, so using safeguarding
  const flexibleCameraManager = manager as IFlexibleCameraManager;
  return flexibleCameraManager.controlsType === undefined ? undefined : flexibleCameraManager;
}

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
