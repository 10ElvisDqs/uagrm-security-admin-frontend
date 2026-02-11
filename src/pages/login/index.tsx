import LoadingMoon from '@/components/loaders/LoadingMoon';
import { ToastError, ToastSuccess } from '@/components/toast/alerts';
import { loadProfile, loadUser, setLoginSuccess } from '@/redux/actions/auth/actions';
import login, { LoginProps } from '@/utils/api/auth/Login';
import verifyOTPLogin, { SendVerifyOTPLoginProps } from '@/utils/api/auth/VerifyOTPLogin';
import { ShieldCheck, HelpCircle, LifeBuoy, Globe, Facebook, Twitter, Instagram, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { UnknownAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { useDeviceHash } from '@/hooks/useDeviceHash';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [otp, setOTP] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [otpMessage, setOtpMessage] = useState<string>('');

  // Hook del Agente de Seguridad
  const { deviceData, isAgentActive } = useDeviceHash();

  const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();
  const router = useRouter();

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      ToastError('Por favor ingresa un correo válido');
      return;
    }
    const loginData: LoginProps = {
      email,
      password,
      'hash-device': deviceData?.hash,
      componentes: deviceData?.componentes
    };

    try {
      setLoading(true);
      const res = await login(loginData);

      // Fix for "Property 'json' does not exist" lint error
      if (!('json' in res)) {
        throw new Error("Error de conexión con el servidor");
      }

      const data = await res.json();

      if (res.status === 200) {
        if (data.results.otp_required) {
          setStep(2);
          setOtpMessage(data.results.message);
          ToastSuccess('Paso 1 completado. Ingresa tu código 2FA.');
        } else {
          await dispatch(loadProfile());
          await dispatch(loadUser());
          await dispatch(setLoginSuccess());
          ToastSuccess(data.results.message || 'Inicio de sesión exitoso');
          router.push('/dashboard');
        }
      } else {
        ToastError(data.error || 'Credenciales inválidas');
      }
    } catch (err: any) {
      ToastError(`Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sendVerifyOTPLoginData: SendVerifyOTPLoginProps = { email, otp };
    try {
      setLoading(true);
      const res = await verifyOTPLogin(sendVerifyOTPLoginData);
      if (res.status === 200) {
        await dispatch(loadProfile());
        await dispatch(loadUser());
        await dispatch(setLoginSuccess());
        ToastSuccess('Inicio de sesión exitoso');
        router.push('/dashboard');
      } else {
        setEmail('');
        setOTP('');
      }
    } catch (err) {
      ToastError(`${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0F172A] font-sans text-slate-300 selection:bg-red-500/30">
      <Head>
        <title>Portal SSO UAGRM - Login</title>
      </Head>

      {/* --- BACKGROUND ELEMENTS --- */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 100% 150%, #0F172A 24%, #1E293B 25%, #1E293B 28%, #0F172A 29%, #0F172A 36%, #1E293B 37%, #1E293B 40%, #0F172A 41%, #0F172A 48%, #1E293B 49%, #1E293B 52%, #0F172A 53%, #0F172A 60%, #1E293B 61%, #1E293B 64%, #0F172A 65%, #0F172A 72%, #1E293B 73%, #1E293B 76%, #0F172A 77%),
            radial-gradient(circle at 0% 150%, #0F172A 24%, #1E293B 25%, #1E293B 28%, #0F172A 29%, #0F172A 36%, #1E293B 37%, #1E293B 40%, #0F172A 41%, #0F172A 48%, #1E293B 49%, #1E293B 52%, #0F172A 53%, #0F172A 60%, #1E293B 61%, #1E293B 64%, #0F172A 65%, #0F172A 72%, #1E293B 73%, #1E293B 76%, #0F172A 77%)
          `,
          backgroundSize: '100px 50px',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0F172A] via-transparent to-[#1E3A8A] opacity-60"></div>

      {/* --- NAVBAR --- */}
      <nav className="relative z-50 flex w-full items-center justify-between border-b border-white/5 bg-[#0F172A]/80 px-6 py-4 backdrop-blur-md lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-red-700 to-red-900 text-white shadow-lg">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wider text-white">UAGRM</h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-red-500">Portal SSO</p>
          </div>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <a href="#" className="text-sm font-medium transition-colors hover:text-white flex items-center gap-2">
            <HelpCircle size={16} /> Ayuda
          </a>
          <a href="#" className="text-sm font-medium transition-colors hover:text-white flex items-center gap-2">
            <LifeBuoy size={16} /> Soporte
          </a>
          <div className="h-4 w-px bg-white/10"></div>
          <a href="#" className="text-sm font-medium text-blue-400 transition-colors hover:text-blue-300 flex items-center gap-2">
            <Globe size={16} /> ES
          </a>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-6">

        {/* Decorative Grid Lines */}
        <div className="pointer-events-none absolute inset-0 flex justify-center opacity-20">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent"></div>
        </div>

        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#1E293B]/70 p-1 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
          <div className="relative overflow-hidden rounded-xl bg-[#0F172A]/80 px-8 py-10">

            {/* Header Section */}
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">
                Bienvenido de Nuevo
              </h2>
              <p className="text-sm text-slate-400">
                {step === 1 ? 'Ingresa tus credenciales institucionales' : 'Verifica tu identidad para continuar'}
              </p>

              {/* Agent Status Indicator */}
              {isAgentActive && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-green-500/10 p-2 text-green-400 border border-green-500/20">
                  <ShieldCheck size={18} />
                  <span className="text-xs font-semibold">Agente de Seguridad Activo</span>
                </div>
              )}
            </div>

            {/* Form */}
            {step === 1 ? (
              <form onSubmit={handleOnSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Correo Institucional
                    </label>
                    <div className="group relative">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded bg-[#1E293B] px-4 py-3 text-white placeholder-slate-600 outline-none ring-1 ring-white/10 transition-all focus:ring-2 focus:ring-blue-500"
                        placeholder="u123456@uagrm.edu.bo"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded bg-[#1E293B] px-4 py-3 text-white placeholder-slate-600 outline-none ring-1 ring-white/10 transition-all focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded bg-gradient-to-r from-red-600 to-red-700 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-900/20 transition-all hover:from-red-500 hover:to-red-600 hover:shadow-red-700/40 disabled:opacity-50"
                >
                  {loading ? <LoadingMoon /> : 'Iniciar Sesión'}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-400">
                    <input type="checkbox" className="rounded border-white/10 bg-white/5" /> Recordarme
                  </label>
                  <Link href="/forgot-password" className="text-xs font-medium text-blue-400 hover:text-blue-300">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-6">
                <div className="space-y-2 text-center">
                  <label htmlFor="otp" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Código de Acceso
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value)}
                    className="w-full rounded bg-[#1E293B] px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-white placeholder-slate-700 outline-none ring-1 ring-white/10 transition-all focus:ring-2 focus:ring-blue-500"
                    placeholder="000000"
                    required
                  />
                  <p className="text-[10px] text-slate-500">{otpMessage || `Enviado a ${email}`}</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded bg-gradient-to-r from-red-600 to-red-700 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-900/20 transition-all hover:from-red-500 hover:to-red-600 hover:shadow-red-700/40 disabled:opacity-50"
                >
                  {loading ? <LoadingMoon /> : 'Verificar'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs text-slate-500 hover:text-white transition-colors"
                >
                  ← Volver a ingresar correo
                </button>
              </form>
            )}
          </div>

          {/* Decorative bottom bar */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-red-500 to-blue-500"></div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="relative z-50 border-t border-white/5 bg-[#0F172A]/80 py-6 text-center backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <p className="text-xs text-slate-500">
            © 2026 Universidad Autónoma Gabriel René Moreno.
          </p>
          <div className="flex gap-6 text-xs text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <div className="flex gap-4 border-l border-white/10 pl-6">
              <a href="#" className="hover:text-blue-400 transition-colors"><Facebook size={14} /></a>
              <a href="#" className="hover:text-sky-400 transition-colors"><Twitter size={14} /></a>
              <a href="#" className="hover:text-pink-400 transition-colors"><Instagram size={14} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

LoginPage.getLayout = function getLayout(page: React.ReactElement) {
  return <>{page}</>;
};
