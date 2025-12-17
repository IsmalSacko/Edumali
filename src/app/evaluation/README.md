# 📊 Module Évaluations & Notes - Ionic + Capacitor

Ce module complet permet de gérer, afficher et analyser les évaluations et notes des élèves avec **trois modes d'affichage** optimisés pour **Web, Android et iOS**.

---

## 🎯 Fonctionnalités Principales

### 📋 Mode Liste
- Affichage des évaluations **groupées par élève**
- Moyenne par élève avec barre de progression
- Détails par note (matière, type, score /20)
- Commentaires et dates d'évaluation
- Recherche par élève ou matière

### 📑 Mode Bulletin
- **Bulletin officiel** d'un élève pour un trimestre
- Moyenne générale en vedette
- Notes par matière avec coefficient
- Commentaires du maître
- Vue propre et imprimable

### 📈 Mode Statistiques
- **Moyenne générale** de toute la classe
- **Nombre d'élèves** évalués
- **Performances par matière** avec coefficients
- Code couleur pour les performances (rouge, orange, jaune, vert)
- Comparaison des matières

---

## 🚀 Utilisation

### Installation & Intégration

1. **Copier les fichiers** dans ton projet :
```
src/app/evaluation/
├── evaluation.page.ts
├── evaluation.page.html
├── evaluation.page.scss
└── evaluation.page.spec.ts

src/app/services/evaluation/
└── evaluation.service.ts
```

2. **Ajouter la route** dans `app.routes.ts` :
```typescript
{
  path: 'evaluation',
  component: EvaluationPage,
  canActivate: [AuthGuard],
}
```

3. **Ajouter au menu** de navigation (nav.page.html) :
```html
<ion-item routerLink="/evaluation">
  <ion-icon name="stats-chart-outline" slot="start"></ion-icon>
  <ion-label>Évaluations</ion-label>
</ion-item>
```

---

## 🔧 Architecture du Service

### `EvaluationService`

#### Méthodes Principales

**Récupérer toutes les évaluations :**
```typescript
await evaluationService.getAll({
  trimester: 1,
  page: 1,
  limit: 50
});
```

**Récupérer par élève :**
```typescript
await evaluationService.getByStudent(studentId, {
  trimester: 1
});
```

**Récupérer par classe :**
```typescript
await evaluationService.getByClasse(classeId, {
  trimester: 2
});
```

**Récupérer un bulletin :**
```typescript
const bulletin = await evaluationService.getBulletin(studentId, trimester);
// Retourne : { student_id, student_name, average, grades, comments }
```

**Récupérer la note finale par matière :**
```typescript
const finalNote = await evaluationService.getMatiereFinalNote(evalId);
// Retourne : { student_id, matiere_id, trimester, note_finale }
```

#### Signals Réactifs

```typescript
// États
evaluationService.evaluations()        // Toutes les évaluations
evaluationService.currentEvaluation()  // Évaluation sélectionnée
evaluationService.loading()            // État de chargement
evaluationService.error()              // Messages d'erreur
evaluationService.totalCount()         // Nombre total

// Données calculées
evaluationService.filteredEvaluations()  // Évaluations filtrées
```

#### Filtrage

```typescript
// Mettre à jour le filtre
evaluationService.updateFilter({
  student: 123,
  classe: 45,
  matiere: 12,
  trimester: 2
});

// Réinitialiser les filtres
evaluationService.resetFilter();
```

---

## 📱 Optimisations Ionic + Capacitor

### ✅ Web
- Interface responsive complète
- Recherche en temps réel
- Statistiques calculées côté client

### ✅ Android
- Native feel avec Capacitor
- Gestures natifs (swipe, tap)
- Optimisé pour écrans petits
- Pull-to-refresh intégré

### ✅ iOS
- Design compatible iOS
- Safe Area respektée
- Haptic feedback possible (ajoutable avec Capacitor)
- Transitions fluides

### 🎨 Features Cross-Platform
- **Thème sombre/clair** automatique
- **Recherche** optimisée
- **Pagination** pour grandes données
- **Toasts** d'erreur élégants
- **Progress bars** avec animations

---

## 🎨 Personnalisation des Couleurs

Les couleurs des badges se basent sur les performances :

| Score | Couleur | Label |
|-------|---------|-------|
| ≥ 16/20 | 🟢 **Success** | Excellent |
| 12-15/20 | 🟡 **Warning** | Bon |
| 10-11/20 | 🟠 **Medium** | Acceptable |
| < 10/20 | 🔴 **Danger** | Faible |

