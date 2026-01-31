module.exports = {
  apps: [
    {
      // Backend Server
      name: "githire-server",
      script: "./server/app.js",
      cwd: "./",
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
      error_file: "./logs/server-error.log",
      out_file: "./logs/server-out.log",
      log_file: "./logs/server-combined.log",
      time: true,
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "1G",
      watch: ["server"],
      ignore_watch: ["node_modules", "logs", "coverage"],
    },
    {
      // Frontend Development Server
      name: "githire-client",
      script: "npm",
      args: "run dev",
      cwd: "./client",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "development",
      },
      error_file: "./logs/client-error.log",
      out_file: "./logs/client-out.log",
      log_file: "./logs/client-combined.log",
      time: true,
      autorestart: true,
      watch: ["client/src"],
      ignore_watch: ["node_modules", "dist", "coverage"],
    },
  ],
};
