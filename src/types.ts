export interface TimeSlot {
  day: number;
  period: string;
  type: string; // e.g., "講義" (Lecture) or "實習" (Lab / Quiz)
}

export interface Course {
  id: string;         // Unique NCKU Course Code (e.g., "C1-004")
  code: string;       // Secondary Serial Code (e.g., "C111400")
  name: string;       // Normalized Name (e.g., "Calculus (I)")
  grade: number;      // Target Academic Year / Grade level (1, 2, 3, 4)
  credits: number;
  required: boolean;  // true for "必修", false for "選修"
  department: string; // Department acronym / code
  teacher: string;    // Instructor name
  enrollment: string; // Registered / Capacity ratio
  period: string;     // Raw string from NCKU database
  locations: string[];
  slots: TimeSlot[];  // Multi-period timeline slots mapping both Lecture & Lab
}

export interface SelectedCourse extends Course {
  color: string;
}

// Added to resolve the missing dependency in Sidebar and Main Controller
export interface DepartmentOption {
  code: string;
  name: string;
}

export interface ConflictResult {
  isConflict: boolean;
  conflictingSlots: TimeSlot[];
}

export function checkCourseConflict(newCourse: Course, currentCourses: Course[]): ConflictResult {
  const conflictingSlots: TimeSlot[] = [];
  
  for (const existingCourse of currentCourses) {
    for (const newSlot of newCourse.slots) {
      for (const existingSlot of existingCourse.slots) {
        if (newSlot.day === existingSlot.day && newSlot.period === existingSlot.period) {
          conflictingSlots.push(newSlot);
        }
      }
    }
  }
  
  return {
    isConflict: conflictingSlots.length > 0,
    conflictingSlots,
  };
}