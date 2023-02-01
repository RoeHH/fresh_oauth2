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
    authorizationEndpointUri: "https://github.com/login/oauth/authorize",
    tokenEndpointUri: "https://github.com/login/oauth/access_token",
    redirectUri,
    scopes: scopes ? scopes : ["read:user"],
    getUserFromApi: async (accessToken) => {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const userData = await response.json();
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        picture: userData["avatar_url"],
      };
    },
  });

export default githubOauth2Plugin;
