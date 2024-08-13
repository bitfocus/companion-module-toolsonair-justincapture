module.exports = {
	initActions: function () {
		let self = this
		let actions = {}

		/*
		actions.startChannel = {
			name: 'Start Channel',
			options: [
				{
					type: 'checkbox',
					label: 'All Channels',
					id: 'all',
					default: false,
				},
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS,
					isVisible: (options) => !options.all,
				},
			],
			callback: async function (action) {
				let opt = action.options

				if (opt.all == true) {
					self.startAllChannels()
				}
				else {
					let channel = opt.channel
					self.startChannel(channel)
				}
			},
		}

		actions.stopChannel = {
			name: 'Stop Channel',
			options: [
				{
					type: 'checkbox',
					label: 'All Channels',
					id: 'all',
					default: false,
				},
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS,
					isVisible: (options) => !options.all,
				},
			],
			callback: async function (action) {
				let opt = action.options

				if (opt.all == true) {
					self.stopAllChannels()
				}
				else {
					let channel = opt.channel
					self.stopChannel(channel)
				}
			},
		}
		*/

		actions.startRecording = {
			name: 'Start Recording',
			options: [
				{
					type: 'checkbox',
					label: 'All Channels',
					id: 'all',
					default: false,
				},
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS,
					isVisible: (options) => !options.all,
				},
				{
					type: 'checkbox',
					label: 'Specify Filename',
					id: 'specify',
					default: false,
				},
				{
					type: 'textinput',
					label: 'Filename',
					id: 'filename',
					default: '',
					useVariables: true,
					isVisible: (options) => options.specify == true,
				},
			],
			callback: async function (action) {
				let opt = action.options

				let filename = undefined

				if (opt.specify == true) {
					filename = await self.parseVariablesInString(opt.filename)
				}

				if (opt.all == true) {
					self.startRecordingAllChannels(filename)
				} else {
					let channel = opt.channel
					self.startRecording(channel, filename)
				}
			},
		}

		actions.stopRecording = {
			name: 'Stop Recording',
			options: [
				{
					type: 'checkbox',
					label: 'All Channels',
					id: 'all',
					default: false,
				},
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS,
					isVisible: (options) => !options.all,
				},
			],
			callback: async function (action) {
				let opt = action.options

				if (opt.all == true) {
					self.stopRecordingAllChannels()
				} else {
					let channel = opt.channel
					self.stopRecording(channel)
				}
			},
		}

		actions.toggleRecording = {
			name: 'Toggle Recording',
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS,
					isVisible: (options) => !options.all,
				},
				{
					type: 'checkbox',
					label: 'Specify Filename',
					id: 'specify',
					default: false,
				},
				{
					type: 'textinput',
					label: 'Filename',
					id: 'filename',
					default: '',
					useVariables: true,
					isVisible: (options) => options.specify == true,
				},
			],
			callback: async function (action) {
				let opt = action.options

				let filename = undefined

				if (opt.specify == true) {
					filename = await self.parseVariablesInString(opt.filename)
				}

				let channel = opt.channel
				self.toggleRecording(channel, filename)
			},
		}

		actions.splitMovie = {
			name: 'Split Movie',
			options: [
				{
					type: 'checkbox',
					label: 'All Channels',
					id: 'all',
					default: false,
				},
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS,
					isVisible: (options) => !options.all,
				},
			],
			callback: async function (action) {
				let opt = action.options

				if (opt.all == true) {
					self.splitMovieAllChannels()
				} else {
					let channel = opt.channel
					self.splitMovie(channel)
				}
			},
		}

		/*
		actions.setCapturePresets = {
			name: 'Set Capture Presets',
			options: [],
			callback: async function (action) {
				let opt = action.options
				
				for (let i = 0; i < self.CHANNELS.length; i++) {
					let channelName = self.CHANNELS[i]
					let capture_preset = opt['capture_preset_' + channelName]
					self.setCapturePreset(channelName, capture_preset)
				}
			},
		}

		//modify the setCapturePresets action to include a dropdown for each channel's individual capture presets
		for (let i = 0; i < self.CHANNELS.length; i++) {
			let channelName = self.CHANNELS[i]
			//create a companion dropdown friendly array for each channel's capture presets
			if (self.DATA[channelName].capture_presets == undefined) {
				self.DATA[channelName].capture_presets = []
			}
			
			let capturePresets = self.DATA[channelName].capture_presets.map((preset) => {
				return { id: preset, label: preset }
			})

			if (capturePresets.length == 0) {
				capturePresets = [{ id: 'None', label: 'None' }]
			}

			actions.setCapturePresets.options.push({
				type: 'dropdown',
				label: `Capture Preset for ${channelName}`,
				id: `capture_preset_${channelName}`,
				default: capturePresets[0].id,
				choices: capturePresets,
			})
		}

		actions.setDestinationPresets = {
			name: 'Set Destination Presets',
			options: [],
			callback: async function (action) {
				let opt = action.options
				
				for (let i = 0; i < self.CHANNELS.length; i++) {
					let channelName = self.CHANNELS[i]
					let destination_preset = opt['destination_preset_' + channelName]
					self.setDestinationPreset(channelName, destination_preset)
				}
			},
		}

		//modify the setDestinationPresets action to include a dropdown for each channel's individual destination presets
		for (let i = 0; i < self.CHANNELS.length; i++) {
			let channelName = self.CHANNELS[i]
			//create a companion dropdown friendly array for each channel's destination presets
			if (self.DATA[channelName].destination_presets == undefined) {
				self.DATA[channelName].destination_presets = []
			}

			let destinationPresets = self.DATA[channelName].destination_presets.map((preset) => {
				return { id: preset, label: preset }
			})

			if (destinationPresets.length == 0) {
				destinationPresets = [{ id: 'None', label: 'None' }]
			}

			actions.setDestinationPresets.options.push({
				type: 'dropdown',
				label: `Destination Preset for ${channelName}`,
				id: `destination_preset_${channelName}`,
				default: destinationPresets[0].id,
				choices: destinationPresets,
			})
		}
		*/

		self.setActionDefinitions(actions)
	},
}
