module.exports = {
	apps: [
		{
			name: 'eden',
			autorestart: true,
			exec_mode: 'fork',
			watch: true,
			script: './dist/index.js',
			error_file: '~/.pm2/logs/eden-error.log',
			out_file: '~/.pm2/logs/eden-out.log',
			ignore_watch: ['node_modules', 'src'],
			env: {
				PM2_ENDPOINT: 'https://soil-api-backend-botproductionai2.up.railway.app/graphql',
				PM2_FRONTEND: 'https://edenprotocol.app',
				PM2_MODE: 'prod'
				// PM2_DMDISABLED: true,
				// PM2_ALLOWCOMMANDS: ['champion', 'invite', 'onboard', 'signup']
			}
		}
	]
};
