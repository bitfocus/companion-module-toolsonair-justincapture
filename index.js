const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')
const UpgradeScripts = require('./src/upgrades')

const config = require('./src/config')
const actions = require('./src/actions')
const feedbacks = require('./src/feedbacks')
const variables = require('./src/variables')
const presets = require('./src/presets')

const utils = require('./src/utils')
const constants = require('./src/constants')

class justinCaptureInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...config,
			...actions,
			...feedbacks,
			...variables,
			...presets,
			...utils,
			...constants,
		})
	}

	async destroy() {
		//clear polling interval
		if (this.POLLING_INTERVAL) {
			clearInterval(this.POLLING_INTERVAL)
		}

		//clear reconnect interval
		if (this.RECONNECT_INTERVAL) {
			clearTimeout(this.RECONNECT_INTERVAL)
		}
	}

	async init(config) {
		this.configUpdated(config)
	}

	async configUpdated(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Connecting)

		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()

		this.checkVariables()
		this.checkFeedbacks()

		this.initConnection()
	}
}

runEntrypoint(justinCaptureInstance, UpgradeScripts)
