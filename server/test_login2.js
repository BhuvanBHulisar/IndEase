import axios from 'axios';
console.log('Sending request...');
try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'admin@originode.com',
        password: 'Demo@1234'
    });
    console.log('Login successful:', res.data.user.email);
} catch (err) {
    if (err.response) {
        console.error('Login failed with status:', err.response.status, 'Response:', err.response.data);
    } else {
        console.error('Login failed without response:', err.message);
    }
}
