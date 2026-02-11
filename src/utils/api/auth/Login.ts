export interface LoginProps {
  email: string;
  password: string;
  'hash-device'?: string;
  componentes?: any;
}

const login = async ({ email, password, 'hash-device': hashDevice, componentes }: LoginProps) => {
  const body = JSON.stringify({ 
    email, 
    password, 
    'hash-device': hashDevice,
    componentes 
  });

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    });

    return res;
  } catch (err) {
    return {
      status: 500,
    };
  }
};

export default login;
