import React, { useState, useMemo, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  Course,
  SelectedCourse,
  DepartmentOption,
  checkCourseConflict,
} from "./types";
import { CourseGrid } from "./CourseGrid";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import { Metrics } from "./components/Metrics";
import { appLayoutStyles, determineCourseColor } from "./styles/componentStyles";

interface SemesterOption {
  id: string;
  name: string;
}

interface CollegeNode {
  collegeCode: string;
  departments: Record<string, string>;
}

const STORAGE_KEY = "ncku_selected_courses";

const App: React.FC = () => {
  const [semesterList, setSemesterList] = useState<SemesterOption[]>([]);
  const [collegeTree, setCollegeTree] = useState<CollegeNode[]>([]);
  const [isBootstrapLoading, setIsBootstrapLoading] = useState(true);

  const [semester, setSemester] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  // ⚡ Filter states for required, elective, and conflict visibility
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
      console.error("Failed to parse persisted schedule data:", err);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCourses));
  }, [selectedCourses]);

  // Inject "Search All" dynamic virtual college tree catalog node
  const enhancedCollegeTree = useMemo<CollegeNode[]>(() => {
    if (!collegeTree.length) return [];
    return [
      {
        collegeCode: "GLOBAL_SEARCH",
        departments: { ALL: "Search All (全校搜尋)" }
      },
      ...collegeTree
    ];
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
        
        // 1. 設定預設學期
        let currentDefaultSemester = "";
        if (semestersData.length > 0) {
          currentDefaultSemester = semestersData[0].id;
          setSemester(currentDefaultSemester);
        }

        // 2. 修正：不再預設為 GLOBAL_SEARCH，改為自動選取第一個真實的學院與科系
        if (departmentsData.length > 0) {
          const firstCollege = departmentsData[0];
          setSelectedCollege(firstCollege.collegeCode);
          
          const deptCodes = Object.keys(firstCollege.departments || {});
          if (deptCodes.length > 0) {
            setSelectedDept(deptCodes[0]);
          } else {
            setSelectedDept("");
          }
        } else {
          setSelectedCollege("");
          setSelectedDept("");
        }

        // ⚡ 3. 核心變更：載入並嚴格審查瀏覽器暫存課表
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsedCourses: SelectedCourse[] = JSON.parse(saved);
            
            if (parsedCourses.length > 0) {
              // 取得暫存資料中所有課程的學期（防禦性防範有些課程沒帶學期欄位）
              // 備註：假設型別 Course 中包含 semester 欄位（例如 "0114-1"）
              const courseSemesters = parsedCourses
                .map((c: any) => c.semester)
                .filter((sem): sem is string => typeof sem === "string" && sem.trim() !== "");

              // 檢查是否有「多重學期混合」的異常髒資料
              const uniqueSemesters = Array.from(new Set(courseSemesters));

              if (uniqueSemesters.length > 1) {
                // 狀況 A：暫存課表內包含多個不同學期的課程，視為錯誤，直接清空
                console.warn("Validation Failed: Persisted schedule contains multiple semesters. Clearing storage.");
                localStorage.removeItem(STORAGE_KEY);
                setSelectedCourses([]);
              } else if (uniqueSemesters.length === 1) {
                const detectedSemester = uniqueSemesters[0];
                
                // 檢查偵測到的學期是否存在於合法的學期清單（semesterList）中
                const isSemesterValid = semestersData.some((s) => s.id === detectedSemester);

                if (isSemesterValid) {
                  // 狀況 B：學期合法且一致，自動將系統學期切換為該課程的學期
                  setSemester(detectedSemester);
                  setSelectedCourses(parsedCourses);
                  console.log(`Successfully restored schedule and synced semester to: ${detectedSemester}`);
                } else {
                  // 狀況 C：課程帶有學期，但該學期不在系統開課清單內，直接清空
                  console.warn(`Validation Failed: Semester '${detectedSemester}' is invalid. Clearing storage.`);
                  localStorage.removeItem(STORAGE_KEY);
                  setSelectedCourses([]);
                }
              } else {
                // 狀況 D：暫存有資料，但所有課程皆無法辨識學期資訊，採用預設學期或安全清空
                // 為了絕對安全，若無法校準年份，直接清空
                console.warn("Validation Failed: Cannot determine semester from persisted courses. Clearing storage.");
                localStorage.removeItem(STORAGE_KEY);
                setSelectedCourses([]);
              }
            } else {
              setSelectedCourses([]);
            }
          }
        } catch (err) {
          console.error("Failed to parse and validate persisted schedule data:", err);
          localStorage.removeItem(STORAGE_KEY);
          setSelectedCourses([]);
        }

        setIsBootstrapLoading(false);
      })
      .catch((err) => {
        console.error("System Bootstrap Failure:", err);
        if (isMounted) setIsBootstrapLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Optimized parallel fetch pipeline infrastructure supporting global cross-department catalog indexing
  useEffect(() => {
    if (!semester || !selectedDept) return;
    let isMounted = true;
    setIsLoading(true);

    if (selectedDept === "ALL") {
      // Fetch data streams across all valid departments concurrently
      const allDeptCodes = collegeTree.flatMap(college => 
        Object.keys(college.departments || {})
      );

      const fetchPromises = allDeptCodes.map(deptCode =>
        fetch(`${import.meta.env.BASE_URL}CourseData/${semester}/${deptCode}.json`)
          .then(res => res.ok && res.headers.get("content-type")?.includes("application/json") ? res.json() : [])
          .catch(() => [])
      );

      Promise.all(fetchPromises)
        .then((results: Course[][]) => {
          if (!isMounted) return;
          // Flatten registries and deduplicate target entities by unique course code identifier
          const flattened = results.flat();
          const seenIds = new Set<string>();
          const uniqueCourses = flattened.filter(course => {
            if (seenIds.has(course.id)) return false;
            seenIds.add(course.id);
            return true;
          });
          setCatalog(uniqueCourses);
          setIsLoading(false);
        })
        .catch(() => {
          if (isMounted) {
            setCatalog([]);
            setIsLoading(false);
          }
        });
    } else {
      // Standard local department routing slice path fetch mechanism
      fetch(`${import.meta.env.BASE_URL}CourseData/${semester}/${selectedDept}.json`)
        .then((res) => {
          const contentType = res.headers.get("content-type");
          if (!res.ok || !contentType || !contentType.includes("application/json")) {
            return "EMPTY_CATALOG";
          }
          return res.json();
        })
        .then((data) => {
          if (!isMounted) return;
          setCatalog(data === "EMPTY_CATALOG" ? [] : data);
          setIsLoading(false);
        })
        .catch(() => {
          if (isMounted) {
            setCatalog([]);
            setIsLoading(false);
          }
        });
    }

    return () => { isMounted = false; };
  }, [semester, selectedDept, collegeTree]);

  // Phase 1: Structural and textual filters
  const filteredCatalog = useMemo(() => {
    let processed = catalog.filter((c) => !c.name.includes("科目序號") && !c.name.includes("選項"));
    if (selectedYear !== "") {
      processed = processed.filter((c) => String(c.grade) === selectedYear);
    }
    const query = searchQuery.trim().toLowerCase();
    if (!query) return processed;
    return processed.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.teacher.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query)
    );
  }, [catalog, searchQuery, selectedYear]);

  const totalCredits = useMemo(() => {
    return selectedCourses.reduce((sum, course) => sum + course.credits, 0);
  }, [selectedCourses]);

  // Phase 2: Compute real-time conflict status AND execute checkbox toggle filter pipelines
  const catalogWithConflictStatus = useMemo(() => {
    // 1. Map fundamental status first
    const mapped = filteredCatalog.map((course) => {
      const isAlreadySelected = selectedCourses.some((sc) => sc.id === course.id);
      if (isAlreadySelected) {
        return { ...course, isConflicting: false, conflictingSlots: [] };
      }
      const activeScheduleCourses = selectedCourses.map((sc) => sc as Course);
      const audit = checkCourseConflict(course, activeScheduleCourses);
      return {
        ...course,
        isConflicting: audit.isConflict,
        conflictingSlots: audit.conflictingSlots,
      };
    });

    // 2. Perform conditional filtering based on specific toggle filters
    return mapped.filter((course) => {
      // Required vs Elective multi-select filter logic
      if (filterRequired && !filterElective && !course.required) return false;
      if (filterElective && !filterRequired && course.required) return false;
      
      // Exclude conflict tracks
      if (excludeConflicts && course.isConflicting) return false;

      return true;
    });
  }, [filteredCatalog, selectedCourses, filterRequired, filterElective, excludeConflicts]);

  const handleAddCourse = (course: Course) => {
    if (selectedCourses.some((c) => c.id === course.id)) return;
    const activeScheduleCourses = selectedCourses.map((sc) => sc as Course);
    const audit = checkCourseConflict(course, activeScheduleCourses);

    if (audit.isConflict) {
      setConflictQueue((prev) => {
        if (prev.some((p) => p.id === course.id)) return prev;
        return [...prev, course];
      });
      return;
    }

    const designatedColor = determineCourseColor(course, selectedDept);
    setSelectedCourses([...selectedCourses, { ...course, color: designatedColor }]);
  };

  const handleForceReplaceCourse = (newCourse: Course) => {
    if (selectedCourses.some((c) => c.id === newCourse.id)) return;
    const filteredSchedule = selectedCourses.filter((existingCourse) => {
      const evaluation = checkCourseConflict(newCourse, [existingCourse as Course]);
      return !evaluation.isConflict;
    });

    const designatedColor = determineCourseColor(newCourse, selectedDept);
    setSelectedCourses([...filteredSchedule, { ...newCourse, color: designatedColor }]);
  };

  const handleRemoveCourse = (id: string) => {
    setSelectedCourses(selectedCourses.filter((c) => c.id !== id));
  };

  const isEligibleForBatchImport = useMemo(() => {
    if (!selectedDept || selectedDept.length === 0 || selectedDept === "ALL") return false;
    const firstChar = selectedDept[0].toUpperCase();
    return !["A", "W", "M"].includes(firstChar);
  }, [selectedDept]);

  const handleAddAllRequired = () => {
    if (!filteredCatalog.length) return;
    const targetGradeCourses = filteredCatalog.filter((c) => {
      const matchesGrade = selectedYear === "" ? true : String(c.grade) === String(selectedYear);
      return matchesGrade && c.required === true && !selectedCourses.some((sc) => sc.id === c.id);
    });

    const standardInserts: SelectedCourse[] = [];
    const internalConflictStaging: Course[] = [];
    let cumulativeSchedule = [...selectedCourses].map((c) => c as Course);

    targetGradeCourses.forEach((course) => {
      const audit = checkCourseConflict(course, cumulativeSchedule);
      if (audit.isConflict) {
        internalConflictStaging.push(course);
      } else {
        const designatedColor = determineCourseColor(course, selectedDept);
        standardInserts.push({ ...course, color: designatedColor });
        cumulativeSchedule.push(course);
      }
    });

    if (standardInserts.length > 0) setSelectedCourses((prev) => [...prev, ...standardInserts]);
    if (internalConflictStaging.length > 0) {
      setConflictQueue((prev) => {
        const filteredNewEntries = internalConflictStaging.filter((item) => !prev.some((p) => p.id === item.id));
        return [...prev, ...filteredNewEntries];
      });
    }
  };

  const handleResolveConflictItem = (id: string, action: "REPLACE" | "DISCARD") => {
    const targetItem = conflictQueue.find((item) => item.id === id);
    if (targetItem && action === "REPLACE") handleForceReplaceCourse(targetItem);
    setConflictQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSemesterChange = (nextSemester: string) => {
    if (selectedCourses.length > 0) {
      const confirmLeave = window.confirm("Warning: Switching semesters will discard your current schedule. Do you want to proceed?");
      if (!confirmLeave) return;
    }
    setSelectedCourses([]);
    setConflictQueue([]);
    setSemester(nextSemester);
  };

  const handleExportSchedule = () => {
    if (selectedCourses.length === 0) {
      alert("Your schedule is empty. Add some courses before exporting!");
      return;
    }
    const dataStr = JSON.stringify(selectedCourses, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", `ncku-schedule-${semester || "current"}.json`);
    linkElement.click();
  };

  const handleImportSchedule = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setSelectedCourses(JSON.parse(event.target?.result as string));
      } catch (err) {
        console.error("Invalid file format during import", err);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div style={appLayoutStyles.container}>
      <TopNav
        semester={semester}
        onSemesterChange={handleSemesterChange}
        semesterList={semesterList}
        isBootstrapLoading={isBootstrapLoading}
        onExportSchedule={handleExportSchedule}
        onImportSchedule={handleImportSchedule}
      />
      <div style={appLayoutStyles.workspaceContainer}>
        <Sidebar
          collegeTree={enhancedCollegeTree}
          selectedCollege={selectedCollege}
          setSelectedCollege={setSelectedCollege}
          currentDeptList={currentDeptList}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          isEligibleForBatchImport={isEligibleForBatchImport}
          onBatchImportRequired={handleAddAllRequired}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterRequired={filterRequired}
          setFilterRequired={setFilterRequired}
          filterElective={filterElective}
          setFilterElective={setFilterElective}
          excludeConflicts={excludeConflicts}
          setExcludeConflicts={setExcludeConflicts}
          catalogWithConflictStatus={catalogWithConflictStatus}
          selectedCourses={selectedCourses}
          handleAddCourse={handleAddCourse}
          setHoveredCourse={setHoveredCourse}
          isLoading={isLoading}
        />
        <main style={{ flex: 1, padding: "20px", overflowY: "auto", backgroundColor: "#f9fafb" }}>
          <CourseGrid
            selectedCourses={selectedCourses}
            onRemoveCourse={handleRemoveCourse}
            hoveredCourse={hoveredCourse}
          />
        </main>
        <Metrics
          totalCredits={totalCredits}
          selectedCourses={selectedCourses}
          conflictQueue={conflictQueue}
          onResolveConflict={handleResolveConflictItem}
        />
      </div>
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<App />);
}