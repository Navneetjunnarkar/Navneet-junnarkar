import React, { useState } from 'react';
import { analyzeDocument } from '../services/geminiService';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface DocumentUploadProps {
    language: Language;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ language }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const t = translations[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setAnalysis('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalysis = async () => {
    if (!preview || !file) return;

    setIsAnalyzing(true);
    // Extract Base64 part
    const base64Data = preview.split(',')[1];
    
    try {
      const result = await analyzeDocument(base64Data, file.type, language);
      setAnalysis(result);
    } catch (error) {
      setAnalysis("Error analyzing document.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
        <i className="fa-solid fa-file-contract text-blue-900 mr-2"></i> {t.uploadTitle}
      </h2>
      <p className="text-slate-500 mb-6 text-sm">
        {t.uploadDesc}
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div className="flex flex-col gap-4">
          <label 
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              preview ? 'border-blue-900 bg-blue-50' : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'
            }`}
          >
            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
            {preview ? (
              <div className="text-center">
                 <i className="fa-solid fa-check-circle text-4xl text-green-500 mb-2"></i>
                 <p className="font-semibold text-slate-700">{file?.name}</p>
                 <p className="text-xs text-slate-500">Click to change</p>
              </div>
            ) : (
              <div className="text-center">
                <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-400 mb-3"></i>
                <p className="font-medium text-slate-700">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, PDF</p>
              </div>
            )}
          </label>

          {preview && (
            <button
              onClick={handleAnalysis}
              disabled={isAnalyzing}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 rounded-lg shadow-md transition disabled:opacity-50"
            >
              {isAnalyzing ? (
                <span><i className="fa-solid fa-gear fa-spin mr-2"></i> {t.analyzing}</span>
              ) : (
                <span><i className="fa-solid fa-magnifying-glass mr-2"></i> {t.analyzeBtn}</span>
              )}
            </button>
          )}
        </div>

        {/* Results Area */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 h-80 overflow-y-auto">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <i className="fa-solid fa-brain text-4xl mb-4 animate-pulse"></i>
                <p>Legal Sathi is reading your document...</p>
            </div>
          ) : analysis ? (
            <div className="prose prose-sm max-w-none">
                <h3 className="text-blue-900 font-bold border-b border-blue-200 pb-2 mb-3">{t.riskAssessment}</h3>
                <div className="whitespace-pre-wrap text-slate-700 text-sm">
                    {analysis}
                </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <i className="fa-regular fa-file-lines text-4xl mb-3 opacity-30"></i>
              <p className="text-sm">Analysis results will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;