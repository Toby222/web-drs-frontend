module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
    reactStrictMode: true,
  },
  webpack(config, { dev }) {
    if (!dev) {
      Object.assign(config.resolve.alias, {
        react: "preact/compat",
        "react-dom": "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
      });
    }
    return config;
  },
};
