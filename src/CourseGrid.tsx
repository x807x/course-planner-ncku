import React from 'react';
import { Course, SelectedCourse } from './types';
import { courseGridStyles as styles, determineCourseColor } from './styles/componentStyles';

interface CourseGridProps {
  selectedCourses: SelectedCourse[];
  onRemoveCourse: (id: string) => void;
  hoveredCourse: Course | null;
}

// 星期改用精簡中文呈現
const DAYS = ['週一', '週二', '週三', '週四', '週五'];
const PERIODS = ['1', '2', '3', '4', 'N', '5', '6', '7', '8', '9', 'A', 'B', 'C'];

export const CourseGrid: React.FC<CourseGridProps> = ({ 
  selectedCourses, 
  onRemoveCourse,
  hoveredCourse 
}) => {
  
  // Helper: Format name to prevent long titles from breaking the grid card layout (Max 16 chars)
  const formatCourseName = (name: string): string => {
    return name.length > 16 ? `${name.substring(0, 16)}...` : name;
  };

  // Helper: Find an already selected course at a specific day and period
  const getCourseAtSlot = (day: number, period: string) => {
    return selectedCourses.find(course =>
      course.slots.some(slot => slot.day === day && slot.period === period)
    );
  };

  // Helper: Verify if the hovered course occupies a specific day and period
  const isHoveredSlot = (day: number, period: string) => {
    if (!hoveredCourse) return false;
    return hoveredCourse.slots.some(slot => slot.day === day && slot.period === period);
  };

  // Helper: Convert HEX color into high-fidelity dim/translucent RGBA for preview masks
  const getDynamicPreviewColor = (hexColor: string): string => {
    const cleanHex = hexColor.replace('#', '');
    let r = parseInt(cleanHex.substring(0, 2), 16);
    let g = parseInt(cleanHex.substring(2, 4), 16);
    let b = parseInt(cleanHex.substring(4, 6), 16);
    
    // Dim basic luminosity by 15% to safeguard light-text contrast metrics
    r = Math.floor(r * 0.85);
    g = Math.floor(g * 0.85);
    b = Math.floor(b * 0.85);
    
    return `rgba(${r}, ${g}, ${b}, 0.65)`;
  };

  return (
    <div style={styles.gridContainer}>
      <div style={styles.headerCell}>節次 / 天</div>
      {DAYS.map((day, idx) => (
        <div key={day} style={{ ...styles.headerCell, gridColumnStart: idx + 2 }}>
          {day}
        </div>
      ))}

      {PERIODS.map((period, pIdx) => {
        const rowStart = pIdx + 2;
        return (
          <React.Fragment key={period}>
            {/* Time Period Left Label */}
            <div style={{ ...styles.periodLabel, gridRowStart: rowStart, gridColumnStart: 1 }}>
              {period}
            </div>
            
            {[1, 2, 3, 4, 5].map((day, dIdx) => {
              const colStart = dIdx + 2;
              const course = getCourseAtSlot(day, period);

              // CASE 1: No active course selected in this slot
              if (!course) {
                const isHovered = isHoveredSlot(day, period);
                
                if (isHovered && hoveredCourse) {
                  // Guard: Only render preview block at the first sequential slot occurrence for the hovered day
                  const sortedHoveredDaySlots = [...hoveredCourse.slots]
                    .filter(s => s.day === day)
                    .sort((a, b) => PERIODS.indexOf(a.period) - PERIODS.indexOf(b.period));

                  if (sortedHoveredDaySlots[0]?.period !== period) return null;

                  const rowSpan = sortedHoveredDaySlots.length;
                  const currentHoveredSlot = hoveredCourse.slots.find(s => s.day === day && s.period === period);
                  const isHoveredLab = currentHoveredSlot?.type === '實習' || currentHoveredSlot?.type === 'Lab';
                  
                  const baseColor = determineCourseColor(hoveredCourse);
                  const previewColor = getDynamicPreviewColor(baseColor);

                  return (
                    <div
                      key={`preview-${hoveredCourse.id}-${day}`}
                      style={styles.getPreviewCard(previewColor, rowStart, rowSpan, colStart)}
                    >
                      <div style={styles.courseName}>
                        {formatCourseName(hoveredCourse.name)}
                        {isHoveredLab && <span style={{ fontSize: '10px', display: 'block', opacity: 0.85 }}>(實習預覽)</span>}
                      </div>
                      <div style={styles.courseMeta}>{hoveredCourse.teacher}教授</div>
                      <div style={styles.courseMeta}>👀 課表預覽中</div>
                    </div>
                  );
                }

                // Standard clean white slot cell
                return (
                  <div
                    key={`${day}-${period}`}
                    style={{ ...styles.slot, gridRowStart: rowStart, gridColumnStart: colStart }}
                  />
                );
              }

              // CASE 2: Active course exists in this slot
              const currentSlot = course.slots.find(s => s.day === day && s.period === period);
              const sortedDaySlots = [...course.slots]
                .filter(s => s.day === day)
                .sort((a, b) => PERIODS.indexOf(a.period) - PERIODS.indexOf(b.period));

              if (sortedDaySlots[0]?.period !== period) return null;

              const rowSpan = sortedDaySlots.length;
              const isLab = currentSlot?.type === '實習' || currentSlot?.type === 'Lab';

              return (
                <div
                  key={`${course.id}-${day}`}
                  style={styles.getCourseCard(course.color, rowStart, rowSpan, colStart)}
                >
                  <div style={styles.courseName}>
                    {formatCourseName(course.name)}
                    {isLab && <span style={{ fontSize: '10px', display: 'block', opacity: 0.85 }}>(實習課)</span>}
                  </div>
                  <div style={styles.courseMeta}>{course.teacher} 教授</div>
                  <div style={styles.courseMeta}>{course.locations[0] || '無安排教室'}</div>
                  <button 
                    onClick={() => onRemoveCourse(course.id)} 
                    style={styles.deleteButton}
                    title="從課表中移除此課程"
                  >
                    &times;
                  </button>
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};