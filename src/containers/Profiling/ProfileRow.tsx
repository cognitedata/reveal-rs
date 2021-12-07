import React, { useMemo, useState } from 'react';

import { Button, Colors, Icon, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';

import ColumnIcon from 'components/ColumnIcon';
import { CustomIcon } from 'components/CustomIcon';
import { useActiveTableContext } from 'contexts';
import { ColumnProfile, useColumnType } from 'hooks/profiling-service';

import { Graph } from './Distribution';
import ProfileDetailsRow from './ProfileDetailsRow';

const StyledInfoFilledIcon = styled(Icon).attrs({
  size: 16,
  type: 'InfoFilled',
})`
  color: ${Colors['text-hint'].hex()};
`;

const NumberOrMissingTd = ({
  checkIfAvailable,
  columnType,
  value,
}: {
  checkIfAvailable?: boolean;
  columnType?: ColumnProfile['type'] | 'Unknown';
  value?: number;
}) => {
  if (columnType !== 'Number' && checkIfAvailable) {
    return (
      <TableData className="numeric">
        <Tooltip content="This information is not available for this data type">
          <CustomIcon icon="NotAvailable" style={{ width: 16 }} />
        </Tooltip>
      </TableData>
    );
  }

  return (
    <TableData className="numeric">
      {Number.isFinite(value) ? (
        value
      ) : (
        <Tooltip content="Unavailable due to error">
          <StyledInfoFilledIcon />
        </Tooltip>
      )}
    </TableData>
  );
};

type Props = {
  allCount: number;
  profile: ColumnProfile;
};

export default function ProfileRow({ allCount, profile }: Props) {
  const {
    label,
    nullCount,
    distinctCount,
    min,
    max,
    mean,
    median,
    std,
    histogram,
    counts,
    count,
  } = profile;
  const [expanded, setExpanded] = useState(false);

  const { database, table } = useActiveTableContext();
  const { getColumnType, isFetched } = useColumnType(database, table);

  const columnType = useMemo(
    () => (isFetched ? getColumnType(label) : undefined),
    [getColumnType, isFetched, label]
  );

  return (
    <>
      <StyledTableRow
        key="profile"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer' }}
      >
        <TableData>{<ColumnIcon dataKey={label} />}</TableData>
        <TableData>{label}</TableData>
        <NumberOrMissingTd value={nullCount} />
        <NumberOrMissingTd value={distinctCount} />
        <TableData style={{ padding: '4px 0 0' }}>
          {histogram && (
            <Graph
              distribution={histogram}
              height={40}
              maximumBarWidth={6}
              width={150}
              fill="rgba(140, 140, 140, 1)"
            />
          )}
        </TableData>
        <NumberOrMissingTd
          checkIfAvailable
          columnType={columnType}
          value={min}
        />
        <NumberOrMissingTd
          checkIfAvailable
          columnType={columnType}
          value={max}
        />
        <NumberOrMissingTd
          checkIfAvailable
          columnType={columnType}
          value={mean}
        />
        <StyledExpandTableCell>
          <StyledExpandButton
            icon={expanded ? 'ChevronUp' : 'ChevronDown'}
            type="ghost"
          />
        </StyledExpandTableCell>
      </StyledTableRow>
      {expanded && (
        <ProfileDetailsRow
          allCount={allCount}
          nullCount={nullCount}
          count={count}
          min={min}
          max={max}
          mean={mean}
          median={median}
          std={std}
          counts={counts}
          distinctCount={distinctCount}
          histogram={histogram}
        />
      )}
    </>
  );
}

export const TableData = styled.td<{ $width?: number }>`
  border: 1px solid ${Colors['greyscale-grey4'].hex()};
  padding: 16px;
  width: ${({ $width }) => ($width !== undefined ? `${$width}px` : '')};
`;

const StyledExpandButton = styled(Button)`
  display: none;
`;

const StyledExpandTableCell = styled(TableData)`
  padding: 9px 16px 8px;
`;

const StyledTableRow = styled.tr`
  &:hover {
    background-color: ${Colors['bg-accent'].hex()};

    ${StyledExpandButton} {
      display: block;
    }
  }
`;
