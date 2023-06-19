/* eslint-disable react/no-multi-comp */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { Button } from '@cognite/cogs.js';

import Provider from './.storybook/boilerplate';
import EmptyState from './EmptyState';

storiesOf('watchtower|EmptyState', module)
  .addDecorator((story) => <Provider story={story} />)
  .add('Default', () => <EmptyState />)
  .add('3D Model', () => <EmptyState type="Model3d" />)
  .add('Custom text', () => <EmptyState text="Custom text" />)
  .add('Extra', () => (
    <EmptyState
      text="Custom text"
      extra={<Button type="primary">Click me</Button>}
    />
  ))
  .add('Stateful story', () => {
    class StatefulEmptyState extends React.Component {
      state = {};

      render() {
        return (
          <div>
            <EmptyState />
          </div>
        );
      }
    }
    return <StatefulEmptyState />;
  });
