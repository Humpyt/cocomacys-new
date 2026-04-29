const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });

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
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || 4000,
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: process.env.DB_PORT || 5432,
        DB_NAME: process.env.DB_NAME || 'cocomacys',
        DB_USER: process.env.DB_USER || 'postgres',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
        SESSION_SECRET: process.env.SESSION_SECRET || '',
        FRONTEND_URL: process.env.FRONTEND_URL || '',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '',
        SMTP_HOST: process.env.SMTP_HOST || '',
        SMTP_PORT: process.env.SMTP_PORT || '',
        SMTP_USER: process.env.SMTP_USER || '',
        SMTP_PASS: process.env.SMTP_PASS || '',
        EMAIL_FROM: process.env.EMAIL_FROM || '',
      },
    },
  ],
};
