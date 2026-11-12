import type { OffreType } from "../types/bp/offers";

// Local correlation key only. It never becomes a persisted offer identity or an AI target.
export type EditorOffer = OffreType & { clientOfferKey?: string };

export function offersForSave(offers: EditorOffer[]): OffreType[] {
    return offers.map(({ clientOfferKey: _key, ...offer }) => offer);
}

export function mergeSavedOfferIds(current: EditorOffer[], submitted: EditorOffer[], saved: OffreType[]): EditorOffer[] {
    const ids = new Map<string, string>();
    for (const offer of submitted) {
        if (!offer.clientOfferKey || offer.offerId) continue;
        const matches = saved.filter(row => row.nomOffre === offer.nomOffre);
        if (matches.length === 1 && matches[0].offerId) ids.set(offer.clientOfferKey, matches[0].offerId);
    }
    return current.map(offer => {
        const id = offer.clientOfferKey && ids.get(offer.clientOfferKey);
        return !offer.offerId && id ? { ...offer, offerId: id } : offer;
    });
}
