import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import EditText from '@/components/forms/EditText';
import EditImage from '@/components/forms/EditImage';
import EditDate from '@/components/forms/EditDate';
import EditURL from '@/components/forms/EditURL';
import EditRichText from '@/components/forms/EditRichText';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import verifyAccess from '@/utils/api/auth/VerifyAccess';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/reducers';
import {
  User,
  MapPin,
  Briefcase,
  Image as ImageIcon,
  Calendar,
  PenTool,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Save,
  Navigation
} from 'lucide-react';
import { loadProfile, loadUser } from '@/redux/actions/auth/actions';
import { ThunkDispatch } from 'redux-thunk';
import { UnknownAction } from 'redux';
import { ToastError, ToastSuccess } from '@/components/toast/alerts';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { verified } = await verifyAccess(context);

  if (!verified) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default function ProfilePage() {
  const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const profile = useSelector((state: RootState) => state.auth.profile);

  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [profilePicture, setProfilePicture] = useState('');
  const [banner, setBanner] = useState('');

  const [biography, setBiography] = useState('');
  const [birthday, setBirthday] = useState('');
  const [location, setLocation] = useState('');
  const [work, setWork] = useState('');

  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [youtube, setYoutube] = useState('');
  const [github, setGithub] = useState('');
  const [tiktok, setTiktok] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
    if (profile) {
      setProfilePicture(profile.profile_picture?.url || '');
      setBanner(profile.banner?.url || '');
      setBiography(profile.biography || '');
      setBirthday(profile.birthday || '');
      setLocation(profile.location || '');
      setWork(profile.work || '');
      setFacebook(profile.facebook || '');
      setTwitter(profile.twitter || '');
      setInstagram(profile.instagram || '');
      setLinkedin(profile.linkedin || '');
      setYoutube(profile.youtube || '');
      setGithub(profile.github || '');
      setTiktok(profile.tiktok || '');
    }
  }, [user, profile]);

  const handleSave = async () => {
    try {
      setLoading(true);
      ToastSuccess('Perfil actualizado correctamente');
      await dispatch(loadUser());
      await dispatch(loadProfile());
    } catch (err) {
      ToastError('Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Información Personal">
      <div className="space-y-10">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-10 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl uppercase italic">Perfil de Usuario</h1>
              <p className="mt-3 text-lg text-slate-400 font-medium">Gestión de identidad institucional y presencia académica.</p>
            </div>
            <Button
              onClick={handleSave}
              disabled={loading}
              bgColor="bg-red-600 hover:bg-red-700"
              className="rounded-xl px-8 py-4 font-bold shadow-lg shadow-red-900/20 text-sm uppercase tracking-widest"
              hoverEffect
            >
              {loading ? <LoadingMoon /> : (
                <div className="flex items-center gap-3">
                  <Save size={20} />
                  <span>Guardar</span>
                </div>
              )}
            </Button>
          </div>
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-red-600/10 blur-3xl"></div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Basic Identity Card */}
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-4 border-b border-gray-50 pb-6 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-red-600 shadow-sm border border-gray-100">
                <User size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Identidad Básica</h2>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nombre de Usuario</label>
                <EditText data={username} setData={setUsername} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nombres</label>
                  <EditText data={firstName} setData={setFirstName} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Apellidos</label>
                  <EditText data={lastName} setData={setLastName} />
                </div>
              </div>
            </div>
          </div>

          {/* Multimedia Card */}
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-4 border-b border-gray-50 pb-6 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-red-600 shadow-sm border border-gray-100">
                <ImageIcon size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Galería</h2>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Foto de Perfil</label>
                <div className="flex justify-center p-6 rounded-2xl bg-gray-50/50 border border-gray-100 border-dashed">
                  <EditImage data={profilePicture} setData={setProfilePicture} shape="circle" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Banner Institucional</label>
                <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 border-dashed">
                  <EditImage data={banner} setData={setBanner} shape="rectangle" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Biography Card */}
        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-4 border-b border-gray-50 pb-6 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-red-600 shadow-sm border border-gray-100">
              <PenTool size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Biografía Institucional</h2>
          </div>
          <div className="rounded-2xl border border-gray-100">
            <EditRichText data={biography} setData={setBiography} title="" description="" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Additional Info Card */}
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-4 border-b border-gray-50 pb-6 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-red-600 shadow-sm border border-gray-100">
                <Briefcase size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Información de Cargo</h2>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                    <Calendar size={12} className="text-red-600" /> Nacimiento
                  </label>
                  <EditDate data={birthday} setData={setBirthday} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                    <MapPin size={12} className="text-red-600" /> Ciudad
                  </label>
                  <EditText data={location} setData={setLocation} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                  <Briefcase size={12} className="text-red-600" /> Cargo / Facultad
                </label>
                <EditText data={work} setData={setWork} />
              </div>
            </div>
          </div>

          {/* Digital Presence Card */}
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-4 border-b border-gray-50 pb-6 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-red-600 shadow-sm border border-gray-100">
                <Globe size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Redes Digitales</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                  <Facebook size={12} className="text-blue-600" /> Facebook
                </label>
                <EditURL data={facebook} setData={setFacebook} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                  <Twitter size={12} className="text-sky-500" /> Twitter (X)
                </label>
                <EditURL data={twitter} setData={setTwitter} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                  <Instagram size={12} className="text-pink-600" /> Instagram
                </label>
                <EditURL data={instagram} setData={setInstagram} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                  <Linkedin size={12} className="text-blue-700" /> LinkedIn
                </label>
                <EditURL data={linkedin} setData={setLinkedin} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                  <Youtube size={12} className="text-red-600" /> YouTube
                </label>
                <EditURL data={youtube} setData={setYoutube} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
                  <Navigation size={12} className="text-black" /> TikTok
                </label>
                <EditURL data={tiktok} setData={setTiktok} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

ProfilePage.getLayout = function getLayout(page: React.ReactElement) {
  return <>{page}</>;
};
