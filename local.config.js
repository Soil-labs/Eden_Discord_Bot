module.exports = {
	apps: [
		{
			name: 'eden_local',
			autorestart: true,
			exec_mode: 'fork',
			watch: true,
			script: './dist/index.js',
			error_file: '~/.pm2/logs/eden_local-error.log',
			out_file: '~/.pm2/logs/eden_local-out.log',
			ignore_watch: ['node_modules', 'src'],
			env: {
				PM2_ENDPOINT: 'https://soil-api-backend-botdevelopai2.up.railway.app/graphql',
				PM2_FRONTEND: 'https://eden-foundation-develop.vercel.app',
				PM2_MODE: 'dev'
			}
		}
	]
};
