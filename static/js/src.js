var AUDIO_FORMATS = {
    'ogg_vorbis': 'audio/ogg',
    'mp3': 'audio/mpeg',
    'pcm': 'audio/wave; codecs=1'
};
var latitude, longitude;

function fetchJSON(method, url, onSuccess, onError) {
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    request.onload = function() {
        // ロード成功
        if (request.readyState === 4) {
            // リクエスト成功
            if (request.status === 200) {
                var data;
                try {
                    data = JSON.parse(request.responseText);
                } catch (error) {
                    onError(request.status, error.toString());
                }
                onSuccess(data);
            } else {
                onError(request.status, request.responseText);
            }
        }
    };
    request.send();
}

function getSupportedAudioFormats(player) {
    return Object.keys(AUDIO_FORMATS)
        .filter(function(format) {
            var supported = player.canPlayType(AUDIO_FORMATS[format]);
            return supported === 'probably' || supported === 'maybe';
        });
}

function getUsersLocation() {
    navigator.geolocation.getCurrentPosition(function(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        return {
            latitude: latitude,
            longitude: longitude
        };
    });
}

document.addEventListener("DOMContentLoaded", function() {
    var voiceMenu = document.getElementById('voice'),
        player = document.getElementById('player'),
        button = document.getElementById('start_button'),
        radioValue = document.radiobuttons.rd,
        supportedFormats = getSupportedAudioFormats(player);

    if (supportedFormats.length === 0) {
        submit.disabled = true;
        alert('The web browser in use does not support any of the' +
            ' available audio formats. Please try with a different' +
            ' one.');
    }
    button.addEventListener('click', function(event) {
        button.style.visibility = "hidden";
        var setVoice = function() {
            var selectedVoice = (radioValue[0].checked ? 'Takumi' : 'Mizuki');
            navigator.geolocation.getCurrentPosition(function(position) {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            });
            // サーバに送信
            player.src = '/read?voiceId=' + selectedVoice +
                '&outputFormat=' + supportedFormats[0] +
                '&latitude=' + String(latitude) +
                '&longitude=' + String(longitude);
            console.log(player.src);
            player.play();
            event.preventDefault();
        };
        // n秒おきに送信
        setInterval(setVoice, 15000);

    });
    fetchJSON('GET', '/voices',
        function(voices) {
            var container = document.createDocumentFragment();
            // Pollyの全ボイスの取得
            // 日本語の男女のみインポート
            voices.forEach(function(voice) {
                var option = document.createElement('option');
                option.value = voice['Id'];
                option.innerHTML = voice['Name'] + ' (' +
                    voice['Gender'] + ', ' +
                    voice['LanguageName'] + ')';
                container.appendChild(option);
            });
            voiceMenu.appendChild(container);
            voiceMenu.disabled = false;
        },
        // リクエスト失敗時
        function(status, response) {
            alert(status + ' - ' + response);
        });
});