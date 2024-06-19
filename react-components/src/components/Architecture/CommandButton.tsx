/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement, useState, useEffect, useMemo } from 'react';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { Button, Tooltip as CogsTooltip, Divider, type IconType } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';
import { RenderTargetCommand } from '../../architecture/base/commands/RenderTargetCommand';
import { OptionButton } from './OptionButton';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { getButtonType, getIcon, getTooltipPlacement } from './Utilities';

export const CommandButtons = ({
  commands,
  isHorizontal = false
}: {
  commands: Array<BaseCommand | undefined>;
  isHorizontal: boolean;
}): ReactElement => {
  return (
    <>
      {commands.map(
        (command, index): ReactElement => addCommandButton(command, isHorizontal, index)
      )}
    </>
  );
};

export const CreateCommandButton = (command: BaseCommand, isHorizontal = false): ReactElement => {
  if (command instanceof BaseOptionCommand) {
    return <OptionButton command={command} isHorizontal={isHorizontal} />;
  } else {
    return <CommandButton command={command} isHorizontal={isHorizontal} />;
  }
};

export const CommandButton = ({
  command,
  isHorizontal = false
}: {
  command: BaseCommand;
  isHorizontal: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const newCommand = useMemo<BaseCommand>(() => getDefaultCommand(command, renderTarget), []);

  const [isChecked, setChecked] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [uniqueId, setUniqueId] = useState<number>(0);
  const [icon, setIcon] = useState<IconType | undefined>(undefined);

  useEffect(() => {
    function update(command: BaseCommand): void {
      setChecked(command.isChecked);
      setEnabled(command.isEnabled);
      setVisible(command.isVisible);
      setUniqueId(command.uniqueId);
      setIcon(getIcon(command));
    }
    update(newCommand);
    newCommand.addEventListener(update);
    return () => {
      newCommand.removeEventListener(update);
    };
  }, [newCommand]);

  if (!isVisible) {
    return <></>;
  }
  const placement = getTooltipPlacement(isHorizontal);
  const tooltip = newCommand.getLabel(t);
  return (
    <CogsTooltip content={tooltip} placement={placement} appendTo={document.body}>
      <Button
        type={getButtonType(newCommand)}
        icon={icon}
        key={uniqueId}
        disabled={!isEnabled}
        toggled={isChecked}
        aria-label={tooltip}
        iconPlacement="right"
        onClick={() => {
          newCommand.invoke();
        }}
      />
    </CogsTooltip>
  );
};

export function getDefaultCommand(
  newCommand: BaseCommand,
  renderTarget: RevealRenderTarget
): BaseCommand {
  // If it exists from before, return the existing command
  // Otherwise, add the new command to the controller and attach the renderTarget.
  if (!newCommand.hasData) {
    const oldCommand = renderTarget.commandsController.getEqual(newCommand);
    if (oldCommand !== undefined) {
      return oldCommand;
    }
    renderTarget.commandsController.add(newCommand);
  }
  if (newCommand instanceof RenderTargetCommand) {
    newCommand.attach(renderTarget);
  }
  return newCommand;
}

function addCommandButton(
  command: BaseCommand | undefined,
  isHorizontal: boolean,
  index: number
): ReactElement {
  if (command === undefined) {
    const direction = !isHorizontal ? 'horizontal' : 'vertical';
    return <Divider key={index} weight="2px" length="24px" direction={direction} />;
  }
  if (command instanceof BaseOptionCommand)
    return <OptionButton key={command.uniqueId} command={command} isHorizontal={isHorizontal} />;
  else
    return <CommandButton key={command.uniqueId} command={command} isHorizontal={isHorizontal} />;
}
