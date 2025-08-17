import React, { useState } from 'react';
import { 
  Upload, 
  MessageCircle, 
  Search, 
  FileText, 
  Scale, 
  Moon, 
  Sun, 
  Settings,
  Trash2,
  Send,
  Paperclip
} from 'lucide-react';
import { BrandingConfig, AppConfig, ChatMessage, Document } from '../types';
import { useTheme } from '../hooks/useTheme';
import DocumentUpload from '../components/DocumentUpload';
import ChatInterface from '../components/ChatInterface';
import CaseSearch from '../components/CaseSearch';
import ContractAnalysis from '../components/ContractAnalysis';
import JurisprudenceSearch from '../components/JurisprudenceSearch';

interface MainPageProps {
  branding: BrandingConfig;
  appConfig: AppConfig;
}

type ActiveFeature = 'chat' | 'upload' | 'case-search' | 'contract' | 'jurisprudence' | null;

const MainPage: React.FC<MainPageProps> = ({ branding, appConfig }) => {
  const { isDark, toggleTheme } = useTheme();
  const [activeFeature, setActiveFeature] = useState<ActiveFeature>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Olá! Sou o ${branding.appName}, seu assistente jurídico inteligente. Como posso ajudá-lo hoje?`,
      timestamp: new Date(),
    }
  ]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  const features = [
    {
      id: 'upload' as ActiveFeature,
      title: 'Upload de Documento',
      icon: Upload,
      description: 'Envie documentos para análise',
      enabled: appConfig.features.documentAnalysis,
    },
    {
      id: 'case-search' as ActiveFeature,
      title: 'Busca de Processos',
      icon: Search,
      description: 'Consulte processos nos tribunais',
      enabled: appConfig.features.caseSearch,
    },
    {
      id: 'contract' as ActiveFeature,
      title: 'Análise de Contratos',
      icon: FileText,
      description: 'Analise contratos conforme a lei brasileira',
      enabled: appConfig.features.contractAnalysis,
    },
    {
      id: 'jurisprudence' as ActiveFeature,
      title: 'Jurisprudência',
      icon: Scale,
      description: 'Pesquise precedentes e decisões',
      enabled: appConfig.features.jurisprudenceSearch,
    },
  ];

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Entendi sua solicitação. Como posso ajudá-lo com isso?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: `Olá! Sou o ${branding.appName}, seu assistente jurídico inteligente. Como posso ajudá-lo hoje?`,
        timestamp: new Date(),
      }
    ]);
  };

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'upload':
        return (
          <DocumentUpload
            documents={documents}
            onDocumentsChange={setDocuments}
            appConfig={appConfig}
          />
        );
      case 'case-search':
        return <CaseSearch courts={appConfig.courts} />;
      case 'contract':
        return <ContractAnalysis documents={documents} />;
      case 'jurisprudence':
        return <JurisprudenceSearch />;
      default:
        return (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            currentMessage={currentMessage}
            onMessageChange={setCurrentMessage}
            onClearChat={clearChat}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-secondary/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {branding.logo && (
              <img 
                src={branding.logo} 
                alt={branding.appName} 
                className="h-8 w-8 object-contain"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-text">{branding.appName}</h1>
              <p className="text-sm text-text-secondary">{branding.tagline}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary/10 transition-colors"
              title={isDark ? 'Modo Claro' : 'Modo Escuro'}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="p-2 rounded-lg hover:bg-secondary/10 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-80 bg-surface border-r border-secondary/20 p-6">
          <div className="space-y-4">
            {/* Chat Button */}
            <button
              onClick={() => setActiveFeature('chat')}
              className={`w-full flex items-center space-x-3 p-4 rounded-lg transition-colors ${
                activeFeature === 'chat'
                  ? 'bg-primary text-white'
                  : 'bg-background hover:bg-secondary/10 text-text'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Chat</div>
                <div className="text-sm opacity-75">Converse com a IA</div>
              </div>
            </button>

            {/* Feature Buttons */}
            {features.map((feature) => {
              if (!feature.enabled) return null;
              
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`w-full flex items-center space-x-3 p-4 rounded-lg transition-colors ${
                    activeFeature === feature.id
                      ? 'bg-primary text-white'
                      : 'bg-background hover:bg-secondary/10 text-text'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{feature.title}</div>
                    <div className="text-sm opacity-75">{feature.description}</div>
                  </div>
                </button>
              );
            })}

            {/* Clear Chat Button */}
            {activeFeature === 'chat' && (
              <button
                onClick={clearChat}
                className="w-full flex items-center space-x-3 p-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Limpar Chat</div>
                  <div className="text-sm opacity-75">Nova conversa</div>
                </div>
              </button>
            )}
          </div>

          {/* Documents Panel */}
          {documents.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-text mb-4">Documentos Carregados</h3>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center space-x-2 p-2 rounded bg-background"
                  >
                    <Paperclip className="w-4 h-4 text-secondary" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text truncate">
                        {doc.name}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {(doc.size / 1024 / 1024).toFixed(1)} MB
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      doc.status === 'ready' ? 'bg-green-500' :
                      doc.status === 'processing' ? 'bg-yellow-500' :
                      doc.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {renderFeatureContent()}
        </main>
      </div>
    </div>
  );
};

export default MainPage;