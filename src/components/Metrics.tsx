import React from 'react';
import { Course } from '../types';

interface MetricsProps {
  totalCredits: number;
  selectedCourses: any[];
  conflictQueue: Course[];
  onResolveConflict: (id: string, action: 'REPLACE' | 'DISCARD') => void;
}

export const Metrics: React.FC<MetricsProps> = ({
  totalCredits,
  selectedCourses,
  conflictQueue,
  onResolveConflict,
}) => {
  return (
    <section style={{ width: '300px', backgroundColor: '#ffffff', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Upper Panel: Academic Status */}
      <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          課表統計數據
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>當前總學分：</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: totalCredits > 30 ? '#dc2626' : '#2563eb' }}>
            {totalCredits} 分
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>已選課程數：</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1f2937' }}>
            已分配 {selectedCourses.length} 門課
          </span>
        </div>
      </div>

      {/* Lower Panel: Conflict Resolution Hub (Inspection Center) */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            衝突審查中心
          </h3>
          {conflictQueue.length > 0 && (
            <span style={{ backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '9999px', border: '1px solid #fca5a5' }}>
              {conflictQueue.length} 筆待決策
            </span>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {conflictQueue.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🛡️</div>
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '500' }}>未偵測到任何時間衝突</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#d1d5db' }}>您的排課畫布非常乾淨安全。</p>
            </div>
          ) : (
            conflictQueue.map((course) => (
              <div
                key={course.id}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fca5a5',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#991b1b', fontWeight: 'bold' }}>
                    <span>{course.id}</span>
                    <span>{course.required ? '必修' : '選修'}</span>
                  </div>
                  <h4 style={{ margin: '4px 0 2px 0', fontSize: '0.85rem', color: '#7f1d1d', fontWeight: '600' }}>
                    {course.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#991b1b' }}>
                    🕒 衝突時段：{course.period}
                  </p>
                </div>

                {/* Interactive Decision Control Grid */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <button
                    onClick={() => onResolveConflict(course.id, 'REPLACE')}
                    style={{
                      flex: 1,
                      padding: '6px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                  >
                    強行取代 🔄
                  </button>
                  <button
                    onClick={() => onResolveConflict(course.id, 'DISCARD')}
                    style={{
                      flex: 1,
                      padding: '6px',
                      backgroundColor: '#e5e7eb',
                      color: '#4b5563',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#d1d5db')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                  >
                    放棄加入 ❌
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};