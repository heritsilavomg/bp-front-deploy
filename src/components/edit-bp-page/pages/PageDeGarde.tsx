import ImageUploadCard from "@/components/shared/ImageUploadCard";

type PageDeGardeProps = {
    coverImagePreview: string | null;
    logoImagePreview: string | null;
    onUpload: (file: File, categorie: "COUVERTURE" | "LOGO") => void;
    onRemove: (categorie: "COUVERTURE" | "LOGO") => void;
    bpData?: Record<string, any> | null;
    onFieldChange?: (field: string, value: any) => void;
    handleFieldChangeWithDelay?: (field: string, value: any, delay?: number) => void;
    getFieldValue?: (field: string) => any;
};

const formtTypeProjet = function (typeProjet: string | undefined) {
    switch (typeProjet) {
        case "CREATION":
            return "Création d'entreprise";
        case "FRANCHISE":
            return "Franchise ou réseau de franchise";
        case "REPRISE":
            return "Reprise d'entreprise";
        case "ENTREPRISE_EXISTANTE":
            return "Entreprise existante";
        default:
            return "Type de projet inconnu";
    }
};

export default function PageDeGarde({
    coverImagePreview,
    logoImagePreview,
    onUpload,
    onRemove,
    bpData,
    onFieldChange,
    handleFieldChangeWithDelay,
    getFieldValue
}: PageDeGardeProps) {

    // Helper function to safely get nested values
    const getValue = (field: string, defaultValue: string = "") => {
        if (getFieldValue) {
            return getFieldValue(field) ?? defaultValue;
        }
        // Fallback to direct access if getFieldValue is not provided
        const keys = field.split('.');
        let value = bpData;
        for (const key of keys) {
            if (value === null || value === undefined) return defaultValue;
            value = value[key];
        }
        return value ?? defaultValue;
    };

    return (
        <div className="rounded-3xl border border-dashed shadow-2xl border-slate-200/80 bg-white/90 p-6 sm:p-7 ">
            <div id="couverture">
                <ImageUploadCard
                    value={coverImagePreview ?? undefined}
                    onUpload={(file) => onUpload(file, "COUVERTURE")}
                    onRemove={() => onRemove("COUVERTURE")}
                    height={280}
                    width="100%"
                    label="Choisir une image de couverture"
                />

                <div className="mt-8 mb-8 w-full flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <input
                        type="text"
                        defaultValue={getValue("nomProjet", "")}
                        onBlur={(e) => handleFieldChangeWithDelay?.("nomProjet", e.target.value, 1000)}
                        placeholder="Donner un nom à votre projet"
                        className="w-[calc(100%/2)] rounded-lg border border-slate-200 px-3 py-2 shadow-sm font-bold"
                    />
                </div>

                <ImageUploadCard
                    value={logoImagePreview ?? undefined}
                    onUpload={(file) => onUpload(file, "LOGO")}
                    onRemove={() => onRemove("LOGO")}
                    height={"100px"}
                    width={"100px"}
                    label="Choisir une image de logo"
                />
            </div>

            <span id="contact-de-reference" />
            <div id="contact_reference" className="mt-24">
                <p className="text-gray-700 font-extrabold">Contact et références</p>
                <div className="mt-4">
                    <p className="mt-1 text-gray-600 font-light">
                        {getValue("contactReference.nomContact", "NOM INCONNU")}
                    </p>
                    <p className="mt-1 text-gray-600 font-light">
                        {getValue("contactReference.emailContact", "EMAIL INCONNU")}
                    </p>
                    <p className="mt-1 text-gray-600 font-light">
                        {getValue("contactReference.telephoneContact", "TELEPHONE INCONNU")}
                    </p>
                </div>
            </div>

            <span id="a-propos-de-votre-projet" />
            <div id="a_propos_projet" className="mt-16">
                <p className="text-gray-700 font-extrabold">À propos du projet</p>
                <div className="mt-4">
                    {/* TODO: Change links and titles */}
                    <a
                        href="#a_propos_projet"
                        title="Valeur à définir dans ..."
                        className="mt-1 block text-gray-600 font-light"
                    >
                        {"Type d'activité: " + getValue("aProposProjet.typeActivite", "<Type d'activité>")}
                    </a>
                    <a
                        href="#a_propos_projet"
                        title="Valeur à définir dans ..."
                        className="mt-1 block text-gray-600 font-light"
                    >
                        {"Code activité: " + getValue("aProposProjet.codeActivite", "<Code activité>")}
                    </a>
                    <a
                        href="#a_propos_projet"
                        title="Valeur à définir dans ..."
                        className="mt-1 block text-gray-600 font-light"
                    >
                        {"Type de projet: " + formtTypeProjet(getValue("aProposProjet.typeProjet"))}
                    </a>
                    <a
                        href="#a_propos_projet"
                        title="Valeur à définir dans ..."
                        className="mt-1 block text-gray-600 font-light"
                    >
                        {"Statut juridique: " + getValue("societe.statutJuridique", "<Statut juridique>")}
                    </a>
                </div>
            </div>
        </div>
    );
}