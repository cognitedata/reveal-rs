import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { CogniteAuth } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk';
import { render } from '../../utils/test';

import Base from './LoginWithAzure';

const getProps = () => {
  const client = new CogniteClient({ appId: 'test' });
  const authClient = new CogniteAuth(client);

  authClient.login = jest.fn();

  return { authClient };
};

describe('<LoginWithAzure />', () => {
  it('Should render the button', () => {
    render(<Base {...getProps()} />);
    expect(screen.getByText('Login with ADFS')).toBeTruthy();
  });

  it('Should trigger login on click', () => {
    const props = getProps();
    render(<Base {...props} />);

    fireEvent.click(screen.getByText('Login with ADFS'));
    expect(props.authClient.login).toBeCalledTimes(1);
    expect(props.authClient.login).toHaveBeenCalledWith('ADFS');
  });
});
