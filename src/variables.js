module.exports = {
	initVariables: function () {
		let self = this
		let variables = []

		for (let i = 0; i < self.CHANNELS.length; i++) {
			variables.push({ variableId: `channel_${i + 1}_name`, name: `Channel ${i + 1} Name` })
			variables.push({ variableId: `channel_${i + 1}_active`, name: `Channel ${i + 1} Is Active` })
			variables.push({ variableId: `channel_${i + 1}_recording`, name: `Channel ${i + 1} Recording` })
			variables.push({ variableId: `channel_${i + 1}_filename`, name: `Channel ${i + 1} Current Filename` })
			variables.push({ variableId: `channel_${i + 1}_hours`, name: `Channel ${i + 1} Hours` })
			variables.push({ variableId: `channel_${i + 1}_minutes`, name: `Channel ${i + 1} Minutes` })
			variables.push({ variableId: `channel_${i + 1}_seconds`, name: `Channel ${i + 1} Seconds` })
			variables.push({ variableId: `channel_${i + 1}_frames`, name: `Channel ${i + 1} Frames` })

			//variables.push({ variableId: `channel_${i+1}_capture_preset`, name: `Channel ${i+1} Current Capture Preset` })
			//variables.push({ variableId: `channel_${i+1}_destination_preset`, name: `Channel ${i+1} Current Destination Preset` })
		}

		self.setVariableDefinitions(variables)
	},

	checkVariables: function () {
		let self = this

		let variableObj = {}

		try {
			//loop through self.DATA and build the variable object
			for (let i = 0; i < self.CHANNELS.length; i++) {
				variableObj[`channel_${i + 1}_name`] = self.CHANNELS[i]
				//look for a channel with this channel's name in self.ACTIVE_CHANNELS and if it is in there, mark it as active/true
				let active = self.ACTIVE_CHANNELS.includes(self.CHANNELS[i])
				variableObj[`channel_${i + 1}_active`] = active ? 'Active' : 'Inactive'

				//look for a channel with this channel's name in self.DATA and if it is in there, mark it as recording if true
				let recObj = self.DATA[self.CHANNELS[i]].rec

				if (recObj) {
					let recording = recObj.rec
					variableObj[`channel_${i + 1}_recording`] = recording ? 'Recording' : 'Not Recording'
					variableObj[`channel_${i + 1}_filename`] = self.DATA[self.CHANNELS[i]].filename || ''
					variableObj[`channel_${i + 1}_hours`] = recObj.hours
					variableObj[`channel_${i + 1}_minutes`] = recObj.minutes
					variableObj[`channel_${i + 1}_seconds`] = recObj.seconds
					variableObj[`channel_${i + 1}_frames`] = recObj.frames

					//variableObj[`channel_${i+1}_capture_preset`] = self.DATA[self.CHANNELS[i]].capture_preset || ''
					//variableObj[`channel_${i+1}_destination_preset`] = self.DATA[self.CHANNELS[i]].destination_preset || ''
				}
			}

			self.setVariableValues(variableObj)
		} catch (error) {
			self.log('error', 'Error Processing Variables: ' + String(error))
		}
	},
}
