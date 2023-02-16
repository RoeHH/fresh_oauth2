import oauthPlugin from "../oauth2Plugin.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const envSecrets = {
  oauthClientId: Deno.env.get("oauthClientId"),
  oauthClientSecret: Deno.env.get("oauthClientSecret"),
};

const githubOauth2Plugin = (
  redirectUri: string,
  options?: {
    oauthClientId?: string,
    oauthClientSecret?: string,
    scopes?: string[],
    excludedPaths?: string[],
  }
) =>
  oauthPlugin({
    clientId: throwErrorIfUndefined(options?.oauthClientId || envSecrets.oauthClientId),
    clientSecret: throwErrorIfUndefined(options?.oauthClientSecret || envSecrets.oauthClientSecret),
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

export default githubOauth2Plugin;

function throwErrorIfUndefined(s: string|undefined): string {
  if (s) {
    return s;
  }
  throw new Error("Environment variable oauthClientSecret and/or oauthClientId are not set or passed as argument");
}