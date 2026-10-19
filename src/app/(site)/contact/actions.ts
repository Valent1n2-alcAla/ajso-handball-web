'use server';

import { API_URL, enTeteIpVisiteur } from '@/lib/api';

export type EtatContact = { ok: boolean; message?: string; erreurs?: Record<string, string>; valeurs?: Record<string, string> };

const champ = (fd: FormData, nom: string) => String(fd.get(nom) ?? '').trim();

/** Longueurs maximales (alignées sur les contraintes de l'API). */
const MAX: Record<'nom' | 'email' | 'telephone' | 'sujet' | 'message', number> = {
  nom: 100, email: 180, telephone: 30, sujet: 150, message: 5000,
};

export async function envoyerMessage(_prev: EtatContact, fd: FormData): Promise<EtatContact> {
  // Pot de miel anti-spam : un humain ne remplit pas ce champ caché.
  if (champ(fd, 'site')) return { ok: true, message: 'Merci, votre message a bien été envoyé.' };

  const data = {
    nom: champ(fd, 'nom'),
    email: champ(fd, 'email'),
    telephone: champ(fd, 'telephone') || null,
    sujet: champ(fd, 'sujet'),
    message: champ(fd, 'message'),
  };

  const erreurs: Record<string, string> = {};
  if (!data.nom) erreurs.nom = 'Votre nom est requis.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) erreurs.email = 'Adresse email invalide.';
  if (!data.sujet) erreurs.sujet = 'Indiquez un sujet.';
  if (data.message.length < 10) erreurs.message = 'Votre message est trop court.';
  for (const [k, max] of Object.entries(MAX) as [keyof typeof MAX, number][]) {
    if ((data[k] ?? '').length > max) erreurs[k] = `${max} caractères maximum.`;
  }
  const valeurs = { ...data, telephone: data.telephone ?? '' };
  if (Object.keys(erreurs).length) return { ok: false, erreurs, valeurs };

  try {
    const res = await fetch(`${API_URL}/api/message_contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/ld+json', Accept: 'application/ld+json', ...(await enTeteIpVisiteur()) },
      body: JSON.stringify(data),
      cache: 'no-store',
    });
    if (res.status === 429) return { ok: false, message: 'Trop de messages envoyés en peu de temps. Merci de réessayer dans quelques minutes.', valeurs };
    if (!res.ok) return { ok: false, message: "L'envoi a échoué. Réessayez ou écrivez-nous directement par email.", valeurs };
  } catch {
    return { ok: false, message: 'Service momentanément indisponible. Réessayez plus tard.', valeurs };
  }
  return { ok: true, message: 'Merci, votre message a bien été envoyé. Nous revenons vers vous rapidement.' };
}
