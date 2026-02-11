import parseCookies from '@/utils/cookies/parseCookies';
import { GetServerSidePropsContext } from 'next';

export default async function verifyAccess(context: GetServerSidePropsContext) {
  const cookies = parseCookies(context.req.headers.cookie || '');
  const accessToken = cookies.sso_access_token;

  if (!accessToken) {
    return {
      verified: false,
    };
  }
  console.log(`${process.env.API_URL}/auth/jwt/verify/`)
  try {
    const apiRes = await fetch(`${process.env.API_URL}/auth/jwt/verify/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'hash-device': 'ID_UNICO_GENERADO_POR_LA_APP_TEST_D2',
        'hostname': 'NOMBRE_DEL_EQUIPO_TEST'
      },
      body: JSON.stringify({
        token: accessToken,
      }),
    });

    if (apiRes.status === 200) {
      return {
        verified: true,
        accessToken,
      };
    }

    return {
      verified: false,
    };
  } catch (err) {
    return {
      verified: false,
    };
  }
}
