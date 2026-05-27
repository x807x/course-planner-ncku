import React from "react";
import { Course, DepartmentOption } from "../types";

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

  // ⚡ Filter status reactivity
  filterRequired: boolean;
  setFilterRequired: (val: boolean) => void;
  filterElective: boolean;
  setFilterElective: (val: boolean) => void;
  excludeConflicts: boolean;
  setExcludeConflicts: (val: boolean) => void;

  catalogWithConflictStatus: (Course & {
    isConflicting: boolean;
    conflictingSlots: any[];
  })[];
  selectedCourses: any[];
  handleAddCourse: (course: Course) => void;
  setHoveredCourse: (course: Course | null) => void;
  isLoading: boolean;
}

const YEARS = [
  { id: "", name: "全部年級 (不分年級)" },
  { id: "1", name: "一年級 ( 大一 )" },
  { id: "2", name: "二年級 ( 大二 )" },
  { id: "3", name: "三年級 ( 大三 )" },
  { id: "4", name: "四年級 ( 大四 )" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collegeTree,
  selectedCollege,
  setSelectedCollege,
  currentDeptList,
  selectedDept,
  setSelectedDept,
  selectedYear,
  setSelectedYear,
  isEligibleForBatchImport,
  onBatchImportRequired,
  searchQuery,
  setSearchQuery,

  // Destructure filter status callbacks
  filterRequired,
  setFilterRequired,
  filterElective,
  setFilterElective,
  excludeConflicts,
  setExcludeConflicts,

  catalogWithConflictStatus,
  selectedCourses,
  handleAddCourse,
  setHoveredCourse,
  isLoading,
}) => {
  return (
    <aside
      style={{
        width: "340px",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Cascading Dropdown Selector Shards */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* College Selector */}
        <div>
          <label
            style={{
              fontSize: "0.75rem",
              fontWeight: "bold",
              color: "#6b7280",
              textTransform: "uppercase",
            }}
          >
            目標學院
          </label>
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              marginTop: "4px",
            }}
          >
            {collegeTree.map((c) => (
              <option key={c.collegeCode} value={c.collegeCode}>
                {c.collegeCode}
              </option>
            ))}
          </select>
        </div>

        {/* Department Selector */}
        <div>
          <label
            style={{
              fontSize: "0.75rem",
              fontWeight: "bold",
              color: "#6b7280",
              textTransform: "uppercase",
            }}
          >
            開課系所
          </label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              marginTop: "4px",
            }}
          >
            {currentDeptList.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Year Input Selection */}
        <div>
          <label
            style={{
              fontSize: "0.75rem",
              fontWeight: "bold",
              color: "#6b7280",
              textTransform: "uppercase",
            }}
          >
            指定修課年級
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              marginTop: "4px",
            }}
          >
            {YEARS.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </div>

        {/* Batch Automation Injection Trigger Button */}
        {isEligibleForBatchImport && (
          <button
            onClick={onBatchImportRequired}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "6px",
              boxShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#2563eb")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#3b82f6")
            }
          >
            ⚡ 一鍵匯入當前年級必修課
          </button>
        )}
      </div>

      {/* Text Filters and Checkbox Control Hub Panel */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <input
          type="text"
          placeholder="搜尋課名、課程代碼或教授名稱..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            boxSizing: "border-box",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
          }}
        />

        {/* Checkbox Filter Hub Panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            background: "#f9fafb",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #f3f4f6",
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: "bold",
              color: "#9ca3af",
              textTransform: "uppercase",
              marginBottom: "2px",
            }}
          >
            進階課程條件篩選
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.8rem",
                color: "#374151",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={filterRequired}
                onChange={(e) => setFilterRequired(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              必修課程
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.8rem",
                color: "#374151",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={filterElective}
                onChange={(e) => setFilterElective(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              選修課程
            </label>
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8rem",
              color: "#dc2626",
              fontWeight: "600",
              cursor: "pointer",
              userSelect: "none",
              marginTop: "2px",
              borderTop: "1px dashed #e5e7eb",
              paddingTop: "6px",
            }}
          >
            <input
              type="checkbox"
              checked={excludeConflicts}
              onChange={(e) => setExcludeConflicts(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            隱藏已衝堂的課程 (排除衝突)
          </label>
        </div>
      </div>

      {/* Catalog Registry Display Stream */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {isLoading ? (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "0.85rem",
              padding: "20px",
            }}
          >
            {selectedDept === "ALL"
              ? "正在跨院系檢索全校課程數據流..."
              : "正在動態加載科系課程清單..."}
          </div>
        ) : catalogWithConflictStatus.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "0.85rem",
              padding: "20px",
            }}
          >
            沒有符合當前篩選條件的課程。
          </div>
        ) : (
          catalogWithConflictStatus.map((course) => {
            const isSelected = selectedCourses.some((c) => c.id === course.id);
            return (
              <div
                key={course.id}
                onMouseEnter={() => setHoveredCourse(course)}
                onMouseLeave={() => setHoveredCourse(null)}
                style={{
                  padding: "12px",
                  borderRadius: "6px",
                  border: `1px solid ${
                    isSelected
                      ? "#10b981"
                      : course.isConflicting
                      ? "#f87171"
                      : "#e5e7eb"
                  }`,
                  backgroundColor: isSelected
                    ? "#f0fdf4"
                    : course.isConflicting
                    ? "#fef2f2"
                    : "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      fontWeight: "bold",
                    }}
                  >
                    {course.id} | {course.required ? "必修" : "選修"}
                  </span>
                  {course.isConflicting && !isSelected && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#dc2626",
                        fontWeight: "bold",
                      }}
                    >
                      時間衝堂
                    </span>
                  )}
                </div>
                <h4
                  style={{
                    margin: "4px 0",
                    fontSize: "0.9rem",
                    color: "#1f2937",
                  }}
                >
                  {course.name}
                </h4>
                <p
                  style={{
                    margin: "2px 0",
                    fontSize: "0.75rem",
                    color: "#4b5563",
                  }}
                >
                  🕒 節次：{course.period}
                </p>

                <button
                  disabled={isSelected || course.isConflicting}
                  onClick={() => handleAddCourse(course)}
                  style={{
                    marginTop: "8px",
                    width: "100%",
                    padding: "6px",
                    backgroundColor: isSelected
                      ? "#10b981"
                      : course.isConflicting
                      ? "#fca5a5"
                      : "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                      isSelected || course.isConflicting
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                  }}
                >
                  {isSelected
                    ? "已加入課表"
                    : course.isConflicting
                    ? "時段被阻擋"
                    : "加入課表"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};