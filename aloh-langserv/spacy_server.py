# server to run spacy pipeline

from aiohttp import web
import socketio

import spacy

from sys import argv
_, PORT, SPACY_MODEL = argv

# set up socket stuff
app = web.Application()
sio = socketio.AsyncServer()
sio.attach(app)

# set up spacy
print('loading spacy...', end='\r')
try:
    nlp = spacy.load(SPACY_MODEL, disable=["tagger", "parser", "attribute_ruler", "lemmatizer"])
except OSError:
    from subprocess import run
    run(['python3', '-m', 'spacy', 'download', SPACY_MODEL])
    nlp = spacy.load(SPACY_MODEL, disable=["tagger", "parser", "attribute_ruler", "lemmatizer"])
print('spacy loaded successfully')

# event handlers for connect/disconnect, we don't need them atm
# @sio.event
# def connect(sid, environ):
#     print(sid, 'connected')
# @sio.event
# def disconnect(sid):
#     print(sid, 'disconnected')

# event handler to run NER
@sio.event
def parse_NER(_, data):
    return [(ent.text, ent.label_) for ent in nlp(data).ents]     # TODO: should this server deal with deduplication?

if __name__ == '__main__':
    web.run_app(app, port=int(PORT))
