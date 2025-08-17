import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  File, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Eye,
  Brain,
  GitBranch,
  MessageSquare
} from 'lucide-react';
import { Document, AppConfig } from '../types';
import { validateFileType, validateFileSize } from '../utils/api';

interface DocumentUploadProps {
  documents: Document[];
  onDocumentsChange: (documents: Document[]) => void;
  appConfig: AppConfig;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  documents,
  onDocumentsChange,
  appConfig,
}) => {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocuments: Document[] = [];

    acceptedFiles.forEach((file) => {
      // Validate file type and size
      if (!validateFileType(file, appConfig.fileUpload.allowedTypes)) {
        alert(`Tipo de arquivo não suportado: ${file.name}`);
        return;
      }

      if (!validateFileSize(file, appConfig.fileUpload.maxSize)) {
        alert(`Arquivo muito grande: ${file.name}. Tamanho máximo: ${appConfig.fileUpload.maxSize / 1024 / 1024}MB`);
        return;
      }

      const document: Document = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        status: 'uploading',
      };

      newDocuments.push(document);

      // Simulate upload progress
      simulateUpload(document.id, file);
    });

    if (newDocuments.length > 0) {
      onDocumentsChange([...documents, ...newDocuments]);
    }
  }, [documents, onDocumentsChange, appConfig]);

  const simulateUpload = async (documentId: string, file: File) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      setUploadProgress(prev => ({ ...prev, [documentId]: progress }));
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update document status to processing
    onDocumentsChange(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: 'processing' }
          : doc
      )
    );

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update document status to ready with mock analysis
    onDocumentsChange(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              status: 'ready',
              analysis: {
                summary: 'Este documento foi analisado com sucesso. Contém informações relevantes sobre o caso.',
                keyPoints: [
                  'Contrato de prestação de serviços',
                  'Prazo de vigência: 12 meses',
                  'Valor total: R$ 50.000,00',
                  'Cláusula de rescisão antecipada'
                ],
                parties: ['Empresa A Ltda.', 'Empresa B S.A.'],
                dates: ['01/01/2024', '31/12/2024'],
                obligations: [
                  'Prestação de serviços de consultoria',
                  'Pagamento mensal até o dia 10',
                  'Relatórios mensais de atividades'
                ],
                risks: [
                  'Cláusula de multa elevada',
                  'Ausência de cláusula de força maior'
                ]
              }
            }
          : doc
      )
    );

    // Clear upload progress
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[documentId];
      return newProgress;
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: appConfig.fileUpload.maxFiles,
  });

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'uploading':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <File className="w-4 h-4 text-secondary" />;
    }
  };

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'uploading':
        return 'Enviando...';
      case 'processing':
        return 'Processando...';
      case 'ready':
        return 'Pronto';
      case 'error':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  const handleAnalyze = (document: Document, analysisType: string) => {
    // This would trigger the specific analysis
    console.log(`Analyzing document ${document.id} with type ${analysisType}`);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-secondary/20">
        <h2 className="text-xl font-semibold text-text mb-2">Upload de Documentos</h2>
        <p className="text-text-secondary">
          Envie documentos para análise jurídica inteligente
        </p>
      </div>

      <div className="flex-1 p-6">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-secondary/30 hover:border-primary/50 hover:bg-primary/5'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-secondary mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-primary font-medium">Solte os arquivos aqui...</p>
          ) : (
            <div>
              <p className="text-text font-medium mb-2">
                Clique para selecionar ou arraste arquivos aqui
              </p>
              <p className="text-text-secondary text-sm">
                Suporte para PDF, DOC, DOCX, TXT (máx. {appConfig.fileUpload.maxSize / 1024 / 1024}MB)
              </p>
            </div>
          )}
        </div>

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-text mb-4">Documentos</h3>
            <div className="space-y-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="bg-surface rounded-lg p-4 border border-secondary/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <h4 className="font-medium text-text">{document.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-text-secondary">
                          <span>{(document.size / 1024 / 1024).toFixed(1)} MB</span>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(document.status)}
                            <span>{getStatusText(document.status)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {document.status === 'ready' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedDocument(document)}
                          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          title="Visualizar Análise"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAnalyze(document, 'synthesis')}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                          title="Síntese"
                        >
                          <Brain className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAnalyze(document, 'mindmap')}
                          className="p-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
                          title="Mapa Mental"
                        >
                          <GitBranch className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAnalyze(document, 'qa')}
                          className="p-2 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors"
                          title="Perguntas e Respostas"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {uploadProgress[document.id] !== undefined && (
                    <div className="mt-3">
                      <div className="w-full bg-secondary/20 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[document.id]}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Analysis Modal */}
        {selectedDocument && selectedDocument.analysis && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-secondary/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-text">
                    Análise: {selectedDocument.name}
                  </h3>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="text-secondary hover:text-text"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-medium text-text mb-2">Resumo</h4>
                  <p className="text-text-secondary">{selectedDocument.analysis.summary}</p>
                </div>

                <div>
                  <h4 className="font-medium text-text mb-2">Pontos-Chave</h4>
                  <ul className="list-disc list-inside space-y-1 text-text-secondary">
                    {selectedDocument.analysis.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-text mb-2">Partes Envolvidas</h4>
                    <ul className="space-y-1 text-text-secondary">
                      {selectedDocument.analysis.parties.map((party, index) => (
                        <li key={index}>• {party}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-text mb-2">Datas Importantes</h4>
                    <ul className="space-y-1 text-text-secondary">
                      {selectedDocument.analysis.dates.map((date, index) => (
                        <li key={index}>• {date}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-text mb-2">Obrigações</h4>
                  <ul className="list-disc list-inside space-y-1 text-text-secondary">
                    {selectedDocument.analysis.obligations.map((obligation, index) => (
                      <li key={index}>{obligation}</li>
                    ))}
                  </ul>
                </div>

                {selectedDocument.analysis.risks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-text mb-2 text-red-600">Riscos Identificados</h4>
                    <ul className="list-disc list-inside space-y-1 text-red-600">
                      {selectedDocument.analysis.risks.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;