export interface OAuth2Plugin {
    clientId: string;
    clientSecret: string;
    authorizationEndpointUri: string;
    tokenEndpointUri: string;
    redirectUri: string;
    scopes: string[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    picture: string;
}