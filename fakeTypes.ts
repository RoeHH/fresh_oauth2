
export interface Plugin {
  /** The name of the plugin. Must be snake-case. */
  name: string;

  /** A map of a snake-case names to a import specifiers. The entrypoints
   * declared here can later be used in the "scripts" option of
   * `PluginRenderResult` to load the entrypoint's code on the client.
   */
  entrypoints?: Record<string, string>;

  routes?: PluginRoute[]

  middlewares?: PluginMiddlewear[]

  /** The render hook is called on the server every time some JSX needs to
   * be turned into HTML. The render hook needs to call the `ctx.render`
   * function exactly once.
   *
   * The hook can return a `PluginRenderResult` object that can do things like
   * inject CSS into the page, or load additional JS files on the client.
   */
  render?(ctx: PluginRenderContext): PluginRenderResult;
}

export interface PluginRenderContext {
  render: PluginRenderFunction;
}

export interface PluginRenderResult {
  /** CSS styles to be injected into the page. */
  styles?: PluginRenderStyleTag[];
  /** JS scripts to ship to the client. */
  scripts?: PluginRenderScripts[];
}

export interface PluginRenderStyleTag {
  cssText: string;
  media?: string;
  id?: string;
}

export interface PluginRenderScripts {
  /** The "key" of the entrypoint (as specified in `Plugin.entrypoints`) for the
   * script that should be loaded. The script must be an ES module that exports
   * a default function.
   *
   * The default function is invoked with the `state` argument specified below.
   */
  entrypoint: string;
  /** The state argument that is passed to the default export invocation of the
   * entrypoint's default export. The state must be JSON-serializable.
   */
  state: unknown;
}

export type PluginRenderFunction = () => PluginRenderFunctionResult;

export interface PluginRenderFunctionResult {
  /** The HTML text that was rendered. */
  htmlText: string;
  /** If the renderer encountered any islands that require hydration on the
   * client.
   */
  requiresHydration: boolean;
}

export interface PluginMiddlewear {
  path: string;
  handler: MiddlewareHandler
}

export interface PluginRoute {
  path: string;
  component?: ComponentType<PageProps>;
  // deno-lint-ignore no-explicit-any
  handler?: Handler<any, any> | Handlers<any, any>;
}