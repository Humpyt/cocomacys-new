module.exports = {
  apps: [
    {
      name: "cocomacys-api",
      cwd: "/var/www/cocofashionbrands.com/current",
      script: "server/index.cjs",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
