import { GoogleLogin } from '@react-oauth/google';

export default function GoogleLoginButton({ onSuccess, onError }) {
  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={onError || (() => console.error('Google login failed'))}
      shape="pill"
      size="large"
      width="380"
    />
  );
}
