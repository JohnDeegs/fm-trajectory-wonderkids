import { useState } from 'react';

interface Props {
  geminiKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

export function SettingsPanel({ geminiKey, onSave, onClose }: Props) {
  const [draft, setDraft] = useState(geminiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(draft.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a2035] border border-[#2a3350] rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-[#7c8db0] hover:text-white transition-colors text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#7c8db0] mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="AIza..."
              className="w-full bg-[#0f1320] border border-[#2a3350] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#4f8ef7] transition-colors"
            />
            <p className="text-xs text-[#7c8db0] mt-1">
              Free tier key from Google AI Studio. Stored locally in your browser only.
            </p>
          </div>

          <div className="bg-[#0f1320] rounded-lg p-3 text-xs text-[#7c8db0] space-y-1">
            <p className="font-medium text-[#e2e8f0]">How to get a free Gemini key:</p>
            <p>1. Visit aistudio.google.com</p>
            <p>2. Sign in with Google</p>
            <p>3. Click "Get API key" → "Create API key"</p>
            <p>4. Paste the key above</p>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-[#4f8ef7] hover:bg-[#3a7de6] text-white font-medium py-2 rounded-lg transition-colors"
          >
            {saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
