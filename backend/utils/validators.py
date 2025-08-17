import re
import os
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class InputValidator:
    """Input validation utilities"""
    
    def __init__(self):
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.allowed_extensions = {'.pdf', '.docx', '.doc', '.txt'}
    
    def validate_file(self, file, allowed_extensions: set = None) -> bool:
        """Validate uploaded file"""
        try:
            if not file or not file.filename:
                return False
            
            # Check file extension
            extensions = allowed_extensions or self.allowed_extensions
            file_ext = os.path.splitext(file.filename.lower())[1]
            if file_ext not in extensions:
                logger.warning(f"Invalid file extension: {file_ext}")
                return False
            
            # Check file size (if file has seek method)
            if hasattr(file, 'seek') and hasattr(file, 'tell'):
                file.seek(0, 2)  # Seek to end
                size = file.tell()
                file.seek(0)  # Reset to beginning
                
                if size > self.max_file_size:
                    logger.warning(f"File too large: {size} bytes")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"File validation error: {e}")
            return False
    
    def validate_document_id(self, document_id: str) -> bool:
        """Validate document ID format"""
        try:
            # Check if it's a valid UUID
            uuid.UUID(document_id)
            return True
        except (ValueError, TypeError):
            logger.warning(f"Invalid document ID format: {document_id}")
            return False
    
    def validate_case_number(self, case_number: str) -> bool:
        """Validate Brazilian case number format"""
        try:
            if not case_number:
                return False
            
            # Brazilian case number format: NNNNNNN-DD.AAAA.J.TR.OOOO
            pattern = r'^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$'
            
            if not re.match(pattern, case_number):
                logger.warning(f"Invalid case number format: {case_number}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Case number validation error: {e}")
            return False
    
    def validate_email(self, email: str) -> bool:
        """Validate email format"""
        try:
            if not email:
                return False
            
            pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            return bool(re.match(pattern, email))
            
        except Exception as e:
            logger.error(f"Email validation error: {e}")
            return False
    
    def validate_phone(self, phone: str) -> bool:
        """Validate Brazilian phone number"""
        try:
            if not phone:
                return False
            
            # Remove non-digits
            phone_digits = re.sub(r'\D', '', phone)
            
            # Brazilian phone: 10 or 11 digits
            if len(phone_digits) not in [10, 11]:
                return False
            
            # Should start with area code (11-99)
            if not phone_digits[:2].isdigit() or int(phone_digits[:2]) < 11:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Phone validation error: {e}")
            return False
    
    def validate_url(self, url: str) -> bool:
        """Validate URL format"""
        try:
            if not url:
                return False
            
            pattern = r'^https?://[^\s/$.?#].[^\s]*$'
            return bool(re.match(pattern, url))
            
        except Exception as e:
            logger.error(f"URL validation error: {e}")
            return False
    
    def validate_text_length(self, text: str, min_length: int = 0, max_length: int = 10000) -> bool:
        """Validate text length"""
        try:
            if not isinstance(text, str):
                return False
            
            length = len(text.strip())
            return min_length <= length <= max_length
            
        except Exception as e:
            logger.error(f"Text length validation error: {e}")
            return False
    
    def validate_json_structure(self, data: Dict[str, Any], required_fields: List[str]) -> bool:
        """Validate JSON structure has required fields"""
        try:
            if not isinstance(data, dict):
                return False
            
            for field in required_fields:
                if field not in data:
                    logger.warning(f"Missing required field: {field}")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"JSON structure validation error: {e}")
            return False
    
    def validate_search_query(self, query: str) -> bool:
        """Validate search query"""
        try:
            if not query or not isinstance(query, str):
                return False
            
            query = query.strip()
            
            # Check length
            if len(query) < 2 or len(query) > 500:
                return False
            
            # Check for potentially malicious patterns
            malicious_patterns = [
                r'<script[^>]*>',
                r'javascript:',
                r'on\w+\s*=',
                r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)',
            ]
            
            for pattern in malicious_patterns:
                if re.search(pattern, query, re.IGNORECASE):
                    logger.warning(f"Potentially malicious query: {query[:50]}")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Search query validation error: {e}")
            return False
    
    def validate_court_id(self, court_id: str) -> bool:
        """Validate court ID"""
        try:
            if not court_id:
                return False
            
            # Valid Brazilian court IDs
            valid_courts = {
                'stf', 'stj', 'tst', 'tse', 'stm',  # Superior courts
                'trf1', 'trf2', 'trf3', 'trf4', 'trf5',  # Federal regional courts
                'tjac', 'tjal', 'tjap', 'tjam', 'tjba', 'tjce', 'tjdf', 'tjes',
                'tjgo', 'tjma', 'tjmt', 'tjms', 'tjmg', 'tjpa', 'tjpb', 'tjpr',
                'tjpe', 'tjpi', 'tjrj', 'tjrn', 'tjrs', 'tjro', 'tjrr', 'tjsc',
                'tjsp', 'tjse', 'tjto'  # State courts
            }
            
            return court_id.lower() in valid_courts
            
        except Exception as e:
            logger.error(f"Court ID validation error: {e}")
            return False
    
    def validate_date_range(self, start_date: str, end_date: str) -> bool:
        """Validate date range"""
        try:
            if not start_date or not end_date:
                return False
            
            # Parse dates
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            
            # Check if start is before end
            if start >= end:
                return False
            
            # Check if range is reasonable (not more than 10 years)
            if (end - start).days > 3650:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Date range validation error: {e}")
            return False
    
    def validate_pagination(self, page: int, per_page: int) -> bool:
        """Validate pagination parameters"""
        try:
            if not isinstance(page, int) or not isinstance(per_page, int):
                return False
            
            if page < 1 or per_page < 1:
                return False
            
            if per_page > 100:  # Limit results per page
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Pagination validation error: {e}")
            return False
    
    def validate_color_hex(self, color: str) -> bool:
        """Validate hex color format"""
        try:
            if not color:
                return False
            
            pattern = r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
            return bool(re.match(pattern, color))
            
        except Exception as e:
            logger.error(f"Color validation error: {e}")
            return False
    
    def validate_branding_config(self, config: Dict[str, Any]) -> bool:
        """Validate branding configuration"""
        try:
            required_fields = ['appName', 'tagline', 'colors']
            
            if not self.validate_json_structure(config, required_fields):
                return False
            
            # Validate app name
            if not self.validate_text_length(config['appName'], 1, 50):
                return False
            
            # Validate tagline
            if not self.validate_text_length(config['tagline'], 1, 100):
                return False
            
            # Validate colors
            colors = config.get('colors', {})
            if not isinstance(colors, dict):
                return False
            
            for theme in ['light', 'dark']:
                if theme not in colors:
                    continue
                
                theme_colors = colors[theme]
                if not isinstance(theme_colors, dict):
                    return False
                
                for color_key, color_value in theme_colors.items():
                    if not self.validate_color_hex(color_value):
                        logger.warning(f"Invalid color value: {color_key}={color_value}")
                        return False
            
            return True
            
        except Exception as e:
            logger.error(f"Branding config validation error: {e}")
            return False
    
    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename"""
        try:
            if not filename:
                return 'unnamed_file'
            
            # Remove path separators and dangerous characters
            filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
            filename = re.sub(r'\.\.', '_', filename)
            
            # Limit length
            if len(filename) > 255:
                name, ext = os.path.splitext(filename)
                filename = name[:250] + ext
            
            return filename or 'unnamed_file'
            
        except Exception as e:
            logger.error(f"Filename sanitization error: {e}")
            return 'unnamed_file'
    
    def validate_api_request(self, data: Dict[str, Any], endpoint: str) -> Dict[str, Any]:
        """Validate API request data based on endpoint"""
        try:
            errors = []
            
            if endpoint == 'chat':
                if 'message' not in data:
                    errors.append('Message is required')
                elif not self.validate_text_length(data['message'], 1, 2000):
                    errors.append('Message must be between 1 and 2000 characters')
                elif not self.validate_search_query(data['message']):
                    errors.append('Invalid message content')
            
            elif endpoint == 'case_search':
                if 'caseNumber' not in data:
                    errors.append('Case number is required')
                elif not self.validate_case_number(data['caseNumber']):
                    errors.append('Invalid case number format')
                
                if 'court' not in data:
                    errors.append('Court is required')
                elif not self.validate_court_id(data['court']):
                    errors.append('Invalid court ID')
            
            elif endpoint == 'jurisprudence_search':
                if 'query' not in data:
                    errors.append('Search query is required')
                elif not self.validate_search_query(data['query']):
                    errors.append('Invalid search query')
            
            return {
                'valid': len(errors) == 0,
                'errors': errors
            }
            
        except Exception as e:
            logger.error(f"API request validation error: {e}")
            return {
                'valid': False,
                'errors': ['Validation error occurred']
            }