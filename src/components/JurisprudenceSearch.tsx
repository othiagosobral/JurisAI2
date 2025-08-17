import React, { useState } from 'react';
import { Search, Scale, Calendar, TrendingUp, BookOpen, Filter } from 'lucide-react';
import { JurisprudenceResult } from '../types';

const JurisprudenceSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    court: '',
    dateRange: '',
    relevance: 'high'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<JurisprudenceResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const courts = [
    { id: 'stf', name: 'Supremo Tribunal Federal' },
    { id: 'stj', name: 'Superior Tribunal de Justiça' },
    { id: 'tst', name: 'Tribunal Superior do Trabalho' },
    { id: 'tjsp', name: 'Tribunal de Justiça de São Paulo' },
    { id: 'tjrj', name: 'Tribunal de Justiça do Rio de Janeiro' },
    { id: 'tjmg', name: 'Tribunal de Justiça de Minas Gerais' },
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResults: JurisprudenceResult[] = [
        {
          id: '1',
          court: 'Superior Tribunal de Justiça',
          date: new Date('2024-01-15'),
          summary: 'Responsabilidade civil por danos morais em relações de consumo. Configuração do dano moral presumido.',
          decision: 'RECURSO ESPECIAL. DIREITO DO CONSUMIDOR. DANOS MORAIS. CONFIGURAÇÃO. O dano moral decorrente de defeito na prestação de serviço é presumido, dispensando prova específica do prejuízo.',
          relevance: 95,
          tags: ['Danos Morais', 'Direito do Consumidor', 'Responsabilidade Civil']
        },
        {
          id: '2',
          court: 'Supremo Tribunal Federal',
          date: new Date('2024-02-20'),
          summary: 'Princípio da dignidade da pessoa humana. Aplicação em contratos de adesão.',
          decision: 'AÇÃO DIRETA DE INCONSTITUCIONALIDADE. CONTRATOS DE ADESÃO. CLÁUSULAS ABUSIVAS. A dignidade da pessoa humana impõe limites à autonomia privada.',
          relevance: 88,
          tags: ['Dignidade Humana', 'Contratos', 'Cláusulas Abusivas']
        },
        {
          id: '3',
          court: 'Tribunal de Justiça de São Paulo',
          date: new Date('2024-03-10'),
          summary: 'Rescisão contratual por inadimplemento. Aplicação da teoria do adimplemento substancial.',
          decision: 'APELAÇÃO CÍVEL. RESCISÃO CONTRATUAL. INADIMPLEMENTO. A teoria do adimplemento substancial impede a rescisão quando o descumprimento é mínimo.',
          relevance: 82,
          tags: ['Rescisão Contratual', 'Inadimplemento', 'Adimplemento Substancial']
        }
      ];

      setResults(mockResults);
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (relevance >= 70) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-secondary/20">
        <h2 className="text-xl font-semibold text-text mb-2">Pesquisa de Jurisprudência</h2>
        <p className="text-text-secondary">
          Encontre precedentes e decisões relevantes dos tribunais brasileiros
        </p>
      </div>

      <div className="flex-1 p-6">
        {/* Search Form */}
        <div className="bg-surface rounded-lg p-6 border border-secondary/20 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ex: responsabilidade civil danos morais consumidor"
                className="w-full px-4 py-3 rounded-lg border border-secondary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-lg border transition-colors ${
                showFilters 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-secondary/20 hover:border-primary/50'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </>
              )}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-secondary/20">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Tribunal
                </label>
                <select
                  value={filters.court}
                  onChange={(e) => setFilters(prev => ({ ...prev, court: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-secondary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todos os tribunais</option>
                  {courts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Período
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-secondary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Qualquer período</option>
                  <option value="1year">Último ano</option>
                  <option value="2years">Últimos 2 anos</option>
                  <option value="5years">Últimos 5 anos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Relevância Mínima
                </label>
                <select
                  value={filters.relevance}
                  onChange={(e) => setFilters(prev => ({ ...prev, relevance: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-secondary/20 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="any">Qualquer</option>
                  <option value="high">Alta (90%+)</option>
                  <option value="medium">Média (70%+)</option>
                  <option value="low">Baixa (50%+)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">
                Resultados da Pesquisa ({results.length})
              </h3>
              <div className="text-sm text-text-secondary">
                Ordenado por relevância
              </div>
            </div>

            {results.map((result) => (
              <div
                key={result.id}
                className="bg-surface rounded-lg p-6 border border-secondary/20 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Scale className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-text">{result.court}</h4>
                      <div className="flex items-center space-x-1 text-text-secondary text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(result.date)}</span>
                      </div>
                    </div>
                    <p className="text-text-secondary mb-3">{result.summary}</p>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRelevanceColor(result.relevance)}`}>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{result.relevance}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="font-medium text-text">Decisão</span>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {result.decision}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <button className="text-primary hover:text-primary/80 text-sm font-medium">
                    Ver decisão completa →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && !isSearching && (
          <div className="text-center py-12">
            <Scale className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text mb-2">
              Pesquise por jurisprudência
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Digite termos relacionados ao seu caso para encontrar precedentes e decisões relevantes dos tribunais brasileiros.
            </p>
            <div className="mt-6 text-sm text-text-secondary">
              <p className="mb-2"><strong>Dicas de pesquisa:</strong></p>
              <ul className="space-y-1">
                <li>• Use termos jurídicos específicos</li>
                <li>• Combine palavras-chave relacionadas</li>
                <li>• Utilize os filtros para refinar os resultados</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JurisprudenceSearch;