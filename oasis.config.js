module.exports = {
	apps: [
		{
			name: 'oasis',
			autorestart: true,
			exec_mode: 'fork',
			watch: true,
			script: './dist/index.js',
			error_file: '~/.pm2/logs/oasis-error.log',
			out_file: '~/.pm2/logs/oasis-out.log',
			ignore_watch: ['node_modules', 'src'],
			env: {
				PM2_ENDPOINT: 'https://oasis-botdevelopment.up.railway.app/graphql',
				PM2_FRONTEND: 'https://eden-develop.vercel.app',
				PM2_MODE: 'prod'
				// Undefined DMDISABLED means false
				// PM2_DMDISABLED: false,
				// Undefined PM2_ALLOWCOMMANDS means no comman limitation
				// PM2_ALLOWCOMMANDS: [],
			},
			env_dev: {
				PM2_ENDPOINT: 'https://oasis-botdevelopment.up.railway.app/graphql',
				PM2_FRONTEND: 'https://eden-develop.vercel.app',
				PM2_MODE: 'dev'
			}
		}
	]
};
