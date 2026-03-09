import http from 'http';
http.get('http://localhost:5000/api/health', (res) => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => console.log('Response:', data));
}).on('error', (e) => console.error(e));
