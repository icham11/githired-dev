module.exports = {
  apps: [
    {
      // Backend Server
      name: "githire-server",
      script: "./app.js",
      cwd: "./server",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      error_file: "../logs/server-error.log",
      out_file: "../logs/server-out.log",
      log_file: "../logs/server-combined.log",
      time: true,
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "1G",
      watch: ["."],
      ignore_watch: ["node_modules", "logs", "coverage"],
    },
  ],
};
