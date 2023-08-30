import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import { parse } from 'query-string';

import { Icon, Chip } from '@cognite/cogs.js';
import {
  getSelectedIdpDetails,
  CogniteIdPResponse,
  saveSelectedIdpDetails,
  useCogniteIdPUserManager,
} from '@cognite/login-utils';

import { Microsoft } from '../../components/icons';
import SignInButton from '../../components/sign-in-button/SignInButton';

export default function SignInWithCogniteIdP({
  organization,
  appConfiguration,
  authority,
  internalId,
  type,
}: CogniteIdPResponse & { organization: string }) {
  const navigate = useNavigate();
  const { internalId: activeInternalId } = getSelectedIdpDetails() ?? {};
  const active = activeInternalId === internalId;

  const { code } = parse(window.location.search);

  const userManager = useCogniteIdPUserManager({
    authority,
    client_id: appConfiguration.clientId,
  });

  const { data: user, isInitialLoading: isLoading } = useQuery(
    ['cognite_idp', 'user'],
    async () => {
      try {
        if (code) {
          const cdfUser = userManager.signinRedirectCallback();
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          return cdfUser;
        } else {
          return userManager.getUser();
        }
      } finally {
        userManager.clearStaleState();
      }
    },
    { enabled: active }
  );

  useEffect(() => {
    if (user) {
      navigate('/select-project');
    }
  }, [user, navigate]);

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  return (
    <SignInButton
      disabled={isLoading}
      isLoading={isLoading}
      onClick={() => {
        saveSelectedIdpDetails({
          internalId,
          type: type,
        });
        userManager.signinRedirect({
          extraQueryParams: {
            audience: 'https://cognitedata.com',
            organization_hint: organization,
          },
        });
      }}
      icon={<Microsoft />}
    >
      {'Sign in with Microsoft '}
      <Chip
        type="danger"
        label="Experimental"
        size="x-small"
        hideTooltip
        appearance="solid"
      />
    </SignInButton>
  );
}
