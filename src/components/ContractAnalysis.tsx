import React, { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle, Lightbulb, Scale, TrendingUp } from 'lucide-react';
import { Document, ContractAnalysisResult } from '../types';

interface ContractAnalysisProps {
  documents: Document[];
}

const ContractAnalysis: React.FC<ContractAnalysisProps> = ({ documents }) => {
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ContractAnalysisResult | null>(null);

  const contractDocuments = documents.filter(doc => 
    doc.status === 'ready' && 
    (doc.name.toLowerCase().includes('contrato') || 
     doc.name.toLowerCase().includes('contract') ||
     doc.type.includes('pdf') ||
     doc.type.includes('word'))
  );

  const handleAnalyze = async () => {
    if (!selectedDocument) return;

    setIsAnalyzing(true);
    
    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockResult: ContractAnalysisResult = {
        summary: 'Este contrato de prestação de serviços apresenta estrutura adequada, mas contém algumas cláusulas que merecem atenção especial conforme a legislação brasileira.',
        score: 75,
        risks: [
          {
            id: '1',
            severity: 'high',
            description: 'Cláusula de multa excessiva que pode ser considerada abusiva',
            clause: 'Cláusula 8.2 - Multa de 50% sobre o valor total do contrato',
            recommendation: 'Reduzir a multa para no máximo 10% conforme jurisprudência do STJ'
          },
          {
            id: '2',
            severity: 'medium',
            description: 'Ausência de cláusula de força maior',
            clause: 'Todo o contrato',
            recommendation: 'Incluir cláusula específica sobre casos fortuitos e força maior'
          },
          {
            id: '3',
            severity: 'low',
            description: 'Prazo de pagamento pode ser mais específico',
            clause: 'Cláusula 5.1',
            recommendation: 'Especificar se são dias úteis ou corridos'
          }
        ],
        suggestions: [
          {
            id: '1',
            type: 'improvement',
            description: 'Melhorar redação da cláusula de rescisão',
            clause: 'Cláusula 9.1',
            newText: 'O presente contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio de 30 (trinta) dias, sem prejuízo das obrigações já assumidas.'
          },
          {
            id: '2',
            type: 'addition',
            description: 'Adicionar cláusula de confidencialidade',
            clause: 'Nova cláusula',
            newText: 'As partes se comprometem a manter sigilo sobre todas as informações confidenciais trocadas durante a vigência deste contrato.'
          }
        ],
        compliance: [
          {
            id: '1',
            law: 'Código Civil',
            article: 'Art. 421',
            status: 'compliant',
            description: 'Função social do contrato respeitada'
          },
          {
            id: '2',
            law: 'Código de Defesa do Consumidor',
            article: 'Art. 51, IV',
            status: 'non-compliant',
            description: 'Cláusula de multa pode ser considerada excessivamente onerosa'
          },
          {
            id: '3',
            law: 'Lei 13.874/2019',
            article: 'Art. 421-A',
            status: 'compliant',
            description: 'Liberdade contratual preservada'
          }
        ]
      };

      setAnalysisResult(mockResult);
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    }
  };

  const getComplianceColor = (status: 'compliant' | 'non-compliant' | 'unclear') => {
    switch (status) {
      case 'compliant':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'non-compliant':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'unclear':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-secondary/20">
        <h2 className="text-xl font-semibold text-text mb-2">Análise de Contratos</h2>
        <p className="text-text-secondary">
          Análise jurídica especializada conforme a legislação brasileira
        </p>
      </div>

      <div className="flex-1 p-6">
        {/* Document Selection */}
        <div className="bg-surface rounded-lg p-6 border border-secondary/20 mb-6">
          <h3 className="text-lg font-medium text-text mb-4">Selecionar Documento</h3>
          
          {contractDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">
                Nenhum documento disponível para análise.
              </p>
              <p className="text-text-secondary text-sm mt-2">
                Faça upload de um contrato na seção "Upload de Documento".
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contractDocuments.map((doc) => (
                <label
                  key={doc.id}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedDocument === doc.id
                      ? 'border-primary bg-primary/5'
                      : 'border-secondary/20 hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="document"
                    value={doc.id}
                    checked={selectedDocument === doc.id}
                    onChange={(e) => setSelectedDocument(e.target.value)}
                    className="sr-only"
                  />
                  <FileText className="w-5 h-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium text-text">{doc.name}</p>
                    <p className="text-sm text-text-secondary">
                      {(doc.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </label>
              ))}
              
              <button
                onClick={handleAnalyze}
                disabled={!selectedDocument || isAnalyzing}
                className="w-full mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Analisando contrato...</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-4 h-4" />
                    <span>Analisar Contrato</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Summary and Score */}
            <div className="bg-surface rounded-lg p-6 border border-secondary/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text">Resumo da Análise</h3>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className={`text-2xl font-bold ${getScoreColor(analysisResult.score)}`}>
                    {analysisResult.score}/100
                  </span>
                </div>
              </div>
              <p className="text-text-secondary">{analysisResult.summary}</p>
            </div>

            {/* Risks */}
            <div className="bg-surface rounded-lg p-6 border border-secondary/20">
              <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Riscos Identificados
              </h3>
              <div className="space-y-4">
                {analysisResult.risks.map((risk) => (
                  <div
                    key={risk.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(risk.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{risk.description}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        risk.severity === 'high' ? 'bg-red-200 text-red-800' :
                        risk.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }`}>
                        {risk.severity === 'high' ? 'Alto' :
                         risk.severity === 'medium' ? 'Médio' : 'Baixo'}
                      </span>
                    </div>
                    <p className="text-sm opacity-75 mb-2">
                      <strong>Cláusula:</strong> {risk.clause}
                    </p>
                    <p className="text-sm">
                      <strong>Recomendação:</strong> {risk.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-surface rounded-lg p-6 border border-secondary/20">
              <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                Sugestões de Melhoria
              </h3>
              <div className="space-y-4">
                {analysisResult.suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">
                        {suggestion.description}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        suggestion.type === 'improvement' ? 'bg-blue-200 text-blue-800' :
                        suggestion.type === 'addition' ? 'bg-green-200 text-green-800' :
                        'bg-red-200 text-red-800'
                      }`}>
                        {suggestion.type === 'improvement' ? 'Melhoria' :
                         suggestion.type === 'addition' ? 'Adição' : 'Remoção'}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      <strong>Cláusula:</strong> {suggestion.clause}
                    </p>
                    {suggestion.newText && (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <strong>Texto sugerido:</strong>
                        <p className="mt-1 italic">{suggestion.newText}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance */}
            <div className="bg-surface rounded-lg p-6 border border-secondary/20">
              <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Conformidade Legal
              </h3>
              <div className="space-y-3">
                {analysisResult.compliance.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border ${getComplianceColor(item.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.law} - {item.article}</p>
                        <p className="text-sm opacity-75">{item.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === 'compliant' ? 'bg-green-200 text-green-800' :
                        item.status === 'non-compliant' ? 'bg-red-200 text-red-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {item.status === 'compliant' ? 'Conforme' :
                         item.status === 'non-compliant' ? 'Não Conforme' : 'Incerto'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractAnalysis;