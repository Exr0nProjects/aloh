from aiohttp import web
import socketio

PORT = 62326

app = web.Application()
sio = socketio.AsyncServer()
sio.attach(app)

@sio.event
def connect(sid, environ):
    print(sid, 'connected')

@sio.event
def parse_NER(_, data):
    return [('Aloh', 'PRODUCT'), ('huxley marvit', 'PERSON'), ('jacob cole', 'PERSON')]

@sio.event
def disconnect(sid):
    print(sid, 'disconnected')

if __name__ == '__main__':
    web.run_app(app, port=PORT)
