import validator from 'validator';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/reducers';
import { useEffect, useState } from 'react';
import EditText from '@/components/forms/EditText';
import { ToastError, ToastSuccess, ToastWarning } from '@/components/toast/alerts';
import { ThunkDispatch } from 'redux-thunk';
import { UnknownAction } from 'redux';
import { loadProfile, loadUser } from '@/redux/actions/auth/actions';
import Button from '@/components/Button';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import EditDate from '@/components/forms/EditDate';
import EditURL from '@/components/forms/EditURL';
import EditRichText from '@/components/forms/EditRichText';
import EditImage from '@/components/forms/EditImage';
import useProfilePicture from '@/hooks/useProfilePicture';
import { fetchS3SignedURL } from '@/utils/api/s3/FetchPresignedUrl';
import uploadProfilePicture from '@/utils/api/profile/UploadProfilePicture';
import useBannerPicture from '@/hooks/useBannerPicture';
import uploadBannerPicture from '@/utils/api/profile/UploadBannerPicture';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import verifyAccess from '@/utils/api/auth/VerifyAccess';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  User, ImageIcon, PenTool, Globe, Facebook, Twitter,
  Instagram, Linkedin, Youtube, Save, Navigation,
  Briefcase, MapPin, Calendar,
} from 'lucide-react';

// ── Componentes auxiliares FUERA del componente principal ──────────────────
// Definirlos aquí evita que React los recree en cada render,
// lo que causaría que los inputs pierdan el foco al escribir.

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-gray-50 pb-6 mb-8">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-red-600 shadow-sm border border-gray-100">
        {icon}
      </div>
      <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{title}</h2>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-2">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

// ── getServerSideProps ─────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { verified } = await verifyAccess(context);
  if (!verified) return { redirect: { destination: '/', permanent: false } };
  return { props: {} };
};

