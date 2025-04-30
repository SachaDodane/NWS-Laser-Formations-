"use client";
import { useMemo } from "react";

interface ClientDateProps {
  date: string | Date | null | undefined;
  format?: Intl.DateTimeFormatOptions;
  prefix?: string;
  className?: string;
}

export default function ClientDate({ date, format, prefix, className }: ClientDateProps) {
  const formatted = useMemo(() => {
    if (!date) return '';
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('fr-FR', format || {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [date, format]);
  if (!formatted) return null;
  return <span className={className}>{prefix}{formatted}</span>;
}
