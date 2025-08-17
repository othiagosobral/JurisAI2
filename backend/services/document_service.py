import os
import uuid
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import json

import PyPDF2
from docx import Document as DocxDocument

logger = logging.getLogger(__name__)

class DocumentService:
    """Service for document processing and management"""
    
    def __init__(self):
        self.storage_path = 'uploads'
        self.metadata_path = 'metadata'
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Ensure required directories exist"""
        for path in [self.storage_path, self.metadata_path]:
            if not os.path.exists(path):
                os.makedirs(path)
    
    def process_document(self, filepath: str, original_filename: str) -> str:
        """Process uploaded document and return document ID"""
        try:
            document_id = str(uuid.uuid4())
            
            # Extract text content
            content = self._extract_text(filepath)
            
            # Create metadata
            metadata = {
                'id': document_id,
                'original_filename': original_filename,
                'filepath': filepath,
                'content_length': len(content),
                'processed_at': datetime.utcnow().isoformat(),
                'status': 'processed'
            }
            
            # Save metadata
            metadata_file = os.path.join(self.metadata_path, f"{document_id}.json")
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)
            
            # Save extracted content
            content_file = os.path.join(self.metadata_path, f"{document_id}_content.txt")
            with open(content_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.info(f"Document processed successfully: {document_id}")
            return document_id
            
        except Exception as e:
            logger.error(f"Document processing error: {e}")
            raise
    
    def _extract_text(self, filepath: str) -> str:
        """Extract text from various document formats"""
        try:
            file_extension = os.path.splitext(filepath)[1].lower()
            
            if file_extension == '.pdf':
                return self._extract_pdf_text(filepath)
            elif file_extension in ['.docx', '.doc']:
                return self._extract_docx_text(filepath)
            elif file_extension == '.txt':
                return self._extract_txt_text(filepath)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
                
        except Exception as e:
            logger.error(f"Text extraction error: {e}")
            return f"Erro na extração de texto: {str(e)}"
    
    def _extract_pdf_text(self, filepath: str) -> str:
        """Extract text from PDF file"""
        try:
            text = ""
            with open(filepath, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            return f"Erro na extração do PDF: {str(e)}"
    
    def _extract_docx_text(self, filepath: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = DocxDocument(filepath)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"DOCX extraction error: {e}")
            return f"Erro na extração do DOCX: {str(e)}"
    
    def _extract_txt_text(self, filepath: str) -> str:
        """Extract text from TXT file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as file:
                return file.read()
        except UnicodeDecodeError:
            # Try with different encoding
            try:
                with open(filepath, 'r', encoding='latin-1') as file:
                    return file.read()
            except Exception as e:
                logger.error(f"TXT extraction error: {e}")
                return f"Erro na leitura do arquivo: {str(e)}"
        except Exception as e:
            logger.error(f"TXT extraction error: {e}")
            return f"Erro na leitura do arquivo: {str(e)}"
    
    def get_document_content(self, document_id: str) -> Optional[str]:
        """Get document content by ID"""
        try:
            content_file = os.path.join(self.metadata_path, f"{document_id}_content.txt")
            if os.path.exists(content_file):
                with open(content_file, 'r', encoding='utf-8') as f:
                    return f.read()
            return None
        except Exception as e:
            logger.error(f"Error getting document content: {e}")
            return None
    
    def get_document_metadata(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document metadata by ID"""
        try:
            metadata_file = os.path.join(self.metadata_path, f"{document_id}.json")
            if os.path.exists(metadata_file):
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return None
        except Exception as e:
            logger.error(f"Error getting document metadata: {e}")
            return None
    
    def store_analysis(self, document_id: str, analysis_result: Dict[str, Any]) -> bool:
        """Store analysis result for a document"""
        try:
            analysis_file = os.path.join(self.metadata_path, f"{document_id}_analysis.json")
            analysis_data = {
                'document_id': document_id,
                'analysis': analysis_result,
                'created_at': datetime.utcnow().isoformat()
            }
            
            with open(analysis_file, 'w', encoding='utf-8') as f:
                json.dump(analysis_data, f, ensure_ascii=False, indent=2)
            
            return True
        except Exception as e:
            logger.error(f"Error storing analysis: {e}")
            return False
    
    def get_analysis(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get stored analysis for a document"""
        try:
            analysis_file = os.path.join(self.metadata_path, f"{document_id}_analysis.json")
            if os.path.exists(analysis_file):
                with open(analysis_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return data.get('analysis')
            return None
        except Exception as e:
            logger.error(f"Error getting analysis: {e}")
            return None
    
    def list_documents(self) -> list:
        """List all processed documents"""
        try:
            documents = []
            for filename in os.listdir(self.metadata_path):
                if filename.endswith('.json') and not filename.endswith('_analysis.json'):
                    document_id = filename.replace('.json', '')
                    metadata = self.get_document_metadata(document_id)
                    if metadata:
                        documents.append(metadata)
            return documents
        except Exception as e:
            logger.error(f"Error listing documents: {e}")
            return []
    
    def delete_document(self, document_id: str) -> bool:
        """Delete a document and its associated files"""
        try:
            files_to_delete = [
                os.path.join(self.metadata_path, f"{document_id}.json"),
                os.path.join(self.metadata_path, f"{document_id}_content.txt"),
                os.path.join(self.metadata_path, f"{document_id}_analysis.json")
            ]
            
            # Get original file path from metadata
            metadata = self.get_document_metadata(document_id)
            if metadata and 'filepath' in metadata:
                files_to_delete.append(metadata['filepath'])
            
            # Delete files
            for filepath in files_to_delete:
                if os.path.exists(filepath):
                    os.remove(filepath)
            
            logger.info(f"Document deleted: {document_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            return False
    
    def get_document_stats(self) -> Dict[str, Any]:
        """Get statistics about processed documents"""
        try:
            documents = self.list_documents()
            total_size = 0
            file_types = {}
            
            for doc in documents:
                # Count file types
                if 'original_filename' in doc:
                    ext = os.path.splitext(doc['original_filename'])[1].lower()
                    file_types[ext] = file_types.get(ext, 0) + 1
                
                # Sum content lengths
                if 'content_length' in doc:
                    total_size += doc['content_length']
            
            return {
                'total_documents': len(documents),
                'total_content_size': total_size,
                'file_types': file_types,
                'last_updated': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting document stats: {e}")
            return {
                'total_documents': 0,
                'total_content_size': 0,
                'file_types': {},
                'error': str(e)
            }