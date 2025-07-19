# -*- coding: utf-8 -*-
from django import template

register = template.Library()

@register.filter
def currency_symbol(currency_code):
    """Return the appropriate currency symbol for a given currency code"""
    symbol_map = {
        'USD': '$',
        'EUR': '\u20AC',  # Euro symbol using Unicode escape
        'EURO': '\u20AC',  # Euro symbol using Unicode escape
        'GMD': 'D',
        'UA': 'UA',
        'GBP': '\u00A3'  # Pound symbol using Unicode escape
    }
    return symbol_map.get(currency_code, currency_code)

@register.filter
def format_currency(amount, currency_code):
    """Format amount with appropriate currency symbol"""
    symbol = currency_symbol(currency_code)
    try:
        amount_float = float(amount)
        return f"{symbol}{amount_float:,.2f}"
    except (ValueError, TypeError):
        return f"{symbol}{amount}"