module.exports = {
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module will allow you to control the ToolsOnAir just:in Capture Solutions. For additional information, visit https://www.toolsonair.com/',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Capture Server IP Address',
				default: '127.0.0.1',
				width: 4,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'API Port',
				default: '8080',
				width: 4,
			},
			{
				type: 'static-text',
				id: 'hr1',
				width: 12,
				label: ' ',
				value: '<hr />',
			},
			{
				type: 'checkbox',
				id: 'enablePolling',
				label: 'Enable Polling',
				default: true,
				width: 3,
			},
			{
				type: 'static-text',
				id: 'info1',
				width: 9,
				label: ' ',
				value: `Polling is used to keep the Companion UI in sync with the server. Disabling polling will prevent the module from updating.`,
			},
			{
				type: 'number',
				id: 'pollingRate',
				label: 'Polling Rate/Interval (ms)',
				default: 1000,
				width: 4,
				tooltip:
					'The interval at which the module will poll the server for updates, defined in milliseconds. Default is 1000ms.',
				isVisible: (configValues) => configValues.enablePolling === true,
			},
			{
				type: 'static-text',
				id: 'hr2',
				width: 12,
				label: ' ',
				value: '<hr />',
			},
			{
				type: 'checkbox',
				id: 'verbose',
				label: 'Enable Verbose Logging',
				default: false,
				width: 3,
			},
			{
				type: 'static-text',
				id: 'info3',
				width: 9,
				label: ' ',
				value: `Enabling Verbose Logging will push all incoming and outgoing data to the log, which is helpful for debugging.`,
				isVisible: (configValues) => configValues.verbose === true,
			},
		]
	},
}
