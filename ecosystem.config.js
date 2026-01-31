module.exports = {
  apps: [
    {
      name: "githired-server",
      script: "./server/app.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",

      // Config untuk Production
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
        DATABASE_URL:
          "postgresql://postgres:DkwkMdkGzfJqhUXlPzrA0ppxFHTcoLPy@caboose.proxy.rlwy.net:56894/railway",
      },
    },
  ],
};
