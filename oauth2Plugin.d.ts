export interface OAuth2PluginParams {
  clientId: string;
  clientSecret: string;
  authorizationEndpointUri: string;
  tokenEndpointUri: string;
  redirectUri: string;
  scopes: string[];
  getUserFromApi: (accessToken: string, logout: Function) => Promise<User | null>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  accessToken?: string;
}
