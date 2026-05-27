import React, { useRef } from "react";

interface TopNavProps {
  semester: string;
  onSemesterChange: (value: string) => void;
  semesterList: { id: string; name: string }[];
  isBootstrapLoading: boolean;
  onExportSchedule: () => void;
  onImportSchedule: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  semester,
  onSemesterChange,
  semesterList,
  isBootstrapLoading,
  onExportSchedule,
  onImportSchedule,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        height: "60px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: "bold",
            color: "#111827",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🗓️ 成大自動排課助手
        </h1>
        {isBootstrapLoading ? (
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            正在同步學期時間軸數據...
          </span>
        ) : (
          <select
            value={semester}
            onChange={(e) => onSemesterChange(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              fontSize: "0.85rem",
              backgroundColor: "#fff",
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

      <div style={{ display: "flex", gap: "8px" }}>
        {/* 📥 Hidden file anchor for prettier programmatic click trigger */}
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
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#059669")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#10b981")}
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
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#4b5563")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6b7280")}
        >
          📥 匯入課表
        </button>
      </div>
    </header>
  );
};