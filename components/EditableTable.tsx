import React, { useState } from 'react';

export interface Column<T> {
  key: keyof T;
  header: string;
  type: 'text' | 'number' | 'select' | 'checkbox';
  options?: { value: string; label: string }[];
  editable?: boolean;
  render?: (row: T) => React.ReactNode;
  getEditValue?: (row: T) => string | number;
}

interface EditableTableProps<T extends { id: number }> {
  columns: Column<T>[];
  data: T[];
  onSaveRow: (row: T) => boolean;
  newRowTemplate: Omit<T, 'id'>;
}

export const EditableTable = <T extends { id: number }>({ columns, data, onSaveRow, newRowTemplate }: EditableTableProps<T>) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<T | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (row: T) => {
    // When editing starts, pre-process the row data using getEditValue if available.
    // This transforms the canonical data (e.g., 0.15) into an editor-friendly format (e.g., 15).
    // This transformed data is then stored in the `editedRow` state.
    let rowForEditing = { ...row };
    columns.forEach(col => {
      if (col.editable && col.getEditValue) {
        (rowForEditing as any)[col.key] = col.getEditValue(row);
      }
    });
    setEditingId(row.id);
    setEditedRow(rowForEditing);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedRow(null);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (editedRow) {
      // The onSaveRow handler is responsible for reversing the transformation.
      const success = onSaveRow(editedRow);
      if(success) {
        handleCancel();
      }
    }
  };
  
  const handleAdd = () => {
    const newRowTemplateWithId = { ...newRowTemplate, id: -1 } as T; // Temporary ID for a new row
    let rowForEditing = { ...newRowTemplateWithId };
    // Also pre-process the new row template for editing.
    columns.forEach(col => {
      if (col.editable && col.getEditValue) {
        (rowForEditing as any)[col.key] = col.getEditValue(newRowTemplateWithId);
      }
    });
    setEditedRow(rowForEditing);
    setEditingId(-1);
    setIsAdding(true);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editedRow) return;

    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
        finalValue = parseFloat(value) || 0;
    }

    setEditedRow({ ...editedRow, [name]: finalValue });
  };

  const renderCell = (row: T, column: Column<T>) => {
    const isEditing = editingId === row.id;

    if (isEditing && column.editable && editedRow) {
      // The value for the input now comes directly from the `editedRow` state,
      // which already holds the editor-friendly format.
      const value = editedRow[column.key];

      if (column.type === 'checkbox') {
        return (
          <input
            type="checkbox"
            name={column.key as string}
            checked={Boolean(editedRow[column.key])}
            onChange={handleInputChange}
            className="h-5 w-5 rounded border-gray-300 text-brand-secondary focus:ring-brand-secondary"
          />
        );
      }
      
      if (column.type === 'select' && column.options) {
        return (
             <select 
                name={column.key as string} 
                value={String(editedRow[column.key])}
                onChange={handleInputChange} 
                className="block w-full text-sm border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary rounded-md"
            >
                {column.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        )
      }

      return (
        <input
          type={column.type}
          name={column.key as string}
          value={String(value)}
          onChange={handleInputChange}
          className="block w-full text-sm border-gray-300 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary rounded-md"
        />
      );
    }
    
    if (column.render) return column.render(row);
    if(typeof row[column.key] === 'boolean') {
        return row[column.key] ? 
            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Sí</span> :
            <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">No</span>
    }
    return <>{String(row[column.key])}</>;
  };
  
  const dataToRender = isAdding && editedRow ? [...data, editedRow] : data;

  return (
    <div className="overflow-x-auto">
        <div className="mb-4">
            <button
                onClick={handleAdd}
                disabled={isAdding}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-secondary rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
                + Agregar Nuevo
            </button>
        </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={col.key as string} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dataToRender.map(row => (
            <tr key={row.id} className={editingId === row.id ? 'bg-amber-50' : ''}>
              {columns.map(col => (
                <td key={`${row.id}-${col.key as string}`} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {renderCell(row, col)}
                </td>
              ))}
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                {editingId === row.id ? (
                  <div className="flex gap-2 justify-end">
                    <button onClick={handleSave} className="text-green-600 hover:text-green-900">Guardar</button>
                    <button onClick={handleCancel} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                  </div>
                ) : (
                  <button onClick={() => handleEdit(row)} className="text-brand-secondary hover:text-brand-primary">Editar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};