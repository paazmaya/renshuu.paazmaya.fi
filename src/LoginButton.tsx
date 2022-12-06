import {
  useAuth0
} from '@auth0/auth0-react';

const LoginButton = () => {
  const {
    loginWithRedirect
  } = useAuth0();

  return <button onClick={() => loginWithRedirect()} className="btn btn-primary">Log In</button>;
};

export default LoginButton;
