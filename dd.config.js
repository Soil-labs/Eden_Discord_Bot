module.exports = {
	apps: [
		{
			name: 'eden_dd',
			autorestart: true,
			exec_mode: 'fork',
			watch: true,
			script: './dist/index.js',
			error_file: '~/.pm2/logs/eden_dd-error.log',
			out_file: '~/.pm2/logs/eden_dd-out.log',
			ignore_watch: ['node_modules', 'src'],
			env: {
				PM2_ENDPOINT: 'https://soil-api-backend-botproductionai2.up.railway.app/graphql',
				PM2_FRONTEND: 'https://edenprotocol.app',
				PM2_MODE: 'dev',
				PM2_DMDISABLED: true,
				PM2_ALLOWCOMMANDS: ['champion', 'invite', 'onboard', 'signup']
			}
		}
	]
};
