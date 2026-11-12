import EditFournisseurs from "@/components/edit-bp-page/components/EditFournisseurs";

type PageFournisseursProps = {
  getFieldValue?: <T extends string>(field: T) => any;
  onFieldChange?: <T extends string>(field: T, value: any) => void;
};

export default function PageFournisseurs({ getFieldValue, onFieldChange }: PageFournisseursProps) {
  const fournisseurs = (getFieldValue?.("fournisseurs") as any[]) ?? [];

  const setFournisseurs = (fournisseurs: any[]) => {
    onFieldChange?.("fournisseurs", fournisseurs);
  };

  return (
    <div className="space-y-6">
      <EditFournisseurs
        fournisseurs={fournisseurs}
        setFournisseurs={setFournisseurs}
      />
    </div>
  );
}
