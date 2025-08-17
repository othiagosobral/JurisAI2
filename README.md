# JurisAI2 - Assistente Jurídico Inteligente

<div align="center">
  <img src="public/logo.svg" alt="JurisAI2 Logo" width="64" height="64">
  <h3>White-label AI-powered Legal Assistant for Brazilian Attorneys</h3>
  <p>Uma solução completa e personalizável para escritórios de advocacia brasileiros</p>
</div>

## 🎯 Visão Geral

JurisAI2 é uma plataforma white-label de assistente jurídico inteligente, especialmente desenvolvida para advogados brasileiros. A aplicação oferece análise de documentos, pesquisa de jurisprudência, busca de processos e análise de contratos, tudo com foco na legislação brasileira.

### ✨ Características Principais

- **🎨 White-label Completo**: Personalize cores, logos, fontes e informações de contato
- **🤖 IA Especializada**: Análise jurídica focada no direito brasileiro
- **📄 Análise de Documentos**: Upload e análise inteligente de PDFs, DOCs e TXTs
- **🔍 Busca de Processos**: Integração com tribunais brasileiros via DataJud
- **⚖️ Pesquisa de Jurisprudência**: Busca em decisões dos tribunais superiores
- **📋 Análise de Contratos**: Verificação de conformidade com leis brasileiras
- **🗺️ Mapas Mentais**: Visualização interativa de documentos jurídicos
- **💬 Chat Inteligente**: Assistente conversacional especializado em direito

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 16+ 
- Python 3.8+
- npm ou yarn

### Instalação Automática

```bash
git clone https://github.com/othiagosobral/JurisAI2.git
cd JurisAI2
chmod +x start.sh
./start.sh
```

### Instalação Manual

1. **Clone o repositório**
   ```bash
   git clone https://github.com/othiagosobral/JurisAI2.git
   cd JurisAI2
   ```

2. **Instale as dependências do frontend**
   ```bash
   npm install
   ```

3. **Instale as dependências do backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Configure as variáveis de ambiente**
   ```bash
   cp config/.env.example config/.env
   # Edite config/.env com suas chaves de API
   ```

5. **Inicie a aplicação**
   ```bash
   # Terminal 1 - Frontend
   npm run dev
   
   # Terminal 2 - Backend  
   npm run server
   
   # Ou use o comando combinado
   npm run dev:full
   ```

## 🔧 Configuração

### Personalização White-label

A aplicação pode ser completamente personalizada através dos arquivos de configuração:

#### `config/branding.json`
```json
{
  "appName": "Seu Escritório AI",
  "tagline": "Seu slogan aqui",
  "logo": "/seu-logo.svg",
  "colors": {
    "light": {
      "primary": "#1e40af",
      "secondary": "#64748b",
      "accent": "#f59e0b"
    }
  },
  "contact": {
    "email": "contato@seuescritorio.com.br",
    "phone": "+55 11 99999-9999",
    "website": "https://seuescritorio.com.br"
  }
}
```

#### `config/app.json`
```json
{
  "features": {
    "documentAnalysis": true,
    "caseSearch": true,
    "contractAnalysis": true,
    "jurisprudenceSearch": true,
    "mindMap": true
  },
  "courts": [
    {
      "id": "tjsp",
      "name": "Tribunal de Justiça de São Paulo",
      "type": "estadual"
    }
  ]
}
```

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# APIs de IA
OPENAI_API_KEY=sua_chave_openai
ANTHROPIC_API_KEY=sua_chave_anthropic

# APIs Jurídicas
DATAJUD_API_KEY=sua_chave_datajud
JURISPRUDENCE_API_KEY=sua_chave_jurisprudencia

# Configurações de Segurança
SECRET_KEY=sua_chave_secreta
VALID_API_KEYS=chave1,chave2,chave3

