// pages/index.js
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';
import {
  FileText, Target, Drama, Search, UserRound, Menu, X, ChevronDown, Sparkles
} from "lucide-react";
import Link from "next/link";

/**
 * ========= Mini i18n (scalabil pentru viitor / DB) =========
 * Pentru migrare în MySQL: tabele:
 *  - translations(lang, ns, key, value)
 *  - scenarios(id, lang, label, theme, goal, tone, sample, cat)
 */
const I18N = {
  fr: {
    ui: {
      siteTitle: 'lexisly.com',
      subtitle: 'Écrivez naturellement. Recevez des corrections professionnelles.',
      menuHome: 'Accueil',
      menuResources: 'Ressources',
      menuVocabulary: 'Vocabulaire',
      menuGrammar: 'Grammaire',
      menuFAQ: 'FAQ',
      menuLanguages: 'Langues',
      langFr: 'Français',
      langEn: 'English',
      langRo: 'Română',
      langDe: 'Deutsch',
      editorLabel: 'Votre message',
      useSample: "Utiliser l’exemple (test)",
      placeholder: 'Écrivez votre message ici…',
      cta: 'Corriger mon français',
      analyzing: 'Analyse en cours…',
      corrected: 'Correction',
      mistakes: 'Erreurs',
      alternatives: 'Alternatives',
      scores: 'Scores',
      clarity: 'Clarté',
      correctness: 'Exactitude',
      tone: 'Ton',
      noAlternatives: 'Pas d’alternatives.',
      noScenarios: 'Aucun scénario disponible dans cette catégorie.',
      style: 'style',
      noSignificantErrors: 'Aucune erreur significative ; seulement des choix stylistiques mineurs.',
      categoriesAria: 'Onglets de catégories',
      scenariosAria: 'Scénarios dans',
    },
    categories: {
      work: 'Travail',
      family: 'Famille',
      shopping: 'Achats',
      holiday: 'Vacances',
      health: 'Santé',
      travel: 'Voyage',
    },
    scenarios: {
      'support-invoice': {
        label: 'Support client – Remise sur facture',
        theme: `Vous êtes agent de support. Un client signale que la remise flash de 10 % n’apparaît pas sur la facture MMC.`,
        goal: `Demander à la facturation d’enquêter, confirmer le prix attendu et indiquer la suite.`,
        tone: `Poli et concis.`,
        sample: `Besoin d’aide : la remise flash -10 % n’apparaît pas sur la facture MMC ; Karen se plaint.`
      },
      'interview': {
        label: 'Entretien – Question comportementale',
        theme: `Vous répondez : « Parlez-moi d’une fois où vous avez géré un interlocuteur difficile. »`,
        goal: `Utilisez la méthode STAR pour expliquer la situation en 120–160 mots.`,
        tone: `Professionnel et positif.`,
        sample: `Nous avions un interlocuteur qui changeait le périmètre chaque semaine et j’ai…`
      },
      'standup': {
        label: 'Daily stand-up – Avancées & blocages',
        theme: `Réunion quotidienne avec votre équipe.`,
        goal: `Dire ce que vous avez fait hier, ce que vous ferez aujourd’hui, et les blocages en ≤ 80 mots.`,
        tone: `Concise et factuelle.`,
        sample: `Hier, j’ai terminé l’écran facture. Aujourd’hui, intégration API. Bloqué par l’auth.`
      },
      'negotiate-priority': {
        label: 'Négocier la priorité d’une tâche',
        theme: `Prioriser un correctif de bug avant une fonctionnalité à faible impact.`,
        goal: `Expliquer l’impact, proposer un calendrier, demander confirmation.`,
        tone: `Fermement respectueux.`,
        sample: `Peut-on prioriser le bug checkout avant la bannière ? Il affecte les paiements.`
      },
      'project-deadline': {
        label: 'Demande de report de délai',
        theme: `Demander un report d’échéance.`,
        goal: `Expliquer les raisons, proposer une nouvelle date, montrer le plan.`,
        tone: `Professionnel, orienté solution.`,
        sample: `Suite à des imprévus techniques, je demande un report d’une semaine.`
      },
      'new-hire-intro': {
        label: 'Présentation d’un nouvel arrivant',
        theme: `Présenter un collègue.`,
        goal: `Rôle, parcours et contribution.`,
        tone: `Chaleureux et informatif.`,
        sample: `Bienvenue à John, notre nouveau dev back-end (5 ans d’XP Node.js).`
      },

      'landlord-boiler': {
        label: 'Appeler le propriétaire – Chaudière',
        theme: `La chaudière s’est arrêtée hier soir.`,
        goal: `Demander une visite urgente aujourd’hui/demain et proposer des créneaux.`,
        tone: `Ferme mais poli.`,
        sample: `Bonjour, la chaudière ne marche plus depuis hier soir. Pouvez-vous passer aujourd’hui ?`
      },
      'teacher-meeting': {
        label: 'École – RDV parent-enseignant',
        theme: `Discuter des progrès de lecture de l’enfant.`,
        goal: `Proposer deux créneaux ; demander observations et supports.`,
        tone: `Amical et coopératif.`,
        sample: `Peut-on planifier un court rendez-vous pour parler des progrès de lecture d’Alex ?`
      },
      'family-reunion': {
        label: 'Organiser une réunion de famille',
        theme: `Préparer une réunion familiale le mois prochain.`,
        goal: `Suggérer date/lieu ; préférences repas/activités.`,
        tone: `Amical et inclusif.`,
        sample: `Je pense organiser une réunion de famille le 15 chez nous. Des avis ?`
      },
      'babysitting-request': {
        label: 'Demande de baby-sitting',
        theme: `Chercher une garde ce week-end.`,
        goal: `Indiquer dates/heures, âges, rémunération.`,
        tone: `Poli et clair.`,
        sample: `Pourriez-vous garder mes enfants (5 et 8 ans) samedi soir ?`
      },
      'pet-care': {
        label: 'Demander des soins pour l’animal',
        theme: `Aide pour nourrir/promener le chien durant votre absence.`,
        goal: `Lister dates, besoins, compensation.`,
        tone: `Amical et reconnaissant.`,
        sample: `Pourriez-vous nourrir et promener Max de vendredi à dimanche ?`
      },
      'appliance-repair': {
        label: 'Réparation d’appareil',
        theme: `Machine à laver en panne.`,
        goal: `Expliquer le souci, demander une date, coûts.`,
        tone: `Poli mais urgent.`,
        sample: `La machine ne tourne plus depuis hier. Possible de la réparer cette semaine ?`
      },

      'refund-online': {
        label: 'Commande en ligne – Remboursement',
        theme: `Colis arrivé endommagé.`,
        goal: `Donner n° de commande, décrire le souci, demander remboursement/remplacement.`,
        tone: `Neutre et concis.`,
        sample: `Commande #10422 : vitre de protection fissurée. Je souhaite un remboursement ou un remplacement.`
      },
      'price-match': {
        label: 'Alignement de prix',
        theme: `Prix plus bas trouvé chez un concurrent.`,
        goal: `Fournir la preuve, demander si l’alignement s’applique et la procédure.`,
        tone: `Neutre et direct.`,
        sample: `Même modèle 20 £ moins cher chez RivalTech. Proposez-vous un alignement ?`
      },
      'delayed-delivery': {
        label: 'Livraison en retard',
        theme: `Commande non arrivée à temps.`,
        goal: `Détails, date mise à jour, compensation si applicable.`,
        tone: `Poli mais ferme.`,
        sample: `Commande #10987 attendue hier et non reçue. Avez-vous une mise à jour ?`
      },
      'product-warranty': {
        label: 'Garantie produit',
        theme: `Produit défectueux sous garantie.`,
        goal: `Preuve d’achat, panne, réparation/remplacement.`,
        tone: `Clair et factuel.`,
        sample: `Mon aspirateur (acheté en mars) ne s’allume plus. Peut-il être remplacé ?`
      },
      'gift-wrap': {
        label: 'Emballage cadeau',
        theme: `Commander un cadeau en ligne.`,
        goal: `Option d’emballage et coût.`,
        tone: `Poli et concis.`,
        sample: `Pouvez-vous emballer la commande #11223 ? Y a-t-il un supplément ?`
      },
      'bulk-order': {
        label: 'Commande en gros',
        theme: `Achat en quantité.`,
        goal: `Stock, remise, délai de livraison.`,
        tone: `Direct et pro.`,
        sample: `Je voudrais 50 unités de l’article #4421. Quel est votre meilleur prix ?`
      },

      'travel-booking': {
        label: 'Vol – Budget & dates',
        theme: `AR Londres → Madrid le mois prochain.`,
        goal: `2–3 options < £180, sans nuit d’escale, règles bagages incluses.`,
        tone: `Amical et clair.`,
        sample: `J’ai besoin d’un vol pas cher Londres-Madrid le mois prochain, svp.`
      },
      'hotel-request': {
        label: 'Hôtel – Demande spéciale',
        theme: `Chambre calme, loin de l’ascenseur.`,
        goal: `Confirmer la résa, demander la préférence, early check-in.`,
        tone: `Poli et clair.`,
        sample: `Réservation #AB3492, 2 nuits. Chambre calme loin de l’ascenseur possible ?`
      },
      'car-rental': {
        label: 'Location de voiture',
        theme: `Louer une voiture.`,
        goal: `Dates, type, assurance.`,
        tone: `Clair et direct.`,
        sample: `Petite voiture du 3 au 7 mai à Barcelone. Quelles options ?`
      },
      'tour-booking': {
        label: 'Réserver une visite guidée',
        theme: `Réserver une visite de ville.`,
        goal: `Dates, prix, taille de groupe, langues.`,
        tone: `Poli et curieux.`,
        sample: `Avez-vous une visite de Rome le 12 mai en anglais ?`
      },
      'cruise-offer': {
        label: 'Offres croisière',
        theme: `Infos croisières Méditerranée.`,
        goal: `Itinéraires, prix, cabines, dates.`,
        tone: `Intéressé et poli.`,
        sample: `Vos meilleures offres pour une croisière de 7 jours en Méditerranée ?`
      },
      'restaurant-reservation': {
        label: 'Réservation restaurant',
        theme: `Dîner en vacances.`,
        goal: `Date/heure, convives, régimes.`,
        tone: `Poli et amical.`,
        sample: `Table pour 4 le 15 juillet à 19 h, options végétariennes svp.`
      },

      'gp-appointment': {
        label: 'RDV médecin généraliste – Symptômes',
        theme: `Toux persistante depuis 2 semaines.`,
        goal: `Symptômes, dispos, documents nécessaires.`,
        tone: `Clair et direct.`,
        sample: `Je souhaite un RDV pour une toux qui dure depuis deux semaines.`
      },
      'dentist-visit': {
        label: 'Dentiste – Détartrage',
        theme: `Contrôle + nettoyage.`,
        goal: `Date, assurance.`,
        tone: `Poli et concis.`,
        sample: `Puis-je réserver un nettoyage la semaine prochaine ? Acceptez-vous AXA ?`
      },
      'physio-session': {
        label: 'Séance de kiné',
        theme: `Blessure au dos.`,
        goal: `Dispos, description, plan.`,
        tone: `Poli et informatif.`,
        sample: `Je me suis blessé au dos. Une séance de kiné cette semaine ?`
      },
      'eye-test': {
        label: 'Examen de la vue',
        theme: `Besoin d’un examen.`,
        goal: `Premier créneau, prix, verres inclus ?`,
        tone: `Clair et poli.`,
        sample: `Avez-vous un créneau demain après-midi ?`
      },
      'nutritionist-consult': {
        label: 'Consultation nutrition',
        theme: `Conseils perte de poids.`,
        goal: `RDV, objectifs, formules.`,
        tone: `Santé et politesse.`,
        sample: `Je souhaite une consultation pour une perte de poids saine.`
      },
      'mental-health': {
        label: 'Soutien santé mentale',
        theme: `Séances pour anxiété.`,
        goal: `Disponibilités, format, confidentialité.`,
        tone: `Sensible et respectueux.`,
        sample: `Pouvez-vous recommander un thérapeute pour l’anxiété ?`
      },

      'visa-query': {
        label: 'Visa – Liste de documents',
        theme: `Infos consulat pour visa touristique court.`,
        goal: `Checklist officielle, délais.`,
        tone: `Formel et poli.`,
        sample: `Pouvez-vous confirmer la liste des documents pour un visa court séjour ?`
      },
      'flight-delay': {
        label: 'Vol en retard',
        theme: `Retard > 4 h.`,
        goal: `Compensation ou réacheminement.`,
        tone: `Poli mais ferme.`,
        sample: `Vol EZY456 retardé 5 h. Quelles compensations ?`
      },
      'lost-luggage': {
        label: 'Bagage perdu',
        theme: `Bagage non livré.`,
        goal: `Détails, description, contact.`,
        tone: `Clair et factuel.`,
        sample: `Bagage manquant vol BA217. Samsonite noire, étiquette #9982.`
      },
      'travel-insurance-claim': {
        label: 'Assurance voyage – Déclaration',
        theme: `Objets perdus en voyage.`,
        goal: `Détails, reçus, rapport.`,
        tone: `Formel et détaillé.`,
        sample: `Déclaration pour un appareil photo perdu à Paris. Rapport de police joint.`
      },
      'airport-transfer': {
        label: 'Transfert aéroport',
        theme: `Aéroport → hôtel.`,
        goal: `Heure d’arrivée, adresse, passagers.`,
        tone: `Poli et clair.`,
        sample: `Prise à Heathrow à 10 h, dépôt Hilton Park Lane, 2 passagers.`
      },
      'travel-advisory': {
        label: 'Conseils aux voyageurs',
        theme: `Mises à jour sécurité.`,
        goal: `Risques, santé, restrictions.`,
        tone: `Poli et prudent.`,
        sample: `Y a-t-il des avis pour la Thaïlande en novembre ?`
      }
    }
  },
  en: {
    ui: {
      siteTitle: 'lexisly.com',
      subtitle: 'Write naturally. Receive professional corrections.',
      menuHome: 'Home',
      menuResources: 'Resources',
      menuVocabulary: 'Vocabulary',
      menuGrammar: 'Grammar',
      menuFAQ: 'FAQ',
      menuLanguages: 'Languages',
      langFr: 'Français',
      langEn: 'English',
      langRo: 'Română',
      langDe: 'Deutsch',
      editorLabel: 'Message',
      useSample: 'Use sample',
      placeholder: 'Write your message here…',
      cta: 'Fix my English',
      analyzing: 'Analyzing…',
      corrected: 'Corrected',
      mistakes: 'Mistakes',
      alternatives: 'Alternatives',
      scores: 'Scores',
      clarity: 'Clarity',
      correctness: 'Correctness',
      tone: 'Tone',
      noAlternatives: 'No alternatives.',
      noScenarios: 'No scenarios available in this category.',
      style: 'style',
      noSignificantErrors: 'No significant errors; minor stylistic choices only.',
      categoriesAria: 'Category tabs',
      scenariosAria: 'Scenarios in',
    },
    categories: {
      work: 'Work',
      family: 'Family',
      shopping: 'Shopping',
      holiday: 'Holiday',
      health: 'Health',
      travel: 'Travel',
    },
    scenarios: {} // (fallback to EN base where no localized copy yet)
  },
  ro: {
  ui: {
    siteTitle: 'lexisly.com',
    subtitle: 'Scrie natural. Primește corecturi profesionale.',
    menuHome: 'Acasă',
    menuResources: 'Resurse',
    menuVocabulary: 'Vocabular',
    menuGrammar: 'Gramatică',
    menuFAQ: 'Întrebări frecvente',
    menuLanguages: 'Limbi',
    langFr: 'Français',
    langEn: 'English',
    langRo: 'Română',
    langDe: 'Deutsch',
    editorLabel: 'Mesajul tău',
    useSample: 'Folosește exemplul (test)',
    placeholder: 'Scrie mesajul aici…',
    cta: 'Corectează-mi româna',
    analyzing: 'Analiză în curs…',
    corrected: 'Corectare',
    mistakes: 'Greșeli',
    alternatives: 'Alternative',
    scores: 'Scoruri',
    clarity: 'Claritate',
    correctness: 'Corectitudine',
    tone: 'Ton',
    noAlternatives: 'Nicio alternativă.',
    noScenarios: 'Nu există scenarii în această categorie.',
    style: 'stil',
    noSignificantErrors: 'Nicio eroare semnificativă; doar alegeri stilistice minore.',
    categoriesAria: 'File de categorii',
    scenariosAria: 'Scenarii în',
  },
  categories: {
    work: 'Muncă',
    family: 'Familie',
    shopping: 'Cumpărături',
    holiday: 'Vacanță',
    health: 'Sănătate',
    travel: 'Călătorii',
  },
scenarios: {
  // --- Muncă ---
  'support-invoice': {
    label: 'Suport clienți – Reducere pe factură',
    theme: 'Ești agent de suport. Un client raportează că reducerea flash de 10% nu apare pe factura MMC.',
    goal: 'Cere facturării să investigheze, confirmă prețul așteptat și indică pașii următori.',
    tone: 'Politicos și concis.',
    sample: 'Am nevoie de ajutor: reducerea flash -10% nu apare pe factura MMC; Karen se plânge.'
  },
  'interview': {
    label: 'Interviu – Întrebare comportamentală',
    theme: 'Răspunzi la „Povestește-mi despre o dată când ai gestionat un stakeholder dificil”.',
    goal: 'Folosește structura STAR pentru a explica situația în 120–160 de cuvinte.',
    tone: 'Profesional și pozitiv.',
    sample: 'Aveam un stakeholder care schimba scope-ul săptămânal și eu...'
  },
  'standup': {
    label: 'Stand-up zilnic – Progres & blocaje',
    theme: 'Stand-up zilnic cu echipa.',
    goal: 'Spune ce ai făcut ieri, ce faci azi și blocajele, în maximum 80 de cuvinte.',
    tone: 'Concis și factual.',
    sample: 'Ieri am terminat ecranul de factură. Azi integrare API. Blocaj la auth.'
  },
  'negotiate-priority': {
    label: 'Negociază prioritatea unei sarcini',
    theme: 'Vrei ca un coleg să prioritizeze un bug în locul unei funcții cu impact redus.',
    goal: 'Explică impactul, propune un calendar și cere confirmarea.',
    tone: 'Ferm, dar respectuos.',
    sample: 'Putem prioritiza bug-ul de checkout înaintea bannerului nou? Afectează plățile.'
  },
  'project-deadline': {
    label: 'Extindere termen proiect',
    theme: 'Ceri o extindere de termen.',
    goal: 'Explică motivele întârzierii, propune o dată nouă și arată planul de finalizare.',
    tone: 'Profesional și orientat pe soluții.',
    sample: 'Din cauza unor probleme tehnice neprevăzute, solicit extinderea termenului cu o săptămână.'
  },
  'new-hire-intro': {
    label: 'Prezintă un coleg nou',
    theme: 'Prezinți un nou coleg echipei.',
    goal: 'Rol, experiență și contribuție.',
    tone: 'Cald și informativ.',
    sample: 'Îl întâmpinăm pe John, noul nostru backend dev cu 5 ani experiență în Node.js.'
  },

  // --- Familie ---
  'landlord-boiler': {
    label: 'Sună proprietarul – Problemă la centrală',
    theme: 'Ești chiriaș, centrala s-a oprit aseară.',
    goal: 'Solicită o vizită urgentă azi sau mâine și confirmă intervalele disponibile.',
    tone: 'Ferm, dar politicos.',
    sample: 'Bună ziua, centrala nu mai funcționează de aseară. Puteți veni azi?'
  },
  'teacher-meeting': {
    label: 'Școală – Întâlnire părinte–profesor',
    theme: 'Vrei să discuți progresul la citit al copilului.',
    goal: 'Propune două intervale, cere observații actuale și materiale de pregătire.',
    tone: 'Prietenos și cooperant.',
    sample: 'Putem programa o întâlnire scurtă despre progresul la citit al lui Alex?'
  },
  'family-reunion': {
    label: 'Organizează reuniune de familie',
    theme: 'Planifici o reuniune luna viitoare.',
    goal: 'Sugerează data/locația și cere preferințe pentru mâncare/activități.',
    tone: 'Prietenos și incluziv.',
    sample: 'Mă gândesc la o reuniune de familie pe 15, la noi. Ce părere aveți?'
  },
  'babysitting-request': {
    label: 'Solicitare babysitting',
    theme: 'Ai nevoie de cineva să stea cu copiii în weekend.',
    goal: 'Precizează date/ore, vârstele copiilor și remunerația.',
    tone: 'Politicos și clar.',
    sample: 'Poți sta cu copiii (5 și 8 ani) sâmbătă seara? Plătesc.'
  },
  'pet-care': {
    label: 'Ajutor cu animalul de companie',
    theme: 'Ai nevoie de hrănire/plimbare pentru câine cât ești plecat.',
    goal: 'Listează perioadele, nevoile și remunerația.',
    tone: 'Prietenos și recunoscător.',
    sample: 'Ai putea hrăni și plimba pe Max de vineri până duminică?'
  },
  'appliance-repair': {
    label: 'Programare reparație electrocasnic',
    theme: 'Mașina de spălat s-a stricat.',
    goal: 'Descrie problema, cere o dată de reparație și întreabă costurile.',
    tone: 'Politicos, dar urgent.',
    sample: 'Mașina nu mai stoarce din ieri. O puteți repara săptămâna asta?'
  },

  // --- Cumpărături ---
  'refund-online': {
    label: 'Comandă online – Cerere de rambursare',
    theme: 'Coletul a sosit deteriorat.',
    goal: 'Oferă numărul comenzii, descrie problema și cere rambursare sau înlocuire.',
    tone: 'Neutru și concis.',
    sample: 'Comanda #10422 a sosit cu folia spartă. Aș dori rambursare sau înlocuire.'
  },
  'price-match': {
    label: 'Întrebare despre preț egalat',
    theme: 'Ai găsit același produs mai ieftin la concurență.',
    goal: 'Furnizează dovada, întreabă dacă se aplică preț egalat și pașii necesari.',
    tone: 'Neutru și direct.',
    sample: 'Am găsit același model cu 20 £ mai ieftin la RivalTech. Faceți preț egalat?'
  },
  'delayed-delivery': {
    label: 'Reclamație întârziere livrare',
    theme: 'Comanda nu a sosit la timp.',
    goal: 'Detalii, dată actualizată de livrare și compensație dacă e cazul.',
    tone: 'Politicos, dar ferm.',
    sample: 'Comanda #10987 trebuia ieri și nu a sosit. Aveți o actualizare?'
  },
  'product-warranty': {
    label: 'Garanție produs',
    theme: 'Produsul s-a defectat în perioada de garanție.',
    goal: 'Dovadă de cumpărare, descrierea defectului și cerere de reparație/înlocuire.',
    tone: 'Clar și factual.',
    sample: 'Aspiratorul (cumpărat în martie) nu pornește. Se poate înlocui?'
  },
  'gift-wrap': {
    label: 'Înfășurare cadou',
    theme: 'Comanzi un cadou online.',
    goal: 'Întreabă dacă există opțiune de ambalare cadou și costul.',
    tone: 'Politicos și concis.',
    sample: 'Se poate ambala cadou comanda #11223? Există taxă suplimentară?'
  },
  'bulk-order': {
    label: 'Comandă en-gros',
    theme: 'Vrei să cumperi o cantitate mare.',
    goal: 'Stoc, discount la volum și termen de livrare.',
    tone: 'Direct și business.',
    sample: 'Aș dori 50 de bucăți din articolul #4421. Care e cel mai bun preț?'
  },

  // --- Vacanță ---
  'travel-booking': {
    label: 'Zbor – Buget & date',
    theme: 'Zbor dus-întors Londra → Madrid luna viitoare.',
    goal: 'Găsește 2–3 opțiuni sub 180 £, fără escale peste noapte; include regulile de bagaje.',
    tone: 'Prietenos și clar.',
    sample: 'Am nevoie de zboruri ieftine Londra–Madrid luna viitoare, te rog.'
  },
  'hotel-request': {
    label: 'Hotel – Cerere specială',
    theme: 'Vrei cameră liniștită departe de lift.',
    goal: 'Confirmă rezervarea, cere preferința și întreabă despre check-in timpuriu.',
    tone: 'Politicos și clar.',
    sample: 'Rezervare #AB3492, 2 nopți. O cameră liniștită, departe de lift, este posibil?'
  },
  'car-rental': {
    label: 'Închiriere mașină',
    theme: 'Vrei să închiriezi o mașină.',
    goal: 'Date ridicare/predare, tip mașină, asigurare.',
    tone: 'Clar și direct.',
    sample: 'Mașină mică 3–7 mai în Barcelona. Ce aveți disponibil?'
  },
  'tour-booking': {
    label: 'Rezervare tur ghidat',
    theme: 'Rezervi un tur de oraș.',
    goal: 'Date, preț, mărimea grupului, limbi disponibile.',
    tone: 'Politicos și curios.',
    sample: 'Aveți tur de oraș la Roma pe 12 mai în engleză?'
  },
  'cruise-offer': {
    label: 'Oferte croazieră',
    theme: 'Informații despre pachete în Mediterană.',
    goal: 'Rute, preț, tipuri de cabine, date disponibile.',
    tone: 'Politicos și interesat.',
    sample: 'Îmi puteți trimite cele mai bune oferte pentru o croazieră de 7 zile în Mediterană?'
  },
  'restaurant-reservation': {
    label: 'Rezervare restaurant',
    theme: 'Rezervi o cină în vacanță.',
    goal: 'Dată/oră, număr persoane, cerințe alimentare.',
    tone: 'Politicos și prietenos.',
    sample: 'Masă pentru 4 pe 15 iulie la 19:00, vă rog opțiuni vegetariene.'
  },

  // --- Sănătate ---
  'gp-appointment': {
    label: 'Programare la medic – Simptome',
    theme: 'Ai o tuse persistentă de 2 săptămâni.',
    goal: 'Descrie simptomele, disponibilitatea și ce e necesar pentru programare.',
    tone: 'Clar și direct.',
    sample: 'Aș vrea o programare pentru o tuse care durează de două săptămâni.'
  },
  'dentist-visit': {
    label: 'Stomatolog – Control & detartraj',
    theme: 'Ai nevoie de control și curățare.',
    goal: 'Cere o dată și întreabă despre asigurare.',
    tone: 'Politicos și concis.',
    sample: 'Pot programa o curățare săptămâna viitoare? Acceptați asigurarea AXA?'
  },
  'physio-session': {
    label: 'Ședință fizioterapie',
    theme: 'Ai nevoie de fizioterapie pentru o accidentare la spate.',
    goal: 'Disponibilitate, descrierea accidentării, plan de tratament.',
    tone: 'Politicos și informativ.',
    sample: 'M-am accidentat la spate. Pot face o ședință de fizioterapie săptămâna aceasta?'
  },
  'eye-test': {
    label: 'Test de vedere',
    theme: 'Vrei un consult oftalmologic.',
    goal: 'Cel mai devreme slot, preț, dacă include prescripție.',
    tone: 'Clar și politicos.',
    sample: 'Aveți un slot pentru test de vedere mâine după-amiază?'
  },
  'nutritionist-consult': {
    label: 'Consultație nutriționist',
    theme: 'Consiliere pentru slăbit sănătos.',
    goal: 'Programare, obiective, pachete.',
    tone: 'Orientat pe sănătate, politicos.',
    sample: 'Aș dori o consultație pentru slăbit sănătos.'
  },
  'mental-health': {
    label: 'Sprijin pentru sănătate mintală',
    theme: 'Cauți consiliere pentru anxietate.',
    goal: 'Disponibilitatea terapeutului, formatul ședințelor, confidențialitate.',
    tone: 'Sensibil și respectuos.',
    sample: 'Puteți recomanda un terapeut pentru ședințe de anxietate?'
  },

  // --- Călătorii ---
  'visa-query': {
    label: 'Viză – Listă documente',
    theme: 'Ceri informații de la consulat pentru o viză turistică scurtă.',
    goal: 'Checklist oficial și timpul de procesare.',
    tone: 'Formal și politicos.',
    sample: 'Puteți confirma lista de documente pentru o viză de scurt sejur?'
  },
  'flight-delay': {
    label: 'Întârziere zbor',
    theme: 'Zbor întârziat peste 4 ore.',
    goal: 'Compensație sau opțiuni de rebooking.',
    tone: 'Politicos, dar ferm.',
    sample: 'Zborul EZY456 a întârziat 5 ore. Ce compensații sunt disponibile?'
  },
  'lost-luggage': {
    label: 'Bagaj pierdut',
    theme: 'Bagajul nu a sosit la destinație.',
    goal: 'Detalii zbor, descriere bagaj, contact.',
    tone: 'Clar și factual.',
    sample: 'Bagaj lipsă de pe zborul BA217. Samsonite neagră, etichetă #9982.'
  },
  'travel-insurance-claim': {
    label: 'Asigurare de călătorie – Dosar daună',
    theme: 'Vrei să reclami obiecte pierdute în călătorie.',
    goal: 'Detalii, chitanțe, proces-verbal.',
    tone: 'Formal și detaliat.',
    sample: 'Revendicare pentru cameră pierdută la Paris. Atașez raportul poliției.'
  },
  'airport-transfer': {
    label: 'Transfer aeroport',
    theme: 'Ai nevoie de transport de la aeroport la hotel.',
    goal: 'Ora sosirii, adresa hotelului, numărul de pasageri.',
    tone: 'Politicos și clar.',
    sample: 'Preluare de la Heathrow la 10:00, destinație Hilton Park Lane, 2 pasageri.'
  },
  'travel-advisory': {
    label: 'Alerte de călătorie',
    theme: 'Verifici actualizări de siguranță pentru o destinație.',
    goal: 'Riscuri curente, recomandări de sănătate, restricții de intrare.',
    tone: 'Politicos și precaut.',
    sample: 'Există alerte pentru călătorie în Thailanda în noiembrie?'
  }
}

},
de: {
  ui: {
    siteTitle: 'lexisly.com',
    subtitle: 'Schreiben Sie natürlich. Erhalten Sie professionelle Korrekturen.',
    menuHome: 'Startseite',
    menuResources: 'Ressourcen',
    menuVocabulary: 'Wortschatz',
    menuGrammar: 'Grammatik',
    menuFAQ: 'FAQ',
    menuLanguages: 'Sprachen',
    langFr: 'Français',
    langEn: 'English',
    langRo: 'Română',
    langDe: 'Deutsch',
    editorLabel: 'Ihre Nachricht',
    useSample: 'Beispiel verwenden (Test)',
    placeholder: 'Schreiben Sie hier Ihre Nachricht…',
    cta: 'Mein Deutsch korrigieren',
    analyzing: 'Analyse läuft…',
    corrected: 'Korrektur',
    mistakes: 'Fehler',
    alternatives: 'Alternativen',
    scores: 'Bewertungen',
    clarity: 'Klarheit',
    correctness: 'Korrektheit',
    tone: 'Ton',
    noAlternatives: 'Keine Alternativen.',
    noScenarios: 'Keine Szenarien in dieser Kategorie.',
    style: 'Stil',
    noSignificantErrors: 'Keine bedeutenden Fehler; nur kleinere stilistische Entscheidungen.',
    categoriesAria: 'Kategorie-Tabs',
    scenariosAria: 'Szenarien in',
  },
  categories: {
    work: 'Arbeit',
    family: 'Familie',
    shopping: 'Einkauf',
    holiday: 'Urlaub',
    health: 'Gesundheit',
    travel: 'Reisen',
  },
scenarios: {
  // --- Arbeit ---
  'support-invoice': {
    label: 'Kundensupport – Rabatt auf Rechnung',
    theme: 'Du bist Support-Agent. Ein Kunde meldet, dass der 10%-Flash-Sale nicht auf der MMC-Rechnung erscheint.',
    goal: 'Die Buchhaltung um Prüfung bitten, erwarteten Preis bestätigen und nächste Schritte nennen.',
    tone: 'Höflich und prägnant.',
    sample: 'Bitte um Hilfe: Der -10%-Flash-Sale erscheint nicht auf der MMC-Rechnung; Karen beschwert sich.'
  },
  'interview': {
    label: 'Vorstellungsgespräch – Verhaltensfrage',
    theme: 'Du beantwortest: „Erzählen Sie von einer Situation mit einem schwierigen Stakeholder.“',
    goal: 'Mit STAR-Struktur in 120–160 Wörtern erklären.',
    tone: 'Professionell und positiv.',
    sample: 'Wir hatten einen Stakeholder, der jede Woche den Scope änderte, und ich...'
  },
  'standup': {
    label: 'Daily Stand-up – Update & Blocker',
    theme: 'Tägliches Stand-up im Team.',
    goal: 'Gestern/Heute/Blocker in ≤ 80 Wörtern nennen.',
    tone: 'Knappt und sachlich.',
    sample: 'Gestern Rechnungsansicht fertig. Heute API-Integration. Blockiert durch Auth.'
  },
  'negotiate-priority': {
    label: 'Priorität verhandeln',
    theme: 'Ein Bugfix soll vor einer Low-Impact-Funktion priorisiert werden.',
    goal: 'Auswirkung erklären, Zeitplan vorschlagen, Bestätigung erfragen.',
    tone: 'Bestimmt, aber respektvoll.',
    sample: 'Können wir den Checkout-Bug vor dem neuen Banner priorisieren? Er betrifft Zahlungen.'
  },
  'project-deadline': {
    label: 'Fristverlängerung anfragen',
    theme: 'Du bittest um Verlängerung einer Projektfrist.',
    goal: 'Gründe erläutern, neues Datum vorschlagen, Plan darlegen.',
    tone: 'Professionell, lösungsorientiert.',
    sample: 'Wegen unvorhergesehener Technikprobleme bitte ich um eine Woche Verlängerung.'
  },
  'new-hire-intro': {
    label: 'Neuen Mitarbeitenden vorstellen',
    theme: 'Du stellst eine neue Kollegin/einen neuen Kollegen vor.',
    goal: 'Rolle, Hintergrund, Beitrag skizzieren.',
    tone: 'Herzlich und informativ.',
    sample: 'Willkommen John, unser neuer Backend-Entwickler mit 5 Jahren Node.js-Erfahrung.'
  },

  // --- Familie ---
  'landlord-boiler': {
    label: 'Vermieter anrufen – Heizung defekt',
    theme: 'Die Heizung fiel gestern Abend aus.',
    goal: 'Dringenden Termin heute/morgen anfragen und Zeitfenster bestätigen.',
    tone: 'Bestimmt, aber höflich.',
    sample: 'Hallo, die Heizung funktioniert seit gestern Abend nicht. Können Sie heute vorbeikommen?'
  },
  'teacher-meeting': {
    label: 'Schule – Eltern-Lehrer-Gespräch',
    theme: 'Du willst die Lesefortschritte deines Kindes besprechen.',
    goal: 'Zwei Termine vorschlagen, aktuelle Beobachtungen und Materialien erfragen.',
    tone: 'Freundlich und kooperativ.',
    sample: 'Können wir kurz über Alex’ Lesefortschritt sprechen und einen Termin finden?'
  },
  'family-reunion': {
    label: 'Familientreffen organisieren',
    theme: 'Du planst ein Treffen nächsten Monat.',
    goal: 'Datum/Ort vorschlagen, Essens-/Aktivitätswünsche erfragen.',
    tone: 'Freundlich und inklusiv.',
    sample: 'Ich plane ein Familientreffen am 15. bei uns. Was meint ihr?'
  },
  'babysitting-request': {
    label: 'Babysitting anfragen',
    theme: 'Du brauchst am Wochenende Kinderbetreuung.',
    goal: 'Daten/Uhren, Alter der Kinder, Bezahlung nennen.',
    tone: 'Höflich und klar.',
    sample: 'Könntest du Samstagabend auf die Kinder (5 & 8) aufpassen?'
  },
  'pet-care': {
    label: 'Haustierbetreuung erbitten',
    theme: 'Du brauchst Füttern/Spazieren mit dem Hund während deiner Abwesenheit.',
    goal: 'Zeitraum, Bedürfnisse, Vergütung nennen.',
    tone: 'Freundlich und dankbar.',
    sample: 'Könntest du Max von Freitag bis Sonntag füttern und ausführen?'
  },
  'appliance-repair': {
    label: 'Gerätereparatur vereinbaren',
    theme: 'Die Waschmaschine ist kaputt.',
    goal: 'Problem schildern, Reparaturtermin anfragen, Kosten erfragen.',
    tone: 'Höflich, aber dringend.',
    sample: 'Die Maschine schleudert seit gestern nicht. Können Sie diese Woche reparieren?'
  },

  // --- Einkauf ---
  'refund-online': {
    label: 'Onlinebestellung – Rückerstattung',
    theme: 'Paket beschädigt angekommen.',
    goal: 'Bestellnummer, Problem beschreiben, Erstattung/Ersatz erbitten.',
    tone: 'Neutral und knapp.',
    sample: 'Bestellung #10422: Schutzglas gerissen. Bitte Rückerstattung oder Ersatz.'
  },
  'price-match': {
    label: 'Preisangleichung anfragen',
    theme: 'Gleicher Artikel beim Mitbewerber günstiger gefunden.',
    goal: 'Nachweis schicken, klären ob Preisangleichung gilt und wie vorgehen.',
    tone: 'Neutral und direkt.',
    sample: 'Gleiches Modell 20 £ günstiger bei RivalTech. Bieten Sie Preisangleichung an?'
  },
  'delayed-delivery': {
    label: 'Verspätete Lieferung',
    theme: 'Bestellung nicht rechtzeitig angekommen.',
    goal: 'Details, neues Lieferdatum, ggf. Entschädigung erfragen.',
    tone: 'Höflich, aber bestimmt.',
    sample: 'Bestellung #10987 sollte gestern kommen. Haben Sie ein Update?'
  },
  'product-warranty': {
    label: 'Gewährleistung / Garantie',
    theme: 'Produkt innerhalb der Garantie defekt.',
    goal: 'Kaufbeleg, Fehlerbeschreibung, Reparatur/Ersatz anfragen.',
    tone: 'Klar und sachlich.',
    sample: 'Mein Staubsauger (Kauf im März) startet nicht mehr. Austausch möglich?'
  },
  'gift-wrap': {
    label: 'Geschenkverpackung',
    theme: 'Du bestellst ein Geschenk online.',
    goal: 'Nach Geschenkverpackung und eventuellen Kosten fragen.',
    tone: 'Höflich und kurz.',
    sample: 'Können Sie Bestellung #11223 als Geschenk verpacken? Gibt es eine Gebühr?'
  },
  'bulk-order': {
    label: 'Großbestellung anfragen',
    theme: 'Du willst eine große Menge kaufen.',
    goal: 'Verfügbarkeit, Mengenrabatt, Lieferzeit erfragen.',
    tone: 'Geschäftlich und direkt.',
    sample: 'Ich möchte 50 Stück von Artikel #4421 bestellen. Bester Preis?'
  },

  // --- Urlaub ---
  'travel-booking': {
    label: 'Flug – Budget & Daten',
    theme: 'Rückflug London → Madrid nächsten Monat.',
    goal: '2–3 Optionen < £180, keine Übernacht-Stopps, Gepäckregeln einbeziehen.',
    tone: 'Freundlich und klar.',
    sample: 'Ich brauche günstige Flüge London–Madrid nächsten Monat, bitte.'
  },
  'hotel-request': {
    label: 'Hotel – Sonderwunsch',
    theme: 'Ruhiges Zimmer fern vom Aufzug.',
    goal: 'Buchung bestätigen, Wunschzimmer anfragen, Early Check-in klären.',
    tone: 'Höflich und klar.',
    sample: 'Buchung #AB3492 für 2 Nächte. Ein ruhiges Zimmer fern vom Aufzug möglich?'
  },
  'car-rental': {
    label: 'Mietwagen anfragen',
    theme: 'Du möchtest einen Wagen mieten.',
    goal: 'Abholung/Rückgabe, Fahrzeugtyp, Versicherung erfragen.',
    tone: 'Klar und direkt.',
    sample: 'Kleiner Wagen vom 3.–7. Mai in Barcelona. Was ist verfügbar?'
  },
  'tour-booking': {
    label: 'Stadtführung buchen',
    theme: 'Du buchst eine Stadtführung.',
    goal: 'Datum, Preis, Gruppengröße, Sprachen erfragen.',
    tone: 'Höflich und neugierig.',
    sample: 'Gibt es am 12. Mai eine Tour in Rom auf Englisch?'
  },
  'cruise-offer': {
    label: 'Kreuzfahrtangebote',
    theme: 'Infos zu Mittelmeer-Kreuzfahrten.',
    goal: 'Routen, Preis, Kabinenoptionen, Termine.',
    tone: 'Höflich und interessiert.',
    sample: 'Bitte beste Angebote für eine 7-tägige Mittelmeer-Kreuzfahrt senden.'
  },
  'restaurant-reservation': {
    label: 'Restaurantreservierung',
    theme: 'Du reservierst ein Abendessen im Urlaub.',
    goal: 'Datum/Uhrzeit, Gästezahl, Ernährungswünsche.',
    tone: 'Höflich und freundlich.',
    sample: 'Tisch für 4 am 15. Juli um 19 Uhr, bitte mit vegetarischen Optionen.'
  },

  // --- Gesundheit ---
  'gp-appointment': {
    label: 'Hausarzttermin – Symptome',
    theme: 'Anhaltender Husten seit 2 Wochen.',
    goal: 'Symptome, Verfügbarkeit, benötigte Unterlagen nennen.',
    tone: 'Klar und direkt.',
    sample: 'Ich hätte gern einen Termin wegen eines seit zwei Wochen anhaltenden Hustens.'
  },
  'dentist-visit': {
    label: 'Zahnarzt – Kontrolle & Reinigung',
    theme: 'Du brauchst Check-up und Reinigung.',
    goal: 'Termin anfragen, Versicherung klären.',
    tone: 'Höflich und knapp.',
    sample: 'Kann ich nächste Woche zur Zahnreinigung kommen? Akzeptieren Sie AXA?'
  },
  'physio-session': {
    label: 'Physiotherapie',
    theme: 'Du brauchst Physio wegen einer Rückenverletzung.',
    goal: 'Verfügbarkeit, Verletzung beschreiben, Behandlungsplan erfragen.',
    tone: 'Höflich und informativ.',
    sample: 'Ich habe mir den Rücken verletzt. Haben Sie diese Woche Termine frei?'
  },
  'eye-test': {
    label: 'Sehtest buchen',
    theme: 'Du willst eine Augenuntersuchung.',
    goal: 'Frühester Termin, Preis, ob Rezept enthalten.',
    tone: 'Klar und höflich.',
    sample: 'Haben Sie morgen Nachmittag einen Termin für einen Sehtest?'
  },
  'nutritionist-consult': {
    label: 'Ernährungsberatung',
    theme: 'Du willst Beratung zum gesunden Abnehmen.',
    goal: 'Termin, Ziele, Pakete erfragen.',
    tone: 'Gesundheitsorientiert und höflich.',
    sample: 'Ich möchte eine Beratung zum gesunden Abnehmen vereinbaren.'
  },
  'mental-health': {
    label: 'Mentale Gesundheit – Unterstützung',
    theme: 'Du suchst Sitzungen wegen Angst.',
    goal: 'Verfügbarkeit, Format, Vertraulichkeit klären.',
    tone: 'Sensibel und respektvoll.',
    sample: 'Können Sie eine*n Therapeut*in für Angstsitzungen empfehlen?'
  },

  // --- Reisen ---
  'visa-query': {
    label: 'Visum – Dokumentencheckliste',
    theme: 'Info vom Konsulat für ein kurzes Touristenvisum.',
    goal: 'Offizielle Checkliste und Bearbeitungszeit bestätigen.',
    tone: 'Formell und höflich.',
    sample: 'Können Sie die Dokumentenliste für ein Kurzaufenthaltsvisum bestätigen?'
  },
  'flight-delay': {
    label: 'Flugverspätung',
    theme: 'Dein Flug war über 4 Stunden verspätet.',
    goal: 'Entschädigung oder Umbuchungsoptionen erfragen.',
    tone: 'Höflich, aber bestimmt.',
    sample: 'Flug EZY456 hatte 5 Stunden Verspätung. Welche Entschädigung ist möglich?'
  },
  'lost-luggage': {
    label: 'Verlorenes Gepäck',
    theme: 'Gepäck ist nicht angekommen.',
    goal: 'Flugdaten, Gepäckbeschreibung, Kontakt angeben.',
    tone: 'Klar und sachlich.',
    sample: 'Gepäck fehlt aus Flug BA217. Schwarze Samsonite, Tag #9982.'
  },
  'travel-insurance-claim': {
    label: 'Reiseversicherung – Schadenmeldung',
    theme: 'Du meldest verlorene Gegenstände auf Reisen.',
    goal: 'Details, Belege, Polizeibericht.',
    tone: 'Formell und detailliert.',
    sample: 'Schadenmeldung für verlorene Kamera in Paris. Polizeibericht beigefügt.'
  },
  'airport-transfer': {
    label: 'Flughafentransfer',
    theme: 'Du brauchst einen Transfer vom Flughafen zum Hotel.',
    goal: 'Ankunftszeit, Hoteladresse, Anzahl der Passagiere.',
    tone: 'Höflich und klar.',
    sample: 'Abholung Heathrow um 10 Uhr, Ziel Hilton Park Lane, 2 Passagiere.'
  },
  'travel-advisory': {
    label: 'Reisehinweise erfragen',
    theme: 'Sicherheitsupdates für ein Reiseziel prüfen.',
    goal: 'Aktuelle Risiken, Gesundheitsratschläge, Einreisebeschränkungen.',
    tone: 'Höflich und vorsichtig.',
    sample: 'Gibt es Reisehinweise für Thailand im November?'
  }
}

},
};

