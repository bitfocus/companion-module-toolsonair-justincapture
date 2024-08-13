const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks: function () {
		let self = this
		let feedbacks = {}

		const colorWhite = combineRgb(255, 255, 255) // White
		const colorRed = combineRgb(255, 0, 0) // Red

		/* feedbacks.channelActive = {
			type: 'boolean',
			name: 'Channel Active State',
			description: 'If the channel is active, change the color of the button',
			defaultStyle: {
				color: colorWhite,
				bgcolor: colorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS,
				},
			],
			callback: async function (feedback) {
				let opt = feedback.options

				let channel = opt.channel

				//get the channel name which is the label
				let channelName = self.CHOICES_CHANNELS.find((c) => c.id === channel).label

				//look for a channel with this channel's name in self.ACTIVE_CHANNELS and if it is in there, mark it as active/true
				let active = self.ACTIVE_CHANNELS.includes(channelName)

				if (active) {
					return true
				}

				return false
			},
		} */

		feedbacks.recState = {
			type: 'boolean',
			name: 'Channel Recording State',
			description: 'If the channel is recording, change the color of the button',
			defaultStyle: {
				color: colorWhite,
				bgcolor: colorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Channel',
					id: 'channel',
					default: self.CHOICES_CHANNELS[0].id,
					choices: self.CHOICES_CHANNELS,
				},
			],
			callback: async function (feedback) {
				let opt = feedback.options

				let channel = opt.channel

				//look for a channel with this channel's name in self.DATA and if it is in there, get its recording state
				let recObj = self.DATA[channel]?.rec

				if (recObj) {
					let recording = recObj.rec

					if (recording == true) {
						return true
					}
				}

				return false
			},
		}

		self.setFeedbackDefinitions(feedbacks)
	},
}
