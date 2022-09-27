module.exports = {
	apps: [
		{
			name: 'oasis-bot',
			autorestart: true,
			exec_mode: 'fork',
			watch: true,
			script: './dist/index.js',
			error_file: '~/.pm2/logs/oasis-bot-error.log',
			out_file: '~/.pm2/logs/oasis-bot-out.log',
			ignore_watch: ['node_modules', 'src']
		}
	]
};