const LANG_NAMES = {
  fr: 'Français',
  en: 'English',
  ro: 'Română',
  de: 'Deutsch',
};

const LANG_ORDER = ['fr','en','ro','de'];




// EN base (canon) — în DB: rânduri per id + traduceri per lang
const CATEGORIES_BASE = [
  { id: 'work', label: 'Work' },
  { id: 'family', label: 'Family' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'holiday', label: 'Holiday' },
  { id: 'health', label: 'Health' },
  { id: 'travel', label: 'Travel' }
];

const SCENARIOS_BASE = [
  { id: 'support-invoice', cat: 'work', label: 'Customer Support – Invoice Discount',
    theme: `You're a support agent. A customer reports that the 10% flash-sale discount is not reflected on the MMC invoice.`,
    goal: `Ask billing to investigate, confirm the expected price, and advise the next steps.`,
    tone: `Polite and concise.`,
    sample: `Need your help as the flash sale -10% does not reflect the invoice price on MMC, Karen complains.` },
  { id: 'interview', cat: 'work', label: 'Job Interview – Behavioral Question',
    theme: `You answer “Tell me about a time you handled a difficult stakeholder”.`,
    goal: `Use the STAR structure to explain the situation in 120–160 words.`,
    tone: `Professional and positive.`,
    sample: `We had a stakeholder who changed scope every week and I...` },
  { id: 'standup', cat: 'work', label: 'Stand-up Daily – Update & Blockers',
    theme: `Daily stand-up meeting with your team.`,
    goal: `State what you did yesterday, what you will do today, and any blockers in 80 words or less.`,
    tone: `Concise and factual.`,
    sample: `Yesterday finished the invoice screen. Today API integration. Blocked by auth.` },
  { id: 'negotiate-priority', cat: 'work', label: 'Negotiate Task Priority',
    theme: `You need a teammate to prioritize a bug fix over a low-impact feature.`,
    goal: `Explain the impact, propose a timeline, and ask for confirmation.`,
    tone: `Firm yet respectful.`,
    sample: `Could we prioritize the checkout bug before the new banner? It affects payments.` },
  { id: 'project-deadline', cat: 'work', label: 'Project Deadline Extension',
    theme: `You need to request an extension for a project deadline.`,
    goal: `Explain the reasons for the delay, propose a new date, and show your plan to complete it.`,
    tone: `Professional and solution-oriented.`,
    sample: `Due to unforeseen technical issues, I request extending the project deadline by one week.` },
  { id: 'new-hire-intro', cat: 'work', label: 'Introduce a New Hire',
    theme: `You are introducing a new colleague to the team.`,
    goal: `Provide their role, background, and how they will contribute.`,
    tone: `Welcoming and informative.`,
    sample: `Please welcome John, our new backend developer with 5 years of experience in Node.js.` },

  { id: 'landlord-boiler', cat: 'family', label: 'Call the Landlord – Boiler Issue',
    theme: `You're a tenant and the boiler stopped working yesterday evening.`,
    goal: `Request an urgent visit today or tomorrow and confirm available time windows.`,
    tone: `Firm but polite.`,
    sample: `Hello, the boiler doesn't work since last night. Can you come today?` },
  { id: 'teacher-meeting', cat: 'family', label: 'School – Parent–Teacher Meeting',
    theme: `You want to discuss your child's reading progress with the teacher.`,
    goal: `Propose two meeting slots, ask for current observations, and any preparation materials.`,
    tone: `Friendly and cooperative.`,
    sample: `Could we schedule a quick meeting to talk about Alex's reading progress?` },
  { id: 'family-reunion', cat: 'family', label: 'Organize Family Reunion',
    theme: `You're planning a family reunion for next month.`,
    goal: `Suggest a date, location, and ask for food/activity preferences.`,
    tone: `Friendly and inclusive.`,
    sample: `Thinking of hosting a family reunion on the 15th at our place. Thoughts?` },
  { id: 'babysitting-request', cat: 'family', label: 'Babysitting Request',
    theme: `You need someone to watch your kids this weekend.`,
    goal: `State dates/times, children’s ages, and offer payment.`,
    tone: `Polite and clear.`,
    sample: `Could you babysit my kids (5 & 8) on Saturday evening?` },
  { id: 'pet-care', cat: 'family', label: 'Ask for Pet Care',
    theme: `You need help feeding and walking your dog while away.`,
    goal: `List dates, pet’s needs, and offer compensation.`,
    tone: `Friendly and appreciative.`,
    sample: `Would you mind feeding and walking Max from Friday to Sunday?` },
  { id: 'appliance-repair', cat: 'family', label: 'Arrange Appliance Repair',
    theme: `Your washing machine is broken.`,
    goal: `Explain the issue, request repair date, and ask about costs.`,
    tone: `Polite but urgent.`,
    sample: `Our washing machine stopped spinning yesterday. Could you repair it this week?` },

  { id: 'refund-online', cat: 'shopping', label: 'Online Order – Refund Request',
    theme: `Your parcel arrived damaged.`,
    goal: `Provide the order number, describe the issue, and request a refund or replacement.`,
    tone: `Neutral and concise.`,
    sample: `Order #10422 arrived with a cracked screen protector. I'd like a refund or replacement.` },
  { id: 'price-match', cat: 'shopping', label: 'Price Match Inquiry',
    theme: `You found a lower price for the same item at a competitor.`,
    goal: `Provide proof of the lower price, ask if price match applies, and how to proceed.`,
    tone: `Neutral and direct.`,
    sample: `I found the same model £20 cheaper at RivalTech. Do you offer price matching?` },
  { id: 'delayed-delivery', cat: 'shopping', label: 'Delayed Delivery Complaint',
    theme: `Your order hasn't arrived on time.`,
    goal: `Provide order details, ask for updated delivery date, and compensation if applicable.`,
    tone: `Polite but firm.`,
    sample: `Order #10987 was due yesterday but hasn't arrived. Could you update me?` },
  { id: 'product-warranty', cat: 'shopping', label: 'Warranty Claim',
    theme: `Your product stopped working within the warranty period.`,
    goal: `Provide proof of purchase, describe the fault, and request repair or replacement.`,
    tone: `Clear and factual.`,
    sample: `My vacuum cleaner (purchased in March) no longer turns on. Can it be replaced?` },
  { id: 'gift-wrap', cat: 'shopping', label: 'Gift Wrapping Request',
    theme: `You are ordering a gift online.`,
    goal: `Ask if gift wrapping is available and confirm any extra cost.`,
    tone: `Polite and concise.`,
    sample: `Could you gift wrap order #11223? Is there an extra fee?` },
  { id: 'bulk-order', cat: 'shopping', label: 'Bulk Order Inquiry',
    theme: `You want to buy a large quantity of a product.`,
    goal: `Ask about stock availability, bulk discount, and delivery time.`,
    tone: `Direct and business-like.`,
    sample: `I’d like to order 50 units of item #4421. What’s the best price?` },

  { id: 'travel-booking', cat: 'holiday', label: 'Travel Booking – Budget & Dates',
    theme: `You need a return flight from London to Madrid next month.`,
    goal: `Find 2–3 options under £180, with no overnight layovers, and include baggage rules.`,
    tone: `Friendly and clear.`,
    sample: `I need cheap flights London to Madrid next month, please.` },
  { id: 'hotel-request', cat: 'holiday', label: 'Hotel – Special Request',
    theme: `You booked a hotel and want a quiet room away from the lift.`,
    goal: `Confirm the reservation, request your preferred room, and ask about early check-in.`,
    tone: `Polite and clear.`,
    sample: `Reservation #AB3492 for 2 nights. Could we have a quiet room away from the lift?` },
  { id: 'car-rental', cat: 'holiday', label: 'Car Rental Inquiry',
    theme: `You want to rent a car for a trip.`,
    goal: `Specify pick-up/drop-off dates, car type, and ask about insurance.`,
    tone: `Clear and direct.`,
    sample: `I need a small car from 3–7 May in Barcelona. What’s available?` },
  { id: 'tour-booking', cat: 'holiday', label: 'Guided Tour Booking',
    theme: `You are booking a city tour.`,
    goal: `Ask about dates, price, group size, and language options.`,
    tone: `Polite and curious.`,
    sample: `Do you have a city tour in Rome on 12th May in English?` },
  { id: 'cruise-offer', cat: 'holiday', label: 'Cruise Offer Request',
    theme: `You want information on Mediterranean cruise packages.`,
    goal: `Ask about routes, price, cabin options, and available dates.`,
    tone: `Polite and interested.`,
    sample: `Could you send me your best offers for a 7-day Mediterranean cruise?` },
  { id: 'restaurant-reservation', cat: 'holiday', label: 'Restaurant Reservation',
    theme: `You are booking a dinner during holiday.`,
    goal: `State date/time, number of guests, and any dietary requirements.`,
    tone: `Polite and friendly.`,
    sample: `Table for 4 on 15th July at 7pm, vegetarian options please.` },

  { id: 'gp-appointment', cat: 'health', label: 'GP Appointment – Symptoms',
    theme: `You need to book a GP appointment for a persistent cough lasting 2 weeks.`,
    goal: `Describe your symptoms, state your availability, and ask if anything is needed for the appointment.`,
    tone: `Clear and straightforward.`,
    sample: `I'd like to book a GP appointment for a cough that's lasted two weeks.` },
  { id: 'dentist-visit', cat: 'health', label: 'Dentist Visit Request',
    theme: `You need a dental check-up and cleaning.`,
    goal: `Request appointment date, ask about insurance coverage.`,
    tone: `Polite and concise.`,
    sample: `Could I book a dental cleaning next week? Do you accept AXA insurance?` },
  { id: 'physio-session', cat: 'health', label: 'Physiotherapy Session',
    theme: `You need physio for a back injury.`,
    goal: `Request availability, describe injury, and ask about treatment plan.`,
    tone: `Polite and informative.`,
    sample: `I injured my back. Could you book me for physiotherapy this week?` },
  { id: 'eye-test', cat: 'health', label: 'Eye Test Booking',
    theme: `You want an eye examination.`,
    goal: `Ask for earliest slot, price, and if prescription lenses are included.`,
    tone: `Clear and polite.`,
    sample: `Do you have an eye test slot tomorrow afternoon?` },
  { id: 'nutritionist-consult', cat: 'health', label: 'Nutritionist Consultation',
    theme: `You want dietary advice for weight loss.`,
    goal: `Request appointment, mention goals, and ask about packages.`,
    tone: `Polite and health-focused.`,
    sample: `I'd like to schedule a consultation for healthy weight loss guidance.` },
  { id: 'mental-health', cat: 'health', label: 'Mental Health Support',
    theme: `You need counseling sessions for anxiety.`,
    goal: `Ask about therapist availability, session format, and confidentiality.`,
    tone: `Sensitive and respectful.`,
    sample: `Could you recommend a counselor for anxiety sessions?` },

  { id: 'visa-query', cat: 'travel', label: 'Visa – Document Checklist',
    theme: `You are requesting information from the consulate for a short tourist visa.`,
    goal: `List your situation, ask for the official document checklist, and confirm the processing time.`,
    tone: `Formal and polite.`,
    sample: `Could you confirm the document checklist for a short-stay tourist visa?` },
  { id: 'flight-delay', cat: 'travel', label: 'Flight Delay Complaint',
    theme: `Your flight was delayed by over 4 hours.`,
    goal: `Request compensation or rebooking options.`,
    tone: `Polite but firm.`,
    sample: `Flight EZY456 delayed 5 hours. What compensation is available?` },
  { id: 'lost-luggage', cat: 'travel', label: 'Lost Luggage Report',
    theme: `Your luggage didn’t arrive at destination.`,
    goal: `Provide flight details, bag description, and contact info.`,
    tone: `Clear and factual.`,
    sample: `Bag missing from flight BA217. Black Samsonite, tag #9982.` },
  { id: 'travel-insurance-claim', cat: 'travel', label: 'Travel Insurance Claim',
    theme: `You need to claim for lost items during travel.`,
    goal: `Provide details, receipts, and incident report.`,
    tone: `Formal and detailed.`,
    sample: `Claim for lost camera during trip to Paris. Police report attached.` },
  { id: 'airport-transfer', cat: 'travel', label: 'Airport Transfer Booking',
    theme: `You need a ride from the airport to hotel.`,
    goal: `Specify flight arrival, hotel address, and passenger count.`,
    tone: `Polite and clear.`,
    sample: `Pick-up from Heathrow at 10am, drop to Hilton Park Lane, 2 passengers.` },
  { id: 'travel-advisory', cat: 'travel', label: 'Travel Advisory Inquiry',
    theme: `You are checking for safety updates on a destination.`,
    goal: `Ask about current risks, health advisories, and entry restrictions.`,
    tone: `Polite and cautious.`,
    sample: `Are there any travel advisories for visiting Thailand in November?` },
];

