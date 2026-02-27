import { GoogleLogin } from '@react-oauth/google';
import { googleSignIn } from './googleAuth';
export default function GoogleLoginButton({ onSuccess }) {
  return (
    <GoogleLogin
      onSuccess={async credentialResponse => {
        const idToken = credentialResponse.credential;
        if (!idToken) return;
        const data = await googleSignIn(idToken);
        if (onSuccess) onSuccess(data);
      }}
      onError={() => {}}
      useOneTap
    />
  );
}
