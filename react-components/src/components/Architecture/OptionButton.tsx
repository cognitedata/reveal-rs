/*!
 * Copyright 2024 Cognite AS
 */

import { Button, Tooltip as CogsTooltip, ChevronDownIcon, ChevronUpIcon } from '@cognite/cogs.js';
import { Menu } from '@cognite/cogs-lab';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type MouseEvent
} from 'react';

import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { type BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import {
  getButtonType,
  getDefaultCommand,
  getFlexDirection,
  getTooltipPlacement,
  getIcon
} from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { IconComponent } from './IconComponentMapper';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { type TranslateDelegate } from '../../architecture/base/utilities/TranslateKey';
import { useClickOutside } from './useClickOutside';
import { DEFAULT_PADDING, OPTION_MIN_WIDTH } from './constants';

export const OptionButton = ({
  inputCommand,
  isHorizontal = false,
  usedInSettings = false
}: {
  inputCommand: BaseOptionCommand;
  isHorizontal: boolean;
  usedInSettings?: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const command = useMemo<BaseOptionCommand>(
    () => getDefaultCommand<BaseOptionCommand>(inputCommand, renderTarget),
    []
  );

  const [isOpen, setOpen] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [uniqueId, setUniqueId] = useState<number>(0);
  const [icon, setIcon] = useState<IconName | undefined>(undefined);

  const update = useCallback((command: BaseCommand) => {
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
  }, []);

  useEffect(() => {
    update(command);
    command.addEventListener(update);
    return () => {
      command.removeEventListener(update);
    };
  }, [command]);

  const outsideAction = (): boolean => {
    if (!isOpen) {
      return false;
    }
    postAction();
    return true;
  };

  const postAction = (): void => {
    setOpen(false);
    renderTarget.domElement.focus();
  };

  const menuRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(menuRef, outsideAction);

  if (!isVisible || command.children === undefined) {
    return <></>;
  }
  const placement = getTooltipPlacement(isHorizontal);
  const label = usedInSettings ? undefined : command.getLabel(t);
  const flexDirection = getFlexDirection(isHorizontal);
  const children = command.children;
  const selectedLabel = command.selectedChild?.getLabel(t);

  const OpenButtonIcon = isOpen ? ChevronUpIcon : ChevronDownIcon;

  return (
    <Menu
      style={{
        minWidth: '0px',
        overflow: 'auto',
        flexDirection
      }}
      hideOnSelect={true}
      appendTo={'parent'}
      placement={usedInSettings ? 'bottom-end' : 'auto-start'}
      renderTrigger={(props: any) => (
        <CogsTooltip
          content={<LabelWithShortcut label={label} command={command} />}
          disabled={usedInSettings || label === undefined}
          appendTo={document.body}
          placement={placement}>
          <Button
            style={{
              padding: usedInSettings ? DEFAULT_PADDING : '8px 4px',
              minWidth: usedInSettings ? OPTION_MIN_WIDTH : undefined
            }}
            type={usedInSettings ? 'tertiary' : getButtonType(command)}
            icon={<OpenButtonIcon />}
            key={uniqueId}
            disabled={!isEnabled}
            toggled={isOpen}
            iconPlacement="right"
            aria-label={command.getLabel(t)}
            onClick={(event: MouseEvent<HTMLElement>) => {
              event.stopPropagation();
              event.preventDefault();
              setOpen((prevState) => !prevState);
            }}
          />
          {selectedLabel}
          <Button />
        </CogsTooltip>
      )}>
      {children.map((child, _index): ReactElement => {
        return createMenuItem(child, t, postAction);
      })}
    </Menu>
  );
};

function createMenuItem(
  command: BaseCommand,
  t: TranslateDelegate,
  postAction: () => void
): ReactElement {
  return (
    <Menu.ItemAction
      key={command.uniqueId}
      icon={getIcon(command)}
      disabled={!command.isEnabled}
      toggled={command.isChecked}
      iconPlacement="right"
      onClick={() => {
        command.invoke();
        postAction();
      }}>
      {command.getLabel(t)}
    </Menu.ItemAction>
  );
}
