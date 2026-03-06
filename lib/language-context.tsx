"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type Language = "fr" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Hero
    "hero.title": "Vendez aujourd'hui. Achetez moins cher.",
    "hero.subtitle": "cheap.tn est le marché le plus rapide pour vendre et acheter au prix le plus bas.",
    "hero.buy": "Acheter maintenant",
    "hero.sell": "Vendre en 30 secondes",
    "hero.search": "Que cherchez-vous ? (iPhone, PS5, vélo...)",

    // Nav
    "nav.buy": "Acheter",
    "nav.sell": "Vendre",
    "nav.categories": "Catégories",
    "nav.login": "Connexion",
    "nav.dashboard": "Tableau de bord",
    "nav.myListings": "Mes annonces",
    "nav.settings": "Paramètres",
    "nav.logout": "Déconnexion",

    // Categories
    "cat.phones": "Téléphones",
    "cat.computers": "Ordinateurs",
    "cat.gaming": "Gaming",
    "cat.appliances": "Électroménager",
    "cat.cars": "Voitures",
    "cat.misc": "Divers",

    // Product
    "product.marketPrice": "Prix du marché estimé",
    "product.savings": "Économie",
    "product.contact": "Contacter le vendeur",
    "product.buyNow": "Acheter maintenant",
    "product.postedAgo": "Posté il y a",
    "product.min": "min",
    "product.addFavorite": "Ajouter aux favoris",
    "product.removeFavorite": "Retirer des favoris",
    "product.loginToFavorite": "Connectez-vous pour sauvegarder",

    // Sell
    "sell.title": "Vendre un article",
    "sell.step1": "Ajouter une photo",
    "sell.step2": "Détails",
    "sell.step3": "Publier",
    "sell.uploadPhoto": "Télécharger une photo",
    "sell.dragDrop": "Glissez-déposez ou cliquez pour ajouter",
    "sell.itemTitle": "Titre de l'article",
    "sell.description": "Description",
    "sell.price": "Prix (TND)",
    "sell.marketPrice": "Prix du marché (TND)",
    "sell.category": "Catégorie",
    "sell.city": "Ville",
    "sell.publish": "Publier maintenant",
    "sell.success": "Votre annonce est visible immédiatement.",
    "sell.publishing": "Publication...",

    // Filters
    "filter.cheapest": "Moins cher",
    "filter.distance": "Distance",
    "filter.category": "Catégorie",
    "filter.recent": "Récent",

    // Profile
    "profile.rating": "Note",
    "profile.itemsSold": "Articles vendus",
    "profile.activeListings": "Annonces actives",
    "profile.verified": "Vendeur vérifié",

    // Misc
    "deals.live": "Offres en direct",
    "deals.trending": "Tendances",
    "deals.priceDrops": "Alertes prix",
    "deals.fastest": "Ventes rapides",
    "deals.recent": "Récemment postés",

    // Dashboard
    "dashboard.overview": "Vue d'ensemble",
    "dashboard.myListings": "Mes annonces",
    "dashboard.favorites": "Favoris",
    "dashboard.messages": "Messages",
    "dashboard.settings": "Paramètres",
    "dashboard.logout": "Déconnexion",
    "dashboard.seller": "Vendeur",
    "dashboard.buyer": "Acheteur",
    "dashboard.backToSite": "Retour au site",
    "dashboard.welcome": "Bonjour",
    "dashboard.sellerSubtitle": "Gérez vos annonces et vos ventes.",
    "dashboard.buyerSubtitle": "Retrouvez vos favoris et vos messages.",
    "dashboard.newListing": "Nouvelle annonce",
    "dashboard.activeListings": "Annonces actives",
    "dashboard.totalViews": "Vues totales",
    "dashboard.unreadMessages": "Messages non lus",
    "dashboard.sellItem": "Vendre un article",
    "dashboard.sellItemDesc": "Créez une nouvelle annonce en quelques secondes.",
    "dashboard.browseDeals": "Parcourir les offres",
    "dashboard.browseDealsDesc": "Découvrez les meilleures affaires.",
    "dashboard.viewMessages": "Voir les messages",
    "dashboard.viewMessagesDesc": "Consultez vos conversations.",
    "dashboard.recentListings": "Annonces récentes",
    "dashboard.viewAll": "Voir tout",
    "dashboard.views": "vues",
    "dashboard.totalListings": "annonces au total",
    "dashboard.noListings": "Aucune annonce",
    "dashboard.noListingsDesc": "Vous n'avez pas encore publié d'annonce.",
    "dashboard.createFirst": "Créer ma première annonce",
    "dashboard.deactivate": "Désactiver",
    "dashboard.activate": "Activer",
    "dashboard.savedItems": "articles sauvegardés",
    "dashboard.noFavorites": "Aucun favori",
    "dashboard.noFavoritesDesc": "Sauvegardez des articles que vous aimez.",
    "dashboard.messagesDesc": "Vos conversations avec les acheteurs et vendeurs.",
    "dashboard.noMessages": "Aucun message",
    "dashboard.noMessagesDesc": "Vos conversations apparaîtront ici.",
    "dashboard.loading": "Chargement...",
    "dashboard.startConversation": "Commencez la conversation !",
    "dashboard.typeMessage": "Tapez votre message...",
    "dashboard.settingsDesc": "Modifiez vos informations personnelles.",
    "dashboard.displayName": "Nom d'affichage",
    "dashboard.phone": "Téléphone",
    "dashboard.city": "Ville",
    "dashboard.selectCity": "Sélectionner une ville",
    "dashboard.saveChanges": "Enregistrer",
    "dashboard.saveError": "Erreur lors de la sauvegarde.",
    "dashboard.saveSuccess": "Profil mis à jour avec succès !",
    "dashboard.accountInfo": "Informations du compte",
    "dashboard.role": "Rôle",
    "dashboard.memberSince": "Membre depuis",
    "dashboard.status": "Statut",
    "dashboard.sellerOnly": "Réservé aux vendeurs",
    "dashboard.sellerOnlyDesc": "Cette page est réservée aux comptes vendeurs.",

    // Footer
    "footer.about": "À propos",
    "footer.aboutDesc": "Le marché le plus rapide de Tunisie pour vendre et acheter au prix le plus bas.",
    "footer.links": "Liens utiles",
    "footer.help": "Aide",
    "footer.terms": "Conditions",
    "footer.privacy": "Confidentialité",
    "footer.contact": "Contact",
    "footer.rights": "Tous droits réservés.",
  },
  en: {
    // Hero
    "hero.title": "Sell today. Buy cheaper.",
    "hero.subtitle": "cheap.tn is the fastest marketplace to sell and buy at the lowest price.",
    "hero.buy": "Buy now",
    "hero.sell": "Sell in 30 seconds",
    "hero.search": "What are you looking for? (iPhone, PS5, bike...)",

    // Nav
    "nav.buy": "Buy",
    "nav.sell": "Sell",
    "nav.categories": "Categories",
    "nav.login": "Login",
    "nav.dashboard": "Dashboard",
    "nav.myListings": "My Listings",
    "nav.settings": "Settings",
    "nav.logout": "Logout",

    // Categories
    "cat.phones": "Phones",
    "cat.computers": "Computers",
    "cat.gaming": "Gaming",
    "cat.appliances": "Appliances",
    "cat.cars": "Cars",
    "cat.misc": "Misc",

    // Product
    "product.marketPrice": "Estimated market price",
    "product.savings": "Savings",
    "product.contact": "Contact seller",
    "product.buyNow": "Buy now",
    "product.postedAgo": "Posted",
    "product.min": "min ago",
    "product.addFavorite": "Add to favorites",
    "product.removeFavorite": "Remove from favorites",
    "product.loginToFavorite": "Login to save",

    // Sell
    "sell.title": "Sell an item",
    "sell.step1": "Add photo",
    "sell.step2": "Details",
    "sell.step3": "Publish",
    "sell.uploadPhoto": "Upload a photo",
    "sell.dragDrop": "Drag and drop or click to add",
    "sell.itemTitle": "Item title",
    "sell.description": "Description",
    "sell.price": "Price (TND)",
    "sell.marketPrice": "Market price (TND)",
    "sell.category": "Category",
    "sell.city": "City",
    "sell.publish": "Publish now",
    "sell.success": "Your listing is visible immediately.",
    "sell.publishing": "Publishing...",

    // Filters
    "filter.cheapest": "Cheapest",
    "filter.distance": "Distance",
    "filter.category": "Category",
    "filter.recent": "Recent",

    // Profile
    "profile.rating": "Rating",
    "profile.itemsSold": "Items sold",
    "profile.activeListings": "Active listings",
    "profile.verified": "Verified seller",

    // Misc
    "deals.live": "Live Deals",
    "deals.trending": "Trending",
    "deals.priceDrops": "Price Alerts",
    "deals.fastest": "Fast Sales",
    "deals.recent": "Recently Posted",

    // Dashboard
    "dashboard.overview": "Overview",
    "dashboard.myListings": "My Listings",
    "dashboard.favorites": "Favorites",
    "dashboard.messages": "Messages",
    "dashboard.settings": "Settings",
    "dashboard.logout": "Logout",
    "dashboard.seller": "Seller",
    "dashboard.buyer": "Buyer",
    "dashboard.backToSite": "Back to site",
    "dashboard.welcome": "Welcome",
    "dashboard.sellerSubtitle": "Manage your listings and sales.",
    "dashboard.buyerSubtitle": "View your favorites and messages.",
    "dashboard.newListing": "New Listing",
    "dashboard.activeListings": "Active Listings",
    "dashboard.totalViews": "Total Views",
    "dashboard.unreadMessages": "Unread Messages",
    "dashboard.sellItem": "Sell an item",
    "dashboard.sellItemDesc": "Create a new listing in seconds.",
    "dashboard.browseDeals": "Browse Deals",
    "dashboard.browseDealsDesc": "Discover the best deals.",
    "dashboard.viewMessages": "View Messages",
    "dashboard.viewMessagesDesc": "Check your conversations.",
    "dashboard.recentListings": "Recent Listings",
    "dashboard.viewAll": "View all",
    "dashboard.views": "views",
    "dashboard.totalListings": "total listings",
    "dashboard.noListings": "No listings",
    "dashboard.noListingsDesc": "You haven't posted any listings yet.",
    "dashboard.createFirst": "Create my first listing",
    "dashboard.deactivate": "Deactivate",
    "dashboard.activate": "Activate",
    "dashboard.savedItems": "saved items",
    "dashboard.noFavorites": "No favorites",
    "dashboard.noFavoritesDesc": "Save items you like.",
    "dashboard.messagesDesc": "Your conversations with buyers and sellers.",
    "dashboard.noMessages": "No messages",
    "dashboard.noMessagesDesc": "Your conversations will appear here.",
    "dashboard.loading": "Loading...",
    "dashboard.startConversation": "Start the conversation!",
    "dashboard.typeMessage": "Type your message...",
    "dashboard.settingsDesc": "Edit your personal information.",
    "dashboard.displayName": "Display name",
    "dashboard.phone": "Phone",
    "dashboard.city": "City",
    "dashboard.selectCity": "Select a city",
    "dashboard.saveChanges": "Save",
    "dashboard.saveError": "Error saving changes.",
    "dashboard.saveSuccess": "Profile updated successfully!",
    "dashboard.accountInfo": "Account Information",
    "dashboard.role": "Role",
    "dashboard.memberSince": "Member since",
    "dashboard.status": "Status",
    "dashboard.sellerOnly": "Sellers only",
    "dashboard.sellerOnlyDesc": "This page is for seller accounts only.",

    // Footer
    "footer.about": "About",
    "footer.aboutDesc": "Tunisia's fastest marketplace to sell and buy at the lowest price.",
    "footer.links": "Useful links",
    "footer.help": "Help",
    "footer.terms": "Terms",
    "footer.privacy": "Privacy",
    "footer.contact": "Contact",
    "footer.rights": "All rights reserved.",
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr")

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
