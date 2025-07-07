"""
Custom middleware to handle URL encoding issues
"""
from django.http import HttpResponseRedirect
from django.urls import reverse
import urllib.parse


class URLDecodeMiddleware:
    """
    Middleware to handle double-encoded URLs that cause 404 errors
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if the full path contains double-encoded parameters
        full_path = request.get_full_path()
        
        # Handle the specific double-encoding issue with login URLs
        if '%3Fnext%3D' in full_path and 'accounts/login' in request.path:
            return HttpResponseRedirect('/accounts/login/?next=/')
        
        # General double-encoding fix for other URLs
        if '%3F' in full_path or '%3D' in full_path:
            decoded_path = urllib.parse.unquote(full_path)
            if decoded_path != full_path:
                return HttpResponseRedirect(decoded_path)
        
        response = self.get_response(request)
        return response