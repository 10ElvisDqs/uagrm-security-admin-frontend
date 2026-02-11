export interface VerifyOTPProps {
  otp: string;
}

const verifyOTP = async ({ otp }: VerifyOTPProps) => {
  const body = JSON.stringify({ otp });

  const res = await fetch('/api/auth/verify_otp', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  });

  return res;
};

export default verifyOTP;
