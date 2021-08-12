# server to run spacy pipeline

from aiohttp import web
import socketio

import spacy
from wordfreq import word_frequency

from math import log
from sys import argv
_, PORT, SPACY_MODEL = argv

# set up socket stuff
app = web.Application()
sio = socketio.AsyncServer()
sio.attach(app)

# set up spacy
print('loading spacy...', end='\r')
# spaghetti ahead
# try:
#     nlp = spacy.load(SPACY_MODEL, disable=["tagger", "parser", "attribute_ruler", "lemmatizer"])
# except OSError:
#     from subprocess import run
#     run(['python3', '-m', 'spacy', 'download', SPACY_MODEL])
#     nlp = spacy.load(SPACY_MODEL, disable=["tagger", "parser", "attribute_ruler", "lemmatizer"])
nlp = spacy.load(SPACY_MODEL)
print('spacy loaded successfully')

# pipeline components
def span_is_interesting(span):
    POS_ALLOWLIST = ['ADJ', 'NOUN', 'PROPN']
    POS_IGNORELIST = ['DET', 'PUNCT']
    words = []
    for tok in span:
        if tok.pos_ in POS_IGNORELIST:
            continue
        if tok.pos_ not in POS_ALLOWLIST:
            # return False
            return 1
        words.append(tok.text)
    # freqs = [word_frequency(w, 'en') for w in words]

    return word_frequency(' '.join(words), 'en')

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

@sio.event
def parse_chunks(_, data):
    # arr = [(span.text, [tok.pos_ for tok in span]) for span in nlp(data).noun_chunks]
    arr = [f'<li data-freq="{log(span_is_interesting(span))}">{span.text}</li>' for span in nlp(data).noun_chunks]
    print(''.join(arr))  # search for patterns of ADJ* NOUN* which are rare?
    # or PROPN* NOUN*
    # remove leading DET and intermitent PUNCT?
    # return arr

if __name__ == '__main__':
    web.run_app(app, port=int(PORT))
