import { Course } from '../types';

// === Dynamic Institutional Color Palette (Unchanged for consistency) ===
export const courseColors = {
  required: '#dc2626',      // Major Required: Crimson Red
  elective: '#10b981',      // Major Elective: Emerald Green
  chinese: '#d97706',       // NCKU Chinese (A7): Amber Orange
  english: '#2563eb',       // Foreign Language (A1): Royal Blue
  pe: '#7c3aed',            // Physical Education (A2): Lavender Purple
  military: '#059669',      // Military Training (A3): Tactical Green
  general: '#db2777',       // General Electives (A9, W...): Rose Pink
};

// Global Deterministic Coloring Engine for NCKU Systems
export const determineCourseColor = (course: Course, selectedDept?: string): string => {
  if (!course.id || course.id.length < 2) {
    return course.required ? courseColors.required : courseColors.elective;
  }
  const prefix = course.id.substring(0, 2).toUpperCase();
  switch (prefix) {
    case 'A1': return courseColors.english;
    case 'A2': return courseColors.pe;
    case 'A3': return courseColors.military;
    case 'A7': return courseColors.chinese;
    case 'A9': return courseColors.general;
    default:
      if (prefix.startsWith('A') || prefix === 'A0' || selectedDept === 'A9') {
        return courseColors.general;
      }
      return course.required ? courseColors.required : courseColors.elective;
  }
};

// === Semantic Semantic Dark/Light Palette Shards ===
export const getThemeColors = (isDark: boolean) => ({
  bgMain: isDark ? '#111827' : '#f3f4f6',
  bgPanel: isDark ? '#1f2937' : '#ffffff',
  bgWorkspace: isDark ? '#111827' : '#f9fafb',
  textPrimary: isDark ? '#f3f4f6' : '#111827',
  textSecondary: isDark ? '#9ca3af' : '#4b5563',
  textMuted: isDark ? '#6b7280' : '#9ca3af',
  border: isDark ? '#374151' : '#e5e7eb',
  gridCanvas: isDark ? '#374151' : '#e5e7eb',
  slotCell: isDark ? '#1f2937' : '#ffffff',
  slotBorder: isDark ? '#111827' : '#f3f4f6',
  filterPanel: isDark ? '#111827' : '#f9fafb',
});

// === index.tsx / Main App Layout Styles ===
export const appLayoutStyles = {
  getContainer: (isDark: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: getThemeColors(isDark).bgMain,
    color: getThemeColors(isDark).textPrimary,
    transition: 'background-color 0.2s, color 0.2s'
  }),
  workspaceContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
};

// === CourseGrid.tsx Canvas Styles ===
export const courseGridStyles = {
  getGridContainer: (isDark: boolean) => ({
    display: 'grid',
    gridTemplateColumns: '60px repeat(5, minmax(130px, 1fr))',
    gridTemplateRows: '40px repeat(13, minmax(55px, auto))',
    gap: '6px',
    background: getThemeColors(isDark).gridCanvas,
    padding: '8px',
    borderRadius: '8px',
    position: 'relative' as const, 
  }),
  getHeaderCell: (isDark: boolean) => ({
    background: isDark ? '#4b5563' : '#1f2937',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    borderRadius: '4px',
    fontSize: '0.9rem',
  }),
  getPeriodLabel: (isDark: boolean) => ({
    background: isDark ? '#111827' : '#6b7280',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    borderRadius: '4px',
    fontSize: '0.85rem',
  }),
  getSlot: (isDark: boolean) => ({
    background: getThemeColors(isDark).slotCell,
    borderRadius: '4px',
    border: `1px solid ${getThemeColors(isDark).slotBorder}`,
  }),
  courseName: {
    fontWeight: 'bold' as const,
    fontSize: '12px',
    marginBottom: '2px',
    lineHeight: '1.2',
  },
  courseMeta: {
    fontSize: '10px',
    opacity: 0.95,
    marginTop: '1px',
  },
  deleteButton: {
    position: 'absolute' as const,
    top: '2px',
    right: '4px',
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '14px',
    cursor: 'pointer',
    opacity: 0.7,
    zIndex: 6,
  },
  getCourseCard: (bgColor: string, rowStart: number, rowSpan: number, colStart: number) => ({
    color: '#ffffff',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    textAlign: 'center' as const,
    transition: 'all 0.15s ease-in-out',
    backgroundColor: bgColor,
    position: 'absolute' as const,
    gridRowStart: rowStart,
    gridRowEnd: `span ${rowSpan}`,
    gridColumnStart: colStart,
    gridColumnEnd: 'span 1',
    top: 0, left: 0, right: 0, bottom: 0,
    boxSizing: 'border-box' as const,
    zIndex: 5,
  }),
  getPreviewCard: (previewColor: string, rowStart: number, rowSpan: number, colStart: number, isDark: boolean) => ({
    color: '#ffffff',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center' as const,
    backgroundColor: previewColor,
    position: 'absolute' as const,
    gridRowStart: rowStart,
    gridRowEnd: `span ${rowSpan}`,
    gridColumnStart: colStart,
    gridColumnEnd: 'span 1',
    top: 0, left: 0, right: 0, bottom: 0,
    boxSizing: 'border-box' as const,
    opacity: 0.6,
    border: `2px dashed ${isDark ? '#f3f4f6' : '#1f2937'}`,
    boxShadow: 'none',
    zIndex: 10,
    pointerEvents: 'none' as const
  }),
};

// === Sidebar.tsx Panel Styles ===
export const sidebarStyles = {
  getAside: (isDark: boolean) => ({ width: '340px', backgroundColor: getThemeColors(isDark).bgPanel, borderRight: `1px solid ${getThemeColors(isDark).border}`, display: 'flex', flexDirection: 'column' as const, transition: 'background-color 0.2s' }),
  getSelectorWrapper: (isDark: boolean) => ({ padding: '16px', borderBottom: `1px solid ${getThemeColors(isDark).border}`, display: 'flex', flexDirection: 'column' as const, gap: '10px' }),
  getLabel: (isDark: boolean) => ({ fontSize: '0.75rem', fontWeight: 'bold', color: getThemeColors(isDark).textSecondary, textTransform: 'uppercase' as const }),
  getSelect: (isDark: boolean) => ({ width: '100%', padding: '8px', borderRadius: '4px', border: `1px solid ${getThemeColors(isDark).border}`, backgroundColor: getThemeColors(isDark).slotCell, color: getThemeColors(isDark).textPrimary, marginTop: '4px' }),
  getInput: (isDark: boolean) => ({ width: '100%', padding: '8px', boxSizing: 'border-box' as const, borderRadius: '4px', border: `1px solid ${getThemeColors(isDark).border}`, backgroundColor: getThemeColors(isDark).slotCell, color: getThemeColors(isDark).textPrimary }),
};

// === TopNav.tsx Global Bar Styles ===
export const topNavStyles = {
  getNavBar: (isDark: boolean) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', height: '60px', backgroundColor: getThemeColors(isDark).bgPanel, borderBottom: `1px solid ${getThemeColors(isDark).border}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', zIndex: 10, transition: 'background-color 0.2s' }),
};