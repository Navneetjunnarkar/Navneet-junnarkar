import React, { useState } from 'react';
import { analyzeDocument } from '../services/geminiService';
import { Language, LegalDocument } from '../types';
import { translations } from '../utils/translations';

interface DocumentUploadProps {
    language: Language;
}

const MOCK_DOCS: LegalDocument[] = [
  { id: '1', name: 'Rental_Agreement_Pune_Flat.pdf', uploadDate: new Date('2023-10-15'), status: 'Analyzed', type: 'Contract' },
  { id: '2', name: 'Legal_Notice_Recovery.jpg', uploadDate: new Date('2023-11-02'), status: 'Pending Review', type: 'Notice' },
  { id: '3', name: 'Sale_Deed_Land_7/12.pdf', uploadDate: new Date('2023-12-10'), status: 'Analyzed', type: 'Deed' },
  { id: '4', name: 'Affidavit_Name_Change.pdf', uploadDate: new Date('2024-01-05'), status: 'Analyzed', type: 'Affidavit' },
];

const DocumentUpload: React.FC<DocumentUploadProps> = ({ language }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const filteredDocs = MOCK_DOCS.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.uploadDate.toLocaleDateString().includes(searchTerm) ||
    doc.uploadDate.toLocaleDateString('en-GB').includes(searchTerm) // Supports DD/MM/YYYY match
  );

  return (
    <div className="space-y-6">
      {/* Analyzer Section */}
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

      {/* Document History & Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{t.documents}</h3>
        
        {/* Search Bar */}
        <div className="mb-6 relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
            <input 
                type="text" 
                placeholder={t.searchDocs}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none transition"
            />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th className="px-6 py-3">{t.docName}</th>
                        <th className="px-6 py-3">{t.uploadDate}</th>
                        <th className="px-6 py-3">{t.status}</th>
                        <th className="px-6 py-3 text-right">{t.actions}</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDocs.length > 0 ? (
                        filteredDocs.map((doc) => (
                            <tr key={doc.id} className="bg-white border-b hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                                    <i className="fa-regular fa-file-pdf text-red-500 text-lg"></i>
                                    {doc.name}
                                </td>
                                <td className="px-6 py-4">
                                    {doc.uploadDate.toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        doc.status === 'Analyzed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-600 hover:text-blue-900 font-medium">
                                        {t.view}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                <i className="fa-solid fa-folder-open text-3xl mb-2 opacity-30 block"></i>
                                {t.noDocsFound}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;