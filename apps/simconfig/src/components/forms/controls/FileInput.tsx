import { DragEvent, ChangeEvent } from 'react';
import { Flex, Icon } from '@cognite/cogs.js';

import { DropTextWrapper, DropWrapper, HiddenInputFile } from './elements';

interface ComponentProps {
  extensions?: string[];
  onFileSelected: (file?: File) => void;
}

export function FileInput({
  extensions,
  onFileSelected,
}: React.PropsWithoutRef<ComponentProps>) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) =>
    onFileSelected(event.currentTarget.files?.[0]);

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    onFileSelected(event.dataTransfer?.files?.[0]);
  };

  return (
    <>
      <DropWrapper
        onDrop={onDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        <DropTextWrapper>
          <Flex gap={10} justifyContent="center">
            <Icon type="Download" size={32} /> Drag and drop model file, or
            browse for file below.
          </Flex>
        </DropTextWrapper>
        <div>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="file-upload" className="cogs-btn cogs-btn--padding">
            Browse...
            <HiddenInputFile
              id="file-upload"
              type="file"
              accept={extensions?.join(',')}
              onChange={onChange}
            />
          </label>
        </div>
      </DropWrapper>
    </>
  );
}
