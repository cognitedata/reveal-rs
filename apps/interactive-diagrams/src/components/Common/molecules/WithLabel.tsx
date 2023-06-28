import React from 'react';

import { SmallTitle } from '../atoms';

type Props = {
  title: string;
  children: React.ReactNode;
};
export const WithLabel = (props: Props) => {
  return (
    <div style={{ width: '100%' }}>
      <SmallTitle>{props.title}</SmallTitle>
      {props.children}
    </div>
  );
};
