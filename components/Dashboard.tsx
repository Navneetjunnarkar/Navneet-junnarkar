import React, { useState } from 'react';
import { User, UserRole, Language } from '../types';
import LegalChat from './LegalChat';
import DocumentUpload from './DocumentUpload';
import VoiceAssistant from './VoiceAssistant';
import TechInfo from './TechInfo';
import { translations } from '../utils/translations';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

type ViewState = 'HOME' | 'CHAT' | 'VOICE' | 'DOCUMENTS' | 'LAWYERS' | 'PROFILE' | 'TECH_INFO';

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, language, setLanguage }) => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const t = translations[language];

  const navItems = [
    { id: 'HOME', label: t.dashboard, icon: 'fa-table-columns' },
    { id: 'CHAT', label: t.aiChat, icon: 'fa-robot' },
    { id: 'VOICE', label: t.voiceAssistant, icon: 'fa-microphone' },
    { id: 'DOCUMENTS', label: t.documents, icon: 'fa-folder-open' },
    { id: 'LAWYERS', label: t.findLawyers, icon: 'fa-user-tie' },
    { id: 'PROFILE', label: t.profile, icon: 'fa-id-card' },
    { id: 'TECH_INFO', label: t.techInfo, icon: 'fa-microchip' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col hidden md:flex shadow-2xl z-10">
        <div className="p-6 border-b border-blue-800 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center p-1 bg-white/10 rounded-full border border-yellow-500">
             <img 
               src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/512px-Emblem_of_India.svg.png" 
               alt="Logo" 
               className="w-full h-full object-contain invert"
             />
          </div>
          <span className="text-xl font-bold tracking-tight text-yellow-500">Legal Sathi</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === item.id 
                  ? 'bg-blue-800 text-yellow-400 font-medium translate-x-1 shadow-md' 
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-800">
           {/* Language Selector Sidebar */}
           <div className="mb-4">
              <label className="text-xs text-blue-300 uppercase font-semibold mb-1 block ml-1">{t.selectLang}</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full bg-blue-800 text-white border border-blue-700 text-sm rounded-lg p-2 focus:ring-2 focus:ring-yellow-500 outline-none"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="raj">राजस्थानी (Rajasthani)</option>
              </select>
           </div>

          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
              src={user.avatarUrl || 'https://via.placeholder.com/40'} 
              alt="User" 
              className="w-10 h-10 rounded-full border-2 border-yellow-500"
            />
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-blue-300 truncate">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full bg-red-600/20 hover:bg-red-600 hover:text-white text-red-200 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-right-from-bracket"></i> {t.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm p-4 md:hidden flex justify-between items-center z-20">
             <div className="flex items-center gap-2 text-blue-900 font-bold">
                <img 
                   src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/512px-Emblem_of_India.svg.png" 
                   alt="Logo" 
                   className="w-8 h-8 object-contain"
                />
                <span className="text-yellow-600">Legal Sathi</span>
             </div>
             <div className="flex items-center gap-2">
                <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="bg-slate-100 text-slate-800 border-none text-xs rounded-md p-1 focus:ring-0"
                >
                    <option value="en">EN</option>
                    <option value="hi">HI</option>
                    <option value="mr">MR</option>
                    <option value="pa">PA</option>
                    <option value="raj">RAJ</option>
                </select>
                <button className="text-blue-900 ml-2" onClick={onLogout}>
                    <i className="fa-solid fa-right-from-bracket"></i>
                </button>
             </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {currentView === 'HOME' && (
            <div className="space-y-6">
              <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">{t.welcome}, {user.name.split(' ')[0]} 👋</h1>
                <p className="text-slate-500">Here is your legal assistance overview.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => setCurrentView('CHAT')} className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg cursor-pointer transform hover:scale-105 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                        <i className="fa-solid fa-robot text-2xl"></i>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{t.askAi}</h3>
                  <p className="text-blue-100 text-xs">{t.askAiDesc}</p>
                </div>

                <div onClick={() => setCurrentView('VOICE')} className="bg-white rounded-xl p-6 shadow-md border border-slate-200 cursor-pointer hover:border-red-500 transition group">
                   <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg group-hover:bg-red-600 group-hover:text-white transition">
                        <i className="fa-solid fa-microphone text-2xl"></i>
                    </div>
                    <span className="bg-yellow-500 text-blue-900 text-[10px] font-bold px-2 py-1 rounded">NEW</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-slate-800">{t.voiceAssistant}</h3>
                  <p className="text-slate-500 text-xs">{t.voiceDesc}</p>
                </div>

                <div onClick={() => setCurrentView('DOCUMENTS')} className="bg-white rounded-xl p-6 shadow-md border border-slate-200 cursor-pointer hover:border-blue-500 transition group">
                   <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-100 text-green-700 rounded-lg group-hover:bg-green-600 group-hover:text-white transition">
                        <i className="fa-solid fa-file-shield text-2xl"></i>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-slate-800">{t.analyzeDocs}</h3>
                  <p className="text-slate-500 text-xs">{t.analyzeDocsDesc}</p>
                </div>

                <div onClick={() => setCurrentView('LAWYERS')} className="bg-white rounded-xl p-6 shadow-md border border-slate-200 cursor-pointer hover:border-blue-500 transition group">
                   <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-100 text-purple-700 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition">
                        <i className="fa-solid fa-gavel text-2xl"></i>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-slate-800">{t.findLawyers}</h3>
                  <p className="text-slate-500 text-xs">{t.findLawyerDesc}</p>
                </div>

                {/* Tech Info Card */}
                <div onClick={() => setCurrentView('TECH_INFO')} className="bg-white rounded-xl p-6 shadow-md border border-slate-200 cursor-pointer hover:border-slate-500 transition group">
                   <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-slate-100 text-slate-700 rounded-lg group-hover:bg-slate-600 group-hover:text-white transition">
                        <i className="fa-solid fa-microchip text-2xl"></i>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-slate-800">{t.techInfo}</h3>
                  <p className="text-slate-500 text-xs">View tech stack & roadmap</p>
                </div>
              </div>

              {/* Recent Activity Mock */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-lg mb-4 text-slate-800">{t.recentActivity}</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition border-b border-slate-100 last:border-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <i className="fa-regular fa-clock"></i>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-slate-800">Document "Rent_Agreement.pdf" analyzed</h4>
                                <p className="text-xs text-slate-500">2 hours ago • Processed by Legal Sathi AI</p>
                            </div>
                            <button className="text-blue-600 hover:underline text-sm font-medium">View</button>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'CHAT' && <LegalChat language={language} />}
          
          {currentView === 'VOICE' && <VoiceAssistant language={language} />}

          {currentView === 'DOCUMENTS' && <DocumentUpload language={language} />}
          
          {currentView === 'TECH_INFO' && <TechInfo />}

          {currentView === 'LAWYERS' && (
              <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-800">Top Verified Lawyers</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(id => (
                          <div key={id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                              <img src={`https://picsum.photos/seed/${id + 10}/100/100`} className="w-20 h-20 rounded-lg object-cover" alt="Lawyer" />
                              <div>
                                  <h3 className="font-bold text-lg">Adv. Rajesh Sharma</h3>
                                  <p className="text-slate-500 text-sm mb-2">Criminal Law • 15 Yrs Exp.</p>
                                  <div className="flex items-center gap-1 text-yellow-500 text-sm mb-3">
                                      <i className="fa-solid fa-star"></i>
                                      <i className="fa-solid fa-star"></i>
                                      <i className="fa-solid fa-star"></i>
                                      <i className="fa-solid fa-star"></i>
                                      <i className="fa-solid fa-star-half-stroke"></i>
                                      <span className="text-slate-400 ml-1">(4.8)</span>
                                  </div>
                                  <button className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition">Book Consultation</button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
          
          {currentView === 'PROFILE' && (
             <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl mx-auto">
                 <div className="text-center mb-8">
                     <img src={user.avatarUrl} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-yellow-500" />
                     <h2 className="text-2xl font-bold">{user.name}</h2>
                     <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full uppercase tracking-wide font-bold">{user.role}</span>
                 </div>
                 <div className="space-y-4">
                     <div className="flex justify-between border-b py-3">
                         <span className="text-slate-500">Email</span>
                         <span className="font-medium">{user.email}</span>
                     </div>
                     <div className="flex justify-between border-b py-3">
                         <span className="text-slate-500">Phone</span>
                         <span className="font-medium">+91 98765 43210</span>
                     </div>
                     <div className="flex justify-between border-b py-3">
                         <span className="text-slate-500">Status</span>
                         <span className="text-green-600 font-bold"><i className="fa-solid fa-check-circle"></i> Verified</span>
                     </div>
                 </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;