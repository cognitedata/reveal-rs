import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Convention } from '../../types';
import { colors } from '../../utils/colors';
import { SelectedText } from '../../containers/convention/elements';

interface Props {
  text: string;
  editMode?: boolean;
  conventions: Convention[];
  onClick?: (id: string) => void;
}
export const StructureText: React.FC<Props> = ({
  conventions,
  editMode,
  text,
  onClick,
}) => {
  const [boundingBoxes, setBoundingBoxes] = useState<
    { rect: DOMRect; color: string }[]
  >([]);

  useEffect(() => {
    if (editMode) {
      const textElement = document.getElementById('textElement');

      if (textElement) {
        const textElementPosition = textElement.getBoundingClientRect();
        const textNode = textElement.childNodes[0];
        const range = document.createRange();

        const rectangles = conventions.map((convention) => {
          range.setStart(textNode, convention.start);
          range.setEnd(textNode, convention.end);
          const rectangle = range.getBoundingClientRect();

          rectangle.x -= textElementPosition.x;
          rectangle.y -= textElementPosition.y;

          rectangle.x -= 2;
          rectangle.y -= 2;
          rectangle.width += 4;
          rectangle.height += 4;

          return { rect: rectangle, color: colors[convention.start] };
        });

        setBoundingBoxes([...rectangles]);
      }
    }
  }, [editMode, conventions]);

  if (editMode || conventions.length === 0) {
    return (
      <>
        <div style={{ position: 'relative' }}>
          <Text id="textElement">{text}</Text>
          {editMode &&
            boundingBoxes.map((box) => {
              return (
                <div
                  style={{
                    position: 'absolute',
                    left: box.rect.left + 'px',
                    top: box.rect.top + 'px',
                    width: box.rect.width + 'px',
                    height: box.rect.height + 'px',
                    border: '2px solid ' + box.color,
                    display: 'inline-block',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                />
              );
            })}
        </div>
      </>
    );
  }

  const content: JSX.Element[] = [];

  for (let i = 0; i < text.length; i++) {
    const selection = conventions.find((item) => {
      return item.start === i;
    });

    if (selection) {
      content.push(
        <SelectedText
          $color={colors[selection.start]}
          onClick={() => {
            onClick?.(selection.id);
          }}
          key={`${selection.start}-${selection.end}`}
        >
          {selection.keyword}
        </SelectedText>
      );
      i = selection.end - 1;
    } else {
      content.push(<Text key={i}>{text.charAt(i)}</Text>);
    }
  }

  return <>{content}</>;
};

export const Text = styled.div`
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
  display: inline-block;
  white-space: pre;
`;
