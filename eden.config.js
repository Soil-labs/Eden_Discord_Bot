module.exports = {
	apps: [
		{
			name: 'eden-bot',
			autorestart: true,
			exec_mode: 'fork',
			watch: true,
			script: './dist/index.js',
			error_file: '~/.pm2/logs/eden-bot-error.log',
			out_file: '~/.pm2/logs/eden-bot-out.log',
			ignore_watch: ['node_modules', 'src']
		}
	]
};
