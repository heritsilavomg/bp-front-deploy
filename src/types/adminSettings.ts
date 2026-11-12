export type SettingValueType = "number" | "string" | "boolean" | "json" | string;

export type AdminSetting = {
  key: string;
  value?: string;
  valueType?: SettingValueType;
  group?: string;
  description?: string;
};

export type AdminAmortissement = {
  typeKey: string;
  tauxAnnuel: number;
  dureeAnnees: number;
};
