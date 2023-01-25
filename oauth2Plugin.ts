import { Plugin } from './fakeTypes.ts'

export default {
    name: "oauth_2",
    routes: [
        {
            path: "/oauth2/login",
            handler: loginHandler
        },
        {
            path: "/oauth2/callback",
            handler: callbackHandler
        }
    ]
} as Plugin

function loginHandler(req: Request, ctx: HandlerContext): Promise<Response>  {
    // ...
}

function callbackHandler(req: Request, ctx: HandlerContext): Promise<Response>  {


  const accessToken = (await oauth2Client.code.getToken(req.url)).accessToken;

  const user = await gitHubApi.getUserData(accessToken)
  ctx.state.user = user
  
  ctx.state.lists.push(await db.getTodoList(user.userId.toString()) || { id: user.userId.toString(), todos: [] });

  const response = await ctx.next();
  setCookie(response.headers, {
    name: "gh_token",
    value: accessToken,
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
  });
}