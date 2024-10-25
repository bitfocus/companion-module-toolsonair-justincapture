const { InstanceStatus } = require('@companion-module/base')

module.exports = {
	initConnection() {
		let self = this

		self.updateStatus(InstanceStatus.Connecting)

		//set port
		if (self.config.port) {
			self.PORT = self.config.port
		}

		self.buildChannelChoices()

		self.updateStatus(InstanceStatus.Connecting)

		//get initial state
		self.getChannels()
	},

	stopPolling() {
		let self = this

		if (self.POLLING_INTERVAL) {
			if (self.config.verbose) {
				self.log('debug', 'Stopping Polling.')
			}

			clearInterval(self.POLLING_INTERVAL)
		}
	},

	startReconnect() {
		let self = this

		if (self.RECONNECT_INTERVAL) {
			//already trying to reconnect
			return
		}

		self.log('info', 'Attempting to reconnect in 30 seconds...')

		self.RECONNECT_INTERVAL = setTimeout(() => {
			self.initConnection()
			clearTimeout(self.RECONNECT_INTERVAL)
			self.RECONNECT_INTERVAL = undefined
		}, 30000)
	},

	buildChannelChoices() {
		let self = this

		//build choices for channel selection
		self.CHOICES_CHANNELS = []

		for (let i = 0; i < self.CHANNELS.length; i++) {
			self.CHOICES_CHANNELS.push({ id: self.CHANNELS[i], label: self.CHANNELS[i] })
		}
	},

	buildDataArrays() {
		let self = this

		//build data arrays
		self.DATA = {}
		for (let i = 0; i < self.CHANNELS.length; i++) {
			self.DATA[self.CHANNELS[i]] = {
				rec: {},
				filename: '',
				capture_presets: [],
				capture_preset: '',
				destination_presets: [],
				destination_preset: '',
			}
		}
	},

	getState() {
		let self = this

		self.getActiveChannels()
		self.getRecordingStates()
		self.getCurrentFilenames()
	},

	getChannels() {
		let self = this

		let url = `http://${self.config.host}:${self.PORT}/ingest/allChannels`

		if (self.config.verbose) {
			self.log('debug', `Getting Channel Names from: ${url}`)
		}

		fetch(url)
			.then((response) => response.json())
			.then((data) => {
				self.updateStatus(InstanceStatus.Ok)

				self.CHANNELS = data['channel-names']
				self.buildChannelChoices()
				self.buildDataArrays()

				self.initActions()
				self.initFeedbacks()
				self.initVariables()
				self.initPresets()

				//now that we know the channels, we can get state
				self.getState()

				self.getCapturePresets()
				self.getDestinationPresets()

				//start polling
				if (self.config.enablePolling) {
					self.log('info', `Polling Enabled. Polling Interval: ${self.config.pollingRate}ms`)
					self.POLLING_INTERVAL = setInterval(() => {
						self.getState()
					}, self.config.pollingRate)
				}
			})
			.catch((error) => {
				console.error('Error:', error)
				self.updateStatus(InstanceStatus.Error, 'Error Getting Channel Names.')
				self.log('error', 'Error Getting Channel Names.')
				self.stopPolling()
				self.startReconnect()
			})
	},

	getActiveChannels() {
		let self = this

		let url = `http://${self.config.host}:${self.PORT}/ingest/activeChannels`

		if (self.config.verbose) {
			self.log('debug', `Getting Active Channels`)
		}

		fetch(url)
			.then((response) => response.json())
			.then((data) => {
				self.ACTIVE_CHANNELS = data['channel-names']
				self.checkFeedbacks()
				self.checkVariables()
			})
			.catch((error) => {
				console.error('Error:', error)
				self.updateStatus(InstanceStatus.Error, 'Error Getting Active Channels')
				self.log('error', 'Error Getting Active Channels.')
				self.stopPolling()
				self.startReconnect()
			})
	},

	getRecordingStates() {
		let self = this

		let url = `http://${self.config.host}:${self.PORT}/ingest/requestRecordingStatus`

		for (let i = 0; i < self.CHANNELS.length; i++) {
			let body = {
				channel: self.CHANNELS[i],
			}

			if (self.config.verbose) {
				self.log('debug', `Getting Recording States for Channel: ${self.CHANNELS[i]}`)
			}

			fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			})
				.then((response) => response.json())
				.then((data) => {
					self.DATA[self.CHANNELS[i]].rec = data
					self.checkFeedbacks()
					self.checkVariables()
				})
				.catch((error) => {
					console.error('Error:', error)
					self.updateStatus(InstanceStatus.Error, 'Error Getting Channel Recording States')
					self.log('error', 'Error Getting Channel Recording States.')
					self.stopPolling()
					self.startReconnect()
				})
		}
	},

	getCurrentFilenames() {
		let self = this

		let url = `http://${self.config.host}:${self.PORT}/ingest/requestCurrentFilename`

		for (let i = 0; i < self.CHANNELS.length; i++) {
			let body = {
				channel: self.CHANNELS[i],
			}

			if (self.config.verbose) {
				self.log('debug', `Getting Current Filename for Channel: ${self.CHANNELS[i]}`)
			}

			fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			})
				.then((response) => response.json())
				.then((data) => {
					self.DATA[self.CHANNELS[i]].filename = data.value || ''
					self.checkFeedbacks()
					self.checkVariables()
				})
				.catch((error) => {
					console.error('Error:', error)
					self.updateStatus(InstanceStatus.Error, 'Error Getting Channel Filename')
					self.log('error', 'Error Getting Channel Filename.')
					self.stopPolling()
					self.startReconnect()
				})
		}
	},

	getCapturePresets() {
		let self = this

		let url = `http://${self.config.host}:${self.PORT}/ingest/requestCapturePresets`

		for (let i = 0; i < self.CHANNELS.length; i++) {
			let channel = self.CHANNELS[i]
			let body = {
				channel: channel,
			}

			if (self.config.verbose) {
				self.log('debug', `Getting Capture Presets for Channel: ${channel}`)
			}

			fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			})
				.then((response) => response.json())
				.then((data) => {
					let presets = data['preset']
					//console.log(presets)
					//stringify compare and if it's different, let's reload the actions
					if (JSON.stringify(self.DATA[channel].capture_presets) !== JSON.stringify(presets)) {
						self.DATA[channel].capture_presets = presets
						console.log(`capture_presets: Channel: ${channel}`, self.DATA[channel].capture_presets)
						self.initActions()
						self.initFeedbacks()

						self.checkFeedbacks()
						self.checkVariables()
					}
				})
				.catch((error) => {
					console.error('Error:', error)
					self.updateStatus(InstanceStatus.Error, 'Error Getting Channel Capture Presets')
					self.log('error', 'Error Getting Channel Capture Presets.')
					self.stopPolling()
					self.startReconnect()
				})
		}
	},

	getDestinationPresets() {
		let self = this

		let url = `http://${self.config.host}:${self.PORT}/ingest/requestDestinationPresets`

		for (let i = 0; i < self.CHANNELS.length; i++) {
			let channel = self.CHANNELS[i]
			let body = {
				channel: channel,
			}

			if (self.config.verbose) {
				self.log('debug', `Getting Destination Presets for Channel: ${channel}`)
			}

			fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			})
				.then((response) => response.json())
				.then((data) => {
					console.log(data)
					let presets = data['presets']
					//stringify compare and if it's different, let's reload the actions
					if (JSON.stringify(self.DATA[channel].destination_presets) !== JSON.stringify(presets)) {
						self.DATA[channel].destination_presets = presets
						console.log(`destination_presets: Channel: ${channel}`, self.DATA[channel].capture_presets)
						self.initActions()
						self.initFeedbacks()

						self.checkFeedbacks()
						self.checkVariables()
					}
				})
				.catch((error) => {
					console.error('Error:', error)
					self.updateStatus(InstanceStatus.Error, 'Error Getting Channel Destination Presets')
					self.log('error', 'Error Getting Channel Destination Presets.')
					self.stopPolling()
					self.startReconnect()
				})
		}
	},

	startAllChannels() {
		let self = this

		self.log('info', 'Starting All Channels.')

		for (let i = 0; i < self.CHANNELS.length; i++) {
			self.startChannel(self.CHANNELS[i])
		}
	},

	startChannel(channel) {
		let self = this

		let url = `http://${self.config.host}:${self.PORT}/ingest/startChannel`

		let body = {
			channel: channel,
		}

		if (self.config.verbose) {
			self.log('debug', `Starting Channel: ${channel}`)
		}

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((response) => response.json())
			.then((data) => {
				//don't really need to do anything
			})
			.catch((error) => {
				//console.error('Error:', error)
			})
	},

	stopAllChannels() {
		let self = this

		self.log('info', 'Stopping All Channels.')

		for (let i = 0; i < self.CHANNELS.length; i++) {
			self.stopChannel(self.CHANNELS[i])
		}
	},

	stopChannel(channel) {
		let self = this

		let url = `http://${self.config.host}:${self.PORT}/ingest/stopChannel`

		let body = {
			channel: channel,
		}

		if (self.config.verbose) {
			self.log('debug', `Stopping Channel: ${channel}`)
		}

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((response) => response.json())
			.then((data) => {
				//don't really need to do anything
			})
			.catch((error) => {
				//console.error('Error:', error)
			})
	},

	startRecordingAllChannels(filename) {
		let self = this

		self.log('info', 'Starting Recording on All Channels.')

		for (let i = 0; i < self.CHANNELS.length; i++) {
			self.startRecording(self.CHANNELS[i], filename)
		}
	},

	startRecording(channel, filename) {
		let self = this

		let url = `http://${self.config.host}:${self.PORT}/ingest/startRecordingWithFilename`

		let body = {
			channel: channel,
			'proposed-filename': '',
			metadata: {
				'toa-just-in-engine-alternative-start-timecode-frames': 0,
				'tal-ingest-engine-override-naming-preset': 0,
				'toa-just-in-engine-alternative-start-timecode-active': 0,
			},
		}

		if (filename !== undefined) {
			body['proposed-filename'] = filename
			body['metadata']['tal-ingest-engine-override-naming-preset'] = 1
		}

		if (self.config.verbose) {
			self.log('debug', `Starting Recording on Channel: ${channel}`)
			self.log('debug', `Filename: ${filename}`)
		}

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((response) => response.json())
			.then((data) => {
				//don't really need to do anything
			})
			.catch((error) => {
				//console.error('Error:', error)
			})
	},

	stopRecordingAllChannels() {
		let self = this

		self.log('info', 'Stopping Recording on All Channels.')

		for (let i = 0; i < self.CHANNELS.length; i++) {
			self.stopRecording(self.CHANNELS[i])
		}
	},

	stopRecording(channel) {
		let self = this

		let url = `http://${self.config.host}:${self.PORT}/ingest/stopRecording`

		let body = {
			channel: channel,
			metadata: {
				'toa-just-in-engine-alternative-stop-timecode-active': 0,
				'toa-just-in-engine-alternative-stop-timecode-frames': 0,
			},
		}

		if (self.config.verbose) {
			self.log('debug', `Stopping Recording on Channel: ${channel}`)
		}

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((response) => response.json())
			.then((data) => {
				//don't really need to do anything
			})
			.catch((error) => {
				//console.error('Error:', error)
			})
	},

	toggleRecordingAllChannels(filename) {
		let self = this

		self.log('info', 'Toggling Recording on All Channels.')

		for (let i = 0; i < self.CHANNELS.length; i++) {
			self.toggleRecording(self.CHANNELS[i], filename)
		}
	},

	toggleRecording(channel, filename) {
		let self = this

		//if the recording state is 'recording', stop recording, otherwise start recording

		//find the rec obj by channel name
		let recObj = self.DATA[channel].rec

		let recording = false

		if (recObj) {
			recording = recObj.rec
		}

		if (self.config.verbose) {
			self.log('debug', `Toggling Recording on Channel: ${channel}. Setting to ${recording ? 'Stop' : 'Start'}.`)
		}

		console.log('recording', recording)

		if (recording == true) {
			self.stopRecording(channel)
		} else {
			self.startRecording(channel, filename)
		}
	},

	splitMovieAllChannels() {
		let self = this

		self.log('info', 'Splitting Movie on All Channels.')

		for (let i = 0; i < self.CHANNELS.length; i++) {
			self.splitMovie(self.CHANNELS[i])
		}
	},

	splitMovie(channel) {
		let self = this

		let url = `http://${self.config.host}:${self.PORT}/ingest/splitMovie`

		let body = {
			channel: channel,
		}

		if (self.config.verbose) {
			self.log('debug', `Splitting Movie on Channel: ${channel}`)
		}

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((response) => response.json())
			.then((data) => {
				//don't really need to do anything
			})
			.catch((error) => {
				//console.error('Error:', error)
			})
	},

	loadCapturePreset(channel, presetId, presetName	) {
		let self = this

		let url = `http://${self.config.host}:${self.PORT}/ingest/requestLoadCapturePreset`

		let body = {
			channel: channel,
			'capture-preset-id': presetId,
			'capture-preset-name': presetName,
		}

		if (self.config.verbose) {
			self.log('debug', `Setting Capture Preset on Channel: ${channel} to: ${presetId} - ${presetName}`)
		}

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((response) => response.json())
			.then((data) => {
				//don't really need to do anything
			})
			.catch((error) => {
				//console.error('Error:', error)
			})
	},

	loadDestinationPreset(channel, presetId, presetName) {
		let self = this

		let url = `http://${self.config.host}:${self.PORT}/ingest/requestLoadDestinationPreset`

		let body = {
			channel: channel,
			'destination-preset-id': presetId,
			'destination-preset-name': presetName,
		}

		if (self.config.verbose) {
			self.log('debug', `Setting Destination Preset on Channel: ${channel} to: ${presetId} - ${presetName}`)
		}

		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((response) => response.json())
			.then((data) => {
				//don't really need to do anything
			})
			.catch((error) => {
				//console.error('Error:', error)
			})
	},
}
