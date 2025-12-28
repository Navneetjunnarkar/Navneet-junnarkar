import React, { useState } from 'react';
import { UserRole, User, Language } from '../types';
import { translations } from '../utils/translations';
import { AuthService } from '../services/authService';
import { isFirebaseConfigured } from '../services/firebaseConfig';

interface AuthProps {
  onLogin: (user: User, token: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, language, setLanguage }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = translations[language];

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        const response = await AuthService.register(name, email, password, role);
        onLogin(response.user, response.token);
      } else {
        const response = await AuthService.login(email, password);
        onLogin(response.user, response.token);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        {!isFirebaseConfigured && (
          <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded-full font-bold border border-amber-200">
            <i className="fa-solid fa-flask mr-1"></i> DEMO MODE (LOCAL)
          </span>
        )}
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी (Hindi)</option>
          <option value="mr">मराठी (Marathi)</option>
          <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
          <option value="raj">राजस्थानी (Rajasthani)</option>
        </select>
      </div>

      <div className="md:w-1/2 bg-blue-900 text-white flex flex-col justify-center items-center p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="z-10 text-center flex flex-col items-center">
            <div className="mb-6 p-6 rounded-full bg-white/10 border-2 border-yellow-500 backdrop-blur-sm">
             <img 
               src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/512px-Emblem_of_India.svg.png" 
               alt="Ashok Stambh" 
               className="h-32 w-auto invert brightness-0 sepia saturate-100 hue-rotate-[10deg] opacity-90"
             />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide text-yellow-500">Legal Sathi</h1>
            <p className="text-xl md:text-2xl font-light text-blue-100">Satyamev Jayate</p>
        </div>
      </div>

      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-yellow-50 p-4 border-b border-yellow-100 flex justify-center">
            <span className="text-yellow-700 font-semibold text-sm uppercase tracking-wider">
              {t.officialPortal}
            </span>
          </div>
          
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isRegistering ? t.registerTitle : t.loginTitle}
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              {isRegistering ? t.registerDesc : t.loginDesc}
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm flex items-center">
                <i className="fa-solid fa-circle-exclamation mr-2"></i> {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition"
                    placeholder="e.g. Arjun Kumar"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition"
                  placeholder={t.emailPlaceholder}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.USER)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                      role === UserRole.USER ? 'bg-blue-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-300'
                    }`}
                  >
                    <i className="fa-solid fa-user mr-2"></i> {t.citizen}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.LAWYER)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                      role === UserRole.LAWYER ? 'bg-blue-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-300'
                    }`}
                  >
                    <i className="fa-solid fa-gavel mr-2"></i> {t.lawyer}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg shadow-lg transition-all flex justify-center items-center"
              >
                {loading ? (
                  <><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> {t.processing}</>
                ) : (
                  isRegistering ? t.registerBtn : t.loginBtn
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isRegistering ? t.haveAccount : t.newToApp}
                <button
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="ml-2 text-blue-700 font-semibold hover:underline"
                >
                  {isRegistering ? t.loginHere : t.registerNow}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;