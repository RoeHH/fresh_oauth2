import oauthPlugin from "../oauth2Plugin.ts";

const githubOauth2Plugin = (
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  scopes?: string[],
) =>
  oauthPlugin({
    clientId,
    clientSecret,
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
