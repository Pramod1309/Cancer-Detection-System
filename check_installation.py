import sys
import os

def check_dependencies():
    required_packages = [
        'flask',
        'flask_cors', 
        'flask_sqlalchemy',
        'PIL',  # Changed from 'pillow' to 'PIL'
        'numpy',
        'torch',
        'transformers'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f' {package}')
        except ImportError:
            print(f' {package} - MISSING')
            missing_packages.append(package)
    
    if missing_packages:
        print(f'\nMissing packages: {missing_packages}')
        print('Run: pip install -r requirements.txt')
        return False
    else:
        print('\nAll dependencies are installed!')
        return True

def check_files():
    required_files = [
        'app.py',
        'requirements.txt',
        'templates/index.html',
        'static/css/style.css',
        'static/js/app.js'
    ]
    
    missing_files = []
    
    for file in required_files:
        if os.path.exists(file):
            print(f' {file}')
        else:
            print(f' {file} - MISSING')
            missing_files.append(file)
    
    if missing_files:
        print(f'\nMissing files: {missing_files}')
        return False
    else:
        print('\nAll files are present!')
        return True

if __name__ == '__main__':
    print('Cancer Detection System - Installation Check')
    print('=' * 50)
    
    deps_ok = check_dependencies()
    files_ok = check_files()
    
    if deps_ok and files_ok:
        print('\n System is ready to run!')
        print('Run: python app.py')
    else:
        print('\n System needs setup')
