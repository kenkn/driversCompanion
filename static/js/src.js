/*
 * This sample code requires a web browser with support for both the
 * HTML5 and ECMAScript 5 standards; the following is a non-comprehensive
 * list of compliant browsers and their minimum version:
 *
 * - Chrome 23.0+
 * - Firefox 21.0+
 * - Internet Explorer 9.0+
 * - Edge 12.0+
 * - Opera 15.0+
 * - Safari 6.1+
 * - Android (stock web browser) 4.4+
 * - Chrome for Android 51.0+
 * - Firefox for Android 48.0+
 * - Opera Mobile 37.0+
 * - iOS (Safari Mobile and Chrome) 3.2+
 * - Internet Explorer Mobile 10.0+
 * - Blackberry Browser 10.0+
 */
// Mapping of the OutputFormat parameter of the SynthesizeSpeech API
// and the audio format strings understood by the browser
var AUDIO_FORMATS = {
    'ogg_vorbis': 'audio/ogg',
    'mp3': 'audio/mpeg',
    'pcm': 'audio/wave; codecs=1'
};
/**
 * Handles fetching JSON over HTTP
 */

var latitude, longitude;

function fetchJSON(method, url, onSuccess, onError) {
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    request.onload = function() {
        // If loading is complete
        if (request.readyState === 4) {
            // if the request was successful
            if (request.status === 200) {
                var data;
                // Parse the JSON in the response
                try {
                    data = JSON.parse(request.responseText);
                } catch (error) {
                    onError(request.status, error.toString());
                }
                onSuccess(data);
            } else {
                onError(request.status, request.responseText)
            }
        }
    };
    request.send();
}
/**
 * Returns a list of audio formats supported by the browser
 */
function getSupportedAudioFormats(player) {
    return Object.keys(AUDIO_FORMATS)
        .filter(function(format) {
            var supported = player.canPlayType(AUDIO_FORMATS[format]);
            return supported === 'probably' || supported === 'maybe';
        });
}
// Initialize the application when the DOM is loaded and ready to be
// manipulated
document.addEventListener("DOMContentLoaded", function() {
    var input = document.getElementById('input'),
        voiceMenu = document.getElementById('voice'),
        text = document.getElementById('text'),
        player = document.getElementById('player'),
        submit = document.getElementById('submit'),
        supportedFormats = getSupportedAudioFormats(player);
    // Display a message and don't allow submitting the form if the
    // browser doesn't support any of the available audio formats
    if (supportedFormats.length === 0) {
        submit.disabled = true;
        alert('The web browser in use does not support any of the' +
            ' available audio formats. Please try with a different' +
            ' one.');
    }
    // Play the audio stream when the form is submitted successfully
    input.addEventListener('submit', function(event) {
        // Validate the fields in the form, display a message if
        // unexpected values are encountered
        // ここでリンクを生成する
        if (voiceMenu.selectedIndex <= 0 || text.value.length === 0) {
            alert('Please fill in all the fields.');
        } else {
            var selectedVoice = voiceMenu
                .options[voiceMenu.selectedIndex]
                .value;
            // ユーザの現在位置取得
            navigator.geolocation.getCurrentPosition(function(position) {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            });
            console.log("inklyu");
            console(latitude);

            // Point the player to the streaming server
            player.src = '/read?voiceId=' +
                encodeURIComponent(selectedVoice) +
                '&text=' + encodeURIComponent(text.value) +
                '&outputFormat=' + supportedFormats[0] +
                '&latitude=' + 'sa' +
                '&longitude=' + String(longitude);
            player.play();
        }
        // Stop the form from submitting,
        // Submitting the form is allowed only if the browser doesn't
        // support Javascript to ensure functionality in such a case
        event.preventDefault();
    });
    // Load the list of available voices and display them in a menu
    fetchJSON('GET', '/voices',
        // If the request succeeds
        function(voices) {
            var container = document.createDocumentFragment();
            // Build the list of options for the menu
            voices.forEach(function(voice) {
                var option = document.createElement('option');
                option.value = voice['Id'];
                option.innerHTML = voice['Name'] + ' (' +
                    voice['Gender'] + ', ' +
                    voice['LanguageName'] + ')';
                container.appendChild(option);
            });
            // Add the options to the menu and enable the form field
            voiceMenu.appendChild(container);
            voiceMenu.disabled = false;
        },
        // If the request fails
        function(status, response) {
            // Display a message in case loading data from the server
            // fails
            alert(status + ' - ' + response);
        });
});