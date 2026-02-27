import axios from 'axios';
export async function googleSignIn(idToken) {
  const res = await axios.post('/api/google', { idToken });
  return res.data;
}