Personnalisable dans `getScoreColor()` de `evaluation.page.ts`.

---

## 🔌 Intégration Backend Django

### Endpoints Attendus

**GET `/api/grades/evaluations/`**
```json
{
  "count": 100,
  "results": [
    {
      "id": 1,
      "student": { "id": 1, "first_name": "John", "last_name": "Doe" },
      "matiere": { "id": 5, "nom": "Mathematics", "coefficient": 2 },
      "eval_type": "CC",
      "score": 15,
      "max_score": 20,
      "trimester": 1,
      "comment": "Très bon travail",
      "date": "2025-12-01"
    }
  ]
}
```

**GET `/api/grades/evaluations/{id}/matiere-final-note/`**
```json
{
  "student_id": 1,
  "matiere_id": 5,
  "trimester": 1,
  "note_finale": 15.5
}
```

**GET `/api/grades/evaluations/bulletin/{student_id}/{trimester}/`**
```json
{
  "student_id": 1,
  "student_name": "John Doe",
  "trimester": 1,
  "average": 14.2,
  "comments": "Élève très motivé",
  "grades": [
    {
      "matiere_id": 5,
      "matiere_name": "Mathematics",
      "average": 15.5,
      "count": 6,
      "coefficient": 2
    }
  ]
}
```

---

## 📊 Types TypeScript

```typescript
interface EvaluationFilter {
  student?: number;
  classe?: number;
  matiere?: number;
  trimester?: number;
  page?: number;
  limit?: number;
}

interface Bulletin {
  student_id: number;
  student_name: string;
  trimester: number;
  average: number;
  grades: any[];
  comments?: string;
}

interface MatiereFinalNote {
  student_id: number;
  matiere_id: number;
  trimester: number;
  note_finale: number;
}

type EvalType = 'CC' | 'EX' | 'TP' | 'DS' | 'RA';
```

---

## 🧪 Tests

Tests unitaires inclus dans `evaluation.page.spec.ts` :

```bash
# Lancer les tests
ng test --include='**/evaluation.page.spec.ts'
```

Couvre :
- ✅ Création du composant
- ✅ Chargement des données
- ✅ Changement de mode
- ✅ Calcul des scores
- ✅ Attribution des couleurs

---

## 🐛 Débogage

### Afficher les logs dans la console
```typescript
// Dans evaluation.service.ts
console.log('✅ Evaluations chargées:', items.length);
console.error('❌ Error fetching evaluations', e);
```

### Vérifier les signaux
```typescript
// Dans le template ou composant
{{ evaluations.length }} évaluations
{{ loading() }} (true/false)
{{ error() }} (message d'erreur ou null)
```

---

## 📱 Déploiement sur Capacitor

### Build & Deploy

```bash
# Build Angular
ng build --configuration production

# Sync Capacitor
ionic cap sync

# iOS
ionic cap open ios

# Android
ionic cap open android
```

### Permissions Nécessaires (si export PDF)
Ajouter dans `capacitor.config.ts` :
```typescript
{
  plugins: {
    Filesystem: {
      permissions: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE']
    }
  }
}
```

---

## 🎓 Exemples d'Utilisation

### Afficher le bulletin d'un élève
```typescript
// Dans le composant
async loadStudentBulletin(studentId: number) {
  const bulletin = await this.evaluationService.getBulletin(studentId, 1);
  this.bulletin.set(bulletin);
}
```

### Filtrer par matière
```typescript
// Dans le composant
async filterByMatiere(matiereId: number) {
  this.evaluationService.updateFilter({ matiere: matiereId });
  await this.evaluationService.getAll();
}
```

### Recherche en temps réel
```typescript
// Dans le template
<ion-searchbar [(ngModel)]="searchText()" 
               placeholder="Chercher..."></ion-searchbar>

// Le filtre se met à jour automatiquement via computed()
filteredEvaluations = computed(() => {
  const all = this.evaluationService.filteredEvaluations();
  return all.filter(e => 
    e.matiere.nom.includes(this.searchText())
  );
});
```

---

## 📚 Ressources

- [Ionic Components](https://ionicframework.com/docs/components)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Angular Signals](https://angular.io/guide/signals)

---

**Version :** 1.0.0  
**Dernière mise à jour :** 17 Décembre 2025  
**Compatibilité :** Angular 16+, Ionic 7+, Capacitor 5+
