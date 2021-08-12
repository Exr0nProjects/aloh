const io = require('socket.io-client');
const PORT = 62326;

console.log('instantiating socket...')
const socket = io(`http://localhost:${PORT}`);
console.log('socket instantiated!')

socket.on('connect', () => {
    console.log('socket connected!');
    console.log(socket.id);
    socket.emit('amazin', (...args) => {
        console.log('response recieved!');
        console.log(...args);
    });
});

socket.on('disconnect', () => {
    console.log('socket disconnected!');
});

