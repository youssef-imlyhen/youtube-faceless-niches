import React, { useState, useRef, useEffect, useCallback } from 'react';

interface FilterSectionProps {
  title: string;
  icon?: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  columns?: number;
}

interface RangeFilterProps {
  label: string;
  icon?: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (min: number, max: number) => void;
  formatValue?: (value: number) => string;
  presets?: { label: string; value: number }[];
  showMaxOnly?: boolean;
  colorScheme?: 'default' | 'success' | 'warning' | 'danger';
}

interface SelectFilterProps {
  label: string;
  icon?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

interface DateFilterProps {
  label: string;
  icon?: string;
  value: string;
  onChange: (value: string) => void;
}

interface SearchFilterProps {
  filters: any[]; // Using any[] to avoid circular dependency with types, or define locally
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: any) => void;
  onReset: () => void;
  properties: { value: string; label: string }[];
}

interface QuickFilterChipProps {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
  color?: 'success' | 'warning' | 'danger';
}

export const FilterSection: React.FC<FilterSectionProps> = ({ 
  title, 
  icon, 
  expanded, 
  onToggle, 
  children,
  columns = 3
}) => {
  return (
    <div className={`filter-section ${expanded ? 'expanded' : ''}`}>
      <button
        className="filter-section-header"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="filter-header-content">
          {icon && <span className="filter-section-icon">{icon}</span>}
          <h3>{title}</h3>
        </div>
        <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </button>
      <div className={`filter-section-body ${expanded ? 'expanded' : ''}`}>
        <div className={`filter-section-inner filter-columns-${columns}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export const RangeFilter: React.FC<RangeFilterProps> = ({
  label,
  icon,
  min,
  max,
  step,
  value,
  onChange,
  formatValue,
  presets,
  showMaxOnly = false,
  colorScheme = 'default'
}) => {
  const [isEditing, setIsEditing] = useState<'min' | 'max' | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const minInputRef = useRef<HTMLInputElement>(null);
  const maxInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing === 'min' && minInputRef.current) {
      minInputRef.current.focus();
    } else if (isEditing === 'max' && maxInputRef.current) {
      maxInputRef.current.focus();
    }
  }, [isEditing]);

  const handlePresetClick = (presetValue: number) => {
    onChange(value[0], presetValue);
  };

  const handleReset = () => {
    onChange(min, max);
  };

  const handleMinEdit = () => {
    setIsEditing('min');
    setEditValue(formatValue ? formatValue(value[0]) : value[0].toString());
  };

  const handleMaxEdit = () => {
    setIsEditing('max');
    setEditValue(formatValue ? formatValue(value[1]) : value[1].toString());
  };

  const handleEditSave = () => {
    const num = parseInt(editValue.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num)) {
      if (isEditing === 'min' && num >= min && num <= value[1]) {
        onChange(num, value[1]);
      } else if (isEditing === 'max' && num <= max && num >= value[0]) {
        onChange(value[0], num);
      }
    }
    setIsEditing(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      setIsEditing(null);
    }
  };

  const format = (val: number) => {
    if (formatValue) {
      return formatValue(val);
    }
    return val.toLocaleString();
  };

  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  const minPercent = getPercent(value[0]);
  const maxPercent = getPercent(value[1]);

  if (isEditing) {
    return (
      <div className={`range-filter compact editing color-${colorScheme}`}>
        <div className="range-filter-header">
          {icon && <span className="range-filter-icon">{icon}</span>}
          <span className="range-label">{label}</span>
        </div>
        <div className="range-edit-group">
          <input
            ref={isEditing === 'min' ? minInputRef : maxInputRef}
            type="text"
            className="range-edit-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditSave}
            autoFocus
          />
          <button className="range-edit-accept" onClick={handleEditSave}>✓</button>
          <button className="range-edit-cancel" onClick={() => setIsEditing(null)}>✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`range-filter ${showMaxOnly ? 'max-only' : ''} color-${colorScheme}`}>
      <div className="range-filter-header">
        {icon && <span className="range-filter-icon">{icon}</span>}
        <span className="range-label">{label}</span>
      </div>

      <div className="range-controls">
        <div className="range-value-display">
          <button
            className="range-value-button range-min-value"
            onClick={handleMinEdit}
            disabled={showMaxOnly}
          >
            {format(value[0])}
          </button>
          {!showMaxOnly && <span className="range-separator">to</span>}
          <button
            className="range-value-button range-max-value"
            onClick={handleMaxEdit}
          >
            {format(value[1])}
          </button>
        </div>

        <div className="dual-slider-container">
          <div className="dual-slider-track"></div>
          <div 
            className="dual-slider-range" 
            style={{ 
              left: `${showMaxOnly ? 0 : minPercent}%`, 
              width: `${showMaxOnly ? maxPercent : maxPercent - minPercent}%` 
            }}
          ></div>
          
          {!showMaxOnly && (
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value[0]}
              onChange={(event) => {
                const val = Math.min(Number(event.target.value), value[1] - step);
                onChange(val, value[1]);
              }}
              className="dual-slider-input"
              style={{ zIndex: 3 }}
            />
          )}
          
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[1]}
            onChange={(event) => {
              const val = Math.max(Number(event.target.value), value[0] + step);
              onChange(value[0], val);
            }}
            className="dual-slider-input"
            style={{ zIndex: 4 }}
          />
        </div>

        {presets && presets.length > 0 && (
          <div className="range-presets-row">
            {presets.slice(0, 3).map((preset) => (
              <button
                key={preset.label}
                className="range-preset-chip"
                onClick={() => handlePresetClick(preset.value)}
              >
                {preset.label}
              </button>
            ))}
            {(value[0] !== min || value[1] !== max) && (
              <button className="range-preset-chip range-preset-reset" onClick={handleReset}>
                Reset
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const SelectFilter: React.FC<SelectFilterProps> = ({
  label,
  icon,
  options,
  value,
  onChange
}) => {
  return (
    <div className="select-filter">
      <div className="select-filter-header">
        {icon && <span className="select-filter-icon">{icon}</span>}
        <span className="select-label">{label}</span>
      </div>
      <div className="select-wrapper">
        <select
          className="select-dropdown"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">All {label}s</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="select-arrow">▼</span>
        {value && (
          <button 
            className="select-clear-btn" 
            onClick={() => onChange('')}
            title="Clear selection"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export const DateFilter: React.FC<DateFilterProps> = ({
  label,
  icon,
  value,
  onChange
}) => {
  return (
    <div className="date-filter">
      <div className="date-filter-header">
        {icon && <span className="date-filter-icon">{icon}</span>}
        <span className="date-label">{label}</span>
      </div>
      <div className="date-input-wrapper">
        <input
          type="date"
          className="date-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button 
            className="date-clear-btn" 
            onClick={() => onChange('')}
            title="Clear date"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export const SearchFilter: React.FC<SearchFilterProps> = ({
  filters,
  onAdd,
  onRemove,
  onUpdate,
  onReset,
  properties
}) => {
  return (
    <div className="search-filter-container">
      <div className="filter-group-header" style={{marginBottom: '10px'}}>
        <span className="filter-group-icon">🔍</span>
        <h4>Advanced Search</h4>
      </div>
      
      <div className="search-filters-list">
        {filters.map((filter, index) => (
          <div key={filter.id} className="search-filter-row">
            <select
              className="search-operator"
              value={filter.operator}
              onChange={(e) => onUpdate(filter.id, { operator: e.target.value })}
              style={{ visibility: index === 0 ? 'hidden' : 'visible' }}
            >
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
            
            <select
              className="search-property"
              value={filter.property}
              onChange={(e) => onUpdate(filter.id, { property: e.target.value })}
            >
              {properties.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            
            <input
              type="text"
              className="search-input"
              value={filter.term}
              onChange={(e) => onUpdate(filter.id, { term: e.target.value })}
              placeholder="Search terms..."
            />
            
            <button
              className="btn-remove-search"
              onClick={() => onRemove(filter.id)}
              disabled={filters.length <= 1}
              title="Remove condition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      
      <div className="search-actions">
        <button className="btn-search-action" onClick={onReset}>
          Reset
        </button>
        <button className="btn-search-action" onClick={onAdd}>
          + Add Condition
        </button>
      </div>
    </div>
  );
};

export const QuickFilterChip: React.FC<QuickFilterChipProps> = ({
  label,
  icon,
  active,
  onClick,
  color = 'warning'
}) => {
  return (
    <button
      className={`quick-filter-chip ${active ? 'active' : ''} color-${color}`}
      onClick={onClick}
    >
      <span className="quick-filter-chip-icon">{icon}</span>
      <span>{label}</span>
      {active && <span className="quick-filter-chip-count">Active</span>}
    </button>
  );
};
