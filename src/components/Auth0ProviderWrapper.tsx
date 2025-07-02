
import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Auth0ProviderWrapperProps {
  children: ReactNode;
}

export function Auth0ProviderWrapper({ children }: Auth0ProviderWrapperProps) {
  const domain = "dev-zh3w0q2u3um73byh.us.auth0.com";
  const clientId = "cViqSXjuhLvSzdmj7rvC6AvNtqcRLCIF";
  const audience = "http://localhost:8000";

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: 'openid profile email'
      }}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}
