import Layout from '@/hocs/Layout';
import validator from 'validator';
import axios from 'axios';

import Container from '@/components/pages/profile/Container';
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

export default function Page() {
  const user = useSelector((state: RootState) => state.auth.user);
  const profile = useSelector((state: RootState) => state.auth.profile);

  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [hasChangesProfile, setHasChangesProfile] = useState<boolean>(false);
  const [hasChangesProfilePicture, setHasChangesProfilePicture] = useState<boolean>(false);
  const [hasChangesBannerPicture, setHasChangesBannerPicture] = useState<boolean>(false);

  const [username, setUsername] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  const [biography, setBiography] = useState<string>('');
  const [birthday, setBirthDay] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [instagram, setInstagram] = useState<string>('');
  const [facebook, setFacebook] = useState<string>('');
  const [threads, setThreads] = useState<string>('');
  const [linkedin, setLinkedin] = useState<string>('');
  const [youtube, setYouTube] = useState<string>('');
  const [tiktok, setTikTok] = useState<string>('');
  const [github, setGitHub] = useState<string>('');
  const [gitlab, setGitLab] = useState<string>('');

  const {
    profilePicture,
    setProfilePicture,
    percentage: profilePicturePerceentage,
    setPercentage: setProfilePicturePercentage,
  } = useProfilePicture();

  const {
    bannerPicture,
    setBannerPicture,
    percentage: bannerPicturePercentage,
    setPercentage: setBannerPicturePercentage,
  } = useBannerPicture();

  const onLoadProfilePicture = (newImage: any) => {
    if (newImage !== profilePicture) {
      setProfilePicture(newImage);
      setHasChangesProfilePicture(true);
    }
  };

  const onLoadBannerPicture = (newImage: any) => {
    if (newImage !== profilePicture) {
      setBannerPicture(newImage);
      setHasChangesBannerPicture(true);
    }
  };

  useEffect(() => {
    if (user) {
      setUsername(user?.username);
      setFirstName(user?.first_name);
      setLastName(user?.last_name);
    }

    if (profile) {
      setBiography(profile?.biography);
      setBirthDay(profile?.birthday);
      setWebsite(profile?.website);
      setInstagram(profile?.instagram);
      setFacebook(profile?.facebook);
      setThreads(profile?.threads);
      setLinkedin(profile?.linkedin);
      setYouTube(profile?.youtube);
      setTikTok(profile?.tiktok);
      setGitHub(profile?.github);
      setGitLab(profile?.gitlab);
    }
  }, [user, profile]);

  const isValidDate = (date: string) => !Number.isNaN(new Date(date).getTime());
  const isValidUrl = (url: string) => validator.isURL(url, { require_protocol: false });
  const isEmpty = (str: string) => {
    const cleanedContent = str.replace(/<[^>]*>/g, '').trim();
    return cleanedContent === '';
  };

  useEffect(() => {
    if (
      username !== user?.username ||
      firstName !== user?.first_name ||
      lastName !== user?.last_name
    ) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }

    if (
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
      (gitlab !== profile?.gitlab && isValidUrl(gitlab))
    ) {
      setHasChangesProfile(true);
    } else {
      setHasChangesProfile(false);
    }
  }, [
    username,
    firstName,
    user,
    lastName,
    birthday,
    profile,
    website,
    instagram,
    facebook,
    threads,
    linkedin,
    youtube,
    tiktok,
    github,
    gitlab,
    biography,
  ]);

  const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);

  const handleSaveUserData = async () => {
    const updatedData: Record<string, string> = {};

    if (username !== user?.username) updatedData.username = username;
    if (firstName !== user?.first_name) updatedData.first_name = firstName;
    if (lastName !== user?.last_name) updatedData.last_name = lastName;

    if (Object.keys(updatedData).length === 0) {
      ToastWarning('Sin cambios para guardar.');
      return;
    }

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        ToastSuccess('Datos de usuario actualizados correctamente');
        await dispatch(loadUser());
      } else {
        ToastError('Error al actualizar los datos de usuario');
      }
    } catch (error) {
      ToastError('Ocurrió un error al actualizar los datos de usuario');
    }
  };

  const handleSaveProfileData = async () => {
    const updatedData: Record<string, string> = {};

    if (biography !== profile?.biography) updatedData.biography = biography;
    if (birthday !== profile?.birthday) updatedData.birthday = birthday;
    if (website !== profile?.website) updatedData.website = website;
    if (instagram !== profile?.instagram) updatedData.instagram = instagram;
    if (facebook !== profile?.facebook) updatedData.facebook = facebook;
    if (threads !== profile?.threads) updatedData.threads = threads;
    if (linkedin !== profile?.linkedin) updatedData.linkedin = linkedin;
    if (youtube !== profile?.youtube) updatedData.youtube = youtube;
    if (tiktok !== profile?.tiktok) updatedData.tiktok = tiktok;
    if (github !== profile?.github) updatedData.github = github;
    if (gitlab !== profile?.gitlab) updatedData.gitlab = gitlab;

    if (Object.keys(updatedData).length === 0) {
      ToastWarning('Sin cambios para guardar.');
      return;
    }

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        ToastSuccess('Perfil actualizado correctamente');
        await dispatch(loadProfile());
      } else {
        ToastError('Error al actualizar el perfil');
      }
    } catch (error) {
      ToastError('Ocurrió un error al actualizar el perfil');
    }
  };

  const handleSaveProfilePicture = async () => {
    if (!profilePicture.file) {
      ToastError('No hay ningún archivo seleccionado');
      return null;
    }

    const { file } = profilePicture;
    const { name: title, size, type } = file;
    const sanitizedTitle = title.replace(/\s/g, '_');
    const fileKey = `media/users/pictures/${user?.username}/${sanitizedTitle}`;

    try {
      const presignedUrl = await fetchS3SignedURL({
        bucket: `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}`,
        key: fileKey,
      });

      const uploadResponse = await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
            setProfilePicturePercentage(percentage);
          }
        },
      });

      if (uploadResponse.status === 200) {
        const backendResponse = await uploadProfilePicture({ key: fileKey, title, size, type });

        if (backendResponse.status === 200) {
          setProfilePicturePercentage(0);
          ToastSuccess('¡Foto de perfil actualizada exitosamente!');
          setHasChangesProfilePicture(false);
        }
      }
    } catch (err) {
      ToastError('Error al subir la imagen a MinIO');
    }

    return null;
  };

  const handleSaveBannerPicture = async () => {
    if (!bannerPicture.file) {
      ToastError('No hay ningún archivo seleccionado para cargar');
      return null;
    }

    const { file } = bannerPicture;
    const { name: title, size, type } = file;
    const sanitizedTitle = title.replace(/\s/g, '_');
    const fileKey = `media/users/banners/${user?.username}/${sanitizedTitle}`;

    try {
      const presignedUrl = await fetchS3SignedURL({
        bucket: `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}`,
        key: fileKey,
      });

      const uploadResponse = await axios.put(presignedUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
            setBannerPicturePercentage(percentage);
          }
        },
      });

      if (uploadResponse.status === 200) {
        const backendResponse = await uploadBannerPicture({ key: fileKey, title, size, type });

        if (backendResponse.status === 200) {
          setBannerPicturePercentage(0);
          ToastSuccess('¡Imagen de portada actualizada exitosamente!');
          setHasChangesBannerPicture(false);
        }
      }
    } catch (err) {
      ToastError('Error al subir la imagen de portada');
    }

    return null;
  };

  const handleSaveData = async () => {
    if (
      !hasChanges &&
      !hasChangesProfile &&
      !hasChangesProfilePicture &&
      !hasChangesBannerPicture
    ) {
      ToastWarning('Sin cambios para guardar.');
      return;
    }

    try {
      setLoading(true);
      if (hasChanges) await handleSaveUserData();
      if (hasChangesProfile) await handleSaveProfileData();
      if (hasChangesProfilePicture) await handleSaveProfilePicture();
      if (hasChangesBannerPicture) await handleSaveBannerPicture();
    } catch (error) {
      ToastError('Ocurrió un error al guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div>
        <div className="">
          <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="ml-4 mt-4">
              <h3 className="text-base font-semibold text-gray-900">Información de usuario</h3>
              <p className="mt-1 text-sm text-gray-500">
                Esta información será visible públicamente, ten cuidado con lo que compartes.
              </p>
            </div>
            <div className="ml-4 mt-4 shrink-0">
              <Button
                style={{ width: '150px' }}
                onClick={handleSaveData}
                disabled={
                  loading ||
                  (!hasChanges &&
                    !hasChangesProfile &&
                    !hasChangesProfilePicture &&
                    !hasChangesBannerPicture)
                }
                hoverEffect
              >
                {loading ? <LoadingMoon /> : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        </div>

        <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6">
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Nombre de usuario
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditText data={username} setData={setUsername} />
            </dd>
          </div>
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Nombre</dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditText data={firstName} setData={setFirstName} />
            </dd>
          </div>
          <div className="pt-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Apellido</dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditText data={lastName} setData={setLastName} />
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="text-base/7 font-semibold text-gray-900">Perfil</h2>
        <p className="mt-1 text-sm/6 text-gray-500">
          Información pública de tu perfil para que el mundo sepa más sobre ti.
        </p>

        <ul className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6">
          <li className="py-6">
            <EditImage
              onLoad={onLoadProfilePicture}
              data={profilePicture}
              setData={setProfilePicture}
              percentage={profilePicturePerceentage}
              title="Foto de perfil"
            />
          </li>
          <li className="py-6">
            <EditImage
              onLoad={onLoadBannerPicture}
              data={bannerPicture}
              setData={setBannerPicture}
              percentage={bannerPicturePercentage}
              variant="banner"
              title="Imagen de portada"
            />
          </li>
          <li className="py-6">
            <EditRichText title="Biografía" data={biography} setData={setBiography} />
          </li>
          <li className="py-6 sm:flex">
            <h4 className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Fecha de nacimiento
            </h4>
            <div className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditDate useTime={false} data={birthday} setData={setBirthDay} />
            </div>
          </li>
          <li className="py-6 sm:flex">
            <h4 className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
              Sitio web
            </h4>
            <div className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditURL data={website} setData={setWebsite} />
            </div>
          </li>
          <li className="py-6 sm:flex">
            <h4 className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Instagram</h4>
            <div className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditURL data={instagram} setData={setInstagram} />
            </div>
          </li>
          <li className="py-6 sm:flex">
            <h4 className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Facebook</h4>
            <div className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditURL data={facebook} setData={setFacebook} />
            </div>
          </li>
          <li className="py-6 sm:flex">
            <h4 className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Threads</h4>
            <div className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditURL data={threads} setData={setThreads} />
            </div>
          </li>
          <li className="py-6 sm:flex">
            <h4 className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">LinkedIn</h4>
            <div className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditURL data={linkedin} setData={setLinkedin} />
            </div>
          </li>
          <li className="py-6 sm:flex">
            <h4 className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">YouTube</h4>
            <div className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditURL data={youtube} setData={setYouTube} />
            </div>
          </li>
          <li className="py-6 sm:flex">
            <h4 className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">TikTok</h4>
            <div className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditURL data={tiktok} setData={setTikTok} />
            </div>
          </li>
          <li className="py-6 sm:flex">
            <h4 className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Github</h4>
            <div className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditURL data={github} setData={setGitHub} />
            </div>
          </li>
          <li className="py-6 sm:flex">
            <h4 className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Gitlab</h4>
            <div className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <EditURL data={gitlab} setData={setGitLab} />
            </div>
          </li>
        </ul>
      </div>
    </Container>
  );
}

Page.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};