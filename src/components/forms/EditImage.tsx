import { v4 as uuidv4 } from 'uuid';
import ReactDropzone from 'react-dropzone';
import { Line } from 'rc-progress';
import Image from 'next/image';
import { ToastError } from '../toast/alerts';

interface ComponentProps {
  encoding?: string;
  data: any;
  setData: any;
  onLoad?: any;
  percentage?: number;
  variant?: string;
  title?: string;
  description?: string;
  shape?: 'circle' | 'square' | 'rectangle';
}

export default function EditImage({
  encoding = 'multipart',
  data,
  setData,
  onLoad = null,
  percentage = 0,
  variant = 'profile',
  title = 'File',
  description = '',
  shape = 'square',
}: ComponentProps) {
  const handleDrop = (acceptedFiles: any) => {
    const acceptedFile = acceptedFiles[0];

    if (acceptedFile.size > 2 * 1024 * 1024) {
      ToastError('Image must be Max 2MB');
      return;
    }

    const allowedFileTypes = ['image/jpeg', 'image/png'];

    if (!allowedFileTypes.includes(acceptedFile.type)) {
      ToastError(
        `${acceptedFile.type} is not allowed. Only .jpg, .jpeg or .png extensions are allowed`,
      );
      return;
    }

    const reader = new FileReader();

    if (encoding === 'base64') {
      reader.readAsDataURL(acceptedFile);
      reader.onload = () => {
        const sizeInKB = acceptedFile.size / 1024;
        const fileTypeMapping: { [key: string]: string } = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
        };
        const newItem = {
          id: uuidv4(),
          title: acceptedFile.name,
          file: reader.result,
          size: `${sizeInKB.toFixed(2)} KB`,
          type: fileTypeMapping[acceptedFile.type] || acceptedFile.type,
          lastModified: acceptedFile.lastModified,
        };
        setData(newItem);
        if (onLoad) {
          onLoad(newItem);
        }
      };
    }

    if (encoding === 'multipart') {
      const sizeInKB = acceptedFile.size / 1024;
      const fileTypeMapping: { [key: string]: string } = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
      };
      const newItem = {
        id: uuidv4(),
        title: acceptedFile.name,
        file: acceptedFile,
        size: `${sizeInKB.toFixed(2)} KB`,
        type: fileTypeMapping[acceptedFile.type] || acceptedFile.type,
        lastModified: acceptedFile.lastModified,
      };
      setData(newItem);
      if (onLoad) {
        onLoad(newItem);
      }
    }
  };

  const isValidUrl = (string: string) => {
    try {
      // eslint-disable-next-line
      const url = new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const getSrcUrl = () => {
    if (isValidUrl(data)) {
      return data;
    }

    if (encoding === 'base64' && data?.file) {
      return data.file;
    }

    if (encoding === 'multipart' && data?.file) {
      return URL.createObjectURL(data.file);
    }

    return '/assets/img/placeholder/media.jpg';
  };

  const srcUrl = getSrcUrl();

  const normalStyle = <div>Normal style</div>;

  const bannerStyle = (
    <div className="space-y-4">
      <div>
        <span className="block text-sm font-bold text-white">{title}</span>
        <span className="block text-xs text-slate-400 mt-1">
          {description}
        </span>
      </div>
      <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-[#0F172A]/50 backdrop-blur-sm">
        {data && (
          <Image
            width={1200}
            height={400}
            src={srcUrl}
            alt=""
            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {!data && <div className="h-48 w-full bg-slate-900/50 flex items-center justify-center text-slate-600 font-medium italic">Sin imagen seleccionada</div>}
      </div>
      <div className="w-full">
        <ReactDropzone onDrop={handleDrop}>
          {({ getRootProps, getInputProps }) => (
            <div
              className="group flex w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-6 transition-all hover:border-red-500/50 hover:bg-white/10"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <span className="text-sm font-semibold text-slate-300 group-hover:text-red-500 transition-colors">
                  {data?.file ? data?.title : 'Arrastra una imagen o haz clic para subir'}
                </span>
                <p className="mt-1 text-[10px] text-slate-500 uppercase tracking-tighter">JPG, PNG hasta 2MB</p>
              </div>
            </div>
          )}
        </ReactDropzone>
        <div className="mt-3">
          <Line
            percent={percentage}
            strokeWidth={1}
            trailWidth={1}
            strokeColor="#ef4444"
            trailColor="rgba(255,255,255,0.05)"
          />
        </div>
      </div>
    </div>
  );

  const profileStyle = (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-center">
        <div className="flex-shrink-0">
          <div className={`relative h-40 w-40 overflow-hidden border-4 border-white/5 shadow-2xl bg-[#0F172A]/50 ${shape === 'circle' ? 'rounded-full' : shape === 'rectangle' ? 'rounded-2xl h-24 w-64' : 'rounded-2xl'
            }`}>
            {data ? (
              <Image
                width={256}
                height={256}
                src={srcUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-600 font-bold text-xs uppercase">Sin Foto</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
        <div className="w-full">
          <ReactDropzone onDrop={handleDrop}>
            {({ getRootProps, getInputProps }) => (
              <div
                className="group flex w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 p-8 transition-all hover:border-red-500/50 hover:bg-white/10"
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <span className="text-sm font-bold text-slate-300 group-hover:text-red-500 transition-colors">
                    {data?.file ? data?.title : 'Cambiar foto de perfil'}
                  </span>
                  <p className="mt-1 text-[10px] text-slate-500 uppercase tracking-widest">Recomendado: Cuadrada JPG/PNG</p>
                </div>
              </div>
            )}
          </ReactDropzone>
          <div className="mt-4">
            <Line
              percent={percentage}
              strokeWidth={1.5}
              trailWidth={1.5}
              strokeColor="#ef4444"
              trailColor="rgba(255,255,255,0.05)"
            />
          </div>
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'profile':
      return profileStyle;
    case 'normal':
      return normalStyle;
    case 'banner':
      return bannerStyle;
    default:
      return null;
  }
}

EditImage.defaultProps = {
  encoding: 'multipart',
  onLoad: null,
  percentage: 0,
  variant: 'profile',
  title: 'File',
  description: '',
  shape: 'square',
};
