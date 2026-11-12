import EditMoyensCommunication from "@/components/edit-bp-page/components/EditMoyensCommunication";
import type { MoyensCommunicationType } from "@/types/bp/general";

type PageMoyensCommunicationProps = {
  onFieldChange?: (field: string, value: any) => void;
  getFieldValue?: (field: string) => any;
};

export default function PageMoyensCommunication({ onFieldChange, getFieldValue }: PageMoyensCommunicationProps) {
  const moyensCommunication = (getFieldValue?.("moyensCommunication") as MoyensCommunicationType[] | undefined) ?? [];

  const setMoyensCommunication = (next: MoyensCommunicationType[]) => {
    onFieldChange?.("moyensCommunication", next);
  };

  return (
    <div className="rounded-3xl p-6 sm:p-7">
      <EditMoyensCommunication moyensCommunication={moyensCommunication} setMoyensCommunication={setMoyensCommunication} />
    </div>
  );
}
