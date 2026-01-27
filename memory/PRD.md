# Sync - Messagerie Instantanée

## Description
Application de messagerie instantanée moderne inspirée de WhatsApp/Messenger, avec support temps réel, conversations 1-à-1 et de groupe, et partage de fichiers.

## Architecture
- **Backend**: FastAPI + MongoDB + WebSocket
- **Frontend**: React + Tailwind CSS + shadcn/ui
- **Auth**: JWT avec bcrypt
- **Real-time**: WebSocket pour messagerie instantanée

## Fonctionnalités Implémentées ✅
- [x] Authentification JWT (inscription/connexion)
- [x] Conversations privées (1-à-1)
- [x] Conversations de groupe
- [x] Envoi de messages texte en temps réel
- [x] Upload et partage de fichiers/images
- [x] Recherche d'utilisateurs
- [x] Indicateur de frappe
- [x] Compteur de messages non lus
- [x] Indicateur de statut en ligne
- [x] Theme automatique (clair/sombre/système)
- [x] Design glassmorphism moderne
- [x] Interface responsive (mobile/desktop)

## Endpoints API
- POST /api/auth/register - Inscription
- POST /api/auth/login - Connexion
- GET /api/auth/me - Profil utilisateur
- GET /api/users/search - Recherche utilisateurs
- POST /api/conversations - Créer conversation
- GET /api/conversations - Liste conversations
- POST /api/messages - Envoyer message
- GET /api/messages/{id} - Messages d'une conversation
- POST /api/files/upload - Upload fichier
- WS /ws/{token} - WebSocket temps réel

## Backlog (Prochaines fonctionnalités)
### P0 (Priorité haute)
- [ ] Notifications push
- [ ] Indicateur "lu/non lu" détaillé

### P1 (Priorité moyenne)
- [ ] Réactions aux messages (emojis)
- [ ] Répondre à un message spécifique
- [ ] Suppression de messages

### P2 (Priorité basse)
- [ ] Appels audio/vidéo
- [ ] Stories/Status
- [ ] Chiffrement de bout en bout

## Date de création: 27 Janvier 2026
