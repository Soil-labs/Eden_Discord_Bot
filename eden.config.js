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
				PM2_ENDPOINT: 'https://eden-deploy.herokuapp.com/graphql',
				PM2_FRONTEND: 'https://eden-app-front-end-zeta.vercel.app',
				PM2_MODE: 'prod',
				PM2_DMDISABLED: true,
				PM2_ALLOWCOMMANDS: ['champion', 'invite', 'onboard', 'signup']
			}
		}
	]
};
