import styled from 'styled-components/macro';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Chip = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cogs-surface--status-undefined--muted--default);
  color: var(--cogs-text-icon--status-undefined);
  border-radius: 6px;
  padding: 6px 12px;
  height: 36px;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
`;
