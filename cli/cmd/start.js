'use strict'

let App = require('../../lib/app')

module.exports = {
	matches: (args, options) => {
		return args[0] == 'start'
	},

	exec: (args, options) => {
		let cwd = process.cwd();
		if (args.length >= 2 && args[1]) {
			cwd = args[1]
		}
		options['runtimes'] = options['runtimes'] || 'core'
		console.log('Starting ' + 'materia'.yellow + ' in ' + cwd.green)
		let app = new App(cwd, options)
		app.load().catch((e) => {
			console.error('Could not load app:', e && e.message)
		}).then(() => {
			return app.start()
		}).catch((err) => {
			if (err.stdout)
				console.error(err.stdout)
			if (err.stderr)
				console.error(err.stderr)
			console.error('Could not start server:', err && err.message)
		})
	}
}