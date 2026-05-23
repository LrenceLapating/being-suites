import React, { useState, useEffect } from 'react';
import { Edit3, Check, X } from 'lucide-react';

interface InlineEditCellProps {
  value: string | number;
  onSave: (newValue: string | number) => void;
  type?: 'text' | 'number' | 'select';
  options?: string[];
  className?: string;
}

const InlineEditCell: React.FC<InlineEditCellProps> = ({
  value,
  onSave,
  type = 'text',
  options = [],
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        {type === 'select' ? (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            className="inline-edit-input text-xs"
            autoFocus
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            onKeyDown={handleKeyPress}
            className={`inline-edit-input ${type === 'number' ? 'text-right' : 'text-left'}`}
            autoFocus
          />
        )}
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:bg-green-100 rounded"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-red-600 hover:bg-red-100 rounded"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`editable-cell ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {value}
    </div>
  );
};

export default InlineEditCell;