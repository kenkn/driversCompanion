from argparse import ArgumentParser
from flask import Flask, jsonify, Response, render_template, request, send_file
import os
import sys
from pprint import pprint
from get_other_info import get_around_spot

from boto3 import Session
from botocore.exceptions import BotoCoreError, ClientError


AUDIO_FORMATS = {"ogg_vorbis": "audio/ogg",
                 "mp3": "audio/mpeg",
                 "pcm": "audio/wave; codecs=1"}


session = Session(profile_name="iekei")
polly = session.client("polly")

app = Flask(__name__)


class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


# Register error handler
@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/read', methods=['GET'])
def read():
    try:
        outputFormat = request.args.get('outputFormat')
        # text = request.args.get('text')
        voiceId = request.args.get('voiceId')
        latitude = request.args.get('latitude')
        longitude = request.args.get('longitude')
        print(type(latitude), latitude)
    except TypeError:
        raise InvalidUsage("Wrong parameters", status_code=400)

    if len(voiceId) == 0 or outputFormat not in AUDIO_FORMATS:
        raise InvalidUsage("Wrong parameters", status_code=400)
    else:
        if latitude != 'undefined' and longitude != 'undefined':
            spot = get_around_spot(float(latitude), float(longitude))
            try:
                response = polly.synthesize_speech(Text=spot,
                                                   VoiceId=voiceId,
                                                   OutputFormat=outputFormat)
            except (BotoCoreError, ClientError) as err:
                raise InvalidUsage(str(err), status_code=500)

        return send_file(response.get("AudioStream"), AUDIO_FORMATS[outputFormat])


@app.route('/voices', methods=['GET'])
def voices():
    params = {}
    voices = []

    try:
        response = polly.describe_voices(**params)
    except (BotoCoreError, ClientError) as err:
        raise InvalidUsage(str(err), status_code=500)

    voices.extend(response.get("Voices", []))

    return jsonify(voices)


cli = ArgumentParser(description='Example Flask Application')
cli.add_argument(
    "-p", "--port", type=int, metavar="PORT", dest="port", default=8000)
cli.add_argument(
    "--host", type=str, metavar="HOST", dest="host", default="localhost")
arguments = cli.parse_args()


if __name__ == '__main__':
    app.secret_key = os.urandom(24)
    app.debug = True
    app.run(arguments.host, arguments.port)
