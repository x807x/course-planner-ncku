import React, { useRef } from "react";
import { getThemeColors } from "../styles/componentStyles";

interface TopNavProps {
  semester: string;
  onSemesterChange: (value: string) => void;
  semesterList: { id: string; name: string }[];
  isBootstrapLoading: boolean;
  onExportSchedule: () => void;
  onImportSchedule: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  semester,
  onSemesterChange,
  semesterList,
  isBootstrapLoading,
  onExportSchedule,
  onImportSchedule,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = getThemeColors(isDarkMode);

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        height: "60px",
        backgroundColor: theme.bgPanel,
        borderBottom: `1px solid ${theme.border}`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        zIndex: 10,
        transition: "background-color 0.2s, border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: "bold",
            color: theme.textPrimary,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🗓️ 成大自動排課助手
        </h1>
        {isBootstrapLoading ? (
          <span style={{ fontSize: "0.85rem", color: theme.textSecondary }}>
            正在同步學期時間軸數據...
          </span>
        ) : (
          <select
            value={semester}
            onChange={(e) => onSemesterChange(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              border: `1px solid ${theme.border}`,
              fontSize: "0.85rem",
              backgroundColor: theme.slotCell,
              color: theme.textPrimary,
              fontWeight: "medium",
            }}
          >
            {semesterList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {/* 🌙 Theme Switcher Toggle Button */}
        <button
          onClick={onToggleDarkMode}
          style={{
            padding: "8px",
            backgroundColor: isDarkMode ? "#4b5563" : "#f3f4f6",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "1.1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            transition: "background-color 0.2s",
            marginRight: "8px"
          }}
          title={isDarkMode ? "切換為淺色模式" : "切換為深色模式"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={onImportSchedule}
          style={{ display: "none" }}
          accept=".json"
        />

        <button
          onClick={onExportSchedule}
          style={{
            padding: "8px 16px",
            backgroundColor: "#10b981",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.8rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          📤 匯出課表
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6b7280",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.8rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          📥 匯入課表
        </button>
      </div>
    </header>
  );
};