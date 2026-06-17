import React from 'react';
import { Course, SelectedCourse } from './types';
import { courseGridStyles as styles, determineCourseColor } from './styles/componentStyles';

interface CourseGridProps {
  selectedCourses: SelectedCourse[];
  onRemoveCourse: (id: string) => void;
  hoveredCourse: Course | null;
  isDarkMode: boolean;
}

const DAYS = ['週一', '週二', '週三', '週四', '週五'];
const PERIODS = ['1', '2', '3', '4', 'N', '5', '6', '7', '8', '9', 'A', 'B', 'C'];

export const CourseGrid: React.FC<CourseGridProps> = ({ 
  selectedCourses, onRemoveCourse, hoveredCourse, isDarkMode 
}) => {
  const formatCourseName = (name: string): string => name.length > 16 ? `${name.substring(0, 16)}...` : name;
  const getCourseAtSlot = (day: number, period: string) => selectedCourses.find(c => c.slots.some(s => s.day === day && s.period === period));
  const isHoveredSlot = (day: number, period: string) => hoveredCourse ? hoveredCourse.slots.some(s => s.day === day && s.period === period) : false;

  const getDynamicPreviewColor = (hexColor: string): string => {
    const cleanHex = hexColor.replace('#', '');
    let r = parseInt(cleanHex.substring(0, 2), 16);
    let g = parseInt(cleanHex.substring(2, 4), 16);
    let b = parseInt(cleanHex.substring(4, 6), 16);
    r = Math.floor(r * (isDarkMode ? 0.6 : 0.85));
    g = Math.floor(g * (isDarkMode ? 0.6 : 0.85));
    b = Math.floor(b * (isDarkMode ? 0.6 : 0.85));
    return `rgba(${r}, ${g}, ${b}, ${isDarkMode ? 0.8 : 0.65})`;
  };

  return (
    <div style={styles.getGridContainer(isDarkMode)}>
      <div style={styles.getHeaderCell(isDarkMode)}>節次 / 天</div>
      {DAYS.map((day, idx) => (
        <div key={day} style={{ ...styles.getHeaderCell(isDarkMode), gridColumnStart: idx + 2 }}>{day}</div>
      ))}

      {PERIODS.map((period, pIdx) => {
        const rowStart = pIdx + 2;
        return (
          <React.Fragment key={period}>
            <div style={{ ...styles.getPeriodLabel(isDarkMode), gridRowStart: rowStart, gridColumnStart: 1 }}>{period}</div>
            {[1, 2, 3, 4, 5].map((day, dIdx) => {
              const colStart = dIdx + 2;
              const course = getCourseAtSlot(day, period);

              if (!course) {
                if (isHoveredSlot(day, period) && hoveredCourse) {
                  const sortedSlots = [...hoveredCourse.slots].filter(s => s.day === day).sort((a, b) => PERIODS.indexOf(a.period) - PERIODS.indexOf(b.period));
                  if (sortedSlots[0]?.period !== period) return null;

                  const rowSpan = sortedSlots.length;
                  const isHoveredLab = hoveredCourse.slots.some(s => s.day === day && s.period === period && (s.type === '實習' || s.type === 'Lab'));
                  return (
                    <div key={`preview-${hoveredCourse.id}-${day}`} style={styles.getPreviewCard(getDynamicPreviewColor(determineCourseColor(hoveredCourse)), rowStart, rowSpan, colStart, isDarkMode)}>
                      <div style={styles.courseName}>{formatCourseName(hoveredCourse.name)}{isHoveredLab && <span style={{ fontSize: '10px', display: 'block', opacity: 0.85 }}>(實習預覽)</span>}</div>
                      <div style={styles.courseMeta}>{hoveredCourse.teacher}教授</div>
                      <div style={styles.courseMeta}>👀 課表預覽中</div>
                    </div>
                  );
                }
                return <div key={`${day}-${period}`} style={{ ...styles.getSlot(isDarkMode), gridRowStart: rowStart, gridColumnStart: colStart }} />;
              }

              const sortedDaySlots = [...course.slots].filter(s => s.day === day).sort((a, b) => PERIODS.indexOf(a.period) - PERIODS.indexOf(b.period));
              if (sortedDaySlots[0]?.period !== period) return null;

              const isLab = course.slots.some(s => s.day === day && s.period === period && (s.type === '實習' || s.type === 'Lab'));
              return (
                <div key={`${course.id}-${day}`} style={styles.getCourseCard(course.color, rowStart, sortedDaySlots.length, colStart)}>
                  <div style={styles.courseName}>{formatCourseName(course.name)}{isLab && <span style={{ fontSize: '10px', display: 'block', opacity: 0.85 }}>(實習課)</span>}</div>
                  <div style={styles.courseMeta}>{course.teacher} 教授</div>
                  <div style={styles.courseMeta}>{course.locations[0] || '無安排教室'}</div>
                  <button onClick={() => onRemoveCourse(course.id)} style={styles.deleteButton} title="從課表中移除此課程">&times;</button>
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
};