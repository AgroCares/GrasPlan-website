# GrasPlan website

GrasPlan is een digitale graslandgebruikskalender. Met GrasPlan is het mogelijk om voor al je percelen het graslandmanagement bij te houdem. Je kunt hierin aangeven wanneer je gemaaid, beweid of bemest heeft. Daarna heb je direct met GrasPlan een eenvoudig van al percelen. GrasPlan ondersteunt ook rotatieweiden.

GrasPlan wordt in 2020 ook ingezet binnen de GLB-pilot in Noord-Holland. GrasPlan is een eerste prototype. Heb je waardevolle feedback over de applicatie of wensen qua gebruikersvriendelijkheid en functionaliteit, laat het ons weten. Mail je reactie naar info@grasplan.nl of stuur een issue in op GitHub.

Je kunt gebruik maken van GrasPlan op [grasplan.nl](https://grasplan.nl)

## Installatie

De website van GrasPlan is open-source beschikbaar. Om GrasPlan lokaal te draaien moet je eerst NodeJS 12 ([download](https://nodejs.org/en/download/)) hebben geïnstalleerd. Je kunt daarna met de volgende code GrasPlan draaien.

```
git clone https://github.com/AgroCares/GrasPlan-website.git
npm install
npm start
```

Om connectie met de NMI API te maken en data op te vragen en in te laden, is een `.env` bestand nodig in de `grasplan-website` map met de volgende data:

```
GRAS_SESSION_SECRET=[JOUW_SESSION_SECRET]
API_KEY=[JOUW_API_KEY]
API_URL=[URL_VAN_DE_API]
PORT=5621
NODE_ENV=development
```

Toegang tot de NMI API kan worden aangevraagd door een mail te sturen naar `api@grasplan.nl`.

Heb je ideeën of verbeteringen voor code van GrasPlan? Leuk, stuur ze dan in als issue of pull request!

## Documentatie

Op dit moment is er nog geen uitgebreide documentatie voor grasplan-website. Als je vragen hebt leggen we het je graag uit! Maak hiervoor een issue aan of stuur naar `info@grasplan.nl`.


![Logo of NMI](https://media.licdn.com/dms/image/C560BAQEYGcm4HjNnxA/company-logo_200_200/0?e=2159024400&v=beta&t=u40rJ7bixPWB2SAqaj3KCKzJRoKcqf0wUXCdmsTDQvw)

![eu](https://user-images.githubusercontent.com/37927107/78378810-cd3a8300-75d1-11ea-8948-45f8f845ddc3.jpg)