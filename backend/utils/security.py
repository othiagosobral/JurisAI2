import os
import hashlib
import secrets
import logging
from typing import Optional, Dict, Any
import re
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SecurityUtils:
    """Security utilities for the application"""
    
    def __init__(self):
        self.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key')
        self.valid_api_keys = self._load_api_keys()
    
    def _load_api_keys(self) -> set:
        """Load valid API keys from environment or config"""
        # In production, this would load from a secure store
        api_keys = os.getenv('VALID_API_KEYS', '').split(',')
        return {key.strip() for key in api_keys if key.strip()}
    
    def validate_api_key(self, api_key: str) -> bool:
        """Validate API key"""
        if not api_key:
            return False
        
        # For development, allow any non-empty key
        if os.getenv('DEBUG', 'false').lower() == 'true':
            return len(api_key) > 0
        
        return api_key in self.valid_api_keys
    
    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename to prevent path traversal attacks"""
        if not filename:
            return 'unnamed_file'
        
        # Remove path separators and dangerous characters
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        filename = re.sub(r'\.\.', '_', filename)  # Remove parent directory references
        
        # Limit length
        if len(filename) > 255:
            name, ext = os.path.splitext(filename)
            filename = name[:250] + ext
        
        return filename or 'unnamed_file'
    
    def validate_file_type(self, filename: str, allowed_extensions: set) -> bool:
        """Validate file type based on extension"""
        if not filename:
            return False
        
        file_ext = os.path.splitext(filename.lower())[1]
        return file_ext in allowed_extensions
    
    def validate_file_size(self, file_size: int, max_size: int) -> bool:
        """Validate file size"""
        return 0 < file_size <= max_size
    
    def generate_secure_token(self, length: int = 32) -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(length)
    
    def hash_password(self, password: str) -> str:
        """Hash password using SHA-256 with salt"""
        salt = secrets.token_hex(16)
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return f"{salt}:{password_hash}"
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        try:
            salt, password_hash = hashed.split(':')
            return hashlib.sha256((password + salt).encode()).hexdigest() == password_hash
        except ValueError:
            return False
    
    def validate_input_length(self, input_str: str, max_length: int) -> bool:
        """Validate input string length"""
        return len(input_str) <= max_length
    
    def detect_sql_injection(self, input_str: str) -> bool:
        """Basic SQL injection detection"""
        sql_patterns = [
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)",
            r"(--|#|/\*|\*/)",
            r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
            r"(\bOR\s+\d+\s*=\s*\d+)",
            r"(\'\s*(OR|AND)\s*\'\w*\'\s*=\s*\'\w*)",
        ]
        
        input_upper = input_str.upper()
        for pattern in sql_patterns:
            if re.search(pattern, input_upper, re.IGNORECASE):
                logger.warning(f"Potential SQL injection detected: {input_str[:100]}")
                return True
        
        return False
    
    def detect_xss(self, input_str: str) -> bool:
        """Basic XSS detection"""
        xss_patterns = [
            r"<script[^>]*>.*?</script>",
            r"javascript:",
            r"on\w+\s*=",
            r"<iframe[^>]*>",
            r"<object[^>]*>",
            r"<embed[^>]*>",
        ]
        
        for pattern in xss_patterns:
            if re.search(pattern, input_str, re.IGNORECASE):
                logger.warning(f"Potential XSS detected: {input_str[:100]}")
                return True
        
        return False
    
    def sanitize_input(self, input_str: str) -> str:
        """Sanitize input string"""
        if not input_str:
            return ""
        
        # Remove null bytes
        input_str = input_str.replace('\x00', '')
        
        # Remove control characters except newlines and tabs
        input_str = ''.join(char for char in input_str 
                           if ord(char) >= 32 or char in '\n\t')
        
        return input_str.strip()
    
    def validate_email(self, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    def validate_phone(self, phone: str) -> bool:
        """Validate Brazilian phone number format"""
        # Remove non-digits
        phone_digits = re.sub(r'\D', '', phone)
        
        # Brazilian phone: 10 or 11 digits (with area code)
        return len(phone_digits) in [10, 11] and phone_digits.startswith(('1', '2', '3', '4', '5', '6', '7', '8', '9'))
    
    def validate_url(self, url: str) -> bool:
        """Validate URL format"""
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        return bool(re.match(pattern, url))
    
    def rate_limit_key(self, identifier: str, action: str) -> str:
        """Generate rate limiting key"""
        return f"rate_limit:{action}:{identifier}"
    
    def log_security_event(self, event_type: str, details: Dict[str, Any], severity: str = 'INFO'):
        """Log security events"""
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'severity': severity,
            'details': details
        }
        
        if severity == 'CRITICAL':
            logger.critical(f"Security Event: {log_entry}")
        elif severity == 'WARNING':
            logger.warning(f"Security Event: {log_entry}")
        else:
            logger.info(f"Security Event: {log_entry}")
    
    def check_password_strength(self, password: str) -> Dict[str, Any]:
        """Check password strength"""
        score = 0
        feedback = []
        
        if len(password) >= 8:
            score += 1
        else:
            feedback.append("Password should be at least 8 characters long")
        
        if re.search(r'[a-z]', password):
            score += 1
        else:
            feedback.append("Password should contain lowercase letters")
        
        if re.search(r'[A-Z]', password):
            score += 1
        else:
            feedback.append("Password should contain uppercase letters")
        
        if re.search(r'\d', password):
            score += 1
        else:
            feedback.append("Password should contain numbers")
        
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 1
        else:
            feedback.append("Password should contain special characters")
        
        strength_levels = {
            0: 'Very Weak',
            1: 'Weak',
            2: 'Fair',
            3: 'Good',
            4: 'Strong',
            5: 'Very Strong'
        }
        
        return {
            'score': score,
            'strength': strength_levels[score],
            'feedback': feedback,
            'is_strong': score >= 4
        }
    
    def generate_csrf_token(self) -> str:
        """Generate CSRF token"""
        return secrets.token_urlsafe(32)
    
    def validate_csrf_token(self, token: str, session_token: str) -> bool:
        """Validate CSRF token"""
        return secrets.compare_digest(token, session_token)
    
    def mask_sensitive_data(self, data: str, mask_char: str = '*', visible_chars: int = 4) -> str:
        """Mask sensitive data for logging"""
        if len(data) <= visible_chars:
            return mask_char * len(data)
        
        return data[:visible_chars] + mask_char * (len(data) - visible_chars)