const LOCALIZE_SCENARIO = (s, dict) => {
  const ov = (dict.scenarios && dict.scenarios[s.id]) || {};
  return { ...s, ...{
    label: ov.label || s.label,
    theme: ov.theme || s.theme,
    goal: ov.goal || s.goal,
    tone: ov.tone || s.tone,
    sample: ov.sample || s.sample,
  }};
};

export default function Home() {
  // === Lang state + persistence
  const [lang, setLang] = useState('fr'); // identic pe server și pe client la prima randare
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved && saved !== 'fr') setLang(saved);
    } catch {}
    }, []);
  
  const L = useMemo(() => I18N[lang] || I18N.en, [lang]);
  const currentLangLabel = useMemo(() => LANG_NAMES[lang] || lang, [lang]);


  const CATEGORIES = useMemo(
    () => CATEGORIES_BASE.map(c => ({ ...c, label: L.categories[c.id] || c.label })),
    [L]
  );
  const SCENARIOS = useMemo(
    () => SCENARIOS_BASE.map(s => LOCALIZE_SCENARIO(s, L)),
    [L]
  );

  // category & scenario
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const scenariosForCategory = useMemo(
    () => SCENARIOS.filter(s => s.cat === category),
    [SCENARIOS, category]
  );
  const [scenarioId, setScenarioId] = useState(scenariosForCategory[0]?.id || '');
  const current = useMemo(
    () => SCENARIOS.find(s => s.id === scenarioId),
    [SCENARIOS, scenarioId]
  );

  // editor & results
  const [text, setText] = useState('');
  const [placeholder, setPlaceholder] = useState(L.ui.placeholder);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const correctedRef = useRef(null);

  // nav states
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [langsOpen, setLangsOpen] = useState(false);
  const [altsOpen, setAltsOpen] = useState(false); // toggle simplu

  // on language change: update placeholder & persist
  useEffect(() => {
    setPlaceholder(L.ui.placeholder);
    try { localStorage.setItem('lang', lang); } catch {}
  }, [lang, L]);

  // când se schimbă categoria → selectează primul scenariu, goliște editorul
  useEffect(() => {
    const first = scenariosForCategory[0]?.id || '';
    setScenarioId(first);
    setText('');
    setResult(null);
    setPlaceholder(L.ui.placeholder);
  }, [scenariosForCategory, L]);

  // când se schimbă scenariul → goliște editorul & rezultate
  useEffect(() => {
    setText('');
    setResult(null);
    setPlaceholder(L.ui.placeholder);
  }, [scenarioId, L]);

  // helpers scoruri
  const clamp10 = (n) => Math.max(0, Math.min(10, Number(n ?? 0)));
  const pct = (n) => `${clamp10(n) * 10}%`;

  const useSample = () => {
    if (!current?.sample) return;
    setText('');
    setResult(null);
    setPlaceholder(current.sample);
  };

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch('/api/correct', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ text, scenario: scenarioId, lang })
      });
      const data = await r.json();
      setResult(data);
      setTimeout(() => correctedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch {
      setResult({ error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const selectLang = (code) => {
    setLang(code);
    setLangsOpen(false);
    setMobileOpen(false);
    setResourcesOpen(false);
  };

  return (
    <div className={styles.wrapper}>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.topbar}>
          {/* Brand (Home) */}
          <Link
            href="/"
            className={styles.brandLink}
            aria-label="Home"
            onClick={() => setMobileOpen(false)}
          >
            <span className={styles.brandDot} aria-hidden="true">
              <Sparkles size={27} strokeWidth={2.4} />
            </span>
            <span className={styles.title}>{L.ui.siteTitle}</span>
          </Link>

          {/* Acțiuni rapide — mereu vizibile (desktop + mobil) */}
          <div className={styles.navRight} aria-label="Quick actions">
            <button className={styles.iconBtn} aria-label="Search">
              <Search size={20} />
            </button>
            <button className={styles.iconBtn} aria-label="Login">
              <UserRound size={20} />
            </button>
          </div>

          {/* Hamburger — doar pe mobil (CSS ascunde pe desktop) */}
          <button
            className={styles.menuBtn}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen ? "true" : "false"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Nav (fără navRight în interior) */}
          <nav className={`${styles.nav} ${mobileOpen ? styles.navOpen : ""}`}>
            <ul className={styles.navLinks} role="menubar">
              <li>
                <Link
                  href="/"
                  className={styles.navLink}
                  role="menuitem"
                  onClick={() => setMobileOpen(false)}
                >
                  {L.ui.menuHome}
                </Link>
              </li>

              {/* Resources (meniul are același design ca Languages) */}
              <li className={styles.dropdown} role="none">
                <button
                  type="button"
                  className={styles.dropdownBtn}
                  aria-haspopup="true"
                  aria-expanded={resourcesOpen ? "true" : "false"}
                  onClick={() => setResourcesOpen((v) => !v)}
                >
                  {L.ui.menuResources} <ChevronDown size={16} />
                </button>
                <ul
                  className={`${styles.dropdownMenu} ${
                    resourcesOpen ? styles.dropdownOpen : ""
                  }`}
                  role="menu"
                >
                  <li role="none">
                    <Link
                      role="menuitem"
                      href="/resources/vocabulary"
                      className={styles.dropdownItem}
                      onClick={() => setMobileOpen(false)}
                    >
                      {L.ui.menuVocabulary}
                    </Link>
                  </li>
                  <li role="none">
                    <Link
                      role="menuitem"
                      href="/resources/grammar"
                      className={styles.dropdownItem}
                      onClick={() => setMobileOpen(false)}
                    >
                      {L.ui.menuGrammar}
                    </Link>
                  </li>
                </ul>
              </li>

              <li>
                <Link
                  href="/faq"
                  className={styles.navLink}
                  role="menuitem"
                  onClick={() => setMobileOpen(false)}
                >
                  {L.ui.menuFAQ}
                </Link>
              </li>

              {/* Languages (afișează limba curentă; o exclude din listă) */}
              <li className={styles.dropdown} role="none">
                <button
                  type="button"
                  className={styles.dropdownBtn}
                  style={{ color:"orange" }}
                  aria-haspopup="true"
                  aria-expanded={langsOpen ? "true" : "false"}
                  onClick={() => setLangsOpen((v) => !v)}
                >
                  {currentLangLabel} <ChevronDown size={16} />
                </button>
                <ul
                  className={`${styles.dropdownMenu} ${
                    langsOpen ? styles.dropdownOpen : ""
                  }`}
                  role="menu"
                >
                  {LANG_ORDER.filter((code) => code !== lang).map((code) => (
                    <li role="none" key={code}>
                      <button
                        role="menuitem"
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => selectLang(code)}
                      >
                        {LANG_NAMES[code]}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>

        <p className={styles.subtitle}>{L.ui.subtitle}</p>
      </header>



      {/* Categories */}
      <div className={styles.panel} aria-label="Categories">
        <div className={styles.segmentTop} role="tablist" aria-label={L.ui.categoriesAria}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={c.id === category}
              className={`${styles.pillCategory} ${c.id===category ? styles.pillCategoryActive : ''}`}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Scenarios */}
        <div role="group" aria-label={`${L.ui.scenariosAria} ${CATEGORIES.find(x=>x.id===category)?.label}`}>
          <div className={styles.segmentBottom}>
            {scenariosForCategory.length > 0 ? (
              scenariosForCategory.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.pill} ${s.id===scenarioId ? styles.pillActive : ''}`}
                  onClick={() => setScenarioId(s.id)}
                >
                  {s.label}
                </button>
              ))
            ) : (
              <div className={styles.emptyHint}>{L.ui.noScenarios}</div>
            )}
          </div>
        </div>
      </div>

      {/* Theme */}
      {current && (
        <div className={`${styles.panel} ${styles.theme}`}>
          <div className={styles.themeHeader}>
            <span className={styles.themeLabel}><FileText size={24} strokeWidth={2} /></span>
            <span><strong>{lang === 'fr' ? 'Thème' : 'Theme'} :</strong> {current.theme}</span>
          </div>
          <div className={styles.themeHeader} style={{ marginTop: 6 }}>
            <span className={styles.themeLabel}><Target size={24} strokeWidth={2} /></span>
            <span><strong>{lang === 'fr' ? 'Objectif' : 'Goal'} :</strong> {current.goal}</span>
          </div>
          <div className={styles.themeHeader} style={{ marginTop: 6 }}>
            <span className={styles.themeLabel}><Drama size={24} strokeWidth={2} /></span>
            <span><strong>{lang === 'fr' ? 'Ton' : 'Tone'} :</strong> {current.tone}</span>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className={styles.panel} style={{ marginTop: 18 }}>
        <div className={styles.controls}>
          <label htmlFor="msg" style={{fontWeight:800}}>{L.ui.editorLabel}</label>
          <button className={styles.sampleBtn} onClick={useSample} type="button">{L.ui.useSample}</button>
        </div>
        <textarea
          id="msg"
          className={styles.textarea}
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            if (placeholder !== L.ui.placeholder) setPlaceholder(L.ui.placeholder);
            setText(e.target.value);
          }}
        />
        <button
          className={styles.cta}
          onClick={submit}
          disabled={loading || !text.trim() }
          aria-busy={loading ? 'true' : 'false'}
        >
          {loading ? (<><span className={styles.spinner} />{L.ui.analyzing}</>) : L.ui.cta}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div ref={correctedRef} className={styles.result} aria-live="polite">
          {!result.error ? (
            <>
              <h2 className={styles.resultTitle}>{L.ui.corrected}</h2>
              <div className={styles.corrected}>{result.corrected}</div>

              <h3 className={styles.sectionTitle}>{L.ui.mistakes}</h3>
              {Array.isArray(result.mistakes) && result.mistakes.length > 0 ? (
                <div className={styles.mistakes}>
                  {result.mistakes.map((m, i) => (
                    <div key={i} className={styles.mistakeItem}>
                      <span className={styles.badge}>{m.type || L.ui.style}</span>
                      {lang === 'fr'
                        ? <>« {m.original} » → <em>{m.fix}</em> — {m.explanation}</>
                        : <>“{m.original}” → <em>{m.fix}</em> — {m.explanation}</>
                      }
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.mistakeItem}>
                  <span className={styles.badge}>{L.ui.style}</span>
                  {L.ui.noSignificantErrors}
                </div>
              )}

              {/* Alternatives — toggle simplu, implicit închis */}
              <button
                type="button"
                className={styles.collapseHeader}
                aria-expanded={altsOpen ? 'true' : 'false'}
                aria-controls="alts-panel"
                onClick={() => setAltsOpen(o => !o)}
              >
                <h3 className={styles.sectionTitle} style={{ fontSize:"1.3em" }}>{L.ui.alternatives}</h3>
                <ChevronDown size={18} className={`${styles.caret} ${altsOpen ? styles.caretOpen : ''}`} />
              </button>

              <div id="alts-panel" hidden={!altsOpen}>
                {Array.isArray(result.alternatives) && result.alternatives.length > 0 ? (
                  <ul className={styles.alts}>
                    {result.alternatives.map((a,i)=><li key={i}>{a}</li>)}
                  </ul>
                ) : (
                  <div className={styles.emptyHint}>{L.ui.noAlternatives}</div>
                )}
              </div>

              <h3 className={styles.sectionTitle}>{L.ui.scores}</h3>
              <div className={styles.scores}>
                <div className={styles.score}>
                  <div className={styles.scoreRow}>
                    <div>{L.ui.clarity}</div>
                    <div className={styles.scoreValue}>{`${Math.max(0, Math.min(10, Number(result.scores?.clarity ?? 0)))}/10`}</div>
                  </div>
                  <div className={styles.meter}><span style={{ '--pct': pct(result.scores?.clarity) }} /></div>
                </div>
                <div className={styles.score}>
                  <div className={styles.scoreRow}>
                    <div>{L.ui.correctness}</div>
                    <div className={styles.scoreValue}>{`${Math.max(0, Math.min(10, Number(result.scores?.correctness ?? 0)))}/10`}</div>
                  </div>
                  <div className={styles.meter}><span style={{ '--pct': pct(result.scores?.correctness) }} /></div>
                </div>
                <div className={styles.score}>
                  <div className={styles.scoreRow}>
                    <div>{L.ui.tone}</div>
                    <div className={styles.scoreValue}>{`${Math.max(0, Math.min(10, Number(result.scores?.tone ?? 0)))}/10`}</div>
                  </div>
                  <div className={styles.meter}><span style={{ '--pct': pct(result.scores?.tone) }} /></div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.toastErr}>{lang === 'fr' ? 'Erreur' : 'Error'} : {result.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
