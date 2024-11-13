/*!
 * Copyright 2024 Cognite AS
 */
import { Comment } from '@cognite/cogs.js';
import { type BaseInputCommand } from '../../architecture/base/commands/BaseInputCommand';
import { type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from '../i18n/I18n';
import { useOnUpdate } from './useOnUpdate';
import { useRenderTarget } from '../RevealCanvas';
import { getDefaultCommand } from './utilities';
import { BaseCommand } from '../../architecture';

export const InputField = ({
  inputCommand
}: {
  inputCommand: BaseInputCommand;
  placement: string;
}): ReactNode => {
  const { t } = useTranslation();

  const renderTarget = useRenderTarget();
  const command = useMemo<BaseInputCommand>(
    () => getDefaultCommand(inputCommand, renderTarget),
    []
  );

  const [content, setContent] = useState<string>('');
  const [enabled, setEnabled] = useState<boolean>(command.isEnabled);
  const [postLabel, setPostLabel] = useState<string | undefined>(command.getPostButtonLabel(t));
  const [cancelLabel, setCancelLabel] = useState<string | undefined>(
    command.getCancelButtonLabel(t)
  );
  const [placeholder, setPlaceholder] = useState<string | undefined>(command.getPlaceholder(t));

  useOnUpdate(command, () => {
    setPostLabel(command.getPostButtonLabel(t));
    setCancelLabel(command.getCancelButtonLabel(t));
    setPlaceholder(command.getPlaceholder(t));
    setEnabled(command.isEnabled);
  });

  return (
    <Comment
      key={command.uniqueId}
      placeholder={placeholder}
      message={content}
      setMessage={setContent}
      onPostMessage={() => command.invokeWithContent(content)}
      postButtonText={postLabel}
      postButtonDisabled={!enabled}
      cancelButtonText={cancelLabel}
      cancelButtonDisabled={false}
      onCancel={command.onCancel}
      showButtons={true}
    />
  );
};
