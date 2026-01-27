# 🚀 Guide de Déploiement - Sync Messaging App

## Prérequis

- **Node.js** v18+ (pour le frontend)
- **Python** 3.9+ (pour le backend)
- **MongoDB** 4.4+ (base de données)
- **Git** (optionnel)

---

## 📦 1. Téléchargement du Code

### Option A: Télécharger depuis Emergent
Utilisez le bouton "Download Code" dans l'interface Emergent.

### Option B: Clone/Copy
Copiez les dossiers `backend/` et `frontend/` sur votre machine.

---

## 🗄️ 2. Configuration de MongoDB

### Installation MongoDB

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Windows:**
Téléchargez depuis https://www.mongodb.com/try/download/community

**Docker (recommandé pour la simplicité):**
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

### Vérification
```bash
mongosh --eval "db.serverStatus()"
```

---

## ⚙️ 3. Configuration Backend

### 3.1 Créer l'environnement virtuel
```bash
cd backend
python -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3.2 Installer les dépendances
```bash
pip install -r requirements.txt
```

### 3.3 Configurer les variables d'environnement
Créez/modifiez le fichier `backend/.env`:

```env
# MongoDB - Modifiez selon votre configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=sync_messaging

# JWT Secret - CHANGEZ CECI en production!
JWT_SECRET=votre-secret-ultra-securise-changez-moi-12345

# CORS - Domaines autorisés (séparés par des virgules)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3.4 Lancer le backend
```bash
# Développement (avec hot reload)
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Production
uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
```

Le backend sera accessible sur: `http://localhost:8001`

---

## 🎨 4. Configuration Frontend

### 4.1 Installer les dépendances
```bash
cd frontend
yarn install
# ou
npm install
```

### 4.2 Configurer les variables d'environnement
Créez/modifiez le fichier `frontend/.env`:

```env
# URL du backend - Modifiez selon votre configuration
REACT_APP_BACKEND_URL=http://localhost:8001

# Port WebSocket (si différent)
WDS_SOCKET_PORT=443
```

### 4.3 Lancer le frontend
```bash
# Développement
yarn start
# ou
npm start

# Production build
yarn build
# ou
npm run build
```

Le frontend sera accessible sur: `http://localhost:3000`

---

## 🔧 5. Configuration Avancée

### MongoDB avec authentification
```env
MONGO_URL=mongodb://username:password@localhost:27017/sync_messaging?authSource=admin
```

### MongoDB Atlas (Cloud)
```env
MONGO_URL=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/sync_messaging?retryWrites=true&w=majority
```

### Variables JWT
```env
JWT_SECRET=un-secret-tres-long-et-complexe-minimum-32-caracteres
JWT_EXPIRATION_HOURS=24
```

---

## 🐳 6. Déploiement Docker (Optionnel)

### docker-compose.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: sync-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: sync_messaging

  backend:
    build: ./backend
    container_name: sync-backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=sync_messaging
      - JWT_SECRET=your-super-secret-key
      - CORS_ORIGINS=http://localhost:3000
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    container_name: sync-frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8001
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### backend/Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

### frontend/Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
EXPOSE 3000

CMD ["yarn", "start"]
```

### Lancer avec Docker
```bash
docker-compose up -d
```

---

## 📱 7. Accès à l'Application

1. Ouvrez votre navigateur: `http://localhost:3000`
2. Créez un compte
3. Commencez à discuter!

### Test avec plusieurs utilisateurs
Ouvrez deux fenêtres de navigateur (ou une en navigation privée) et connectez-vous avec deux comptes différents pour tester la messagerie en temps réel.

---

## 🔒 8. Sécurité en Production

### Checklist
- [ ] Changez `JWT_SECRET` avec une clé forte (32+ caractères)
- [ ] Configurez HTTPS (SSL/TLS)
- [ ] Limitez `CORS_ORIGINS` aux domaines autorisés
- [ ] Activez l'authentification MongoDB
- [ ] Configurez un reverse proxy (nginx/caddy)
- [ ] Ajoutez un rate limiting

### Nginx Config Example
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name votre-domaine.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## 🐛 9. Dépannage

### Erreur MongoDB Connection
```bash
# Vérifiez que MongoDB est en cours d'exécution
sudo systemctl status mongodb
# ou
brew services list | grep mongodb
```

### Erreur CORS
Assurez-vous que `CORS_ORIGINS` dans le backend contient l'URL du frontend.

### WebSocket ne se connecte pas
- Vérifiez que le port 8001 est ouvert
- Si derrière un proxy, configurez correctement les headers WebSocket

### Erreur "Module not found"
```bash
# Backend
pip install -r requirements.txt

# Frontend
yarn install
```

---

## 📞 Support

En cas de problème, vérifiez:
1. Les logs du backend: `tail -f backend.log`
2. La console du navigateur (F12)
3. La connexion MongoDB

---

## 📁 Structure des Fichiers

```
sync-messaging/
├── backend/
│   ├── server.py          # API FastAPI
│   ├── requirements.txt   # Dépendances Python
│   └── .env              # Configuration
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── components/
│   ├── package.json
│   └── .env              # Configuration
└── README.md
```

Bonne installation! 🎉
