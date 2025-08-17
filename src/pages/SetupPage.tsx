import React, { useState } from 'react';
import { Upload, Palette, Type, Mail, Phone, Globe, Check } from 'lucide-react';
import { BrandingConfig, ColorScheme } from '../types';
import { useBranding } from '../hooks/useBranding';
import { useTheme } from '../hooks/useTheme';

interface SetupPageProps {
  branding: BrandingConfig;
  onComplete: () => void;
}

const SetupPage: React.FC<SetupPageProps> = ({ branding, onComplete }) => {
  const { updateBranding } = useBranding();
  const { isDark, toggleTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    appName: branding.appName,
    tagline: branding.tagline,
    logo: branding.logo,
    colors: branding.colors,
    contact: branding.contact,
  });

  const steps = [
    { title: 'Informações Básicas', icon: Type },
    { title: 'Identidade Visual', icon: Palette },
    { title: 'Contato', icon: Mail },
    { title: 'Finalização', icon: Check },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColorChange = (theme: 'light' | 'dark', colorKey: keyof ColorScheme, value: string) => {
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [theme]: {
          ...prev.colors[theme],
          [colorKey]: value
        }
      }
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleInputChange('logo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    updateBranding(formData);
    onComplete();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Nome da Aplicação
              </label>
              <input
                type="text"
                value={formData.appName}
                onChange={(e) => handleInputChange('appName', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-secondary/20 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: MeuJurisAI"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Slogan/Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-secondary/20 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Seu Assistente Jurídico Inteligente"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Logo da Aplicação
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg bg-surface border border-secondary/20 flex items-center justify-center overflow-hidden">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Upload className="w-6 h-6 text-secondary" />
                  )}
                </div>
                <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  Escolher Arquivo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-text">Esquema de Cores</h3>
                <button
                  onClick={toggleTheme}
                  className="px-3 py-1 rounded-lg bg-surface border border-secondary/20 text-sm"
                >
                  {isDark ? 'Modo Escuro' : 'Modo Claro'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(formData.colors[isDark ? 'dark' : 'light']).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-text mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(isDark ? 'dark' : 'light', key as keyof ColorScheme, e.target.value)}
                        className="w-10 h-10 rounded border border-secondary/20"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleColorChange(isDark ? 'dark' : 'light', key as keyof ColorScheme, e.target.value)}
                        className="flex-1 px-3 py-2 rounded border border-secondary/20 bg-surface text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email de Contato
              </label>
              <input
                type="email"
                value={formData.contact.email}
                onChange={(e) => handleInputChange('contact', { ...formData.contact, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-secondary/20 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="contato@exemplo.com.br"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Telefone
              </label>
              <input
                type="tel"
                value={formData.contact.phone}
                onChange={(e) => handleInputChange('contact', { ...formData.contact, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-secondary/20 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+55 11 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Website
              </label>
              <input
                type="url"
                value={formData.contact.website}
                onChange={(e) => handleInputChange('contact', { ...formData.contact, website: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-secondary/20 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://exemplo.com.br"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text mb-2">Configuração Concluída!</h3>
              <p className="text-text-secondary">
                Sua aplicação está pronta para uso. Você pode alterar essas configurações a qualquer momento nas configurações.
              </p>
            </div>
            <div className="bg-surface rounded-lg p-6 text-left">
              <h4 className="font-medium text-text mb-4">Resumo das Configurações:</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Nome:</strong> {formData.appName}</div>
                <div><strong>Slogan:</strong> {formData.tagline}</div>
                <div><strong>Email:</strong> {formData.contact.email}</div>
                <div><strong>Telefone:</strong> {formData.contact.phone}</div>
                <div><strong>Website:</strong> {formData.contact.website}</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Configuração Inicial</h1>
          <p className="text-text-secondary">
            Personalize sua aplicação jurídica de acordo com sua marca
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <React.Fragment key={index}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  isActive 
                    ? 'border-primary bg-primary text-white' 
                    : isCompleted 
                    ? 'border-primary bg-primary text-white'
                    : 'border-secondary bg-surface text-secondary'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 transition-colors ${
                    isCompleted ? 'bg-primary' : 'bg-secondary/30'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-surface rounded-xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-text mb-6">
            {steps[currentStep].title}
          </h2>
          
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 rounded-lg border border-secondary/20 text-secondary hover:bg-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Finalizar Configuração
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Próximo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;