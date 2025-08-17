import os
import logging
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json
import re

logger = logging.getLogger(__name__)

class JurisprudenceService:
    """Service for Brazilian jurisprudence search and analysis"""
    
    def __init__(self):
        self.api_key = os.getenv('JURISPRUDENCE_API_KEY')
        self.base_url = os.getenv('JURISPRUDENCE_BASE_URL', 'https://jurisprudencia.stf.jus.br')
        self.timeout = 30
        self.cache = {}  # Simple in-memory cache
    
    def search(self, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Search for jurisprudence based on query and filters"""
        try:
            # Sanitize and validate query
            query = self._sanitize_query(query)
            if not query:
                return []
            
            # Check cache first
            cache_key = self._generate_cache_key(query, filters)
            if cache_key in self.cache:
                cached_result = self.cache[cache_key]
                if datetime.now() - cached_result['timestamp'] < timedelta(hours=2):
                    logger.info(f"Returning cached jurisprudence results for query: {query}")
                    return cached_result['data']
            
            # Perform search
            if self.api_key and self.api_key != 'your_jurisprudence_api_key_here':
                results = self._search_with_api(query, filters)
            else:
                results = self._mock_jurisprudence_search(query, filters)
            
            # Cache the results
            self.cache[cache_key] = {
                'data': results,
                'timestamp': datetime.now()
            }
            
            return results
            
        except Exception as e:
            logger.error(f"Jurisprudence search error: {e}")
            return self._mock_jurisprudence_search(query, filters)
    
    def _sanitize_query(self, query: str) -> str:
        """Sanitize search query"""
        if not query:
            return ""
        
        # Remove potentially harmful characters
        query = re.sub(r'[<>"\']', '', query)
        
        # Limit length
        query = query[:500]
        
        # Remove excessive whitespace
        query = ' '.join(query.split())
        
        return query.strip()
    
    def _generate_cache_key(self, query: str, filters: Dict[str, Any] = None) -> str:
        """Generate cache key for query and filters"""
        key_parts = [query]
        if filters:
            for key, value in sorted(filters.items()):
                if value:
                    key_parts.append(f"{key}:{value}")
        return "_".join(key_parts)
    
    def _search_with_api(self, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Search using external jurisprudence API"""
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            # Build search parameters
            params = {
                'q': query,
                'limit': 20
            }
            
            if filters:
                if filters.get('court'):
                    params['tribunal'] = filters['court']
                if filters.get('dateRange'):
                    params['periodo'] = filters['dateRange']
                if filters.get('relevance'):
                    params['relevancia'] = filters['relevance']
            
            # Make API request
            response = requests.get(
                f"{self.base_url}/api/search",
                headers=headers,
                params=params,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                return self._parse_api_response(data)
            else:
                logger.warning(f"Jurisprudence API returned status {response.status_code}")
                return self._mock_jurisprudence_search(query, filters)
                
        except requests.RequestException as e:
            logger.error(f"Jurisprudence API request error: {e}")
            return self._mock_jurisprudence_search(query, filters)
        except Exception as e:
            logger.error(f"Jurisprudence API error: {e}")
            return self._mock_jurisprudence_search(query, filters)
    
    def _parse_api_response(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Parse API response into standardized format"""
        try:
            results = []
            
            if 'results' in data:
                for item in data['results']:
                    result = {
                        'id': item.get('id', ''),
                        'court': item.get('tribunal', 'Tribunal não identificado'),
                        'date': self._parse_date(item.get('data', '')),
                        'summary': item.get('ementa', '')[:500],
                        'decision': item.get('decisao', '')[:1000],
                        'relevance': item.get('relevancia', 50),
                        'tags': self._extract_tags(item.get('ementa', '') + ' ' + item.get('decisao', ''))
                    }
                    results.append(result)
            
            return results
            
        except Exception as e:
            logger.error(f"Error parsing jurisprudence API response: {e}")
            return []
    
    def _parse_date(self, date_string: str) -> datetime:
        """Parse date string to datetime object"""
        try:
            formats = [
                '%Y-%m-%d',
                '%d/%m/%Y',
                '%Y-%m-%dT%H:%M:%S',
                '%d/%m/%Y %H:%M:%S'
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(date_string, fmt)
                except ValueError:
                    continue
            
            return datetime.now()
            
        except Exception:
            return datetime.now()
    
    def _extract_tags(self, text: str) -> List[str]:
        """Extract relevant tags from jurisprudence text"""
        try:
            text_lower = text.lower()
            
            # Common legal terms and concepts
            legal_terms = {
                'danos morais': 'Danos Morais',
                'responsabilidade civil': 'Responsabilidade Civil',
                'direito do consumidor': 'Direito do Consumidor',
                'contrato': 'Contratos',
                'inadimplemento': 'Inadimplemento',
                'rescisão': 'Rescisão Contratual',
                'indenização': 'Indenização',
                'dignidade humana': 'Dignidade Humana',
                'boa-fé': 'Boa-fé',
                'função social': 'Função Social',
                'cláusula abusiva': 'Cláusulas Abusivas',
                'direito fundamental': 'Direitos Fundamentais',
                'devido processo legal': 'Devido Processo Legal',
                'ampla defesa': 'Ampla Defesa',
                'contraditório': 'Contraditório',
                'prescrição': 'Prescrição',
                'decadência': 'Decadência'
            }
            
            tags = []
            for term, tag in legal_terms.items():
                if term in text_lower:
                    tags.append(tag)
            
            # Limit to 5 most relevant tags
            return tags[:5]
            
        except Exception:
            return ['Jurisprudência']
    
    def _mock_jurisprudence_search(self, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Mock jurisprudence search for development/fallback"""
        
        # Generate different results based on query keywords
        base_results = []
        
        if any(term in query.lower() for term in ['danos morais', 'moral']):
            base_results.extend([
                {
                    'id': '1',
                    'court': 'Superior Tribunal de Justiça',
                    'date': datetime(2024, 1, 15),
                    'summary': 'Responsabilidade civil por danos morais em relações de consumo. Configuração do dano moral presumido quando há defeito na prestação de serviço.',
                    'decision': 'RECURSO ESPECIAL. DIREITO DO CONSUMIDOR. DANOS MORAIS. DEFEITO NA PRESTAÇÃO DE SERVIÇO. DANO MORAL PRESUMIDO. O dano moral decorrente de defeito na prestação de serviço é presumido, dispensando prova específica do prejuízo, bastando a demonstração do defeito e do nexo causal.',
                    'relevance': 95,
                    'tags': ['Danos Morais', 'Direito do Consumidor', 'Responsabilidade Civil']
                },
                {
                    'id': '2',
                    'court': 'Tribunal de Justiça de São Paulo',
                    'date': datetime(2024, 2, 10),
                    'summary': 'Danos morais por negativação indevida. Valor da indenização deve observar critérios de proporcionalidade e razoabilidade.',
                    'decision': 'APELAÇÃO CÍVEL. DANOS MORAIS. NEGATIVAÇÃO INDEVIDA. QUANTUM INDENIZATÓRIO. A fixação do valor da indenização por danos morais deve observar os critérios de proporcionalidade e razoabilidade, considerando a extensão do dano e a capacidade econômica das partes.',
                    'relevance': 88,
                    'tags': ['Danos Morais', 'Negativação', 'Indenização']
                }
            ])
        
        if any(term in query.lower() for term in ['contrato', 'contractual']):
            base_results.extend([
                {
                    'id': '3',
                    'court': 'Supremo Tribunal Federal',
                    'date': datetime(2024, 3, 5),
                    'summary': 'Função social dos contratos. Limitação da autonomia privada pelos princípios constitucionais.',
                    'decision': 'AÇÃO DIRETA DE INCONSTITUCIONALIDADE. CONTRATOS. FUNÇÃO SOCIAL. AUTONOMIA PRIVADA. A função social dos contratos, prevista no art. 421 do Código Civil, impõe limitações à autonomia privada, devendo os contratos atender não apenas aos interesses das partes, mas também aos valores sociais.',
                    'relevance': 92,
                    'tags': ['Contratos', 'Função Social', 'Autonomia Privada']
                }
            ])
        
        if any(term in query.lower() for term in ['consumidor', 'cdc']):
            base_results.extend([
                {
                    'id': '4',
                    'court': 'Superior Tribunal de Justiça',
                    'date': datetime(2024, 1, 20),
                    'summary': 'Relação de consumo. Inversão do ônus da prova. Aplicação do Código de Defesa do Consumidor.',
                    'decision': 'RECURSO ESPECIAL. DIREITO DO CONSUMIDOR. INVERSÃO DO ÔNUS DA PROVA. CDC. A inversão do ônus da prova prevista no art. 6º, VIII, do CDC é direito básico do consumidor e deve ser aplicada quando presentes a verossimilhança das alegações ou a hipossuficiência do consumidor.',
                    'relevance': 90,
                    'tags': ['Direito do Consumidor', 'Inversão do Ônus', 'CDC']
                }
            ])
        
        # Default results if no specific keywords found
        if not base_results:
            base_results = [
                {
                    'id': '5',
                    'court': 'Tribunal de Justiça do Rio de Janeiro',
                    'date': datetime(2024, 2, 25),
                    'summary': 'Princípio da dignidade da pessoa humana. Aplicação em casos concretos do direito civil.',
                    'decision': 'APELAÇÃO CÍVEL. DIGNIDADE DA PESSOA HUMANA. DIREITO CIVIL. O princípio da dignidade da pessoa humana constitui fundamento da República e deve ser observado em todas as relações jurídicas, inclusive nas de direito privado.',
                    'relevance': 85,
                    'tags': ['Dignidade Humana', 'Direitos Fundamentais']
                },
                {
                    'id': '6',
                    'court': 'Tribunal Regional Federal da 3ª Região',
                    'date': datetime(2024, 3, 15),
                    'summary': 'Devido processo legal. Garantias constitucionais do processo.',
                    'decision': 'APELAÇÃO. DEVIDO PROCESSO LEGAL. GARANTIAS CONSTITUCIONAIS. O devido processo legal compreende não apenas o aspecto formal (procedural due process), mas também o aspecto material (substantive due process), garantindo a justiça das decisões.',
                    'relevance': 82,
                    'tags': ['Devido Processo Legal', 'Garantias Constitucionais']
                }
            ]
        
        # Apply filters
        if filters:
            if filters.get('court'):
                court_filter = filters['court']
                base_results = [r for r in base_results if court_filter in r['court'].lower()]
            
            if filters.get('relevance'):
                min_relevance = {
                    'high': 90,
                    'medium': 70,
                    'low': 50
                }.get(filters['relevance'], 0)
                base_results = [r for r in base_results if r['relevance'] >= min_relevance]
        
        # Sort by relevance
        base_results.sort(key=lambda x: x['relevance'], reverse=True)
        
        return base_results[:10]  # Limit to 10 results
    
    def get_related_cases(self, case_id: str) -> List[Dict[str, Any]]:
        """Get cases related to a specific jurisprudence entry"""
        try:
            # This would normally query for related cases
            return [
                {
                    'id': f"related_{case_id}_1",
                    'court': 'Superior Tribunal de Justiça',
                    'date': datetime(2023, 12, 10),
                    'summary': 'Caso relacionado com temática similar',
                    'relevance': 75
                }
            ]
        except Exception as e:
            logger.error(f"Error getting related cases: {e}")
            return []
    
    def get_jurisprudence_trends(self) -> Dict[str, Any]:
        """Get trending topics in jurisprudence"""
        try:
            return {
                'trending_topics': [
                    {'topic': 'Danos Morais', 'count': 1250, 'growth': '+15%'},
                    {'topic': 'Direito do Consumidor', 'count': 980, 'growth': '+8%'},
                    {'topic': 'Contratos', 'count': 750, 'growth': '+12%'},
                    {'topic': 'Responsabilidade Civil', 'count': 650, 'growth': '+5%'}
                ],
                'most_cited_courts': [
                    {'court': 'STJ', 'citations': 2500},
                    {'court': 'STF', 'citations': 1800},
                    {'court': 'TJSP', 'citations': 1200}
                ],
                'last_updated': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting jurisprudence trends: {e}")
            return {'error': str(e)}
    
    def clear_cache(self):
        """Clear the jurisprudence search cache"""
        self.cache.clear()
        logger.info("Jurisprudence search cache cleared")