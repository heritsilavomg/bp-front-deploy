import EditPartenaires from "@/components/edit-bp-page/components/EditPartenaires";

type PagePartenairesProps = {
  getFieldValue?: <T extends string>(field: T) => any;
  onFieldChange?: <T extends string>(field: T, value: any) => void;
};

export default function PagePartenaires({ getFieldValue, onFieldChange }: PagePartenairesProps) {
  const partenaires = (getFieldValue?.("partenaires") as any[]) ?? [];

  const setPartenaires = (partenaires: any[]) => {
    onFieldChange?.("partenaires", partenaires);
  };

  return (
    <div className="space-y-6">
      <EditPartenaires
        partenaires={partenaires}
        setPartenaires={setPartenaires}
      />
    </div>
  );
}
