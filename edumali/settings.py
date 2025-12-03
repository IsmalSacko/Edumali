import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-x@*t9(*z2*do+ev4xg@uqk*hkhzr_4dm0^rajwg7a*q!v-cdzb'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
    #"https://tf.ismael-dev.com",
    #"http://tf.ismael-dev.com",
]


# Application definition

INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    #'rest_framework.authtoken',
    'django_filters',
    'djoser',
    'apps.accounts',
    'apps.classes',
    'apps.grades',
    'apps.attendance',
    'apps.payments',
    'apps.messaging',
    'apps.dashboard',
]


AUTH_USER_MODEL = 'accounts.User'
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'edumali.urls'


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
# Chemin vers ton CSS custom pour l'admin


WSGI_APPLICATION = 'edumali.wsgi.application'
JAZZMIN_SETTINGS = {
    # Titre de la fenêtre
    "site_title": "EduMali Admin",

    # Titre sur la page de login
    "site_header": "EduMali",

    # Marque dans le coin en haut à gauche
    "site_brand": "EduMali",
    "site_logo": "school/logo/logo-edumali.png",

    # Logo sur la page de login
    "login_logo": "school/logo/logo-edumali.png",
    "login_logo_dark": None,
    "site_logo_classes": "img-circle",
    "site_icon": "school/logo/logo-edumali.png",
    "custom_css": "school/css/custom_admin.css",
    # Texte de bienvenue sur login
    "welcome_sign": "Bienvenue sur EduMali",

    # Copyright
    "copyright": "EduMali SaaS",

    # Avatar utilisateur
   # "user_avatar": "accounts.User.profile_photo",
   "user_avatar": "profile_photo",
   


    ############
    # Top Menu #
    # les
    "topmenu_links": [
        {"app": "accounts"},
        {"app": "classes"},
        {"app": "grades"},
        {"app": "attendance"},
        {"app": "payments"},
        {"app": "messaging"},
        {"app": "dashboard"},
    ],

    #############
    # Side Menu #
    #############
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    "order_with_respect_to": [
        "accounts",
        "classes",
        "grades",
        "attendance",
        "payments",
        "messaging",
        "dashboard",
    ],

    "custom_links": {
        "accounts": [
            {"name": "Exporter élèves", "icon": "fas fa-file-export", "permissions": ["accounts.view_student"]}
        ],
        "payments": [
            {"name": "Rappels Paiements", "icon": "fas fa-bell", "permissions": ["payments.view_payment"]}
        ],
    },

    "icons": {
        "auth.Group": "fas fa-users",
        "accounts.User": "fas fa-user",
        "accounts.Student": "fas fa-user-graduate",
        "accounts.Parent": "fas fa-user-friends",
        "accounts.Teacher": "fas fa-chalkboard-teacher",
        "classes.Classe": "fas fa-chalkboard",
        "classes.EmploiDuTemps": "fas fa-calendar-alt",
        "classes.Matiere": "fas fa-book",
        "grades.Evaluation": "fas fa-clipboard-list",
        "attendance.Attendance": "fas fa-user-check",
        "payments.Payment": "fas fa-money-bill-wave",
        "messaging.Message": "fas fa-envelope",
        "dashboard": "fas fa-chart-line",
        "dashboard.Alert": "fas fa-bell",
        "dashboard.SchoolProfile": "fas fa-school",
        "dashboard.ActionLog": "fas fa-clipboard-list",
        #"authtoken.tokenproxy": "fas fa-key",
    },
    

    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",

    #################
    # Related Modal #
    #################
    "related_modal_active": True,

    #############
    # UI Tweaks #
    #############
    
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,

    ###############
    # Change view #
    ###############
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "accounts.User": "collapsible",
        "auth.Group": "vertical_tabs",
        "authtoken.Token": "collapsible",  # facultatif
    },

    # Langue
    "language_chooser": True,
}

DJOSER = {
    'LOGIN_FIELD': 'username',
    'SEND_ACTIVATION_EMAIL': False,
    'SEND_CONFIRMATION_EMAIL': False,
    'SEND_PASSWORD_RESET_EMAIL': False,
    'SERIALIZERS': {
       
        'user_create': 'apps.accounts.serializers.UserSerializer',
        'user': 'apps.accounts.serializers.UserSerializer',
    },
}
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
  
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
}
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),  # court
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),          # long
    'ROTATE_REFRESH_TOKENS': True,                       # rotation pour meilleure sécurité
    'BLACKLIST_AFTER_ROTATION': True,                    # nécessite token_blacklist app
    'ALGORITHM': 'HS256',
    # 'SIGNING_KEY': SECRET_KEY (par défaut),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'fr'

TIME_ZONE = 'Africa/Bamako'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [
   BASE_DIR / 'static',
]
STATIC_ROOT = BASE_DIR / 'staticfiles'  # pour collectstatic en prod
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
