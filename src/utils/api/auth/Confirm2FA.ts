export interface Confirm2FAProps {
  bool: boolean;
}

const confirm2FA = async ({ bool }: Confirm2FAProps) => {
  const body = JSON.stringify({ bool });

  const res = await fetch('/api/auth/confirm_2fa', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  });

  return res;
};

export default confirm2FA;
