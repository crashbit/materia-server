'use strict';

var fs = require('fs')
var path = require('path')

var async = require('async')

module.exports = class Addons {
	constructor(app) {
		this.app = app
		this.addons = []
		this.rootDirectory = path.join(this.app.path, 'addons')
		this.addonsConfig = {}
	}

	_requireAndCreateAddons(files, callback) {
		let addonsWithDeps = {}
		for (let addon of files) {
			if (fs.existsSync(path.join(this.rootDirectory, addon, 'index.coffee')) ||
				fs.existsSync(path.join(this.rootDirectory, addon, 'index.js')) ||
				fs.existsSync(path.join(this.rootDirectory, addon + '.js')) ||
				fs.existsSync(path.join(this.rootDirectory, addon + '.coffee'))) {
				(() => {
					let addonClass, addonInstance
					try {
						addonClass = require(path.join(this.rootDirectory, addon))
					} catch (e) {
						return console.error('Impossible to require addon ' + addon, e.stack)
					}
					try {
						addonInstance = new addonClass(this.app, this.addonsConfig[addon])
					} catch(e) {
						return console.error('Impossible to create addon ' + addon, e.stack)
					}

					let pushAddon = (callback) => callback(this.addons.push(addonInstance))
					if (addonClass.dependencies) {
						addonsWithDeps = []
						for (var dep of addonClass.dependencies) {
							addonsWithDeps[addon].push(dep)
						}
						addonsWithDeps[addon].push(pushAddon)
					} else {
						addonsWithDeps[addon] = pushAddon
					}
				})()
			}
		}

		async.auto(addonsWithDeps, callback)
	}

	load() {
		this.addons = []

		return new Promise((accept, reject) => {
			let files
			try {
				files = fs.readdirSync(path.join(this.app.path, 'addons'))
			} catch (e) {
				if (e.code == 'ENOENT')
					return accept()
				return reject(e)
			}

			if (fs.existsSync(path.join(this.app.path, 'addons.json'))) {
				let content = fs.readFileSync(path.join(this.app.path, 'addons.json'))
				this.addonsConfig = JSON.parse(content.toString())
			}

			this._requireAndCreateAddons(files, () => {
				let p = Promise.resolve()
				for (let addon of this.addons) {
					((addon) => {
						p = p.then(() => {
							if (typeof addon.load == 'function') {
								let obj = addon.load()
								if (obj && obj.then && obj.catch
									&& typeof obj.then === 'function'
									&& typeof obj.catch === 'function') { // promise-like simple test
									return obj
								}
							}
							return Promise.resolve()
						})
					})(addon)
				}

				p.then(() => {
					accept()
				}).catch((err) => {
					reject(err)
				})
			})
		})
	}

	getLength() {
		return this.addons.length
	}
}