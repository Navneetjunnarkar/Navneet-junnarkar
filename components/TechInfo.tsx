import React from 'react';

const TechInfo: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
        {/* Header */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Project Architecture & Workflow</h1>
            <p className="text-slate-600">
                A transparent look into how Legal Sathi processes data. Currently running in <strong>Demo Mode (Serverless)</strong>, but designed for a robust <strong>Java Spring Boot</strong> backend.
            </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
                    <i className="fa-solid fa-layer-group mr-3"></i> Technology Stack
                </h3>
                <div className="space-y-4">
                    <TechItem 
                        icon="fa-brands fa-react" 
                        color="text-blue-500" 
                        title="React & TypeScript" 
                        desc="Frontend framework for a responsive, type-safe user interface." 
                    />
                    <TechItem 
                        icon="fa-brands fa-java" 
                        color="text-red-600" 
                        title="Java Spring Boot (Backend)" 
                        desc="Designed to handle API requests, secure authentication, and managing Gemini API calls securely on the server." 
                    />
                    <TechItem 
                        icon="fa-brands fa-google" 
                        color="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-red-500" 
                        title="Google Gemini API" 
                        desc="Powering the 'Legal Brain'. Handles text generation, document OCR/analysis, and multilingual translation." 
                    />
                     <TechItem 
                        icon="fa-solid fa-wind" 
                        color="text-cyan-500" 
                        title="Tailwind CSS" 
                        desc="Utility-first CSS framework for rapid, beautiful styling." 
                    />
                </div>
            </div>

            {/* Development Flow Timeline */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
                    <i className="fa-solid fa-code-branch mr-3"></i> Architecture Diagram
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                    <div className="flex flex-col items-center space-y-2">
                        <div className="p-3 bg-blue-100 text-blue-800 rounded-lg font-bold border border-blue-300 w-full text-center">
                            React Client (Browser)
                        </div>
                        <i className="fa-solid fa-arrow-down text-slate-400"></i>
                        <div className="p-3 bg-red-100 text-red-800 rounded-lg font-bold border border-red-300 w-full text-center">
                            Java Spring Boot Server (Port 8080)
                            <p className="text-xs font-normal mt-1 text-red-600">LegalController.java</p>
                        </div>
                        <i className="fa-solid fa-arrow-down text-slate-400"></i>
                        <div className="p-3 bg-green-100 text-green-800 rounded-lg font-bold border border-green-300 w-full text-center">
                            Google Gemini API
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-xs text-slate-500 italic">
                    *Note: For this online demo, the React Client connects directly to Gemini to function without a running Java server. The Java code is provided in the <code>backend/</code> folder.
                </p>
            </div>
        </div>
    </div>
  );
};

const TechItem = ({ icon, color, title, desc }: any) => (
    <div className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-lg transition">
        <div className={`text-2xl ${color} w-8 text-center mt-1 flex-shrink-0`}>
            <i className={icon}></i>
        </div>
        <div>
            <h4 className="font-bold text-slate-800">{title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default TechInfo;