import {
  HandlerContext,
  MiddlewareHandlerContext,
  Plugin,
} from "../fresh/server.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client@v1.0.0/mod.ts";
import { OAuth2PluginParams, User } from "./oauth2Plugin.d.ts";
import {
  cookieSession,
  WithSession,
} from "https://deno.land/x/fresh_session@0.2.0/mod.ts";

export type State = { user: User } & WithSession;
export type Data = { session: Record<string, string> };

const getHostUrl = (req: Request): string => {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}/`;
};

export default (params: OAuth2PluginParams) => {
  const oauth2Client = new OAuth2Client({
    clientId: params.clientId,
    clientSecret: params.clientSecret,
    authorizationEndpointUri: params.authorizationEndpointUri,
    tokenUri: params.tokenEndpointUri,
    redirectUri: params.redirectUri,
    defaults: {
      scope: params.scopes.join(" "),
    },
  });

  return {
    name: "oauth_2",
    routes: [
      {
        path: "/oauth2/login",
        handler: async (
          _req: Request,
          ctx: HandlerContext<Data, WithSession>,
        ): Promise<Response> => {
          const { session } = ctx.state;
          const code = await oauth2Client.code.getAuthorizationUri();
          session.set("codeVerifier", code.codeVerifier);
          return new Response(null, {
            status: 302,
            headers: {
              Location: code.uri.toString(),
            },
          });
        },
      },
      {
        path: "/oauth2/logout",
        handler: (
          req: Request,
          ctx: HandlerContext<Data, WithSession>,
        ): Response => {
          const { session } = ctx.state;
          session.set("auth_token", undefined);
          return new Response(null, {
            status: 302,
            headers: { Location: getHostUrl(req) },
          });
        },
      },
      {
        path: "/oauth2/callback",
        handler: async (
          req: Request,
          ctx: HandlerContext<Data, WithSession>,
        ): Promise<Response> => {
          const { session } = ctx.state;
          const url = new URL(req.url);
          const code = url.searchParams.get("code");
          if (!code) {
            return new Response(undefined, { status: 404 });
          }

          const accessToken = (await oauth2Client.code.getToken(req.url, {
            codeVerifier: session.get("codeVerifier"),
          }))
            .accessToken;

          session.set("auth_token", accessToken);
          return new Response(undefined, {
            headers: { location: getHostUrl(req) },
            status: 302,
          });
        },
      },
    ],
    middlewares: [
      {
        path: "/",
        middleware: {
          handler: [
            (
              req: Request,
              ctx: MiddlewareHandlerContext<State>,
            ): Promise<Response> => {
              return cookieSession()(req, ctx);
            },
            async (
              _req: Request,
              ctx: MiddlewareHandlerContext<State>,
            ): Promise<Response> => {
              const { session } = ctx.state;
              const logout = () => { session.set("auth_token", undefined);  };
              const token = session.get("auth_token");
              if (token) {
                ctx.state.user = await params.getUserFromApi(token, logout);
              }

              return ctx.next();
            },
          ],
        },
      },
    ],
  } as Plugin;
};
