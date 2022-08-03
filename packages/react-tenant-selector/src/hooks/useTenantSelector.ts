import { useState } from 'react';
import axios from 'axios';

const useTenantSelector = (appName: string, appsApiBaseUrl: string) => {
  const [validatingTenant, setValidatingTenant] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const initialTenant = localStorage.getItem('initialTenant');

  const onTenantSelected = (newTenant: string) => {
    localStorage.setItem('initialTenant', newTenant);
    setRedirecting(true);
    const { hash, search } = window.location;
    const url = [`/${newTenant}`, search, hash].filter(Boolean).join('');
    window.location.href = url;
  };

  const checkTenantValidity = (tenant: string) => {
    setValidatingTenant(true);
    return axios
      .get(`${appsApiBaseUrl}/tenant`, {
        params: { tenant, app: appName, redirectUrl: window.location.origin },
      })
      .then(() => true)
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        setValidatingTenant(false);
      });
  };

  return {
    checkTenantValidity,
    onTenantSelected,
    validatingTenant,
    redirecting,
    initialTenant,
  };
};

export default useTenantSelector;