# Configurações do Servidor
PORT=5000
DEBUG=false
```

## 📚 Funcionalidades Detalhadas

### 1. Análise de Documentos
- Upload de arquivos PDF, DOC, DOCX, TXT
- Extração automática de texto
- Identificação de partes, datas e obrigações
- Análise de riscos jurídicos
- Geração de resumos executivos

### 2. Busca de Processos
- Integração com DataJud (CNJ)
- Consulta por número de processo
- Histórico processual completo
- Identificação de prazos importantes
- Acompanhamento de deadlines

### 3. Pesquisa de Jurisprudência
- Busca em tribunais superiores (STF, STJ, TST)
- Filtros por tribunal, período e relevância
- Análise de precedentes
- Extração de teses jurídicas
- Ranking por relevância

### 4. Análise de Contratos
- Verificação de conformidade legal
- Identificação de cláusulas abusivas
- Sugestões de melhorias
- Score de qualidade contratual
- Compliance com CDC, Código Civil, etc.

### 5. Mapas Mentais Interativos
- Visualização hierárquica de documentos
- Navegação interativa
- Exportação em diversos formatos
- Colaboração em tempo real

## 🏗️ Arquitetura

```
JurisAI2/
├── src/                    # Frontend React + TypeScript
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── hooks/             # Custom hooks
│   ├── types/             # Definições TypeScript
│   └── utils/             # Utilitários
├── backend/               # Backend Python Flask
│   ├── services/          # Serviços de negócio
│   ├── utils/             # Utilitários do backend
│   └── app.py            # Aplicação principal
├── config/                # Arquivos de configuração
│   ├── branding.json      # Configuração visual
│   ├── app.json          # Configuração da aplicação
│   └── .env.example      # Variáveis de ambiente
└── public/               # Assets estáticos
```

### Stack Tecnológica

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS para estilização
- Vite para build e desenvolvimento
- React Router para navegação
- Lucide React para ícones

**Backend:**
- Python Flask para API REST
- OpenAI/Anthropic para IA
- PyPDF2 para processamento de PDFs
- Flask-CORS para CORS
- Flask-Limiter para rate limiting

## 🔒 Segurança

- Validação rigorosa de entrada
- Sanitização de dados
- Rate limiting por IP
- Validação de tipos de arquivo
- Logs de segurança
- Proteção contra XSS e SQL Injection

## 🧪 Testes

```bash
# Testes do frontend
npm test

# Testes do backend
cd backend
python -m pytest tests/

# Testes de integração
npm run test:integration
```

## 📦 Deploy

### Docker

```bash
# Build da imagem
docker build -t jurisai2 .

# Executar container
docker run -p 3000:3000 -p 5000:5000 jurisai2
```

### Deploy Manual

1. **Build do frontend**
   ```bash
   npm run build
   ```

2. **Configurar servidor web** (Nginx/Apache)

3. **Deploy do backend** (Gunicorn/uWSGI)
   ```bash
   cd backend
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes de Contribuição

- Siga os padrões de código estabelecidos
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário
- Use commits semânticos

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- 📧 Email: [contato@jurisai.com.br](mailto:contato@jurisai.com.br)
- 💬 Issues: [GitHub Issues](https://github.com/othiagosobral/JurisAI2/issues)
- 📖 Documentação: [Wiki do Projeto](https://github.com/othiagosobral/JurisAI2/wiki)

## 🗺️ Roadmap

- [ ] Integração com mais tribunais
- [ ] Análise de petições
- [ ] Geração automática de documentos
- [ ] Dashboard de analytics
- [ ] API pública
- [ ] Aplicativo mobile
- [ ] Integração com sistemas de gestão

## 👥 Equipe

- **Desenvolvedor Principal**: [Thiago Sobral](https://github.com/othiagosobral)

## 🙏 Agradecimentos

- Comunidade open source brasileira
- Tribunais que disponibilizam APIs públicas
- Contribuidores do projeto

---

<div align="center">
  <p>Feito com ❤️ para a comunidade jurídica brasileira</p>
  <p>© 2024 JurisAI2. Todos os direitos reservados.</p>
</div>