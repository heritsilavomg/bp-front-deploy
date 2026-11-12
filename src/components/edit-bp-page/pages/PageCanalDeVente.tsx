import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

type PageCanalDeVenteProps = {
    onFieldChange?: (field: string, value: any) => void;
    getFieldValue?: (field: string) => any;
};

const PRESET_CHANNELS = ["En ligne", "Livraison", "Par téléphone"];

export default function PageCanalDeVente({ onFieldChange, getFieldValue }: PageCanalDeVenteProps) {
    const [customChannel, setCustomChannel] = useState("");
    const channels = useMemo(() => {
        return (getFieldValue?.("canauxVente") as string[] | undefined) ?? [];
    }, [getFieldValue]);

    const updateChannels = (nextChannels: string[]) => {
        onFieldChange?.("canauxVente", nextChannels);
    };

    const addChannel = (channel: string) => {
        const trimmed = channel.trim();
        if (!trimmed) return;
        if (channels.includes(trimmed)) return;
        updateChannels([...channels, trimmed]);
        setCustomChannel("");
    };

    const removeChannel = (index: number) => {
        updateChannels(channels.filter((_, currentIndex) => currentIndex !== index));
    };

    return (
        <div className="p-6 sm:p-7">
            <h2 id="canaux-de-ventes" className="text-2xl font-bold text-slate-800">Canaux de ventes</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Je vends mes produits et services :</p>

            <div className="mt-6 space-y-3">
                {channels.length > 0 ? (
                    <ul className="space-y-3">
                        {channels.map((channel, index) => (
                            <li key={`${channel}-${index}`} className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm">
                                <span>{channel}</span>
                                <button
                                    type="button"
                                    onClick={() => removeChannel(index)}
                                    className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                                    aria-label={`Supprimer ${channel}`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="rounded-3xl border border-dashed border-slate-200/80 bg-slate-50 p-6 text-sm text-slate-500">
                        Aucun canal de vente défini pour le moment.
                    </div>
                )}
            </div>

            <div className="mt-6">
                <p className="text-sm text-slate-500">Ajouter un canal de vente :</p>
                <div className="mt-4 flex flex-wrap gap-3">
                    {PRESET_CHANNELS.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => addChannel(item)}
                            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                        >
                            {item}
                        </button>
                    ))}
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                        type="text"
                        value={customChannel}
                        onChange={(event) => setCustomChannel(event.target.value)}
                        placeholder="Ajouter un canal personnalisé"
                        className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                    />
                    <button
                        type="button"
                        onClick={() => addChannel(customChannel)}
                        className="inline-flex cursor-pointer shrink-0 items-center justify-center rounded-full border border-cyan-500 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!customChannel.trim()}
                    >
                        Ajouter un canal de vente
                    </button>
                </div>
            </div>
        </div>
    );
}
