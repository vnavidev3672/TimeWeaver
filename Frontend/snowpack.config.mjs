/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  mount: {
    /* ... */
    src:'/dist/',
	  public:'/',
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
  ],
  knownEntrypoints: ['react-dom'],
  routes: [
    /* Enable an SPA Fallback in development: */
    { match: "routes", src: ".*", dest: "/index.html" },
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
