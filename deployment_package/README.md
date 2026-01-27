# 🚀 SYNC MESSAGING - Guide de Déploiement

## Structure des fichiers

```
deployment_package/
├── backend/
│   ├── server.py          # API FastAPI
│   ├── requirements.txt   # Dépendances Python
│   ├── .env.example       # Configuration (à renommer en .env)
│   └── Dockerfile         # Pour déploiement Docker
├── frontend/
│   ├── src/               # Code source React
│   ├── public/            # Fichiers statiques
│   ├── package.json       # Dépendances Node.js
│   ├── .env.example       # Configuration (à renommer en .env)
│   └── ...
└── docker-compose.yml     # Déploiement complet
```

---

## 🔧 Configuration Rapide

### 1. Backend (.env)

Renommez `backend/.env.example` en `backend/.env` et configurez :

```env
MONGO_URL=mongodb+srv://msg:msg123987@msg.azwnc1f.mongodb.net/?appName=msg
DB_NAME=sync_messaging
JWT_SECRET=CHANGEZ-CE-SECRET-EN-PRODUCTION
CORS_ORIGINS=https://votre-frontend.com
RESEND_API_KEY=re_RSLKMWSd_L2ZynHYquCjuAAH8mNdJgpUD
FRONTEND_URL=https://votre-frontend.com
```

### 2. Frontend (.env)

Renommez `frontend/.env.example` en `frontend/.env` :

```env
REACT_APP_BACKEND_URL=https://votre-backend.com
```

---

## 📦 Option 1: Déploiement sur Hostinger VPS

### Backend (Python/FastAPI)

```bash
# Connectez-vous à votre VPS
ssh user@votre-vps.com

# Installez Python 3.11+
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip

# Créez l'environnement
cd /var/www
mkdir sync-backend && cd sync-backend
python3.11 -m venv venv
source venv/bin/activate

# Copiez les fichiers et installez
pip install -r requirements.txt

# Créez le fichier .env
cp .env.example .env
nano .env  # Éditez les valeurs

# Lancez avec Gunicorn (production)
pip install gunicorn
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001
```

### Frontend (React)

```bash
cd /var/www
mkdir sync-frontend && cd sync-frontend

# Copiez les fichiers frontend
# Installez les dépendances
npm install  # ou yarn install

# Créez le fichier .env
cp .env.example .env
nano .env  # Mettez l'URL de votre backend

# Build pour production
npm run build  # ou yarn build

# Le dossier 'build/' contient les fichiers statiques à servir
```

### Configuration Nginx

```nginx
# /etc/nginx/sites-available/sync

# Frontend
server {
    listen 80;
    server_name votre-domaine.com;
    
    root /var/www/sync-frontend/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name api.votre-domaine.com;
    
    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📦 Option 2: Déploiement Docker

### docker-compose.yml (inclus)

```bash
# Sur votre serveur
docker-compose up -d
```

Le frontend sera sur le port 3000, le backend sur 8001.

---

## 📦 Option 3: Hébergement Séparé

### Frontend → Vercel/Netlify (Gratuit)

1. Créez un compte sur vercel.com ou netlify.com
2. Connectez votre repo GitHub
3. Configurez la variable d'environnement :
   - `REACT_APP_BACKEND_URL=https://votre-backend.com`
4. Déployez !

### Backend → Railway/Render (Gratuit/Payant)

1. Créez un compte sur railway.app ou render.com
2. Créez un nouveau service Web
3. Uploadez le dossier backend
4. Configurez les variables d'environnement depuis .env.example
5. Déployez !

---

## ⚠️ Checklist Sécurité Production

- [ ] Changez `JWT_SECRET` avec une clé de 32+ caractères aléatoires
- [ ] Configurez HTTPS (SSL) sur votre domaine
- [ ] Limitez `CORS_ORIGINS` à votre domaine frontend uniquement
- [ ] Vérifiez un domaine sur Resend pour envoyer des emails à tous

---

## 🔑 Informations de connexion

**MongoDB Atlas:**
- Host: msg.azwnc1f.mongodb.net
- Database: sync_messaging
- User: msg

**Resend Email:**
- API Key: Configurée
- Note: En mode test, seule votre adresse vérifiée peut recevoir des emails

---

## 🆘 Dépannage

### L'API ne répond pas
```bash
# Vérifiez les logs
tail -f /var/log/sync-backend.log

# Vérifiez que le port est ouvert
sudo ufw allow 8001
```

### Erreur CORS
Assurez-vous que `CORS_ORIGINS` dans le backend contient l'URL exacte du frontend.

### WebSocket ne fonctionne pas
Configurez Nginx pour supporter les WebSockets (voir config ci-dessus).

---

## 📞 Support

Pour toute question, vérifiez :
1. Les logs du backend
2. La console du navigateur (F12)
3. La connexion MongoDB Atlas
