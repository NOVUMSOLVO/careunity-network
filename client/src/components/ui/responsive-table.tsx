/**
 * Responsive Table Component
 * 
 * A table component that adapts to different screen sizes.
 * On mobile devices, it transforms into a card-based layout.
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDevice } from '@/hooks/use-mobile';
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';

export interface Column<T> {
  /** Unique identifier for the column */
  id: string;
  /** Header text to display */
  header: React.ReactNode;
  /** Function to extract the cell value from the row data */
  accessor: (row: T) => React.ReactNode;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Whether to hide the column on mobile devices */
  hideOnMobile?: boolean;
  /** Whether to show the column as a header on mobile cards */
  showAsMobileHeader?: boolean;
  /** Custom cell renderer */
  cell?: (value: any, row: T) => React.ReactNode;
  /** Column width (e.g., '100px', '10%') */
  width?: string;
  /** CSS class for the column */
  className?: string;
}

export interface ResponsiveTableProps<T> {
  /** Array of column definitions */
  columns: Column<T>[];
  /** Array of data rows */
  data: T[];
  /** Key function to generate unique keys for rows */
  getRowKey: (row: T) => string | number;
  /** Whether to enable sorting */
  sortable?: boolean;
  /** Default sort column */
  defaultSortColumn?: string;
  /** Default sort direction */
  defaultSortDirection?: 'asc' | 'desc';
  /** Whether to show a loading state */
  loading?: boolean;
  /** Message to display when there's no data */
  emptyMessage?: React.ReactNode;
  /** CSS class for the table container */
  className?: string;
  /** CSS class for the table element */
  tableClassName?: string;
  /** CSS class for table rows */
  rowClassName?: string | ((row: T, index: number) => string);
  /** Function called when a row is clicked */
  onRowClick?: (row: T) => void;
  /** Whether to use card layout on mobile */
  mobileCards?: boolean;
  /** CSS class for mobile cards */
  cardClassName?: string;
  /** Whether to enable pagination */
  pagination?: boolean;
  /** Number of rows per page */
  pageSize?: number;
  /** Current page number (1-based) */
  currentPage?: number;
  /** Total number of rows (for server-side pagination) */
  totalRows?: number;
  /** Function called when page changes */
  onPageChange?: (page: number) => void;
  /** Whether to enable row selection */
  selectable?: boolean;
  /** Array of selected row keys */
  selectedRows?: (string | number)[];
  /** Function called when selection changes */
  onSelectionChange?: (selectedKeys: (string | number)[]) => void;
}

/**
 * Responsive Table Component
 */
