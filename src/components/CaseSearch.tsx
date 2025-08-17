import React, { useState } from 'react';
import { Search, Calendar, Clock, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { Court, CaseInfo } from '../types';

interface CaseSearchProps {
  courts: Court[];
}

const CaseSearch: React.FC<CaseSearchProps> = ({ courts }) => {
  const [caseNumber, setCaseNumber] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!caseNumber.trim() || !selectedCourt) {
      setError('Por favor, informe o número do processo e selecione o tribunal.');
      return;
    }

    setIsSearching(true);
    setError('');
    setCaseInfo(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock case data
      const mockCaseInfo: CaseInfo = {
        number: caseNumber,
        court: courts.find(c => c.id === selectedCourt)?.name || selectedCourt,
        status: 'Em andamento',
        parties: ['João Silva', 'Empresa XYZ Ltda.'],
        subject: 'Ação de Cobrança',
        lastUpdate: new Date(),
        timeline: [
          {
            id: '1',
            date: new Date('2024-01-15'),
            description: 'Distribuição do processo',
            type: 'filing'
          },
          {
            id: '2',
            date: new Date('2024-02-01'),
            description: 'Citação da parte requerida',
            type: 'filing'
          },
          {
            id: '3',
            date: new Date('2024-02-20'),
            description: 'Apresentação de contestação',
            type: 'filing'
          },
          {
            id: '4',
            date: new Date('2024-03-10'),
            description: 'Audiência de conciliação designada',
            type: 'hearing'
          }
        ],
        deadlines: [
          {
            id: '1',
            date: new Date('2024-03-10'),
            description: 'Audiência de conciliação',
            priority: 'high',
            completed: false
          },
          {
            id: '2',
            date: new Date('2024-03-25'),
            description: 'Prazo para manifestação sobre documentos',
            priority: 'medium',
            completed: false
          }
        ]
      };

      setCaseInfo(mockCaseInfo);
    } catch (err) {
      setError('Erro ao buscar informações do processo. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'decision':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'hearing':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'filing':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case 'deadline':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-secondary/20">
        <h2 className="text-xl font-semibold text-text mb-2">Busca de Processos</h2>
        <p className="text-text-secondary">
          Consulte informações de processos nos tribunais brasileiros
        </p>
      </div>

      <div className="flex-1 p-6">
        {/* Search Form */}
        <div className="bg-surface rounded-lg p-6 border border-secondary/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Número do Processo
              </label>
              <input
                type="text"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="Ex: 1234567-89.2024.8.26.0001"
                className="w-full px-4 py-3 rounded-lg border border-secondary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Tribunal
              </label>
              <select
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-secondary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Selecione o tribunal</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Buscar Processo</span>
              </>
            )}
          </button>
        </div>

        {/* Case Information */}
        {caseInfo && (
          <div className="space-y-6">
            {/* Case Overview */}
            <div className="bg-surface rounded-lg p-6 border border-secondary/20">
              <h3 className="text-lg font-semibold text-text mb-4">Informações do Processo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Número</label>
                  <p className="text-text font-mono">{caseInfo.number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Tribunal</label>
                  <p className="text-text">{caseInfo.court}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Status</label>
                  <p className="text-text">{caseInfo.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Assunto</label>
                  <p className="text-text">{caseInfo.subject}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="text-sm font-medium text-text-secondary">Partes</label>
                <div className="mt-1">
                  {caseInfo.parties.map((party, index) => (
                    <span key={index} className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-sm mr-2 mb-1">
                      {party}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Deadlines */}
            <div className="bg-surface rounded-lg p-6 border border-secondary/20">
              <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                Prazos Importantes
              </h3>
              <div className="space-y-3">
                {caseInfo.deadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className={`p-3 rounded-lg border ${getPriorityColor(deadline.priority)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{deadline.description}</p>
                        <p className="text-sm opacity-75">{formatDate(deadline.date)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          deadline.priority === 'high' ? 'bg-red-200 text-red-800' :
                          deadline.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-green-200 text-green-800'
                        }`}>
                          {deadline.priority === 'high' ? 'Alta' :
                           deadline.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                        {deadline.completed && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-surface rounded-lg p-6 border border-secondary/20">
              <h3 className="text-lg font-semibold text-text mb-4">Histórico do Processo</h3>
              <div className="space-y-4">
                {caseInfo.timeline.map((event, index) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-text font-medium">{event.description}</p>
                      <p className="text-text-secondary text-sm">{formatDate(event.date)}</p>
                    </div>
                    {index < caseInfo.timeline.length - 1 && (
                      <div className="absolute left-[22px] mt-6 w-0.5 h-8 bg-secondary/30" />
                    )}
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

export default CaseSearch;