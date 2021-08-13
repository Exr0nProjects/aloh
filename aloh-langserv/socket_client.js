const io = require('socket.io-client');
const PORT = 62326;

//console.log('instantiating socket...')
const socket = io(`http://localhost:${PORT}`);
//console.log('socket instantiated!')

socket.on('connect', () => {
    //console.log('socket connected!');
    console.log(socket.id);
    let data = process.argv.slice(2).join(' ');
    console.log('requesting', data)
    //socket.emit('parse_chunks', data, (amazing) => {
    socket.emit('parse_NER', data, (amazing) => {
        //console.log('response recieved!');
        console.log(amazing);
        //socket.disconnect();
    });
});

socket.on('disconnect', () => {
    console.log('socket disconnected!');
});

