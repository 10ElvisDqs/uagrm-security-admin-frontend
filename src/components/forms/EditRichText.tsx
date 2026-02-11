import inputFormClassName from '@/utils/inputFormClassName';
import TiptapEditor from '../tiptap/TipTapEditor';

interface ComponentProps {
  data: string;
  setData: (value: string) => void;
  title?: string;
  description?: string;
  maxTextLength?: number;
}

export default function EditRichText({
  data,
  setData,
  title = '',
  description = '',
  maxTextLength = 1200,
}: ComponentProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</label>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1 transition-all focus-within:border-red-600/50 focus-within:ring-2 focus-within:ring-red-600/5">
        <TiptapEditor data={data} setData={setData} maxTextLength={maxTextLength} />
      </div>
    </div>
  );
}

EditRichText.defaultProps = {
  title: '',
  description: '',
  maxTextLength: 1200,
};
