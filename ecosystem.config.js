const env = process.env

module.exports = {
  apps: [{
    name: 'differ',
    cwd: '/app',
    script: 'bin/www',
    instances: env.INSTANCES || 2,
    exec_mode: 'cluster',
    env: {
      DB: env.DB || 'postgres://postgres:secret123@db:5432/differ',
      NODE_ENV: env.NODE_ENV || 'production',
      PORT: env.PORT || 3000
    }
  }]
};
