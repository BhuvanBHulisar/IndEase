import axios from 'axios';

async function testLogin() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@originode.com',
            password: 'Demo@1234'
        });
        console.log('Login successful:', res.data.user.email);
    } catch (err) {
        console.error('Login failed:', err.response?.data || err.message);
    }
}

testLogin();
