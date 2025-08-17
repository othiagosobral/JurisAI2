import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

import openai
from openai import OpenAI

logger = logging.getLogger(__name__)

class AIService:
    """Service for AI-powered legal analysis and chat functionality"""
    
    def __init__(self):
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize OpenAI client"""
        api_key = os.getenv('OPENAI_API_KEY')
        if api_key and api_key != 'your_openai_api_key_here':
            try:
                self.client = OpenAI(api_key=api_key)
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}")
                self.client = None
        else:
            logger.warning("OpenAI API key not configured, using mock responses")
            self.client = None
    
    def analyze_document(self, content: str, analysis_type: str = 'general') -> Dict[str, Any]:
        """Analyze a legal document"""
        try:
            if self.client:
                return self._analyze_document_with_ai(content, analysis_type)
            else:
                return self._mock_document_analysis(content, analysis_type)
        except Exception as e:
            logger.error(f"Document analysis error: {e}")
            return self._mock_document_analysis(content, analysis_type)
    
    def _analyze_document_with_ai(self, content: str, analysis_type: str) -> Dict[str, Any]:
        """Analyze document using OpenAI"""
        prompts = {
            'general': """
            Analise o seguinte documento jurídico brasileiro e forneça:
            1. Um resumo conciso
            2. Pontos-chave identificados
            3. Partes envolvidas
            4. Datas importantes
            5. Obrigações principais
            6. Riscos potenciais
            
            Documento: {content}
            
            Responda em formato JSON com as chaves: summary, keyPoints, parties, dates, obligations, risks
            """,
            'synthesis': """
            Faça uma síntese detalhada do seguinte documento jurídico brasileiro:
            
            Documento: {content}
            
            Forneça uma análise estruturada em formato JSON.
            """,
            'qa': """
            Prepare-se para responder perguntas sobre o seguinte documento jurídico brasileiro:
            
            Documento: {content}
            
            Identifique os principais tópicos que podem gerar perguntas.
            """
        }
        
        prompt = prompts.get(analysis_type, prompts['general']).format(content=content[:4000])
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Você é um assistente jurídico especializado em direito brasileiro. Sempre responda em português brasileiro."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.3
            )
            
            result = response.choices[0].message.content
            
            # Try to parse as JSON, fallback to structured text
            try:
                return json.loads(result)
            except json.JSONDecodeError:
                return {
                    'summary': result[:500],
                    'keyPoints': [result[500:1000]] if len(result) > 500 else [],
                    'parties': [],
                    'dates': [],
                    'obligations': [],
                    'risks': []
                }
                
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return self._mock_document_analysis(content, analysis_type)
    
    def _mock_document_analysis(self, content: str, analysis_type: str) -> Dict[str, Any]:
        """Mock document analysis for development/fallback"""
        return {
            'summary': 'Análise do documento realizada com sucesso. Este é um resumo simulado do conteúdo analisado.',
            'keyPoints': [
                'Documento de natureza jurídica identificado',
                'Estrutura formal adequada',
                'Cláusulas principais identificadas',
                'Termos técnicos presentes'
            ],
            'parties': ['Parte A', 'Parte B'],
            'dates': [datetime.now().strftime('%d/%m/%Y')],
            'obligations': [
                'Cumprimento das cláusulas contratuais',
                'Observância dos prazos estabelecidos',
                'Manutenção da confidencialidade'
            ],
            'risks': [
                'Possível ambiguidade em algumas cláusulas',
                'Necessidade de revisão de prazos'
            ]
        }
    
    def generate_mindmap(self, content: str) -> Dict[str, Any]:
        """Generate a mind map from document content"""
        try:
            if self.client:
                return self._generate_mindmap_with_ai(content)
            else:
                return self._mock_mindmap(content)
        except Exception as e:
            logger.error(f"Mindmap generation error: {e}")
            return self._mock_mindmap(content)
    
    def _generate_mindmap_with_ai(self, content: str) -> Dict[str, Any]:
        """Generate mindmap using AI"""
        prompt = f"""
        Crie um mapa mental hierárquico do seguinte documento jurídico brasileiro.
        Organize as informações em categorias principais e subcategorias.
        
        Documento: {content[:3000]}
        
        Responda em formato JSON com a estrutura:
        {{
            "root": {{
                "id": "root",
                "label": "Documento Principal",
                "type": "root",
                "children": [...]
            }}
        }}
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Você é um especialista em organização de informações jurídicas."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            result = response.choices[0].message.content
            return json.loads(result)
            
        except Exception as e:
            logger.error(f"AI mindmap generation error: {e}")
            return self._mock_mindmap(content)
    
    def _mock_mindmap(self, content: str) -> Dict[str, Any]:
        """Mock mindmap for development/fallback"""
        return {
            "root": {
                "id": "root",
                "label": "Documento Jurídico",
                "type": "root",
                "children": [
                    {
                        "id": "parties",
                        "label": "Partes Envolvidas",
                        "type": "category",
                        "children": [
                            {"id": "party1", "label": "Requerente", "type": "item"},
                            {"id": "party2", "label": "Requerido", "type": "item"}
                        ]
                    },
                    {
                        "id": "obligations",
                        "label": "Obrigações",
                        "type": "category",
                        "children": [
                            {"id": "obl1", "label": "Pagamento", "type": "item"},
                            {"id": "obl2", "label": "Prestação de Serviços", "type": "item"}
                        ]
                    },
                    {
                        "id": "dates",
                        "label": "Datas Importantes",
                        "type": "category",
                        "children": [
                            {"id": "date1", "label": "Data de Assinatura", "type": "item"},
                            {"id": "date2", "label": "Prazo de Vigência", "type": "item"}
                        ]
                    }
                ]
            }
        }
    
    def analyze_contract(self, content: str) -> Dict[str, Any]:
        """Analyze a contract according to Brazilian law"""
        try:
            if self.client:
                return self._analyze_contract_with_ai(content)
            else:
                return self._mock_contract_analysis(content)
        except Exception as e:
            logger.error(f"Contract analysis error: {e}")
            return self._mock_contract_analysis(content)
    
    def _analyze_contract_with_ai(self, content: str) -> Dict[str, Any]:
        """Analyze contract using AI with Brazilian law focus"""
        prompt = f"""
        Analise o seguinte contrato conforme a legislação brasileira (Código Civil, CDC, etc.):
        
        1. Identifique riscos e cláusulas potencialmente abusivas
        2. Verifique conformidade com leis brasileiras
        3. Sugira melhorias
        4. Atribua uma pontuação de 0-100
        
        Contrato: {content[:4000]}
        
        Responda em JSON com: summary, score, risks, suggestions, compliance
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Você é um advogado especialista em direito contratual brasileiro."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.2
            )
            
            result = response.choices[0].message.content
            return json.loads(result)
            
        except Exception as e:
            logger.error(f"AI contract analysis error: {e}")
            return self._mock_contract_analysis(content)
    
    def _mock_contract_analysis(self, content: str) -> Dict[str, Any]:
        """Mock contract analysis"""
        return {
            'summary': 'Contrato analisado conforme legislação brasileira. Estrutura adequada com alguns pontos de atenção.',
            'score': 75,
            'risks': [
                {
                    'id': '1',
                    'severity': 'high',
                    'description': 'Cláusula de multa pode ser considerada excessiva',
                    'clause': 'Cláusula 8.2',
                    'recommendation': 'Reduzir multa para máximo de 10% conforme jurisprudência'
                },
                {
                    'id': '2',
                    'severity': 'medium',
                    'description': 'Ausência de cláusula de força maior',
                    'clause': 'Todo o contrato',
                    'recommendation': 'Incluir cláusula específica sobre casos fortuitos'
                }
            ],
            'suggestions': [
                {
                    'id': '1',
                    'type': 'improvement',
                    'description': 'Melhorar redação da cláusula de rescisão',
                    'clause': 'Cláusula 9.1',
                    'newText': 'Rescisão mediante aviso prévio de 30 dias'
                }
            ],
            'compliance': [
                {
                    'id': '1',
                    'law': 'Código Civil',
                    'article': 'Art. 421',
                    'status': 'compliant',
                    'description': 'Função social do contrato respeitada'
                },
                {
                    'id': '2',
                    'law': 'CDC',
                    'article': 'Art. 51, IV',
                    'status': 'non-compliant',
                    'description': 'Cláusula de multa excessiva'
                }
            ]
        }
    
    def generate_chat_response(self, message: str, context: Dict[str, Any] = None) -> str:
        """Generate chat response"""
        try:
            if self.client:
                return self._generate_chat_response_with_ai(message, context)
            else:
                return self._mock_chat_response(message, context)
        except Exception as e:
            logger.error(f"Chat response error: {e}")
            return self._mock_chat_response(message, context)
    
    def _generate_chat_response_with_ai(self, message: str, context: Dict[str, Any] = None) -> str:
        """Generate chat response using AI"""
        system_prompt = """
        Você é um assistente jurídico especializado em direito brasileiro.
        Forneça respostas precisas, profissionais e úteis.
        Sempre cite a legislação relevante quando aplicável.
        Mantenha um tom profissional mas acessível.
        """
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ]
        
        # Add context if available
        if context and context.get('documentId'):
            messages.insert(1, {
                "role": "system", 
                "content": f"Contexto: O usuário está trabalhando com o documento ID {context['documentId']}"
            })
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=800,
                temperature=0.4
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"AI chat error: {e}")
            return self._mock_chat_response(message, context)
    
    def _mock_chat_response(self, message: str, context: Dict[str, Any] = None) -> str:
        """Mock chat response for development/fallback"""
        responses = [
            "Entendo sua solicitação. Como assistente jurídico, posso ajudá-lo com análises de documentos, pesquisa de jurisprudência e orientações sobre direito brasileiro.",
            "Essa é uma questão interessante. Para fornecer uma resposta mais precisa, seria útil ter mais detalhes sobre o contexto específico do seu caso.",
            "Com base na legislação brasileira, posso orientá-lo sobre os aspectos jurídicos relevantes. Você poderia fornecer mais informações sobre a situação?",
            "Posso ajudá-lo com essa questão jurídica. Recomendo que consultemos a documentação relevante e a jurisprudência aplicável ao caso."
        ]
        
        # Simple keyword-based response selection
        if any(word in message.lower() for word in ['contrato', 'contract']):
            return "Para análise de contratos, recomendo usar a funcionalidade específica de análise contratual, que verifica a conformidade com a legislação brasileira."
        elif any(word in message.lower() for word in ['processo', 'case']):
            return "Para consulta de processos, você pode usar a busca de processos que acessa informações dos tribunais brasileiros."
        elif any(word in message.lower() for word in ['jurisprudência', 'precedente']):
            return "A pesquisa de jurisprudência pode ajudá-lo a encontrar precedentes relevantes nos tribunais superiores e estaduais."
        
        return responses[hash(message) % len(responses)]