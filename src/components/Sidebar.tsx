import React from "react";
import { Course, DepartmentOption } from "../types";
import { sidebarStyles as styles, getThemeColors } from "../styles/componentStyles";

interface SidebarProps {
  collegeTree: any[];
  selectedCollege: string;
  setSelectedCollege: (college: string) => void;
  currentDeptList: DepartmentOption[];
  selectedDept: string;
  setSelectedDept: (dept: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  isEligibleForBatchImport: boolean;
  onBatchImportRequired: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterRequired: boolean;
  setFilterRequired: (val: boolean) => void;
  filterElective: boolean;
  setFilterElective: (val: boolean) => void;
  excludeConflicts: boolean;
  setExcludeConflicts: (val: boolean) => void;
  catalogWithConflictStatus: (Course & { isConflicting: boolean; conflictingSlots: any[]; })[];
  selectedCourses: any[];
  handleAddCourse: (course: Course) => void;
  setHoveredCourse: (course: Course | null) => void;
  isLoading: boolean;
  isDarkMode: boolean;
}

const YEARS = [
  { id: "", name: "全部年級 (不分年級)" },
  { id: "1", name: "一年級 ( 大大一 )" },
  { id: "2", name: "二年級 ( 大大二 )" },
  { id: "3", name: "三年級 ( 大大三 )" },
  { id: "4", name: "四年級 ( 大大四 )" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collegeTree, selectedCollege, setSelectedCollege,
  currentDeptList, selectedDept, setSelectedDept,
  selectedYear, setSelectedYear,
  isEligibleForBatchImport, onBatchImportRequired,
  searchQuery, setSearchQuery,
  filterRequired, setFilterRequired,
  filterElective, setFilterElective,
  excludeConflicts, setExcludeConflicts,
  catalogWithConflictStatus, selectedCourses,
  handleAddCourse, setHoveredCourse, isLoading,
  isDarkMode,
}) => {
  const theme = getThemeColors(isDarkMode);

  return (
    <aside style={styles.getAside(isDarkMode)}>
      <div style={styles.getSelectorWrapper(isDarkMode)}>
        <div>
          <label style={styles.getLabel(isDarkMode)}>目標學院</label>
          <select value={selectedCollege} onChange={(e) => setSelectedCollege(e.target.value)} style={styles.getSelect(isDarkMode)}>
            {collegeTree.map((c) => (<option key={c.collegeCode} value={c.collegeCode}>{c.collegeCode}</option>))}
          </select>
        </div>

        <div>
          <label style={styles.getLabel(isDarkMode)}>開課系所</label>
          <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} style={styles.getSelect(isDarkMode)}>
            {currentDeptList.map((d) => (<option key={d.code} value={d.code}>{d.code} - {d.name}</option>))}
          </select>
        </div>

        <div>
          <label style={styles.getLabel(isDarkMode)}>指定修課年級</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={styles.getSelect(isDarkMode)}>
            {YEARS.map((y) => (<option key={y.id} value={y.id}>{y.name}</option>))}
          </select>
        </div>

        {isEligibleForBatchImport && (
          <button onClick={onBatchImportRequired} style={{ width: "100%", padding: "10px", backgroundColor: "#3b82f6", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "6px" }}>
            ⚡ 一鍵匯入當前年級必修課
          </button>
        )}
      </div>

      <div style={{ padding: "16px", borderBottom: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", gap: "12px" }}>
        <input type="text" placeholder="搜尋課名、課程代碼或教授名稱..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.getInput(isDarkMode)} />

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", backgroundColor: theme.filterPanel, padding: "10px", borderRadius: "6px", border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: "0.7rem", fontWeight: "bold", color: theme.textMuted, textTransform: "uppercase", marginBottom: "2px" }}>進階課程條件篩選</div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: theme.textPrimary, cursor: "pointer" }}>
              <input type="checkbox" checked={filterRequired} onChange={(e) => setFilterRequired(e.target.checked)} /> 必修課程
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: theme.textPrimary, cursor: "pointer" }}>
              <input type="checkbox" checked={filterElective} onChange={(e) => setFilterElective(e.target.checked)} /> 選修課程
            </label>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#dc2626", fontWeight: "600", cursor: "pointer", marginTop: "2px", borderTop: `1px dashed ${theme.border}`, paddingTop: "6px" }}>
            <input type="checkbox" checked={excludeConflicts} onChange={(e) => setExcludeConflicts(e.target.checked)} /> 隱藏已衝堂的課程 (排除衝突)
          </label>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", color: theme.textMuted, fontSize: "0.85rem", padding: "20px" }}>
            {selectedDept === "ALL" ? "正在跨院系檢索全校課程數據流..." : "正在動態加載科系課程清單..."}
          </div>
        ) : catalogWithConflictStatus.length === 0 ? (
          <div style={{ textAlign: "center", color: theme.textMuted, fontSize: "0.85rem", padding: "20px" }}>沒有符合當前篩選條件的課程。</div>
        ) : (
          catalogWithConflictStatus.map((course) => {
            const isSelected = selectedCourses.some((c) => c.id === course.id);
            return (
              <div key={course.id} onMouseEnter={() => setHoveredCourse(course)} onMouseLeave={() => setHoveredCourse(null)}
                style={{
                  padding: "12px", borderRadius: "6px",
                  border: `1px solid ${isSelected ? "#10b981" : course.isConflicting ? "#f87171" : theme.border}`,
                  backgroundColor: isSelected ? (isDarkMode ? "#064e3b" : "#f0fdf4") : course.isConflicting ? (isDarkMode ? "#7f1d1d" : "#fef2f2") : theme.slotCell,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "0.75rem", color: theme.textSecondary, fontWeight: "bold" }}>{course.id} | {course.required ? "必修" : "選修"}</span>
                  {course.isConflicting && !isSelected && (<span style={{ fontSize: "0.75rem", color: "#f87171", fontWeight: "bold" }}>時間衝堂</span>)}
                </div>
                <h4 style={{ margin: "4px 0", fontSize: "0.9rem", color: theme.textPrimary }}>{course.name}</h4>
                <p style={{ margin: "2px 0", fontSize: "0.75rem", color: theme.textSecondary }}>🕒 節次：{course.period}</p>
                <button disabled={isSelected || course.isConflicting} onClick={() => handleAddCourse(course)}
                  style={{ marginTop: "8px", width: "100%", padding: "6px", backgroundColor: isSelected ? "#10b981" : course.isConflicting ? (isDarkMode ? "#4b5563" : "#fca5a5") : "#2563eb", color: "#ffffff", border: "none", borderRadius: "4px", cursor: isSelected || course.isConflicting ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: "bold" }}
                >
                  {isSelected ? "已加入課表" : course.isConflicting ? "時段被阻擋" : "加入課表"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};