"""
Custom middleware to handle URL encoding issues and AJAX endpoint authentication
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


class AjaxAuthenticationMiddleware:
    """
    Middleware to bypass authentication for specific AJAX endpoints
    """
    def __init__(self, get_response):
        self.get_response = get_response
        # List of URL patterns that should bypass authentication
        self.bypass_urls = [
            '/social_and_env/ajax/load-districts-ohs/',
            '/social_and_env/ajax/load-settlements-ohs/',
            '/social_and_env/ajax/load-investment-types-ohs/',
            '/social_and_env/test-cascading/',
        ]

    def __call__(self, request):
        # Check if the current path should bypass authentication
        for url in self.bypass_urls:
            if request.path.startswith(url):
                # Set a flag to indicate this request should bypass auth
                request.bypass_auth = True
                break
        
        response = self.get_response(request)
        return response