import oauthPlugin from "../oauth2Plugin.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import { User } from "../oauth2Plugin.ts";

const envSecrets = {
  oauthClientId: Deno.env.get("oauthClientId"),
  oauthClientSecret: Deno.env.get("oauthClientSecret"),
};

const spotifyOauth2Plugin = (
  redirectUri: string,
  options?: {
    oauthClientId?: string,
    oauthClientSecret?: string,
    scopes?: string[],
    excludedPaths?: string[],
    mock: boolean,
    mockUser: User
  }
) =>
  oauthPlugin({
    clientId: throwErrorIfUndefined(options?.oauthClientId || envSecrets.oauthClientId, options?.mock),
    clientSecret: throwErrorIfUndefined(options?.oauthClientSecret || envSecrets.oauthClientSecret, options?.mock),
    authorizationEndpointUri: "https://accounts.spotify.com/authorize",
    tokenEndpointUri: "https://accounts.spotify.com/api/token",
    redirectUri,
    scopes: options?.scopes ? options.scopes : ["user-read-email"],
    getUserFromApi: async (accessToken, logout) => {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return null;
        }else{
          throw new Error(await response.text());
        }
      }

      const userData = await response.json();
      return {
        id: userData.id,
        name: userData.display_name,
        email: userData.email,
        picture: userData.images[0].url,
        accessToken: accessToken,
      };
    },
  });

export default spotifyOauth2Plugin;

function throwErrorIfUndefined(s: string|undefined, mocked: boolean): string {
  if(mocked)
    return "mocked"
  if (s)
    return s;
  throw new Error("Environment variable oauthClientSecret and/or oauthClientId are not set or passed as argument");
}