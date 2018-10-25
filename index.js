var clapDetector = require('clap-detector');
var secret = require('./secret.js');
var axios = require('axios');

// Define configuration
var clapConfig = {
   AUDIO_SOURCE: 'alsa hw:1,0'// default for linux
};

var lastClap;
var wasAvailable = true;
var INTERVAL_TIME_SECONDS = 30;
var POLL_TIME_MS = 500;
 
var mattermostHookUrl = secret.mattermost;

function updateMattermostAvailable(available) {
		var state = available ? 'LEDIGT' : 'UPPTAGET';
		console.log(state);
		axios.post(mattermostHookUrl, {
			channel: 'pong-ping',
			username: 'pong-ping',
			text: state,
			icon_url: 'http://icons.iconarchive.com/icons/custom-icon-design/pretty-office-7/256/Sport-table-tennis-icon.png'
		});
}

function checkAvailability() {
	if (!lastClap) {
		return;
	}

	var isAvailable = (new Date().getTime() - lastClap.time) > INTERVAL_TIME_SECONDS * 1000;
	if (isAvailable != wasAvailable) {
		updateMattermostAvailable(isAvailable);
	}
	wasAvailable = isAvailable;
}

// Start clap detection
function startApplication() {
	updateMattermostAvailable(true);
	clapDetector.start(clapConfig);
	setInterval(checkAvailability, POLL_TIME_MS)
}	
 
// Register on clap event
clapDetector.onClap(function(history) {
	lastClap = history[history.length -1];
    console.log('pong');
});
 
 
// Update the configuration
clapDetector.updateConfig({
	DETECTION_PERCENTAGE_START : '5%', // minimum noise percentage threshold necessary to start recording sound
	DETECTION_PERCENTAGE_END: '5%',  // minimum noise percentage threshold necessary to stop recording sound
	CLAP_AMPLITUDE_THRESHOLD: 0.5, // minimum amplitude threshold to be considered as clap
	CLAP_ENERGY_THRESHOLD: 0.3,  // maximum energy threshold to be considered as clap
	MAX_HISTORY_LENGTH: 10, // all claps are stored in history, this is its max length
        CLAP_MAX_DURATION: 800
});

startApplication();
