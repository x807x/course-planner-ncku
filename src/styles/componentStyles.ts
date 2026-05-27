import React from 'react';
import { Course } from '../types';

// === Dynamic Institutional Color Palette ===
export const courseColors = {
  required: '#dc2626',      // 專業必修：質感紅
  elective: '#10b981',      // 專業選修：草本綠
  chinese: '#d97706',       // 大學國文 (A7)：琥珀橘
  english: '#2563eb',       // 外國語言 (A1)：皇家藍
  pe: '#7c3aed',            // 體育課程 (A2)：羅蘭紫
  military: '#059669',      // 軍訓課程 (A3)：軍警綠
  general: '#db2777',       // 通識 / 跨領域 (A9, W...)：玫瑰粉
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

// === index.tsx / Main App Layout Styles ===
export const appLayoutStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
  },
  workspaceContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
};

// === CourseGrid.tsx Canvas Styles ===
// === CourseGrid.tsx Canvas Styles ===
export const courseGridStyles = {
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '60px repeat(5, minmax(130px, 1fr))',
    gridTemplateRows: '40px repeat(13, minmax(55px, auto))',
    gap: '6px',
    background: '#e5e7eb',
    padding: '8px',
    borderRadius: '8px',
    
    // 🎯 【關鍵救星】必須宣告為 relative，才能成為 absolute 課程卡片的定位基準點點！
    position: 'relative' as const, 
  },
  headerCell: {
    background: '#1f2937',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  periodLabel: {
    background: '#6b7280',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    borderRadius: '4px',
    fontSize: '0.85rem',
  },
  slot: {
    background: '#ffffff',
    borderRadius: '4px',
    border: '1px solid #f3f4f6',
  },
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
  // ⚡ 貼紙層：現在它們會完美錨定在 gridContainer 的邊界內了！
  getCourseCard: (bgColor: string, rowStart: number, rowSpan: number, colStart: number) => ({
    color: '#ffffff',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    transition: 'all 0.15s ease-in-out',
    backgroundColor: bgColor,

    position: 'absolute' as const,
    gridRowStart: rowStart,
    gridRowEnd: `span ${rowSpan}`,
    gridColumnStart: colStart,
    gridColumnEnd: 'span 1',

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    boxSizing: 'border-box' as const,
    zIndex: 5,
  }),
  getPreviewCard: (previewColor: string, rowStart: number, rowSpan: number, colStart: number) => ({
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
    
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    boxSizing: 'border-box' as const,
    
    opacity: 0.45,
    border: '2px dashed #1f2937',
    boxShadow: 'none',
    zIndex: 10,
    pointerEvents: 'none' as const
  }),
};

// === Sidebar.tsx Panel Styles ===
export const sidebarStyles = {
  aside: { width: '340px', backgroundColor: '#ffffff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' } as React.CSSProperties,
  selectorWrapper: { padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '10px' } as React.CSSProperties,
  label: { fontSize: '0.75rem', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' } as React.CSSProperties,
  select: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', marginTop: '4px' } as React.CSSProperties,
  batchButton: { width: '100%', padding: '10px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)' } as React.CSSProperties,
  searchWrapper: { padding: '16px', borderBottom: '1px solid #e5e7eb' } as React.CSSProperties,
  searchInput: { width: '100%', padding: '8px', boxSizing: 'border-box' as const, borderRadius: '4px', border: '1px solid #d1d5db' } as React.CSSProperties,
  catalogStream: { flex: 1, overflowY: 'auto' as const, padding: '16px', display: 'flex', flexDirection: 'column' as const, gap: '12px' } as React.CSSProperties,
  loadingText: { textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '20px' } as React.CSSProperties,
  courseCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } as React.CSSProperties,
  courseMetaText: { fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold' } as React.CSSProperties,
  conflictBadge: { fontSize: '0.75rem', color: '#dc2626', fontWeight: 'bold' } as React.CSSProperties,
  courseTitle: { margin: '4px 0', fontSize: '0.9rem', color: '#1f2937', textAlign: 'left' as const } as React.CSSProperties,
  coursePeriod: { margin: '2px 0', fontSize: '0.75rem', color: '#4b5563', textAlign: 'left' as const } as React.CSSProperties,
  addButtonBase: { marginTop: '8px', width: '100%', padding: '6px', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' } as React.CSSProperties,
};

// === TopNav.tsx Global Bar Styles ===
export const topNavStyles = {
  navBar: { height: '60px', backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', color: '#ffffff' } as React.CSSProperties,
  leftCluster: { display: 'flex', alignItems: 'center', gap: '16px' } as React.CSSProperties,
  rightActionCluster: { display: 'flex', alignItems: 'center', gap: '10px' } as React.CSSProperties,
  navButtonBase: { padding: '6px 12px', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' } as React.CSSProperties,
  exportBtn: { backgroundColor: '#10b981' } as React.CSSProperties,
  importBtn: { backgroundColor: '#4b5563' } as React.CSSProperties,
};