"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

export type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
};

export default function MultiSelect({ options, value, onChange, label }: MultiSelectProps) {
  const [query, setQuery] = useState("");
  const selected = useMemo(() => new Set(value), [value]);
  const visibleOptions = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );

  function toggle(optionValue: string) {
    onChange(selected.has(optionValue)
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue]);
  }

  return (
    <div className="admin-multiselect">
      <div className="admin-selected-values" aria-label={`${label}: valeurs sélectionnées`}>
        {value.map((item) => {
          const option = options.find((candidate) => candidate.value === item);
          if (!option) {
            return (
              <span key={item} className="admin-selected-tag admin-selected-tag-warning">
                <span>Valeur legacy: {item}</span>
                <button type="button" aria-label={`Retirer la valeur legacy ${item}`} onClick={() => toggle(item)}>
                  <X size={12} />
                </button>
              </span>
            );
          }
          return (
            <span key={item} className="admin-selected-tag">
              <span>{option.label}</span>
              <button type="button" aria-label={`Retirer ${option.label}`} onClick={() => toggle(item)}>
                <X size={12} />
              </button>
            </span>
          );
        })}
        {value.length === 0 && <span className="admin-cell-secondary">Aucune valeur sélectionnée</span>}
      </div>
      {value.some((item) => !options.some((option) => option.value === item)) && (
        <p role="alert" className="admin-field-warning">Retirez les valeurs legacy non autorisées avant d’enregistrer.</p>
      )}
      <details className="admin-select-details group">
        <summary aria-label={`Choisir ${label}`}>
          <span>Choisir les valeurs ({value.length})</span><ChevronDown size={16} className="transition-transform group-open:rotate-180" />
        </summary>
        <div className="admin-select-options">
          {options.length > 8 && <input type="search" aria-label={`Rechercher dans ${label}`} placeholder="Rechercher…" value={query} onChange={(event) => setQuery(event.target.value)} />}
          <div className="space-y-1">
            {visibleOptions.map((option) => (
              <label key={option.value}>
                <input type="checkbox" checked={selected.has(option.value)} onChange={() => toggle(option.value)} />
                <span className="min-w-0 flex-1">{option.label}</span>
                {selected.has(option.value) && <Check size={14} className="admin-valid" />}
              </label>
            ))}
            {visibleOptions.length === 0 && <p className="admin-cell-secondary">Aucun résultat</p>}
          </div>
        </div>
      </details>
    </div>
  );
}
