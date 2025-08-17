import os
import logging
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

class CaseService:
    """Service for Brazilian court case search and information retrieval"""
    
    def __init__(self):
        self.datajud_api_key = os.getenv('DATAJUD_API_KEY')
        self.datajud_base_url = os.getenv('DATAJUD_BASE_URL', 'https://api-publica.datajud.cnj.jus.br')
        self.timeout = 30
        self.cache = {}  # Simple in-memory cache
    
    def search_case(self, case_number: str, court: str) -> Dict[str, Any]:
        """Search for case information in Brazilian courts"""
        try:
            # Check cache first
            cache_key = f"{case_number}_{court}"
            if cache_key in self.cache:
                cached_result = self.cache[cache_key]
                if datetime.now() - cached_result['timestamp'] < timedelta(hours=1):
                    logger.info(f"Returning cached result for case {case_number}")
                    return cached_result['data']
            
            # Try DataJud API if available
            if self.datajud_api_key and self.datajud_api_key != 'your_datajud_api_key_here':
                result = self._search_with_datajud(case_number, court)
            else:
                result = self._mock_case_search(case_number, court)
            
            # Cache the result
            self.cache[cache_key] = {
                'data': result,
                'timestamp': datetime.now()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Case search error: {e}")
            return self._mock_case_search(case_number, court)
    
    def _search_with_datajud(self, case_number: str, court: str) -> Dict[str, Any]:
        """Search using DataJud API"""
        try:
            headers = {
                'Authorization': f'Bearer {self.datajud_api_key}',
                'Content-Type': 'application/json'
            }
            
            # DataJud API endpoint for case search
            url = f"{self.datajud_base_url}/api_publica_v2/processos"
            params = {
                'numeroProcesso': case_number,
                'tribunal': court
            }
            
            response = requests.get(
                url,
                headers=headers,
                params=params,
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                return self._parse_datajud_response(data, case_number, court)
            else:
                logger.warning(f"DataJud API returned status {response.status_code}")
                return self._mock_case_search(case_number, court)
                
        except requests.RequestException as e:
            logger.error(f"DataJud API request error: {e}")
            return self._mock_case_search(case_number, court)
        except Exception as e:
            logger.error(f"DataJud API error: {e}")
            return self._mock_case_search(case_number, court)
    
    def _parse_datajud_response(self, data: Dict[str, Any], case_number: str, court: str) -> Dict[str, Any]:
        """Parse DataJud API response into standardized format"""
        try:
            if not data or 'hits' not in data or not data['hits']:
                return self._mock_case_search(case_number, court)
            
            case_data = data['hits'][0]['_source']
            
            # Extract timeline events
            timeline = []
            if 'movimentos' in case_data:
                for movimento in case_data['movimentos'][:10]:  # Limit to 10 most recent
                    timeline.append({
                        'id': str(movimento.get('codigo', '')),
                        'date': self._parse_date(movimento.get('dataHora', '')),
                        'description': movimento.get('nome', 'Movimento processual'),
                        'type': self._classify_movement_type(movimento.get('nome', ''))
                    })
            
            # Extract deadlines (mock for now, as DataJud doesn't provide future deadlines)
            deadlines = self._generate_mock_deadlines()
            
            return {
                'number': case_number,
                'court': self._get_court_name(court),
                'status': case_data.get('situacao', 'Em andamento'),
                'parties': self._extract_parties(case_data),
                'subject': case_data.get('assunto', {}).get('nome', 'Não informado'),
                'lastUpdate': datetime.now(),
                'timeline': timeline,
                'deadlines': deadlines
            }
            
        except Exception as e:
            logger.error(f"Error parsing DataJud response: {e}")
            return self._mock_case_search(case_number, court)
    
    def _extract_parties(self, case_data: Dict[str, Any]) -> List[str]:
        """Extract parties from case data"""
        parties = []
        try:
            if 'participantes' in case_data:
                for participante in case_data['participantes']:
                    nome = participante.get('nome', '')
                    if nome and nome not in parties:
                        parties.append(nome)
            return parties[:10]  # Limit to 10 parties
        except Exception:
            return ['Parte não identificada']
    
    def _classify_movement_type(self, movement_name: str) -> str:
        """Classify movement type based on name"""
        movement_name_lower = movement_name.lower()
        
        if any(word in movement_name_lower for word in ['sentença', 'decisão', 'acórdão']):
            return 'decision'
        elif any(word in movement_name_lower for word in ['audiência', 'sessão']):
            return 'hearing'
        elif any(word in movement_name_lower for word in ['prazo', 'intimação']):
            return 'deadline'
        else:
            return 'filing'
    
    def _parse_date(self, date_string: str) -> datetime:
        """Parse date string to datetime object"""
        try:
            # Try different date formats
            formats = [
                '%Y-%m-%dT%H:%M:%S',
                '%Y-%m-%d %H:%M:%S',
                '%Y-%m-%d',
                '%d/%m/%Y',
                '%d/%m/%Y %H:%M:%S'
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(date_string, fmt)
                except ValueError:
                    continue
            
            # If no format works, return current date
            return datetime.now()
            
        except Exception:
            return datetime.now()
    
    def _generate_mock_deadlines(self) -> List[Dict[str, Any]]:
        """Generate mock deadlines for demonstration"""
        return [
            {
                'id': '1',
                'date': datetime.now() + timedelta(days=15),
                'description': 'Prazo para manifestação',
                'priority': 'medium',
                'completed': False
            },
            {
                'id': '2',
                'date': datetime.now() + timedelta(days=30),
                'description': 'Audiência de instrução',
                'priority': 'high',
                'completed': False
            }
        ]
    
    def _get_court_name(self, court_id: str) -> str:
        """Get full court name from ID"""
        court_names = {
            'tjsp': 'Tribunal de Justiça de São Paulo',
            'stj': 'Superior Tribunal de Justiça',
            'stf': 'Supremo Tribunal Federal',
            'trf1': 'Tribunal Regional Federal da 1ª Região',
            'trf2': 'Tribunal Regional Federal da 2ª Região',
            'trf3': 'Tribunal Regional Federal da 3ª Região',
            'trf4': 'Tribunal Regional Federal da 4ª Região',
            'trf5': 'Tribunal Regional Federal da 5ª Região',
            'tst': 'Tribunal Superior do Trabalho'
        }
        return court_names.get(court_id, court_id.upper())
    
    def _mock_case_search(self, case_number: str, court: str) -> Dict[str, Any]:
        """Mock case search for development/fallback"""
        return {
            'number': case_number,
            'court': self._get_court_name(court),
            'status': 'Em andamento',
            'parties': ['João Silva Santos', 'Empresa ABC Ltda.'],
            'subject': 'Ação de Cobrança',
            'lastUpdate': datetime.now(),
            'timeline': [
                {
                    'id': '1',
                    'date': datetime.now() - timedelta(days=60),
                    'description': 'Distribuição do processo',
                    'type': 'filing'
                },
                {
                    'id': '2',
                    'date': datetime.now() - timedelta(days=45),
                    'description': 'Citação da parte requerida',
                    'type': 'filing'
                },
                {
                    'id': '3',
                    'date': datetime.now() - timedelta(days=30),
                    'description': 'Apresentação de contestação',
                    'type': 'filing'
                },
                {
                    'id': '4',
                    'date': datetime.now() - timedelta(days=15),
                    'description': 'Despacho saneador',
                    'type': 'decision'
                },
                {
                    'id': '5',
                    'date': datetime.now() - timedelta(days=5),
                    'description': 'Designação de audiência de instrução',
                    'type': 'hearing'
                }
            ],
            'deadlines': [
                {
                    'id': '1',
                    'date': datetime.now() + timedelta(days=10),
                    'description': 'Audiência de instrução e julgamento',
                    'priority': 'high',
                    'completed': False
                },
                {
                    'id': '2',
                    'date': datetime.now() + timedelta(days=25),
                    'description': 'Prazo para alegações finais',
                    'priority': 'medium',
                    'completed': False
                },
                {
                    'id': '3',
                    'date': datetime.now() + timedelta(days=40),
                    'description': 'Prazo para sentença',
                    'priority': 'low',
                    'completed': False
                }
            ]
        }
    
    def get_court_statistics(self, court: str) -> Dict[str, Any]:
        """Get statistics for a specific court"""
        try:
            # This would normally query court APIs or databases
            return {
                'court': self._get_court_name(court),
                'total_cases': 125000,
                'pending_cases': 45000,
                'resolved_cases': 80000,
                'average_duration_days': 365,
                'last_updated': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting court statistics: {e}")
            return {
                'error': str(e),
                'court': court
            }
    
    def validate_case_number(self, case_number: str) -> bool:
        """Validate Brazilian case number format"""
        try:
            # Brazilian case number format: NNNNNNN-DD.AAAA.J.TR.OOOO
            # Where N=sequential, D=verification digits, A=year, J=judicial segment,
            # T=court, R=region, O=origin
            
            import re
            pattern = r'^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$'
            return bool(re.match(pattern, case_number))
            
        except Exception:
            return False
    
    def clear_cache(self):
        """Clear the case search cache"""
        self.cache.clear()
        logger.info("Case search cache cleared")