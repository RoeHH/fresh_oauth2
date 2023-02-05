import oauthPlugin from "../oauth2Plugin.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const envSecrets = {
  oauthClientId: Deno.env.get("oauthClientId"),
  oauthClientSecret: Deno.env.get("oauthClientSecret"),
};

const githubOauth2Plugin = (
  redirectUri: string,
  oauthClientId?: string,
  oauthClientSecret?: string,
  scopes?: string[],
) =>
  oauthPlugin({
    clientId: throwErrorIfUndefined(oauthClientId || envSecrets.oauthClientId),
    clientSecret: throwErrorIfUndefined(oauthClientSecret || envSecrets.oauthClientSecret),
    authorizationEndpointUri: "https://accounts.spotify.com/authorize",
    tokenEndpointUri: "https://accounts.spotify.com/api/token",
    redirectUri,
    scopes: scopes ? scopes : ["user-read-email"],
    getUserFromApi: async (accessToken) => {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(await response.text());
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