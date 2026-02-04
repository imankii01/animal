module.exports = {
  apps: [
    {
      name: 'moo-music-tracker-api',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 5000,
      },
      // Error and output logs
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // Restart on crash
      autorestart: true,
      watch: false, // Set to true for development
      max_memory_restart: '500M',
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      // Environment file loading
      env_files: ['.env.dev', '.env.prod'],
    },
  ],
};
