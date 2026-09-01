function normalizeOption(option) {
  if (typeof option === "string" || typeof option === "number") {
    return { label: String(option), value: option };
  }
  return {
    label: option.label,
    value: option.value,
  };
}

function InvestorPillSegmented({ options = [], value, onChange, className = "" }) {
  const items = options.map(normalizeOption);

  return (
    <div
      className={`investor-pill-segmented${className ? ` ${className}` : ""}`}
      role="tablist"
      aria-label="Filter"
    >
      {items.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? "true" : undefined}
            className={`investor-pill-segmented__item${
              isActive ? " investor-pill-segmented__item--active" : ""
            }`}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default InvestorPillSegmented;
