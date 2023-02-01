import { createLink } from '@cognite/cdf-utilities';
import {
  Button,
  Drawer,
  Flex,
  Input,
  SegmentedControl,
  Select,
} from '@cognite/cogs.js';
import { useState } from 'react';
import { redirect, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AbbreviationTable } from '../../components/Table/AbbreviationTable';
import { Convention, TagTypes } from '../../types';

interface Props {
  selectedConvention?: Convention;
  conventions?: Convention[];
  onChange: (item: Convention) => void;
}
export const ConventionItem: React.FC<Props> = ({
  conventions,
  selectedConvention,
  onChange,
}) => {
  const navigate = useNavigate();

  const [convention, setConvention] = useState<Convention | undefined>(
    selectedConvention
  );
  const [currentKey, setCurrentKey] = useState<TagTypes>('Abbreviation');

  if (!convention) {
    return null;
  }

  return (
    <Flex gap={8} direction="column">
      <SegmentedControl
        currentKey={currentKey}
        onButtonClicked={(nextKey: any) => setCurrentKey(nextKey)}
      >
        <SegmentedControl.Button key="Abbreviation">
          Abbreviations
        </SegmentedControl.Button>
        <SegmentedControl.Button key="Range">Ranges</SegmentedControl.Button>
        <SegmentedControl.Button key="Regex">Regex</SegmentedControl.Button>
      </SegmentedControl>

      <Button
        style={{ alignSelf: 'flex-end' }}
        onClick={() => navigate('/edit/' + convention.id)}
        icon={'Edit'}
        type={'secondary'}
        aria-label="Edit mode"
      ></Button>
      <AbbreviationTable convention={convention} conventions={conventions} />
    </Flex>
  );
};

const SaveButton = styled(Button)`
  width: 100px;
  display: flex;
  align-self: flex-end;
`;
