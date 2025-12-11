import { Contact } from "./types";

/**
 * Helper to remove accents and special characters for search normalization
 */
const normalizeText = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Remove dots and spaces to find "74.545" as "74545"
    .replace(/[\.\s-]/g, "");
};

/**
 * Generate a unique ID using crypto if available, otherwise fallback to robust random
 */
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * Filter contacts based on query.
 * Robust search that handles accents and formatting differences.
 */
export const searchContacts = (contacts: Contact[], query: string): Contact[] => {
  if (!query) return contacts;
  
  const normalizedQuery = normalizeText(query);
  
  return contacts.filter(c => {
    return (
      normalizeText(c.servicio).includes(normalizedQuery) ||
      normalizeText(c.interno).includes(normalizedQuery) ||
      normalizeText(c.externo).includes(normalizedQuery) ||
      normalizeText(c.centro).includes(normalizedQuery) ||
      normalizeText(c.edificio).includes(normalizedQuery)
    );
  });
};

/**
 * Parses a CSV string into Contact objects.
 * Uses Regex to correctly handle separators, even if they appear inside quoted strings.
 * Expected columns order: Centro, Edificio, Planta, Servicio, Interno, Externo
 */
export const parseCSV = (csvContent: string): Contact[] => {
  // Normalize line endings
  const content = csvContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = content.split("\n");
  const result: Contact[] = [];

  // Detect separator based on first valid line
  let separator = ",";
  if (lines.length > 0) {
    // If the line contains significantly more semicolons than commas, assume semicolon
    const firstLine = lines.find(l => l.trim().length > 0) || "";
    if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) {
      separator = ";";
    }
  }

  // Helper to clean quotes
  const clean = (str: string | undefined) => {
    if (!str) return "";
    let s = str.trim();
    if (s.startsWith('"') && s.endsWith('"')) {
      s = s.substring(1, s.length - 1);
    }
    // Replace double double-quotes with single double-quotes
    return s.replace(/""/g, '"');
  };

  // Regex breakdown:
  // Match either:
  // 1. Quoted string: "..." (handling escaped quotes "")
  // 2. Non-quoted string: anything except separator
  // Followed by separator OR end of string
  // Note: This matches fields sequentially.
  const regexPattern = new RegExp(`(?:^|${separator})\\s*(?:"([^"]*(?:""[^"]*)*)"|([^"${separator}]*))`, "g");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns: string[] = [];
    let match;
    
    // Reset regex index for each line
    regexPattern.lastIndex = 0;
    
    // Using matchAll logic (or while loop for older JS env support) to extract fields
    // We simple split is not enough.
    
    // Fallback: If the line doesn't seem to have complex quotes, use fast split
    if (!line.includes('"')) {
       const simpleCols = line.split(separator);
       simpleCols.forEach(c => columns.push(c));
    } else {
       // Complex parsing for quoted CSV
       // If standard regex is tricky, we use a basic parser state machine for reliability
       let currentVal = '';
       let inQuote = false;
       for(let charIdx = 0; charIdx < line.length; charIdx++) {
           const char = line[charIdx];
           if (char === '"') {
               inQuote = !inQuote;
           } else if (char === separator && !inQuote) {
               columns.push(currentVal);
               currentVal = '';
               continue;
           }
           currentVal += char;
       }
       columns.push(currentVal);
    }

    // Skip header if it looks like a header
    if (i === 0 && (clean(columns[0]).toLowerCase().includes('centro') || clean(columns[3]).toLowerCase().includes('servicio'))) {
      continue;
    }

    // Map columns based on the user's provided structure
    // Centro, Edificio, Planta, Servicio, Interno, Externo
    if (columns.length >= 1) { 
      result.push({
        id: generateId(),
        centro: clean(columns[0]) || "GENERAL",
        edificio: clean(columns[1]) || "",
        planta: clean(columns[2]) || "",
        servicio: clean(columns[3]) || "Sin Nombre",
        interno: clean(columns[4]) || "",
        externo: clean(columns[5]) || ""
      });
    }
  }

  return result;
};