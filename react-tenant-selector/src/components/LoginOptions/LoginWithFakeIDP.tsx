import * as React from 'react';
import axios from 'axios';

import { Button } from '@cognite/cogs.js';
import { saveToLocalStorage } from '@cognite/storage';
import { CogniteAuth } from '@cognite/auth-utils';

import { FakeIdp } from 'utils';

type Props = {
  authClient?: CogniteAuth;
  handleSubmit: (tenant: string) => void;
} & FakeIdp;
const LoginWithFakeIDP: React.FC<Props> = ({
  roles,
  groups,
  project,
  cluster,
  fakeApplicationId,
  authClient,
  handleSubmit,
}) => {
  const handleClick = () => {
    return axios
      .post(`http://localhost:8200/login/token`, {
        fakeApplicationId,
        groups,
        roles,
      })
      .then((result) => {
        saveToLocalStorage('fakeIdp', {
          project,
          cluster,
          idToken: result.data.id_token,
          accessToken: result.data.access_token,
        });

        if (authClient) {
          authClient.loginInitial({
            flow: 'FAKE_IDP',
          });
        }

        handleSubmit(project);
      })
      .catch(() => {
        // eslint-disable-next-line no-console
        console.error(
          'There has been an error, do you have the FakeIdP service running?'
        );
      });
  };

  return (
    <>
      <Button
        style={{ height: 40, width: '100%', marginTop: 10 }}
        size="default"
        type="secondary"
        onClick={handleClick}
      >
        Login with Fake IDP ({fakeApplicationId})
      </Button>
    </>
  );
};

export default LoginWithFakeIDP;
