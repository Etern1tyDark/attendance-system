'use client';

import { ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ExportFormat = 'csv' | 'xlsx';

interface DataExportMenuProps {
  disabled?: boolean;
  loadingFormat: ExportFormat | null;
  onSelect: (format: ExportFormat) => void;
}

export default function DataExportMenu({
  disabled = false,
  loadingFormat,
  onSelect,
}: DataExportMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const isBusy = disabled || loadingFormat !== null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={isBusy}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        Download Data
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !isBusy && (
        <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSelect('csv');
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 text-blue-600" />
            CSV (.csv)
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSelect('xlsx');
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            Excel (.xlsx)
          </button>
        </div>
      )}
    </div>
  );
}
