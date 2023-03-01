export interface OAuth2PluginParams {
  clientId: string;
  clientSecret: string;
  authorizationEndpointUri: string;
  tokenEndpointUri: string;
  redirectUri: string;
  scopes: string[];
  getUserFromApi: (accessToken: string, logout: Function) => Promise<User | null>;
  excludedPaths?: string[];
  mock: boolean;
  mockUser: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  accessToken?: string;
}
