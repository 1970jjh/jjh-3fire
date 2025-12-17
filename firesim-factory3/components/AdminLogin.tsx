import React, { useState } from 'react';
import { Lock, ArrowLeft, Key } from 'lucide-react';

interface Props {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<Props> = ({ onLoginSuccess, onBack }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  // Updated password per request
  const ADMIN_PASSWORD = "6749467";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLoginSuccess();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_#000]">
        <div className="bg-black p-6 text-white flex items-center justify-between">
           <h2 className="text-2xl font-black uppercase">Admin Access</h2>
           <Lock className="w-6 h-6" />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="block font-black text-lg">PASSWORD</label>
            <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => { setError(false); setPassword(e.target.value); }}
                  className="w-full p-4 border-2 border-black focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_#000] transition-all text-xl font-mono"
                  placeholder="Enter password..."
                  autoFocus
                />
                <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20" />
            </div>
            {error && <p className="text-red-600 font-bold text-sm bg-red-100 p-2 border-2 border-red-600">⚠ 접근 거부: 비밀번호가 일치하지 않습니다.</p>}
          </div>

          <div className="pt-4 flex gap-4">
             <button 
                type="button"
                onClick={onBack}
                className="flex-1 py-4 border-2 border-black font-bold hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000]"
             >
                <ArrowLeft className="w-5 h-5 mx-auto" />
             </button>
             <button 
                type="submit"
                className="flex-[3] py-4 bg-[#ff5d5d] text-white font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:bg-[#ff4444] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] transition-all"
             >
                LOGIN
             </button>
          </div>
        </form>
        <div className="p-4 bg-gray-100 border-t-2 border-black text-xs font-mono text-center text-gray-500">
            SECURE AREA
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;