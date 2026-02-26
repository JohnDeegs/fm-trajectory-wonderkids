import { useRef, useState, useCallback } from 'react';

interface Props {
  onLoad: (html: string) => void;
  playerCount: number;
}

export function UploadPanel({ onLoad, playerCount }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setError('Please upload an FM24 HTML export file.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = e => onLoad(e.target?.result as string);
    reader.readAsText(file, 'utf-8');
  }, [onLoad]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
        dragging ? 'border-[#4f8ef7] bg-[#4f8ef7]/10' : 'border-[#2a3350] hover:border-[#4f8ef7]/60'
      }`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept=".html,.htm" className="hidden" onChange={onFileChange} />
      <div className="text-4xl mb-3">{playerCount > 0 ? '✓' : '📂'}</div>
      {playerCount > 0 ? (
        <>
          <p className="text-[#4ade80] font-semibold">{playerCount} players loaded</p>
          <p className="text-[#7c8db0] text-sm mt-1">Click or drop to load a new file</p>
        </>
      ) : (
        <>
          <p className="text-white font-semibold">Drop your FM24 HTML export here</p>
          <p className="text-[#7c8db0] text-sm mt-1">or click to browse</p>
          <p className="text-[#7c8db0] text-xs mt-3">
            In FM24: Scouting → Add scout report view → File → Export as Web Page
          </p>
        </>
      )}
      {error && <p className="text-[#f87171] text-sm mt-2">{error}</p>}
    </div>
  );
}
