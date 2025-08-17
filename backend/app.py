import os
import json
import logging
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, Any, List

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
import bleach
from dotenv import load_dotenv

# Import custom modules
from services.ai_service import AIService
from services.document_service import DocumentService
from services.case_service import CaseService
from services.jurisprudence_service import JurisprudenceService
from utils.security import SecurityUtils
from utils.validators import InputValidator

# Load environment variables
load_dotenv('../config/.env')

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_UPLOAD_SIZE', 10485760))  # 10MB default

# Configure CORS
CORS(app, origins=os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:53777').split(','))

# Configure rate limiting
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)
limiter.init_app(app)

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize services
ai_service = AIService()
document_service = DocumentService()
case_service = CaseService()
jurisprudence_service = JurisprudenceService()
security_utils = SecurityUtils()
input_validator = InputValidator()

# Upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.txt'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def require_api_key(f):
    """Decorator to require API key for sensitive endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or not security_utils.validate_api_key(api_key):
            return jsonify({'error': 'Invalid or missing API key'}), 401
        return f(*args, **kwargs)
    return decorated_function

def sanitize_input(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize input data to prevent XSS and injection attacks"""
    if isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    elif isinstance(data, str):
        return bleach.clean(data, tags=[], attributes={}, strip=True)
    return data

@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    return jsonify({'error': 'File too large. Maximum size is 10MB.'}), 413

@app.errorhandler(429)
def handle_rate_limit(e):
    return jsonify({'error': 'Rate limit exceeded. Please try again later.'}), 429

@app.errorhandler(500)
def handle_internal_error(e):
    logger.error(f"Internal server error: {str(e)}")
    return jsonify({'error': 'Internal server error'}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

# Document endpoints
@app.route('/api/documents/upload', methods=['POST'])
@limiter.limit("10 per minute")
def upload_document():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file
        if not input_validator.validate_file(file, ALLOWED_EXTENSIONS):
            return jsonify({'error': 'Invalid file type or size'}), 400
        
        # Secure filename
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        
        # Save file
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Process document
        document_id = document_service.process_document(filepath, file.filename)
        
        return jsonify({
            'id': document_id,
            'status': 'uploaded',
            'filename': file.filename
        })
        
    except Exception as e:
        logger.error(f"Document upload error: {str(e)}")
        return jsonify({'error': 'Upload failed'}), 500

@app.route('/api/documents/<document_id>/analyze', methods=['POST'])
@limiter.limit("5 per minute")
def analyze_document(document_id):
    try:
        data = sanitize_input(request.get_json() or {})
        analysis_type = data.get('analysisType', 'general')
        
        if not input_validator.validate_document_id(document_id):
            return jsonify({'error': 'Invalid document ID'}), 400
        
        # Get document content
        document_content = document_service.get_document_content(document_id)
        if not document_content:
            return jsonify({'error': 'Document not found'}), 404
        
        # Perform analysis
        analysis_result = ai_service.analyze_document(document_content, analysis_type)
        
        # Store analysis result
        document_service.store_analysis(document_id, analysis_result)
        
        return jsonify(analysis_result)
        
    except Exception as e:
        logger.error(f"Document analysis error: {str(e)}")
        return jsonify({'error': 'Analysis failed'}), 500

@app.route('/api/documents/<document_id>/mindmap', methods=['POST'])
@limiter.limit("3 per minute")
def generate_mindmap(document_id):
    try:
        if not input_validator.validate_document_id(document_id):
            return jsonify({'error': 'Invalid document ID'}), 400
        
        document_content = document_service.get_document_content(document_id)
        if not document_content:
            return jsonify({'error': 'Document not found'}), 404
        
        mindmap_data = ai_service.generate_mindmap(document_content)
        
        return jsonify(mindmap_data)
        
    except Exception as e:
        logger.error(f"Mindmap generation error: {str(e)}")
        return jsonify({'error': 'Mindmap generation failed'}), 500

# Chat endpoint
@app.route('/api/chat', methods=['POST'])
@limiter.limit("20 per minute")
def chat():
    try:
        data = sanitize_input(request.get_json() or {})
        message = data.get('message', '').strip()
        context = data.get('context', {})
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        if len(message) > 2000:
            return jsonify({'error': 'Message too long'}), 400
        
        # Generate AI response
        response = ai_service.generate_chat_response(message, context)
        
        return jsonify({
            'response': response,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return jsonify({'error': 'Chat service unavailable'}), 500

# Case search endpoint
@app.route('/api/cases/search', methods=['POST'])
@limiter.limit("10 per minute")
def search_case():
    try:
        data = sanitize_input(request.get_json() or {})
        case_number = data.get('caseNumber', '').strip()
        court = data.get('court', '').strip()
        
        if not case_number or not court:
            return jsonify({'error': 'Case number and court are required'}), 400
        
        if not input_validator.validate_case_number(case_number):
            return jsonify({'error': 'Invalid case number format'}), 400
        
        # Search case information
        case_info = case_service.search_case(case_number, court)
        
        return jsonify(case_info)
        
    except Exception as e:
        logger.error(f"Case search error: {str(e)}")
        return jsonify({'error': 'Case search failed'}), 500

# Contract analysis endpoint
@app.route('/api/contracts/<document_id>/analyze', methods=['POST'])
@limiter.limit("5 per minute")
def analyze_contract(document_id):
    try:
        if not input_validator.validate_document_id(document_id):
            return jsonify({'error': 'Invalid document ID'}), 400
        
        document_content = document_service.get_document_content(document_id)
        if not document_content:
            return jsonify({'error': 'Document not found'}), 404
        
        # Perform contract analysis
        analysis_result = ai_service.analyze_contract(document_content)
        
        return jsonify(analysis_result)
        
    except Exception as e:
        logger.error(f"Contract analysis error: {str(e)}")
        return jsonify({'error': 'Contract analysis failed'}), 500

# Jurisprudence search endpoint
@app.route('/api/jurisprudence/search', methods=['POST'])
@limiter.limit("10 per minute")
def search_jurisprudence():
    try:
        data = sanitize_input(request.get_json() or {})
        query = data.get('query', '').strip()
        filters = data.get('filters', {})
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        if len(query) > 500:
            return jsonify({'error': 'Query too long'}), 400
        
        # Search jurisprudence
        results = jurisprudence_service.search(query, filters)
        
        return jsonify({
            'results': results,
            'total': len(results),
            'query': query
        })
        
    except Exception as e:
        logger.error(f"Jurisprudence search error: {str(e)}")
        return jsonify({'error': 'Jurisprudence search failed'}), 500

# Serve static files (for development)
@app.route('/config/<path:filename>')
def serve_config(filename):
    return send_from_directory('../config', filename)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    
    logger.info(f"Starting JurisAI2 API server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)