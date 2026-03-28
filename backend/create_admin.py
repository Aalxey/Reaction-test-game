import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

def create_superuser():
    username = 'admin'
    email = 'admin@example.com'
    password = 'admin'

    if User.objects.filter(username=username).exists():
        print(f"Superuser '{username}' already exists.")
    else:
        User.objects.create_superuser(username, email, password)
        print(f"Superuser '{username}' created successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")

if __name__ == '__main__':
    create_superuser()
