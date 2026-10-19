'use server';

import { API_URL, enTeteIpVisiteur } from '@/lib/api';
import { aujourdhuiParis } from '@/lib/format';
import { CHAMPS_PREINSCRIPTION, validerPreinscription } from '@/lib/preinscription';

export type EtatPreinscription = {
  ok: boolean;
  message?: string;
  erreurs?: Record<string, string>;
  valeurs?: Record<string, string>;
};

export async function envoyerPreinscription(_prev: EtatPreinscription, fd: FormData): Promise<EtatPreinscription> {
  const succes = { ok: true, message: 'Merci ! Le club vous recontacte rapidement pour organiser les séances d\'essai et la licence.' };
  // Pot de miel anti-spam : un humain ne remplit pas ce champ caché.
  if (String(fd.get('site') ?? '')) return succes;

  const brut: Record<string, string> = {};
  for (const k of CHAMPS_PREINSCRIPTION) brut[k] = String(fd.get(k) ?? '');
  const { donnees, erreurs } = validerPreinscription(brut, aujourdhuiParis());
  const valeurs = brut;
  if (Object.keys(erreurs).length) return { ok: false, erreurs: erreurs as Record<string, string>, valeurs, message: 'Merci de corriger les champs signalés.' };

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/preinscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/ld+json', Accept: 'application/ld+json', ...(await enTeteIpVisiteur()) },
      body: JSON.stringify(donnees),
      cache: 'no-store',
    });
  } catch {
    return { ok: false, message: 'Service momentanément indisponible. Réessayez plus tard ou contactez-nous.', valeurs };
  }

  if (res.status === 422) {
    const data = await res.json().catch(() => null);
    const erreursApi: Record<string, string> = {};
    for (const v of data?.violations ?? []) {
      if (typeof v?.propertyPath === 'string' && typeof v?.message === 'string') erreursApi[v.propertyPath || 'message'] ??= v.message;
    }
    return { ok: false, erreurs: erreursApi, valeurs, message: 'Merci de corriger les champs signalés.' };
  }
  if (res.status === 429) {
    const data = await res.json().catch(() => null);
    const detail = typeof data?.detail === 'string' ? data.detail : null;
    return { ok: false, message: detail ?? 'Trop de demandes envoyées en peu de temps. Merci de réessayer plus tard.', valeurs };
  }
  if (!res.ok) return { ok: false, message: "L'envoi a échoué. Réessayez ou écrivez-nous via la page Contact.", valeurs };
  return succes;
}
