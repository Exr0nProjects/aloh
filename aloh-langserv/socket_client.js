const io = require('socket.io-client');
const PORT = 62326;

console.log('instantiating socket...')
const socket = io(`http://localhost:${PORT}`);
console.log('socket instantiated!')

socket.on('connect', () => {
    console.log('socket connected!');
    console.log(socket.id);
    let data = 'meet Aloh: an app inspired by jacob cole and huxley marvit'
    socket.emit('parse_NER', data, (amazing) => {
        console.log('response recieved!');
        console.log(amazing);
    });
});

socket.on('disconnect', () => {
    console.log('socket disconnected!');
});

