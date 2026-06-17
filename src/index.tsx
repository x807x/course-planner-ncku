import React, { useState, useMemo, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Course, SelectedCourse, DepartmentOption, checkCourseConflict } from "./types";
import { CourseGrid } from "./CourseGrid";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { Metrics } from "./components/Metrics";
import { appLayoutStyles, getThemeColors, determineCourseColor } from "./styles/componentStyles";

interface SemesterOption { id: string; name: string; }
interface CollegeNode { collegeCode: string; departments: Record<string, string>; }

const STORAGE_KEY = "ncku_selected_courses";
const THEME_KEY = "ncku_planner_theme";

const App: React.FC = () => {
  const [semesterList, setSemesterList] = useState<SemesterOption[]>([]);
  const [collegeTree, setCollegeTree] = useState<CollegeNode[]>([]);
  const [isBootstrapLoading, setIsBootstrapLoading] = useState(true);

  const [semester, setSemester] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  // ⚡ Dark Mode Active Core State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [filterRequired, setFilterRequired] = useState(false);
  const [filterElective, setFilterElective] = useState(false);
  const [excludeConflicts, setExcludeConflicts] = useState(false);

  const [conflictQueue, setConflictQueue] = useState<Course[]>([]);
  const [catalog, setCatalog] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCourse, setHoveredCourse] = useState<Course | null>(null);

  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCourses));
  }, [selectedCourses]);

  // Sync Dark Mode state to local browser registry
  useEffect(() => {
    localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const enhancedCollegeTree = useMemo<CollegeNode[]>(() => {
    if (!collegeTree.length) return [];
    return [{ collegeCode: "GLOBAL_SEARCH", departments: { ALL: "Search All (全校搜尋)" } }, ...collegeTree];
  }, [collegeTree]);

  const currentDeptList = useMemo<DepartmentOption[]>(() => {
    if (!enhancedCollegeTree.length || !selectedCollege) return [];
    const target = enhancedCollegeTree.find((c) => c.collegeCode === selectedCollege);
    if (!target || !target.departments) return [];
    return Object.entries(target.departments).map(([code, name]) => ({ code, name }));
  }, [enhancedCollegeTree, selectedCollege]);

  useEffect(() => {
    if (currentDeptList.length > 0) {
      const isDeptValid = currentDeptList.some((d) => d.code === selectedDept);
      if (!isDeptValid) setSelectedDept(currentDeptList[0].code);
    } else {
      setSelectedDept("");
    }
  }, [currentDeptList, selectedDept]);

  useEffect(() => {
    let isMounted = true;
    setIsBootstrapLoading(true);
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}CourseData/semesterList.json`).then((res) => res.json()),
      fetch(`${import.meta.env.BASE_URL}CourseData/departments.json`).then((res) => res.json()),
    ])
      .then(([semestersData, departmentsData]: [SemesterOption[], CollegeNode[]]) => {
        if (!isMounted) return;
        setSemesterList(semestersData);
        setCollegeTree(departmentsData);
        
        if (semestersData.length > 0) {
          setSemester(semestersData[0].id);
        }

        if (departmentsData.length > 0) {
          const firstCollege = departmentsData[0];
          setSelectedCollege(firstCollege.collegeCode);
          const deptCodes = Object.keys(firstCollege.departments || {});
          setSelectedDept(deptCodes.length > 0 ? deptCodes[0] : "");
        }

        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsedCourses: SelectedCourse[] = JSON.parse(saved);
            if (parsedCourses.length > 0) {
              const courseSemesters = parsedCourses
                .map((c: any) => c.semester)
                .filter((sem): sem is string => typeof sem === "string" && sem.trim() !== "");
              const uniqueSemesters = Array.from(new Set(courseSemesters));

              if (uniqueSemesters.length > 1) {
                localStorage.removeItem(STORAGE_KEY);
                setSelectedCourses([]);
              } else if (uniqueSemesters.length === 1) {
                const detectedSemester = uniqueSemesters[0];
                if (semestersData.some((s) => s.id === detectedSemester)) {
                  setSemester(detectedSemester);
                  setSelectedCourses(parsedCourses);
                } else {
                  localStorage.removeItem(STORAGE_KEY);
                  setSelectedCourses([]);
                }
              }
            }
          }
        } catch (err) {
          localStorage.removeItem(STORAGE_KEY);
          setSelectedCourses([]);
        }
        setIsBootstrapLoading(false);
      })
      .catch(() => { if (isMounted) setIsBootstrapLoading(false); });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!semester || !selectedDept) return;
    let isMounted = true;
    setIsLoading(true);

    if (selectedDept === "ALL") {
      const allDeptCodes = collegeTree.flatMap(college => Object.keys(college.departments || {}));
      const fetchPromises = allDeptCodes.map(deptCode =>
        fetch(`${import.meta.env.BASE_URL}CourseData/${semester}/${deptCode}.json`)
          .then(res => res.ok ? res.json() : [])
          .catch(() => [])
      );

      Promise.all(fetchPromises).then((results: Course[][]) => {
          if (!isMounted) return;
          const flattened = results.flat();
          const seenIds = new Set<string>();
          const uniqueCourses = flattened.filter(course => {
            if (seenIds.has(course.id)) return false;
            seenIds.add(course.id);
            return true;
          });
          setCatalog(uniqueCourses);
          setIsLoading(false);
        }).catch(() => { if (isMounted) setIsLoading(false); });
    } else {
      fetch(`${import.meta.env.BASE_URL}CourseData/${semester}/${selectedDept}.json`)
        .then((res) => res.ok ? res.json() : [])
        .then((data) => {
          if (!isMounted) return;
          setCatalog(data);
          setIsLoading(false);
        }).catch(() => { if (isMounted) setIsLoading(false); });
    }
    return () => { isMounted = false; };
  }, [semester, selectedDept, collegeTree]);

  const filteredCatalog = useMemo(() => {
    let processed = catalog.filter((c) => !c.name.includes("科目序號") && !c.name.includes("選項"));
    if (selectedYear !== "") processed = processed.filter((c) => String(c.grade) === selectedYear);
    const query = searchQuery.trim().toLowerCase();
    if (!query) return processed;
    return processed.filter((c) => c.name.toLowerCase().includes(query) || c.teacher.toLowerCase().includes(query) || c.id.toLowerCase().includes(query));
  }, [catalog, searchQuery, selectedYear]);

  const totalCredits = useMemo(() => selectedCourses.reduce((sum, c) => sum + c.credits, 0), [selectedCourses]);

  const catalogWithConflictStatus = useMemo(() => {
    const mapped = filteredCatalog.map((course) => {
      if (selectedCourses.some((sc) => sc.id === course.id)) {
        return { ...course, isConflicting: false, conflictingSlots: [] };
      }
      const audit = checkCourseConflict(course, selectedCourses.map((sc) => sc as Course));
      return { ...course, isConflicting: audit.isConflict, conflictingSlots: audit.conflictingSlots };
    });

    return mapped.filter((course) => {
      if (filterRequired && !filterElective && !course.required) return false;
      if (filterElective && !filterRequired && course.required) return false;
      if (excludeConflicts && course.isConflicting) return false;
      return true;
    });
  }, [filteredCatalog, selectedCourses, filterRequired, filterElective, excludeConflicts]);

  const handleAddCourse = (course: Course) => {
    if (selectedCourses.some((c) => c.id === course.id)) return;
    const audit = checkCourseConflict(course, selectedCourses.map((sc) => sc as Course));
    if (audit.isConflict) {
      setConflictQueue((prev) => prev.some((p) => p.id === course.id) ? prev : [...prev, course]);
      return;
    }
    setSelectedCourses([...selectedCourses, { ...course, color: determineCourseColor(course, selectedDept) }]);
  };

  const handleForceReplaceCourse = (newCourse: Course) => {
    if (selectedCourses.some((c) => c.id === newCourse.id)) return;
    const filteredSchedule = selectedCourses.filter((ec) => !checkCourseConflict(newCourse, [ec as Course]).isConflict);
    setSelectedCourses([...filteredSchedule, { ...newCourse, color: determineCourseColor(newCourse, selectedDept) }]);
  };

  const handleAddAllRequired = () => {
    if (!filteredCatalog.length) return;
    const targetGradeCourses = filteredCatalog.filter((c) => (selectedYear === "" ? true : String(c.grade) === String(selectedYear)) && c.required && !selectedCourses.some((sc) => sc.id === c.id));
    const standardInserts: SelectedCourse[] = [];
    const internalConflicts: Course[] = [];
    let cumulativeSchedule = [...selectedCourses].map((c) => c as Course);

    targetGradeCourses.forEach((course) => {
      if (checkCourseConflict(course, cumulativeSchedule).isConflict) {
        internalConflicts.push(course);
      } else {
        standardInserts.push({ ...course, color: determineCourseColor(course, selectedDept) });
        cumulativeSchedule.push(course);
      }
    });

    if (standardInserts.length > 0) setSelectedCourses((prev) => [...prev, ...standardInserts]);
    if (internalConflicts.length > 0) setConflictQueue((prev) => [...prev, ...internalConflicts.filter((item) => !prev.some((p) => p.id === item.id))]);
  };

  return (
    <div style={appLayoutStyles.getContainer(isDarkMode)}>
      <TopNav
        semester={semester}
        onSemesterChange={(next) => {
          if (selectedCourses.length > 0 && !window.confirm("Warning: Switching semesters will discard your current schedule. Proceed?")) return;
          setSelectedCourses([]); setConflictQueue([]); setSemester(next);
        }}
        semesterList={semesterList}
        isBootstrapLoading={isBootstrapLoading}
        onExportSchedule={() => {
          if (selectedCourses.length === 0) return alert("Schedule is empty!");
          const link = document.createElement("a");
          link.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedCourses, null, 2)));
          link.setAttribute("download", `ncku-schedule-${semester || "current"}.json`); link.click();
        }}
        onImportSchedule={(e) => {
          const file = e.target.files?.[0]; if (!file) return;
          const r = new FileReader(); r.onload = (ev) => { try { setSelectedCourses(JSON.parse(ev.target?.result as string)); } catch {} };
          r.readAsText(file); e.target.value = "";
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      <div style={appLayoutStyles.workspaceContainer}>
        <Sidebar
          collegeTree={enhancedCollegeTree} selectedCollege={selectedCollege} setSelectedCollege={setSelectedCollege}
          currentDeptList={currentDeptList} selectedDept={selectedDept} setSelectedDept={setSelectedDept}
          selectedYear={selectedYear} setSelectedYear={setSelectedYear}
          isEligibleForBatchImport={!!selectedDept && selectedDept !== "ALL" && !["A", "W", "M"].includes(selectedDept[0].toUpperCase())}
          onBatchImportRequired={handleAddAllRequired} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          filterRequired={filterRequired} setFilterRequired={setFilterRequired} filterElective={filterElective} setFilterElective={setFilterElective}
          excludeConflicts={excludeConflicts} setExcludeConflicts={setExcludeConflicts}
          catalogWithConflictStatus={catalogWithConflictStatus} selectedCourses={selectedCourses}
          handleAddCourse={handleAddCourse} setHoveredCourse={setHoveredCourse} isLoading={isLoading}
          isDarkMode={isDarkMode}
        />
        <main style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: getThemeColors(isDarkMode).bgWorkspace, transition: 'background-color 0.2s' }}>
          <CourseGrid selectedCourses={selectedCourses} onRemoveCourse={(id) => setSelectedCourses(selectedCourses.filter((c) => c.id !== id))} hoveredCourse={hoveredCourse} isDarkMode={isDarkMode} />
        </main>
        <Metrics totalCredits={totalCredits} selectedCourses={selectedCourses} conflictQueue={conflictQueue} onResolveConflict={(id, act) => { if (act === "REPLACE") { const item = conflictQueue.find((c) => c.id === id); if (item) handleForceReplaceCourse(item); } setConflictQueue((prev) => prev.filter((c) => c.id !== id)); }} isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

const container = document.getElementById("root");
if (container) createRoot(container).render(<App />);