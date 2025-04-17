import json
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_translations = {}

def load_translations():
    """Load all translation files"""
    translations_dir = Path(__file__).parent.parent / 'translations'
    
    # Create translations directory if it doesn't exist
    if not os.path.exists(translations_dir):
        logger.warning(f"Translations directory not found: {translations_dir}")
        return
    
    for filename in os.listdir(translations_dir):
        if filename.endswith('.json'):
            language = filename.split('.')[0]
            try:
                with open(os.path.join(translations_dir, filename), 'r', encoding='utf-8') as f:
                    _translations[language] = json.load(f)
                logger.info(f"Loaded translations for language: {language}")
            except Exception as e:
                logger.error(f"Error loading translation file {filename}: {e}")

def get_translation(key, language='en'):
    """Get a translation by key and language"""
    if not _translations:
        load_translations()
    
    # Fallback to English if translation not found
    if language not in _translations:
        logger.warning(f"Language not found: {language}, falling back to English")
        language = 'en'
    
    # Navigate nested keys (e.g., "invoice.title")
    value = _translations.get(language, {})
    for part in key.split('.'):
        if isinstance(value, dict) and part in value:
            value = value[part]
        else:
            # Key not found, fallback to English
            if language != 'en':
                logger.warning(f"Translation key not found: {key} in language {language}, falling back to English")
                return get_translation(key, 'en')
            logger.warning(f"Translation key not found: {key} in English, returning key")
            return key
    
    return value

def format_date(date_obj, language='en'):
    """Format date based on language"""
    locale_map = {
        'en': 'en_US',
        'de': 'de_DE'
    }
    locale = locale_map.get(language, 'en_US')
    
    import locale as loc
    try:
        loc.setlocale(loc.LC_TIME, locale)
        return date_obj.strftime('%d. %B %Y' if language == 'de' else '%B %d, %Y')
    except Exception as e:
        logger.error(f"Error formatting date with locale {locale}: {e}")
        # Fallback if locale not available
        return date_obj.strftime('%Y-%m-%d')

def format_currency(amount, currency='USD', language='en'):
    """Format currency based on language"""
    locale_map = {
        'en': 'en_US',
        'de': 'de_DE'
    }
    locale = locale_map.get(language, 'en_US')
    
    try:
        import locale as loc
        loc.setlocale(loc.LC_MONETARY, locale)
        return loc.currency(amount, currency, grouping=True)
    except Exception as e:
        logger.error(f"Error formatting currency with locale {locale}: {e}")
        # Fallback if locale not available
        currency_symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'CAD': 'CA$',
            'AUD': 'A$'
        }
        symbol = currency_symbols.get(currency, currency)
        return f"{symbol}{amount:.2f}"
