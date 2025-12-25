
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/products',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log('BODY:', JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('BODY (raw):', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
