# Exercice HelloWork avec l'API France Travail par Fabrice Marguerie

## Technologies utilisées

- Sveltekit
- TypeScript
- Remult
- SQLite

J'ai choisi d'utiliser Svelte/SvelteKit car ce sont les technologies que j'ai le plus utilisées ces derniers mois.

J'ai choisi TypeScript car je l'ai beaucoup utilisé dernièrement. J'ai regretté de ne pas avoir utilisé C# au moment de générer le rapport !

J'ai utilisé Remult pour la gestion de la base de données car je voulais tester cette bibliothèque, qui facilite la gestion données et car elle fournit directement une interface de visualisation des données (http://localhost:5173/api/admin#/entity/jobs).

## Ressources pour l'API France Travail

- [Référence de l'API pour récupérer les offres d'emploi](https://francetravail.io/data/api/offres-emploi/documentation#/api-reference/operations/recupererListeOffre)
- [Schéma des données retournées par l'API](https://francetravail.io/produits-partages/catalogue/offres-emploi/documentation#/api-reference/schemas/Offre)
- [Documentation pour OAuth](https://francetravail.io/produits-partages/documentation/utilisation-api-france-travail) (autorisation `Client credentials grant`)

## Limitations

- Il manque la gestion des erreurs
- Il n'y a pas de mise à jour des offres d'emploi modifiées
- Une fois qu'on a récupéré les offres postérieures à une date donnée, on ne peut pas récupérer les offres antérieures

## Configuration

Créer un fichier `.env` avec les variables d'environnement suivantes :

```dosini
FRANCE_TRAVAIL_CLIENT_ID=l'identifiant fourni par France Travail
FRANCE_TRAVAIL_CLIENT_SECRET=le secret fourni par France Travail
```

## Exécution

```bash
pnpm install && pnpm run dev
```
