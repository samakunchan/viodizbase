# NRGX

## Boucle infini

Situation: Les données passent de component -> action -> effet, et cela produit une boucle infini.

Résolution:

- Ne pas utiliser d'observable quand on utilise le service pour lancer le debut du cycle de vie des données
- Instancier un nouvel object au moment critique afin de le redonner au new UserLoaded({ user })

## Dépendence rajouter

    npm install --save toastr
