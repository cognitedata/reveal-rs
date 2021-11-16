import styled from 'styled-components';
import moment from 'moment';
import { Tag, Tooltip, Colors } from '@cognite/cogs.js';
import { Simulator } from 'store/simulator/types';
import { selectIsSimulatorAvailable } from 'store/simulator/selectors';

const SimulatorItemContainer = styled.div`
  display: flex;
  margin: 5px 0;
  white-space: nowrap;
  flex-direction: column;
`;

const SimulatorItem = styled.p`
  margin: 0;
  margin-bottom: 0.25em;
  padding: 0;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HearBeatContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

interface SimulatorProps {
  simulators: Simulator[];
  color?: string;
  icon?: string;
}

export function SimulatorTag({
  simulators,
  color,
  icon,
  children,
}: React.PropsWithChildren<SimulatorProps>) {
  return (
    <Tag color={color} icon={icon}>
      <Tooltip
        content={simulators.map((simulator) => (
          <SimulatorItemContainer key={simulator.name}>
            <SimulatorItem>Name: {simulator.name}</SimulatorItem>
            <SimulatorItem>
              Connector Version: {simulator.connectorVersion}
            </SimulatorItem>
            <HearBeatContainer>
              <SimulatorItem>Last Seen: </SimulatorItem>
              <Tag
                color={
                  selectIsSimulatorAvailable(simulator)
                    ? Colors['graphics-success'].hex()
                    : Colors['graphics-danger'].hex()
                }
              >
                {moment.duration(moment().diff(simulator.heartbeat)).humanize()}{' '}
                ago
              </Tag>
            </HearBeatContainer>
          </SimulatorItemContainer>
        ))}
      >
        <div>{children}</div>
      </Tooltip>
    </Tag>
  );
}
