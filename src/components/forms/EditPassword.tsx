import inputClassName from '@/utils/inputClassName';
import inputFormClassName from '@/utils/inputFormClassName';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface ComponentProps {
  data: string;
  setData: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  maxTextLength?: number;
  showMaxTextLength?: boolean;
  placeholder?: string;
  title?: string;
  description?: string;
}

export default function EditPassword({
  data,
  setData,
  required = false,
  disabled = false,
  maxTextLength = 120,
  showMaxTextLength = false,
  placeholder = '',
  title = '',
  description = '',
}: ComponentProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    inputValue = inputValue.replace(/[^a-zA-Z0-9\s',:.?-ÁÉÍÓÚáéíóúÑñüÜ!@#$%^&*()_+=]/g, '');

    setData(inputValue);
  };

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      {title && <span className="block text-sm font-bold text-gray-900 mb-1">{title}</span>}
      {description && (
        <span className="mb-2 block text-sm text-gray-500">
          {description}
        </span>
      )}
      <div className={`${inputFormClassName} bg-white rounded-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-red-500/20`}>
        <input
          type={showPassword ? 'text' : 'password'}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={data}
          maxLength={maxTextLength}
          className={`${inputClassName} bg-transparent text-gray-900 placeholder:text-gray-400`}
          onChange={handleInputChange}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-red-500 transition-colors"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        {showMaxTextLength && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-10">
            <span className="text-[10px] text-gray-400 font-medium">
              {data?.length}/{maxTextLength}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

EditPassword.defaultProps = {
  required: false,
  disabled: false,
  maxTextLength: 120,
  showMaxTextLength: false,
  placeholder: '',
  title: '',
  description: '',
};
