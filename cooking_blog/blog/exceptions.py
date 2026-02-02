from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns user-friendly error messages
    instead of exposing internal errors.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Log the full error for debugging
        logger.error(f"API Error: {exc}")
        logger.error(f"Context: {context}")
        
        # Customize the response data
        custom_response_data = {
            'error': 'Si è verificato un errore. Riprova più tardi.',
            'detail': None
        }
        
        # If it's a validation error, try to extract meaningful messages
        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                # Extract first meaningful error message
                for key, value in exc.detail.items():
                    if isinstance(value, list) and len(value) > 0:
                        error_msg = str(value[0])
                        # Only use if it's a reasonable length and doesn't contain technical details
                        if len(error_msg) < 200 and not any(tech in error_msg.lower() for tech in ['traceback', 'file', 'line', 'typeerror', 'attributeerror']):
                            custom_response_data['error'] = error_msg
                            break
                    elif isinstance(value, str) and len(value) < 200:
                        custom_response_data['error'] = str(value)
                        break
            elif isinstance(exc.detail, (list, str)):
                error_msg = str(exc.detail[0] if isinstance(exc.detail, list) else exc.detail)
                if len(error_msg) < 200 and not any(tech in error_msg.lower() for tech in ['traceback', 'file', 'line']):
                    custom_response_data['error'] = error_msg
        
        response.data = custom_response_data
    
    return response
