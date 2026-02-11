const generateQRCode = async () => {
  const res = await fetch('/api/auth/generate_qr_code', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  return res;
};

export default generateQRCode;