// ── Componente principal ───────────────────────────────────────────────────

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const profile = useSelector((state: RootState) => state.auth.profile);
  const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasChangesProfile, setHasChangesProfile] = useState(false);
  const [hasChangesProfilePicture, setHasChangesProfilePicture] = useState(false);
  const [hasChangesBannerPicture, setHasChangesBannerPicture] = useState(false);

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [biography, setBiography] = useState('');
  const [birthday, setBirthDay] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [threads, setThreads] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [youtube, setYouTube] = useState('');
  const [tiktok, setTikTok] = useState('');
  const [github, setGitHub] = useState('');
  const [gitlab, setGitLab] = useState('');

  const {
    profilePicture, setProfilePicture,
    percentage: profilePicturePercentage,
    setPercentage: setProfilePicturePercentage,
  } = useProfilePicture();

  const {
    bannerPicture, setBannerPicture,
    percentage: bannerPicturePercentage,
    setPercentage: setBannerPicturePercentage,
  } = useBannerPicture();

  const onLoadProfilePicture = (newImage: any) => {
    if (newImage !== profilePicture) { setProfilePicture(newImage); setHasChangesProfilePicture(true); }
  };
  const onLoadBannerPicture = (newImage: any) => {
    if (newImage !== bannerPicture) { setBannerPicture(newImage); setHasChangesBannerPicture(true); }
  };

  useEffect(() => {
    if (user) { setUsername(user.username); setFirstName(user.first_name); setLastName(user.last_name); }
    if (profile) {
      setBiography(profile.biography); setBirthDay(profile.birthday); setWebsite(profile.website);
      setInstagram(profile.instagram); setFacebook(profile.facebook); setThreads(profile.threads);
      setLinkedin(profile.linkedin); setYouTube(profile.youtube); setTikTok(profile.tiktok);
      setGitHub(profile.github); setGitLab(profile.gitlab);
    }
  }, [user, profile]);

  const isValidDate = (d: string) => !Number.isNaN(new Date(d).getTime());
  const isValidUrl = (u: string) => validator.isURL(u, { require_protocol: false });
  const isEmpty = (s: string) => s.replace(/<[^>]*>/g, '').trim() === '';

  useEffect(() => {
    setHasChanges(
      username !== user?.username ||
      firstName !== user?.first_name ||
      lastName !== user?.last_name,
    );
    setHasChangesProfile(
      (biography !== profile?.biography && !isEmpty(biography)) ||
      (birthday !== profile?.birthday && isValidDate(birthday)) ||
      (website !== profile?.website && isValidUrl(website)) ||
      (instagram !== profile?.instagram && isValidUrl(instagram)) ||
      (facebook !== profile?.facebook && isValidUrl(facebook)) ||
      (threads !== profile?.threads && isValidUrl(threads)) ||
      (linkedin !== profile?.linkedin && isValidUrl(linkedin)) ||
      (youtube !== profile?.youtube && isValidUrl(youtube)) ||
      (tiktok !== profile?.tiktok && isValidUrl(tiktok)) ||
      (github !== profile?.github && isValidUrl(github)) ||
      (gitlab !== profile?.gitlab && isValidUrl(gitlab)),
    );
  }, [username, firstName, lastName, user, biography, birthday, website,
      instagram, facebook, threads, linkedin, youtube, tiktok, github, gitlab, profile]);

  const handleSaveUserData = async () => {
    const data: Record<string, string> = {};
    if (username !== user?.username) data.username = username;
    if (firstName !== user?.first_name) data.first_name = firstName;
    if (lastName !== user?.last_name) data.last_name = lastName;
    if (!Object.keys(data).length) return;
    const res = await fetch('/api/user/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) await dispatch(loadUser()); else throw new Error();
  };

  const handleSaveProfileData = async () => {
    const data: Record<string, string> = {};
    if (biography !== profile?.biography) data.biography = biography;
    if (birthday !== profile?.birthday) data.birthday = birthday;
    if (website !== profile?.website) data.website = website;
    if (instagram !== profile?.instagram) data.instagram = instagram;
    if (facebook !== profile?.facebook) data.facebook = facebook;
    if (threads !== profile?.threads) data.threads = threads;
    if (linkedin !== profile?.linkedin) data.linkedin = linkedin;
    if (youtube !== profile?.youtube) data.youtube = youtube;
    if (tiktok !== profile?.tiktok) data.tiktok = tiktok;
    if (github !== profile?.github) data.github = github;
    if (gitlab !== profile?.gitlab) data.gitlab = gitlab;
    if (!Object.keys(data).length) return;
    const res = await fetch('/api/profile/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) await dispatch(loadProfile()); else throw new Error();
  };

  const handleSaveProfilePicture = async () => {
    if (!profilePicture.file) return;
    const { file } = profilePicture;
    const { name: title, size, type } = file;
    const fileKey = `media/users/pictures/${user?.username}/${title.replace(/\s/g, '_')}`;
    const presignedUrl = await fetchS3SignedURL({ bucket: `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}`, key: fileKey });
    const up = await axios.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (e) => { if (e.total) setProfilePicturePercentage(Math.floor((e.loaded / e.total) * 100)); },
    });
    if (up.status === 200) {
      const br = await uploadProfilePicture({ key: fileKey, title, size, type });
      if (br.status === 200) { setProfilePicturePercentage(0); setHasChangesProfilePicture(false); }
    }
  };

  const handleSaveBannerPicture = async () => {
    if (!bannerPicture.file) return;
    const { file } = bannerPicture;
    const { name: title, size, type } = file;
    const fileKey = `media/users/banners/${user?.username}/${title.replace(/\s/g, '_')}`;
    const presignedUrl = await fetchS3SignedURL({ bucket: `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}`, key: fileKey });
    const up = await axios.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (e) => { if (e.total) setBannerPicturePercentage(Math.floor((e.loaded / e.total) * 100)); },
    });
    if (up.status === 200) {
      const br = await uploadBannerPicture({ key: fileKey, title, size, type });
      if (br.status === 200) { setBannerPicturePercentage(0); setHasChangesBannerPicture(false); }
    }
  };

  const hasAnyChange = hasChanges || hasChangesProfile || hasChangesProfilePicture || hasChangesBannerPicture;

  const handleSaveData = async () => {
    if (!hasAnyChange) { ToastWarning('Sin cambios para guardar.'); return; }
    try {
      setLoading(true);
      if (hasChanges) await handleSaveUserData();
      if (hasChangesProfile) await handleSaveProfileData();
      if (hasChangesProfilePicture) await handleSaveProfilePicture();
      if (hasChangesBannerPicture) await handleSaveBannerPicture();
      ToastSuccess('¡Perfil actualizado exitosamente!');
    } catch {
      ToastError('Ocurrió un error al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Información Personal">
      <div className="space-y-10">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-10 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl uppercase italic">
                Perfil de Usuario
              </h1>
              <p className="mt-3 text-lg text-slate-400 font-medium">
                Gestiona tu identidad y presencia pública.
              </p>
            </div>
            <Button
              onClick={handleSaveData}
              disabled={loading || !hasAnyChange}
              className="rounded-xl px-8 py-4 font-bold shadow-lg text-sm uppercase tracking-widest"
              hoverEffect
            >
              {loading ? <LoadingMoon /> : (
                <div className="flex items-center gap-3">
                  <Save size={20} /><span>Guardar cambios</span>
                </div>
              )}
            </Button>
          </div>
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-red-600/10 blur-3xl" />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

          {/* ── Identidad Básica ─────────────────────────────────────────── */}
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <SectionHeader icon={<User size={20} />} title="Identidad Básica" />
            <div className="grid grid-cols-1 gap-8">
              <Field label="Nombre de Usuario">
                <EditText data={username} setData={setUsername} />
              </Field>
              <Field label="Nombres">
                <EditText data={firstName} setData={setFirstName} />
              </Field>
              <Field label="Apellidos">
                <EditText data={lastName} setData={setLastName} />
              </Field>
            </div>
          </div>

          {/* ── Galería ──────────────────────────────────────────────────── */}
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <SectionHeader icon={<ImageIcon size={20} />} title="Galería" />
            <div className="space-y-10">
              <Field label="Foto de Perfil">
                <div className="flex justify-center p-6 rounded-2xl bg-gray-50/50 border border-dashed border-gray-100">
                  <EditImage
                    onLoad={onLoadProfilePicture}
                    data={profilePicture}
                    setData={setProfilePicture}
                    percentage={profilePicturePercentage}
                    title="Foto de perfil"
                  />
                </div>
              </Field>
              <Field label="Imagen de Portada">
                <div className="p-4 rounded-2xl bg-gray-50/50 border border-dashed border-gray-100">
                  <EditImage
                    onLoad={onLoadBannerPicture}
                    data={bannerPicture}
                    setData={setBannerPicture}
                    percentage={bannerPicturePercentage}
                    variant="banner"
                    title="Imagen de portada"
                  />
                </div>
              </Field>
            </div>
          </div>
        </div>

        {/* ── Biografía ────────────────────────────────────────────────────── */}
        <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
          <SectionHeader icon={<PenTool size={20} />} title="Biografía" />
          <div className="rounded-2xl border border-gray-100">
            <EditRichText title="Biografía" data={biography} setData={setBiography} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

          {/* ── Información Adicional ────────────────────────────────────── */}
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <SectionHeader icon={<Briefcase size={20} />} title="Información Adicional" />
            <div className="space-y-6">
              <Field label="Fecha de Nacimiento" icon={<Calendar size={12} className="text-red-600" />}>
                <EditDate useTime={false} data={birthday} setData={setBirthDay} />
              </Field>
              <Field label="Sitio Web" icon={<Globe size={12} className="text-red-600" />}>
                <EditURL data={website} setData={setWebsite} />
              </Field>
            </div>
          </div>

          {/* ── Redes Digitales ──────────────────────────────────────────── */}
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <SectionHeader icon={<Globe size={20} />} title="Redes Digitales" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Instagram" icon={<Instagram size={12} className="text-pink-600" />}>
                <EditURL data={instagram} setData={setInstagram} />
              </Field>
              <Field label="Facebook" icon={<Facebook size={12} className="text-blue-600" />}>
                <EditURL data={facebook} setData={setFacebook} />
              </Field>
              <Field label="Threads" icon={<Twitter size={12} className="text-sky-500" />}>
                <EditURL data={threads} setData={setThreads} />
              </Field>
              <Field label="LinkedIn" icon={<Linkedin size={12} className="text-blue-700" />}>
                <EditURL data={linkedin} setData={setLinkedin} />
              </Field>
              <Field label="YouTube" icon={<Youtube size={12} className="text-red-600" />}>
                <EditURL data={youtube} setData={setYouTube} />
              </Field>
              <Field label="TikTok" icon={<Navigation size={12} className="text-black" />}>
                <EditURL data={tiktok} setData={setTikTok} />
              </Field>
              <Field label="GitHub" icon={<MapPin size={12} className="text-gray-700" />}>
                <EditURL data={github} setData={setGitHub} />
              </Field>
              <Field label="GitLab" icon={<MapPin size={12} className="text-orange-600" />}>
                <EditURL data={gitlab} setData={setGitLab} />
              </Field>
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