export function ResponsiveTable<T>({
  columns,
  data,
  getRowKey,
  sortable = false,
  defaultSortColumn,
  defaultSortDirection = 'asc',
  loading = false,
  emptyMessage = 'No data available',
  className,
  tableClassName,
  rowClassName,
  onRowClick,
  mobileCards = true,
  cardClassName,
  pagination = false,
  pageSize = 10,
  currentPage = 1,
  totalRows,
  onPageChange,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
}: ResponsiveTableProps<T>) {
  const { isMobile } = useDevice();
  const [sortColumn, setSortColumn] = useState<string | undefined>(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [sortedData, setSortedData] = useState<T[]>(data);
  
  // Update sorted data when data, sort column, or sort direction changes
  useEffect(() => {
    if (sortable && sortColumn) {
      const column = columns.find(col => col.id === sortColumn);
      if (column) {
        const sorted = [...data].sort((a, b) => {
          const aValue = column.accessor(a);
          const bValue = column.accessor(b);
          
          // Handle different value types
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc' 
              ? aValue.localeCompare(bValue) 
              : bValue.localeCompare(aValue);
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
          } else {
            // Convert to string for comparison
            const aStr = String(aValue);
            const bStr = String(bValue);
            return sortDirection === 'asc' 
              ? aStr.localeCompare(bStr) 
              : bStr.localeCompare(aStr);
          }
        });
        setSortedData(sorted);
      } else {
        setSortedData(data);
      }
    } else {
      setSortedData(data);
    }
  }, [data, sortColumn, sortDirection, columns, sortable]);
  
  // Handle sort click
  const handleSortClick = (columnId: string) => {
    if (sortable) {
      if (sortColumn === columnId) {
        // Toggle direction if same column
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        // Set new column and default to ascending
        setSortColumn(columnId);
        setSortDirection('asc');
      }
    }
  };
  
  // Handle row selection
  const handleRowSelection = (rowKey: string | number) => {
    if (selectable && onSelectionChange) {
      const isSelected = selectedRows.includes(rowKey);
      const newSelectedRows = isSelected
        ? selectedRows.filter(key => key !== rowKey)
        : [...selectedRows, rowKey];
      onSelectionChange(newSelectedRows);
    }
  };
  
  // Render sort indicator
  const renderSortIndicator = (column: Column<T>) => {
    if (sortable && column.sortable) {
      if (sortColumn === column.id) {
        return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
      }
      return <ArrowUpDown size={16} className="opacity-50" />;
    }
    return null;
  };
  
  // Render as cards on mobile
  if (isMobile && mobileCards) {
    return (
      <div className={cn("space-y-4", className)}>
        {loading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : sortedData.length === 0 ? (
          <div className="py-8 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          sortedData.map((row, rowIndex) => {
            const rowKey = getRowKey(row);
            const isSelected = selectable && selectedRows.includes(rowKey);
            
            return (
              <div
                key={rowKey}
                className={cn(
                  "bg-white rounded-lg shadow border border-gray-100 overflow-hidden",
                  isSelected && "ring-2 ring-primary",
                  typeof rowClassName === 'function' ? rowClassName(row, rowIndex) : rowClassName,
                  onRowClick && "cursor-pointer",
                  cardClassName
                )}
                onClick={() => {
                  if (selectable) {
                    handleRowSelection(rowKey);
                  }
                  if (onRowClick) {
                    onRowClick(row);
                  }
                }}
              >
                <div className="divide-y divide-gray-100">
                  {columns
                    .filter(col => !col.hideOnMobile)
                    .map(column => (
                      <div key={column.id} className="flex p-3">
                        <div className="w-1/3 font-medium text-gray-500">{column.header}</div>
                        <div className="w-2/3">
                          {column.cell ? column.cell(column.accessor(row), row) : column.accessor(row)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }
  
  // Render as traditional table on larger screens
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className={cn("w-full border-collapse", tableClassName)}>
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {selectable && (
              <th className="px-4 py-3 text-left w-10">
                {/* Checkbox for select all could go here */}
              </th>
            )}
            {columns.map(column => (
              <th
                key={column.id}
                className={cn(
                  "px-4 py-3 text-left font-medium text-gray-500",
                  sortable && column.sortable && "cursor-pointer hover:bg-gray-100",
                  column.className
                )}
                style={column.width ? { width: column.width } : undefined}
                onClick={() => column.sortable && handleSortClick(column.id)}
              >
                <div className="flex items-center gap-1">
                  <span>{column.header}</span>
                  {renderSortIndicator(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-8 text-center text-gray-500"
              >
                Loading...
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-8 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => {
              const rowKey = getRowKey(row);
              const isSelected = selectable && selectedRows.includes(rowKey);
              
              return (
                <tr
                  key={rowKey}
                  className={cn(
                    "border-b border-gray-100 hover:bg-gray-50",
                    isSelected && "bg-primary-50",
                    typeof rowClassName === 'function' ? rowClassName(row, rowIndex) : rowClassName,
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => {
                    if (onRowClick) {
                      onRowClick(row);
                    }
                  }}
                >
                  {selectable && (
                    <td className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRowSelection(rowKey)}
                        onClick={e => e.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td key={column.id} className={cn("px-4 py-3", column.className)}>
                      {column.cell ? column.cell(column.accessor(row), row) : column.accessor(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
