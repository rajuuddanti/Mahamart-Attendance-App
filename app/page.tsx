"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

type Employee = {
  id: string;
  name: string;
  location: string;
  shiftIn: string;
  shiftOut: string;
  status: "Present" | "On Break" | "Not Checked In" | "Absent" | "Half Day";
  avatar: string;
  late?: boolean;
  phone?: string;
  email?: string;
  dob?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  joiningDate?: string;
  designation?: string;
  department?: string;
  pan?: string;
  aadhaar?: string;
  bankAccount?: string;
  ifsc?: string;
  shiftStart?: string;
  shiftEnd?: string;
  role?: string;
};

type Punch = {
  id: string;
  employeeId: string;
  employee: string;
  action: "Shift In" | "Shift Out" | "Break Out" | "Break In";
  time: string;
  date: string;
  faceVerified: boolean;
  faceConfidence: number;
  source: "Web Admin" | "Kiosk";
};

type Rules = {
  shiftStart: string;
  shiftEnd: string;
  grace: string;
  absentAfter: string;
  absentHours: string;
  halfDayHours: string;
  workingHoursEnabled: boolean;
  multipleBreaks: boolean;
  requireShiftOut: boolean;
  allowEarlyIn: boolean;
};

const navItems = [
  { label: "Dashboard", icon: "▦" },
  { label: "Employees", icon: "♙" },
  { label: "Locations", icon: "⌖" },
  { label: "Attendance", icon: "◷" },
  { label: "Reports", icon: "▤" },
  { label: "Users & Roles", icon: "♙" },
  { label: "Rules", icon: "◈" },
  { label: "Settings", icon: "⚙" },
];

const initialEmployees: Employee[] = [
  { name: "Rahul Kumar", id: "EMP001", location: "Head Office", shiftIn: "09:02 AM", shiftOut: "—", status: "Present", avatar: "RK", late: false, phone: "9876543210", email: "rahul@mahamart.com", designation: "Sales Executive", department: "Sales", shiftStart: "09:00", shiftEnd: "18:00", role: "Employee" },
  { name: "Suresh Babu", id: "EMP002", location: "Head Office", shiftIn: "09:11 AM", shiftOut: "—", status: "Present", avatar: "SB", late: false, phone: "9876543211", email: "suresh@mahamart.com", designation: "Store Executive", department: "Store", shiftStart: "09:00", shiftEnd: "18:30", role: "Employee" },
  { name: "Priya Sharma", id: "EMP003", location: "Head Office", shiftIn: "08:58 AM", shiftOut: "—", status: "Present", avatar: "PS", late: false, phone: "9876543212", email: "priya@mahamart.com", designation: "HR Executive", department: "HR", shiftStart: "09:00", shiftEnd: "18:00", role: "Employee" },
  { name: "Arun Kumar", id: "EMP004", location: "Head Office", shiftIn: "—", shiftOut: "—", status: "Not Checked In", avatar: "AK" },
  { name: "Divya Reddy", id: "EMP005", location: "Head Office", shiftIn: "09:17 AM", shiftOut: "—", status: "Present", avatar: "DR", late: true },
  { name: "Kiran Rao", id: "EMP006", location: "Head Office", shiftIn: "09:06 AM", shiftOut: "—", status: "Present", avatar: "KR" },
  { name: "Meena Devi", id: "EMP007", location: "Head Office", shiftIn: "09:20 AM", shiftOut: "—", status: "Present", avatar: "MD", late: true },
  { name: "Vikram Singh", id: "EMP008", location: "Head Office", shiftIn: "09:14 AM", shiftOut: "—", status: "Present", avatar: "VS" },
  { name: "Anita Reddy", id: "EMP009", location: "Head Office", shiftIn: "—", status: "Absent", avatar: "AR" },
  { name: "Ravi Teja", id: "EMP010", location: "Head Office", shiftIn: "09:28 AM", shiftOut: "—", status: "Present", avatar: "RT", late: true },
  { name: "Lakshmi Rao", id: "EMP011", location: "Head Office", shiftIn: "09:04 AM", shiftOut: "—", status: "Present", avatar: "LR" },
  { name: "Manoj Kumar", id: "EMP012", location: "Head Office", shiftIn: "—", status: "Not Checked In", avatar: "MK" },
];

const initialPunches: Punch[] = [
  { id: "p1", employeeId: "EMP002", employee: "Suresh Babu", action: "Break Out", time: "12:42 PM", date: "2026-09-21", faceVerified: true, faceConfidence: 98.4, source: "Kiosk" },
  { id: "p2", employeeId: "EMP005", employee: "Divya Reddy", action: "Shift In", time: "09:17 AM", date: "2026-09-21", faceVerified: true, faceConfidence: 99.1, source: "Kiosk" },
  { id: "p3", employeeId: "EMP001", employee: "Rahul Kumar", action: "Shift In", time: "09:02 AM", date: "2026-09-21", faceVerified: true, faceConfidence: 99.3, source: "Kiosk" },
  { id: "p4", employeeId: "EMP003", employee: "Priya Sharma", action: "Shift In", time: "08:58 AM", date: "2026-09-21", faceVerified: true, faceConfidence: 98.9, source: "Kiosk" },
  { id: "p5", employeeId: "EMP001", employee: "Rahul Kumar", action: "Break Out", time: "12:16 PM", date: "2026-09-21", faceVerified: true, faceConfidence: 97.8, source: "Kiosk" },
  { id: "p6", employeeId: "EMP001", employee: "Rahul Kumar", action: "Break In", time: "12:24 PM", date: "2026-09-21", faceVerified: true, faceConfidence: 98.2, source: "Kiosk" },
  { id: "p7", employeeId: "EMP001", employee: "Rahul Kumar", action: "Shift Out", time: "06:02 PM", date: "2026-09-20", faceVerified: true, faceConfidence: 99.0, source: "Kiosk" },
];

const defaultRules: Rules = {
  shiftStart: "09:00",
  shiftEnd: "18:00",
  grace: "15",
  absentAfter: "12:00",
  absentHours: "5",
  halfDayHours: "8",
  workingHoursEnabled: true,
  multipleBreaks: true,
  requireShiftOut: true,
  allowEarlyIn: true,
};

function localDate() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

function dateKeyFromTimestamp(value: string) {
  const d = new Date(value);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

function dateRange(date: string) {
  const start = new Date(date + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function formatPunchTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(value));
}

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date(date + "T00:00:00")).toUpperCase();
}

function nowLabel() {
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date());
}

function timeToMinutes(value: string) {
  const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return hour * 60 + minute;
}

function scheduleTimeToMinutes(value: string) {
  const parts = value.split(":").map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

function statusForDate(employee: Employee, date: string, punches: Punch[], rules: Rules) {
  const events = punches.filter((p) => p.employeeId === employee.id && p.date === date)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  const shiftIn = events.find((p) => p.action === "Shift In");
  const shiftOut = [...events].reverse().find((p) => p.action === "Shift Out");
  const lastShift = [...events].reverse().find((p) => p.action === "Shift In" || p.action === "Shift Out");
  const lastBreak = [...events].reverse().find((p) => p.action === "Break Out" || p.action === "Break In");

  if (!shiftIn || lastShift?.action !== "Shift In") {
    return { status: "Not Checked In" as Employee["status"], late: false, shiftIn: shiftIn?.time || "—", shiftOut: shiftOut?.time || "—" };
  }

  const late = timeToMinutes(shiftIn.time) > scheduleTimeToMinutes(rules.shiftStart) + Number(rules.grace);
  if (lastBreak?.action === "Break Out" && (!lastShift || timeToMinutes(lastBreak.time) > timeToMinutes(lastShift.time))) {
    return { status: "On Break" as Employee["status"], late, shiftIn: shiftIn.time, shiftOut: shiftOut?.time || "—" };
  }

  if (shiftOut && rules.workingHoursEnabled) {
    const worked = calculateWorkedMinutes(employee.id, date, punches);
    if (worked < Number(rules.absentHours) * 60) return { status: "Absent" as Employee["status"], late, shiftIn: shiftIn.time, shiftOut: shiftOut.time };
    if (worked < Number(rules.halfDayHours) * 60) return { status: "Half Day" as Employee["status"], late, shiftIn: shiftIn.time, shiftOut: shiftOut.time };
  }

  return { status: "Present" as Employee["status"], late, shiftIn: shiftIn.time, shiftOut: shiftOut?.time || "—" };
}

function calculateWorkedMinutes(employeeId: string, date: string, punches: Punch[]) {
  const events = punches.filter((p) => p.employeeId === employeeId && p.date === date)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  let total = 0;
  let inAt: number | null = null;
  let breakAt: number | null = null;

  for (const event of events) {
    const t = timeToMinutes(event.time);
    if (event.action === "Shift In" && inAt === null) inAt = t;
    if (event.action === "Break Out" && inAt !== null) {
      total += t - inAt;
      inAt = null;
      breakAt = t;
    }
    if (event.action === "Break In" && breakAt !== null) {
      inAt = t;
      breakAt = null;
    }
    if (event.action === "Shift Out" && inAt !== null) {
      total += t - inAt;
      inAt = null;
      breakAt = null;
    }
  }

  return total;
}

function formatHours(minutes: number) {
  return Math.floor(minutes / 60) + "h " + String(minutes % 60).padStart(2, "0") + "m";
}

export default function Dashboard() {
  const [active, setActive] = useState("Dashboard");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [punches, setPunches] = useState<Punch[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState("");
  const [rules, setRules] = useState<Rules>(defaultRules);
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("All Locations");
  const [dateFilter, setDateFilter] = useState(localDate());
  const [showAdd, setShowAdd] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedRules = localStorage.getItem("mahamart-rules");
    if (savedRules) setRules({ ...defaultRules, ...JSON.parse(savedRules) });

    let active = true;
    async function loadCompany() {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        if (active) {
          setAttendanceLoading(false);
          setAttendanceError("Sign in through the Live Attendance page first so the dashboard can read Supabase attendance.");
        }
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", sessionData.session.user.id)
        .single();

      if (profileError || !profile?.company_id) {
        if (active) {
          setAttendanceLoading(false);
          setAttendanceError(profileError?.message || "Your Supabase profile/company was not found.");
        }
        return;
      }

      if (active) setCompanyId(profile.company_id);
    }

    loadCompany();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!companyId) return;

    let active = true;

    async function loadEmployeesAndLocations() {
      setAttendanceLoading(true);
      setAttendanceError("");

      const [{ data: employeeRows, error: employeeError }, { data: locationRows, error: locationError }] = await Promise.all([
        supabase.from("employees")
          .select("id,employee_code,full_name,location_id,phone,email,designation,department,joining_date,active,shift_id")
          .eq("company_id", companyId)
          .eq("active", true)
          .order("full_name"),
        supabase.from("locations")
          .select("id,name")
          .eq("company_id", companyId)
          .order("name"),
      ]);

      if (!active) return;
      if (employeeError || locationError) {
        setAttendanceError(employeeError?.message || locationError?.message || "Could not load employees or locations from Supabase.");
        setAttendanceLoading(false);
        return;
      }

      const locationMap = new Map((locationRows || []).map((row: any) => [row.id, row.name]));
      const mappedEmployees: Employee[] = (employeeRows || []).map((row: any) => ({
        id: row.id,
        name: row.full_name,
        location: locationMap.get(row.location_id) || "No location",
        shiftIn: "—",
        shiftOut: "—",
        status: "Not Checked In",
        avatar: row.full_name.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase(),
        phone: row.phone || "",
        email: row.email || "",
        designation: row.designation || "",
        department: row.department || "",
        joiningDate: row.joining_date || "",
        shiftStart: defaultRules.shiftStart,
        shiftEnd: defaultRules.shiftEnd,
        role: "Employee",
      }));

      setEmployees(mappedEmployees);
      setAttendanceLoading(false);
    }

    loadEmployeesAndLocations();

    const channel = supabase.channel("main-dashboard-attendance")
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_punches" }, () => {
        loadAttendance();
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [companyId, dateFilter]);

  async function loadAttendance() {
    if (!companyId) return;
    const { start, end } = dateRange(dateFilter);
    setAttendanceLoading(true);

    const { data, error } = await supabase
      .from("attendance_punches")
      .select("id,employee_id,action,punched_at,source,face_verified,face_confidence")
      .eq("company_id", companyId)
      .gte("punched_at", start)
      .lt("punched_at", end)
      .order("punched_at", { ascending: false })
      .limit(500);

    if (error) {
      setAttendanceError(error.message);
      setPunches([]);
      setAttendanceLoading(false);
      return;
    }

    const nameById = new Map(employees.map((employee) => [employee.id, employee.name]));
    const mappedPunches: Punch[] = (data || []).map((row: any) => ({
      id: row.id,
      employeeId: row.employee_id,
      employee: nameById.get(row.employee_id) || "Employee",
      action: row.action,
      time: formatPunchTime(row.punched_at),
      date: dateKeyFromTimestamp(row.punched_at),
      faceVerified: !!row.face_verified,
      faceConfidence: Number(row.face_confidence || 0),
      source: row.source === "Web Admin" ? "Web Admin" : "Kiosk",
    }));

    setPunches(mappedPunches);
    setAttendanceLoading(false);
    setAttendanceError("");
  }

  const locations = Array.from(new Set(employees.map((e) => e.location))).filter(Boolean);

  const stats = useMemo(() => {
    const selected = employees.map((employee) => statusForDate(employee, dateFilter, punches, rules));
    return {
      present: selected.filter((e) => e.status === "Present" || e.status === "Half Day").length,
      absent: selected.filter((e) => e.status === "Absent").length,
      break: selected.filter((e) => e.status === "On Break").length,
      notIn: selected.filter((e) => e.status === "Not Checked In").length,
      late: selected.filter((e) => e.late && e.status !== "Absent").length,
    };
  }, [employees, punches, rules, dateFilter]);

  const filteredEmployees = employees.filter((employee) =>
    (storeFilter === "All Locations" || employee.location === storeFilter) &&
    (employee.name + " " + employee.id + " " + employee.location).toLowerCase().includes(search.toLowerCase())
  );

  const datePunches = punches.filter((p) => p.date === dateFilter);

  async function addEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const location = String(form.get("location") || "Head Office").trim();
    if (!name) return;

    const id = "EMP" + String(employees.length + 1).padStart(3, "0");
    const avatar = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    const phone = String(form.get("phone") || "");
    const email = String(form.get("email") || "");
    const designation = String(form.get("designation") || "");
    const department = String(form.get("department") || "");
    const joiningDate = String(form.get("joiningDate") || "");
    const shiftStart = String(form.get("shiftStart") || "09:00");
    const shiftEnd = String(form.get("shiftEnd") || "18:00");

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      alert("Please sign in through the Live Attendance page first, then try again.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.company_id) {
      alert(profileError?.message || "Admin profile/company was not found in Supabase.");
      return;
    }

    const { data: locationRow, error: locationError } = await supabase
      .from("locations")
      .select("id")
      .eq("company_id", profile.company_id)
      .eq("name", location)
      .maybeSingle();

    if (locationError) {
      alert(locationError.message);
      return;
    }

    const { error: insertError } = await supabase.from("employees").insert({
      company_id: profile.company_id,
      employee_code: id,
      full_name: name,
      location_id: locationRow?.id ?? null,
      phone: phone || null,
      email: email || null,
      designation: designation || null,
      department: department || null,
      joining_date: joiningDate || null,
      active: true,
    });

    if (insertError) {
      alert(insertError.message);
      return;
    }

    const employee: Employee = {
      id, name, location, shiftIn: "—", status: "Not Checked In", avatar,
      phone, email, designation, department, joiningDate,
      shiftStart, shiftEnd, role: "Employee",
    };

    setEmployees((current) => [...current, employee]);
    setShowAdd(false);
    alert(name + " was saved to Supabase.");
  }

  function punchEmployee(employeeId: string, action: Punch["action"]) {
    if (action !== "Shift In" && action !== "Shift Out") return;
    const employee = employees.find((item) => item.id === employeeId);
    if (!employee) return;
    const time = nowLabel();
    const date = localDate();
    const todays = punches.filter((p) => p.employeeId === employeeId && p.date === date);
    const hasOpenShift = todays.some((p) => p.action === "Shift In") && !todays.some((p) => p.action === "Shift Out");
    if (action === "Shift In" && hasOpenShift) { alert("This employee is already checked in. Shift Out must be recorded first."); return; }
    if (action === "Shift Out" && !hasOpenShift) { alert("This employee is not checked in."); return; }
    let status: Employee["status"] = employee.status;
    let late = employee.late;
    if (action === "Shift In") {
      status = "Present";
      const currentMinutes = timeToMinutes(time);
      const shiftMinutes = scheduleTimeToMinutes(employee.shiftStart || rules.shiftStart);
      late = currentMinutes > shiftMinutes + Number(rules.grace);
    }
    if (action === "Shift Out") {
      const worked = calculateWorkedMinutes(employeeId, date, [...punches, { id: "temp", employeeId, employee: employee.name, action, time, date, faceVerified: false, faceConfidence: 0, source: "Web Admin" as const }]);
      if (rules.workingHoursEnabled) {
        if (worked < Number(rules.absentHours) * 60) status = "Absent";
        else if (worked < Number(rules.halfDayHours) * 60) status = "Half Day";
        else status = "Present";
      }
    }
    setEmployees((current) => current.map((item) => item.id === employeeId ? { ...item, status, shiftIn: action === "Shift In" ? time : item.shiftIn, late } : item));
    setPunches((current) => [{ id: Date.now().toString(), employeeId, employee: employee.name, action, time, date, faceVerified: false, faceConfidence: 0, source: "Web Admin" as const }, ...current].slice(0, 500));
  }

  function createAdminBreak(employeeId: string, remarks: string) {
    const employee = employees.find((item) => item.id === employeeId);
    if (!employee) return;
    const time = nowLabel();
    const date = localDate();
    const hasOpenShift = punches.some((p) => p.employeeId === employeeId && p.date === date && p.action === "Shift In") &&
      !punches.some((p) => p.employeeId === employeeId && p.date === date && p.action === "Shift Out");
    if (!hasOpenShift) { alert("Employee must be checked in before a break can be created."); return; }
    setPunches((current) => [{ id: Date.now().toString(), employeeId, employee: employee.name, action: "Break Out", time, date, faceVerified: false, faceConfidence: 0, source: "Web Admin" as const, notes: remarks } as Punch, ...current]);
    setEmployees((current) => current.map((item) => item.id === employeeId ? { ...item, status: "On Break" } : item));
  }

  function goTo(label: string) {
    setActive(label);
    setSearch("");
    setShowNotifications(false);
  }

  async function importExcel(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      const imported: Employee[] = rows.map((row, index): Employee => {
        const get = (keys: string[]) => {
          const key = Object.keys(row).find((k) => keys.includes(k.toLowerCase().replace(/\s+/g, "")));
          return key ? String(row[key]) : "";
        };
        const name = get(["name", "employeename", "fullname"]) || ("Imported Employee " + (index + 1));
        const id = get(["id", "employeeid", "empid"]) || ("EMP" + String(employees.length + index + 1).padStart(3, "0"));
        const location = get(["location", "store", "storelocation"]) || "Head Office";
        const avatar = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
        return {
          id, name, location, avatar, shiftIn: "—", status: "Not Checked In" as const,
          phone: get(["phone", "mobile", "mobilenumber"]),
          email: get(["email", "emailaddress"]),
          dob: get(["dob", "dateofbirth"]),
          gender: get(["gender", "sex"]),
          address: get(["address", "permanentaddress"]),
          emergencyContact: get(["emergencycontact", "emergencyname"]),
          emergencyPhone: get(["emergencyphone", "emergencynumber"]),
          joiningDate: get(["joiningdate", "dateofjoining"]),
          designation: get(["designation", "jobtitle"]),
          department: get(["department", "dept"]),
          pan: get(["pan", "pannumber"]),
          aadhaar: get(["aadhaar", "aadhaarnumber"]),
          bankAccount: get(["bankaccount", "accountnumber"]),
          ifsc: get(["ifsc", "ifsccode"]),
        };
      }).filter((e) => e.name);
      setEmployees((current) => {
        const map = new Map(current.map((e) => [e.id, e]));
        imported.forEach((e) => map.set(e.id, { ...map.get(e.id), ...e }));
        return Array.from(map.values());
      });
      setShowImport(false);
      alert(imported.length + " employee records imported.");
    } catch {
      alert("Could not read this Excel file. Please check that it is a valid .xlsx or .xls file.");
    }
    if (importRef.current) importRef.current.value = "";
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">M</div><div><div className="brand-name">Mahamart</div><div className="brand-subtitle">Attendance</div></div></div>
        <nav className="nav"><div className="nav-section">MAIN MENU</div>{navItems.map((item) => <button key={item.label} className={active === item.label ? "nav-item active" : "nav-item"} onClick={() => goTo(item.label)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}</nav>
        <div className="sidebar-bottom"><div className="office-chip"><span className="online-dot" /><div><strong>{locations[0] || "Head Office"}</strong><small>{locations.length} location{locations.length === 1 ? "" : "s"} active</small></div></div><div className="user-mini"><div className="avatar">RA</div><div><strong>Admin</strong><small>Company Admin</small></div><span className="more">•••</span></div></div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div><div className="eyebrow">{dateLabel(dateFilter)}</div><h1>{active}</h1></div>
          <div className="top-actions"><div className="notification-wrap"><button className="icon-button" aria-label="Notifications" onClick={() => setShowNotifications((v) => !v)}>♢<span className="notification-dot" /></button>{showNotifications && <div className="notification-pop"><strong>Notifications</strong><span>{stats.late} late arrivals today.</span><span>{stats.notIn} employees have not checked in.</span></div>}</div><div className="top-user"><div className="avatar">RA</div><div><strong>Admin</strong><small>Company Admin</small></div><span>⌄</span></div></div>
        </header>

        <div className="page">
          {active === "Dashboard" && <DashboardPage stats={stats} employees={employees} punches={datePunches} rules={rules} date={dateFilter} onDate={setDateFilter} onAdd={() => setShowAdd(true)} onGo={goTo} loading={attendanceLoading} error={attendanceError} />}
          {active === "Employees" && <EmployeesPage employees={filteredEmployees} allEmployees={employees} search={search} storeFilter={storeFilter} locations={locations} onSearch={setSearch} onStore={setStoreFilter} onAdd={() => setShowAdd(true)} onImport={() => setShowImport(true)} onSelect={setSelectedEmployee} />}
          {active === "Locations" && <LocationsPage locations={locations} employees={employees} onAdd={() => alert("Location creation will be connected to Supabase next.")} onSelect={setSelectedLocation} onRename={(oldName, newName) => setEmployees((current) => current.map((e) => e.location === oldName ? { ...e, location: newName } : e))} />}
          {active === "Attendance" && <AttendancePage employees={filteredEmployees} punches={punches} date={dateFilter} onDate={setDateFilter} storeFilter={storeFilter} locations={locations} onStore={setStoreFilter} onPunch={punchEmployee} onSelect={setSelectedEmployee} />}
          {active === "Reports" && <ReportsPage employees={employees} punches={punches} rules={rules} />}
          {active === "Users & Roles" && <UsersPage />}
          {active === "Rules" && <RulesPage rules={rules} setRules={setRules} />}
          {active === "Settings" && <SettingsPage rules={rules} setRules={setRules} />}
        </div>
      </section>

      {showAdd && <EmployeeForm locations={locations} onClose={() => setShowAdd(false)} onSubmit={addEmployee} />}
      {showImport && <ImportHelp onClose={() => setShowImport(false)} onChoose={() => importRef.current?.click()} />}
      <input ref={importRef} type="file" accept=".xlsx,.xls" onChange={importExcel} hidden />
      {selectedEmployee && <EmployeeDetail employee={selectedEmployee} punches={punches} onClose={() => setSelectedEmployee(null)} onBreak={createAdminBreak} />}
      {selectedLocation && <LocationDetail location={selectedLocation} employees={employees} onClose={() => setSelectedLocation(null)} onRename={(name) => { setEmployees((current) => current.map((e) => e.location === selectedLocation ? { ...e, location: name } : e)); setSelectedLocation(name); }} />}
    </main>
  );
}

function DashboardPage({ stats, employees, punches, rules, date, onDate, onAdd, onGo, loading, error }: { stats: { present: number; absent: number; break: number; notIn: number; late: number }; employees: Employee[]; punches: Punch[]; rules: Rules; date: string; onDate: (date: string) => void; onAdd: () => void; onGo: (label: string) => void; loading: boolean; error: string }) {
  const selected = employees.map((employee) => ({ employee, ...statusForDate(employee, date, punches, rules) }));
  const lateEmployees = selected.filter((x) => x.late).map((x) => ({ ...x.employee, late: x.late }));
  return <>
    <div className="welcome-row"><div><h2>Good morning, Admin 👋</h2><p>Attendance overview for the selected date.</p></div><div className="page-actions"><label className="date-filter">Date<input type="date" value={date} onChange={(e) => onDate(e.target.value)} /></label><button className="primary-button" onClick={onAdd}>+ Add Employee</button></div></div>
    {error && <div className="live-message">{error}</div>}
    {loading && <div className="live-message">Loading live attendance from Supabase…</div>}
    <section className="stats-grid"><StatCard label="Present" value={String(stats.present)} detail="Working / completed" icon="✓" tone="green" /><StatCard label="Absent" value={String(stats.absent)} detail="Marked absent" icon="×" tone="red" /><StatCard label="On Break" value={String(stats.break)} detail="Currently away" icon="◌" tone="orange" /><StatCard label="Not Checked In" value={String(stats.notIn)} detail="Expected today" icon="○" tone="blue" /><StatCard label="Late Arrivals" value={String(stats.late)} detail="After grace period" icon="!" tone="purple" /></section>
    <section className="dashboard-grid"><div className="panel attendance-panel"><div className="panel-header"><div><h3>Attendance</h3><p>Selected date · {date}</p></div><button className="ghost-button" onClick={() => onGo("Attendance")}>View all →</button></div><div className="table-wrap"><table><thead><tr><th>EMPLOYEE</th><th>LOCATION</th><th>SHIFT IN</th><th>SHIFT OUT</th><th>STATUS</th></tr></thead><tbody>{selected.slice(0, 7).map((item) => <tr key={item.employee.id}><td><div className="employee-cell"><div className="avatar small">{item.employee.avatar}</div><div><strong>{item.employee.name}</strong><small>{item.employee.id}</small></div></div></td><td>{item.employee.location}</td><td>{item.shiftIn}</td><td>{item.shiftOut}</td><td><StatusBadge status={item.late ? "Late" : item.status} /></td></tr>)}</tbody></table></div></div><div className="panel"><div className="panel-header"><div><h3>Recent Activity</h3><p>Selected date · face verification events</p></div></div><div className="activity-list">{punches.slice(0, 6).map((punch) => <div className="activity" key={punch.id}><div className="activity-dot" /><div className="activity-body"><strong>{punch.employee}</strong><span>{punch.action} · {punch.faceVerified ? "Face verified" : "Web admin"}</span></div><time>{punch.time}</time></div>)}</div></div></section>
    <section className="quick-row"><button className="quick-card" onClick={() => onGo("Employees")}><span className="quick-icon">♙</span><div><strong>{employees.length} Employees</strong><small>Manage your team</small></div><span className="arrow">→</span></button><button className="quick-card" onClick={() => onGo("Locations")}><span className="quick-icon">⌖</span><div><strong>Locations</strong><small>{new Set(employees.map((e) => e.location)).size} active</small></div><span className="arrow">→</span></button><button className="quick-card" onClick={() => onGo("Reports")}><span className="quick-icon">▤</span><div><strong>Reports</strong><small>View attendance reports</small></div><span className="arrow">→</span></button></section>
    <section className="panel late-panel"><div className="panel-header"><div><h3>Late arrivals</h3><p>Employees who punched after the configured grace period</p></div></div><div className="late-list">{lateEmployees.slice(0, 6).map((e) => <div className="late-row" key={e.id}><div className="employee-cell"><div className="avatar small">{e.avatar}</div><div><strong>{e.name}</strong><small>{e.id} · {e.location}</small></div></div><StatusBadge status="Late" /></div>)}</div></section>
  </>;
}

function EmployeesPage({ employees, allEmployees, search, storeFilter, locations, onSearch, onStore, onAdd, onImport, onSelect }: { employees: Employee[]; allEmployees: Employee[]; search: string; storeFilter: string; locations: string[]; onSearch: (v: string) => void; onStore: (v: string) => void; onAdd: () => void; onImport: () => void; onSelect: (e: Employee) => void }) {
  return <PageFrame title="Employees" subtitle={allEmployees.length + " employees in your organization"} action={<div className="page-actions"><button className="secondary-button" onClick={onImport}>Import Excel</button><button className="primary-button" onClick={onAdd}>+ Add Employee</button></div>}>
    <div className="toolbar"><input className="search-input" placeholder="Search name, ID or location..." value={search} onChange={(e) => onSearch(e.target.value)} /><select className="filter-select" value={storeFilter} onChange={(e) => onStore(e.target.value)}><option>All Locations</option>{locations.map((l) => <option key={l}>{l}</option>)}</select><span className="toolbar-count">{employees.length} shown</span></div>
    <div className="panel"><div className="table-wrap"><table><thead><tr><th>EMPLOYEE</th><th>ID</th><th>LOCATION</th><th>SHIFT IN</th><th>STATUS</th></tr></thead><tbody>{employees.map((person) => <tr key={person.id} className="clickable-row" onClick={() => onSelect(person)}><td><div className="employee-cell"><div className="avatar small">{person.avatar}</div><div><strong>{person.name}</strong><small>{person.designation || person.id}</small></div></div></td><td>{person.id}</td><td>{person.location}</td><td>{person.shiftIn}</td><td><StatusBadge status={person.late ? "Late" : person.status} /></td></tr>)}</tbody></table></div></div>
    <p className="table-hint">Click an employee to view today&apos;s punches and date-filtered attendance history.</p>
  </PageFrame>;
}

function LocationsPage({ locations, employees, onAdd, onSelect, onRename }: { locations: string[]; employees: Employee[]; onAdd: () => void; onSelect: (location: string) => void; onRename: (oldName: string, newName: string) => void }) {
  return <PageFrame title="Locations" subtitle="Click a location to view employees, attendance and geo-fence settings" action={<button className="primary-button" onClick={onAdd}>+ Add Location</button>}><div className="location-grid">{locations.map((location) => <button className="location-card clickable-card" key={location} onClick={() => onSelect(location)}><div className="location-top"><span className="location-icon">⌖</span><StatusBadge status="Present" /></div><h3>{location}</h3><p>Click to open location details</p><div className="location-meta"><span><strong>{employees.filter((e) => e.location === location).length}</strong> Employees</span><span><strong>1</strong> Kiosk</span></div></button>)}</div></PageFrame>;
}

function LocationDetail({ location, employees, onClose, onRename }: { location: string; employees: Employee[]; onClose: () => void; onRename: (name: string) => void }) {
  const [name, setName] = useState(location);
  const people = employees.filter((e) => e.location === location);
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal xl-modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-header"><div><h3>{location}</h3><p>{people.length} employees assigned to this location</p></div><button className="close-button" onClick={onClose}>×</button></div><div className="detail-card-grid"><div className="detail-card"><strong>Employees</strong><span>{people.length}</span></div><div className="detail-card"><strong>Kiosks</strong><span>1</span></div><div className="detail-card"><strong>Geo-fence</strong><span>Configure in Supabase</span></div></div><h4>Location name</h4><div className="inline-form"><input value={name} onChange={(e) => setName(e.target.value)} /><button className="primary-button" onClick={() => { if(name.trim()) onRename(name.trim()); }}>Save name</button></div><h4>Employees</h4><div className="table-wrap"><table><thead><tr><th>ID</th><th>NAME</th><th>DESIGNATION</th><th>SHIFT</th></tr></thead><tbody>{people.map(e=><tr key={e.id}><td>{e.id}</td><td>{e.name}</td><td>{e.designation || "—"}</td><td>{e.shiftStart || "09:00"} - {e.shiftEnd || "18:00"}</td></tr>)}</tbody></table></div></div></div>;
}

function AttendancePage({ employees, punches, date, onDate, storeFilter, locations, onStore, onPunch, onSelect }: { employees: Employee[]; punches: Punch[]; date: string; onDate: (v: string) => void; storeFilter: string; locations: string[]; onStore: (v: string) => void; onPunch: (id: string, action: Punch["action"]) => void; onSelect: (employee: Employee) => void }) {
  const visiblePunches = punches.filter((p) => p.date === date && (storeFilter === "All Locations" || employees.find((e) => e.id === p.employeeId)?.location === storeFilter));
  return <PageFrame title="Attendance" subtitle="View and manage attendance"><div className="attendance-filters"><label className="date-filter">Date<input type="date" value={date} onChange={(e) => onDate(e.target.value)} /></label><label className="date-filter">Store<select className="filter-select" value={storeFilter} onChange={(e) => onStore(e.target.value)}><option>All Locations</option>{locations.map((l) => <option key={l}>{l}</option>)}</select></label></div><div className="attendance-layout"><div className="panel"><div className="panel-header"><div><h3>Attendance for {date}</h3><p>Admin can manually record any punch.</p></div></div><div className="table-wrap"><table><thead><tr><th>EMPLOYEE</th><th>STATUS</th><th>SHIFT IN</th><th>WORKED</th><th>ACTIONS</th></tr></thead><tbody>{employees.map((person) => <tr key={person.id}><td onClick={() => onSelect(person)} className="clickable-cell"><div className="employee-cell"><div className="avatar small">{person.avatar}</div><div><strong>{person.name}</strong><small>{person.id} · {person.designation || "Employee"}</small></div></div></td><td><StatusBadge status={person.late ? "Late" : person.status} /></td><td>{person.shiftIn}</td><td>{formatHours(calculateWorkedMinutes(person.id, date, punches))}</td><td><div className="action-row">{(() => { const day = punches.filter(p => p.employeeId === person.id && p.date === date); const open = day.some(p => p.action === "Shift In") && !day.some(p => p.action === "Shift Out"); return <button className="table-action" onClick={() => onPunch(person.id, open ? "Shift Out" : "Shift In")}>{open ? "Shift Out" : "Shift In"}</button>; })()}</div></td></tr>)}</tbody></table></div></div><div className="panel"><div className="panel-header"><div><h3>Punch & face verification log</h3><p>Last 7 days of recorded punch metadata</p></div></div><div className="activity-list">{punches.filter((p) => new Date(p.date).getTime() >= Date.now() - 7 * 86400000).slice(0, 30).map((punch) => <div className="activity face-activity" key={punch.id}><div className="activity-dot" /><div className="activity-body"><strong>{punch.employee}</strong><span>{punch.action} · {punch.date} · {punch.faceVerified ? "Face verified " + punch.faceConfidence.toFixed(1) + "%" : "Manual web punch"}</span></div><time>{punch.time}</time></div>)}</div></div></div></PageFrame>;
}

function ReportsPage({ employees, punches, rules }: { employees: Employee[]; punches: Punch[]; rules: Rules }) {
  const [mode, setMode] = useState<"daily" | "monthly">("daily");
  const [date, setDate] = useState(localDate());
  const periodStart = new Date(); periodStart.setDate(21); periodStart.setMonth(periodStart.getMonth() - 1);
  const periodEnd = new Date(); periodEnd.setDate(20);
  const dates: string[] = [];
  for (let d = new Date(periodStart); d <= periodEnd; d.setDate(d.getDate() + 1)) dates.push(d.toISOString().slice(0,10));
  const dailyRows = employees.map(e => {
    const events = punches.filter(p => p.employeeId === e.id && p.date === date).sort((a,b)=>timeToMinutes(a.time)-timeToMinutes(b.time));
    return { e, firstIn: events.find(p=>p.action==="Shift In")?.time || "—", lastOut: [...events].reverse().find(p=>p.action==="Shift Out")?.time || "—" };
  });
  return <PageFrame title="Reports" subtitle="Attendance reports use a 21st-to-20th monthly cycle"><div className="report-tabs"><button className={mode==="daily"?"active":""} onClick={()=>setMode("daily")}>Daily Report</button><button className={mode==="monthly"?"active":""} onClick={()=>setMode("monthly")}>Monthly Attendance</button></div>{mode==="daily" ? <div className="panel"><div className="panel-header"><div><h3>Daily attendance</h3><p>Employee first-in and last-out for the selected date.</p></div><input type="date" value={date} onChange={e=>setDate(e.target.value)} /></div><div className="table-wrap"><table><thead><tr><th>EMP ID</th><th>NAME</th><th>DESIGNATION</th><th>DESIGNATED LOCATION</th><th>ROLE</th><th>FIRST IN</th><th>LAST OUT</th></tr></thead><tbody>{dailyRows.map(({e,firstIn,lastOut})=><tr key={e.id}><td>{e.id}</td><td>{e.name}</td><td>{e.designation||"—"}</td><td>{e.location}</td><td>{e.role||"Employee"}</td><td>{firstIn}</td><td>{lastOut}</td></tr>)}</tbody></table></div></div> : <div className="panel"><div className="panel-header"><div><h3>Monthly attendance · {periodStart.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})} to {periodEnd.toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</h3><p>Present includes completed full days and half days separately; no week-offs are applied.</p></div></div><div className="table-wrap"><table><thead><tr><th>EMP ID</th><th>NAME</th><th>ROLE</th><th>TOTAL PRESENT DAYS</th><th>PRESENT</th><th>HALF</th><th>ABSENT</th>{dates.map(d=><th key={d}>{new Date(d+"T00:00:00").getDate()} {new Date(d+"T00:00:00").toLocaleDateString("en-IN",{month:"short"})}</th>)}</tr></thead><tbody>{employees.map(e=>{let present=0,half=0,absent=0; const cells=dates.map(d=>{const s=statusForDate(e,d,punches,rules).status;if(s==="Half Day"){half++;return "H"} if(s==="Absent"){absent++;return "A"} if(s==="Present"){present++;return "P"} return "A"}); return <tr key={e.id}><td>{e.id}</td><td>{e.name}</td><td>{e.role||"Employee"}</td><td>{present+half}</td><td>{present}</td><td>{half}</td><td>{absent}</td>{cells.map((v,i)=><td key={dates[i]}>{v}</td>)}</tr>})}</tbody></table></div></div>}</PageFrame>;
}

function UsersPage() {
  const roles = ["Super Admin", "Company Admin", "HR", "Store Manager", "Supervisor", "Employee"];
  const permissions = ["View Employees", "Manage Employees", "View Attendance", "Edit Attendance", "View Reports", "Export Reports", "Manage Locations", "Manage Users", "Manage Rules"];
  type User = { name: string; email: string; role: string; location: string; active: boolean };
  const [users, setUsers] = useState<User[]>([{ name: "Raju", email: "admin@mahamart.com", role: "Company Admin", location: "All Locations", active: true }, { name: "Store Manager", email: "manager@mahamart.com", role: "Store Manager", location: "Head Office", active: true }]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState("Company Admin");
  useEffect(() => { const saved = localStorage.getItem("mahamart-users"); if (saved) setUsers(JSON.parse(saved)); }, []);
  useEffect(() => { localStorage.setItem("mahamart-users", JSON.stringify(users)); }, [users]);
  function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const user: User = { name: String(form.get("name") || "").trim(), email: String(form.get("email") || "").trim(), role: String(form.get("role") || "Supervisor"), location: String(form.get("location") || "Head Office"), active: true };
    if (!user.name || !user.email) return;
    setUsers(current => editing ? current.map(u => u.email === editing.email ? user : u) : [...current, user]);
    setEditing(null); setShowUserForm(false);
  }
  return <PageFrame title="Users & Roles" subtitle="Control access, roles and location scope" action={<button className="primary-button" onClick={() => { setEditing(null); setShowUserForm(true); }}>+ Add User</button>}>
    <div className="role-layout">
      <div className="panel"><div className="panel-header"><div><h3>System Users</h3><p>Click a user to edit name, role or location scope.</p></div></div><div className="table-wrap"><table><thead><tr><th>USER</th><th>EMAIL</th><th>ROLE</th><th>LOCATION SCOPE</th><th>STATUS</th></tr></thead><tbody>{users.map(user=><tr key={user.email} className="clickable-row" onClick={()=>{setEditing(user);setShowUserForm(true)}}><td><strong>{user.name}</strong></td><td>{user.email}</td><td><span className="role-pill">{user.role}</span></td><td>{user.location}</td><td><StatusBadge status={user.active ? "Present" : "Absent"} /></td></tr>)}</tbody></table></div></div>
      <div className="settings-card"><h3>Role permissions</h3><p className="card-description">Review permissions for each role before saving user access.</p><label className="field-label">Select role<select className="role-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>{roles.map(r=><option key={r}>{r}</option>)}</select></label><div className="permission-list">{permissions.map(permission=><div className="permission-row" key={permission}><span>{permission}</span><span className="permission-on">{selectedRole === "Employee" && ["Manage Employees","Edit Attendance","Export Reports","Manage Locations","Manage Users","Manage Rules"].includes(permission) ? "No" : "Yes"}</span></div>)}</div></div>
    </div>
    {showUserForm && <UserForm roles={roles} editing={editing} onClose={()=>{setEditing(null);setShowUserForm(false)}} onSubmit={saveUser} />}
  </PageFrame>;
}

function RulesPage({ rules, setRules }: { rules: Rules; setRules: (r: Rules) => void }) {
  const update = (key: keyof Rules, value: string | boolean) => setRules({ ...rules, [key]: value });
  return <PageFrame title="Attendance Rules" subtitle="Define working hours, grace periods and attendance outcomes"><div className="rules-grid"><div className="settings-card"><h3>Shift & working hours</h3><p className="card-description">These values will be applied by the attendance engine after backend connection.</p><div className="rule-fields"><Field label="Shift starts" type="time" value={rules.shiftStart} onChange={(v) => update("shiftStart", v)} /><Field label="Shift ends" type="time" value={rules.shiftEnd} onChange={(v) => update("shiftEnd", v)} /><Field label="Grace period (minutes)" type="number" value={rules.grace} onChange={(v) => update("grace", v)} /><Field label="Mark absent after" type="time" value={rules.absentAfter} onChange={(v) => update("absentAfter", v)} /><Field label="Absent if worked less than (hours)" type="number" value={rules.absentHours} onChange={(v) => update("absentHours", v)} /><Field label="Half day if worked less than (hours)" type="number" value={rules.halfDayHours} onChange={(v) => update("halfDayHours", v)} /></div></div><div className="settings-card"><h3>Attendance behavior</h3><SettingToggle label="Working-hours calculation" description="Calculate net worked hours from shift and break punches." enabled={rules.workingHoursEnabled} onChange={(v) => update("workingHoursEnabled", v)} /><SettingToggle label="Allow multiple breaks" description="No fixed number of break out/in events." enabled={rules.multipleBreaks} onChange={(v) => update("multipleBreaks", v)} /><SettingToggle label="Require Shift Out" description="Employees can punch Shift Out any time; the rule only controls whether a completed day expects it." enabled={rules.requireShiftOut} onChange={(v) => update("requireShiftOut", v)} /><SettingToggle label="Allow early Shift In" description="Allow employees to punch before the scheduled shift start." enabled={rules.allowEarlyIn} onChange={(v) => update("allowEarlyIn", v)} /></div></div></PageFrame>;
}

function SettingsPage({ rules, setRules }: { rules: Rules; setRules: (r: Rules) => void }) {
  return <PageFrame title="Settings" subtitle="Configure application features"><div className="settings-grid"><div className="settings-card"><h3>Attendance features</h3><SettingToggle label="Working-hours calculation" description="Enable the 5-hour absent / 8-hour half-day thresholds from Rules." enabled={rules.workingHoursEnabled} onChange={(v) => setRules({ ...rules, workingHoursEnabled: v })} /><SettingToggle label="Realtime dashboard" description="Will sync attendance changes instantly after Supabase Realtime is connected." enabled={true} onChange={() => undefined} /></div><div className="settings-card"><h3>Imports & integrations</h3><div className="integration-row"><span>Excel employee import</span><span className="coming">Available</span></div><div className="integration-row"><span>Supabase database</span><span className="coming">Next step</span></div><div className="integration-row"><span>Android kiosk + face recognition</span><span className="coming">Later</span></div></div></div></PageFrame>;
}

function EmployeeForm({ locations, onClose, onSubmit }: { locations: string[]; onClose: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal wide-modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-header"><div><h3>Add Employee</h3><p>Assign the employee's default shift during creation.</p></div><button className="close-button" onClick={onClose}>×</button></div><form onSubmit={onSubmit}><div className="form-grid"><Field label="Full name" name="name" required /><Field label="Phone" name="phone" /><Field label="Email" name="email" type="email" /><Field label="Designation" name="designation" /><Field label="Department" name="department" /><Field label="Joining date" name="joiningDate" type="date" /><label className="field-label">Location<select name="location">{locations.map((l) => <option key={l}>{l}</option>)}<option>Head Office</option></select></label><Field label="Shift starts" name="shiftStart" type="time" value="09:00" /><Field label="Shift ends" name="shiftEnd" type="time" value="18:00" /></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">Create Employee</button></div></form></div></div>;
}

function ImportHelp({ onClose, onChoose }: { onClose: () => void; onChoose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-header"><div><h3>Import employees from Excel</h3><p>Use the first row as column headers. The importer recognizes common employee/legal fields.</p></div><button className="close-button" onClick={onClose}>×</button></div><div className="import-fields"><span>Name, Employee ID, Location</span><span>Phone, Email, DOB, Gender</span><span>Address, Emergency Contact, Joining Date</span><span>Designation, Department, PAN, Aadhaar</span><span>Bank Account, IFSC</span></div><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={onChoose}>Choose Excel File</button></div></div></div>;
}

function UserForm({ roles, editing, onClose, onSubmit }: { roles: string[]; editing: {name:string;email:string;role:string;location:string} | null; onClose: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-header"><div><h3>{editing ? "Edit System User" : "Add System User"}</h3><p>{editing ? "Update role or location scope." : "Create a user and assign a role/location scope."}</p></div><button className="close-button" onClick={onClose}>×</button></div><form onSubmit={onSubmit}><label className="field-label">Name<input name="name" defaultValue={editing?.name || ""} required placeholder="e.g. Priya HR" /></label><label className="field-label">Email<input name="email" type="email" defaultValue={editing?.email || ""} required placeholder="name@mahamart.com" /></label><label className="field-label">Role<select name="role" defaultValue={editing?.role || "Supervisor"}>{roles.map(r=><option key={r}>{r}</option>)}</select></label><label className="field-label">Location scope<select name="location" defaultValue={editing?.location || "Head Office"}><option>All Locations</option><option>Head Office</option><option>Store 1</option><option>Store 2</option></select></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">{editing ? "Save Changes" : "Create User"}</button></div></form></div></div>;
}

function EmployeeDetail({ employee, punches, onClose, onBreak }: { employee: Employee; punches: Punch[]; onClose: () => void; onBreak: (employeeId: string, remarks: string) => void }) {
  const [date, setDate] = useState(localDate());
  const [showBreak, setShowBreak] = useState(false);
  const [remarks, setRemarks] = useState("");
  const events = punches.filter((p) => p.employeeId === employee.id && p.date === date).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  const worked = calculateWorkedMinutes(employee.id, date, punches);
  const hasOpenShift = events.some(p => p.action === "Shift In") && !events.some(p => p.action === "Shift Out");
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal xl-modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-header"><div className="employee-detail-title"><div className="avatar">{employee.avatar}</div><div><h3>{employee.name}</h3><p>{employee.id} · {employee.location} · {employee.designation || "Employee"} · {employee.shiftStart || "09:00"}-{employee.shiftEnd || "18:00"}</p></div></div><button className="close-button" onClick={onClose}>×</button></div><div className="employee-detail-grid"><div className="detail-card"><strong>Working hours</strong><span>{formatHours(worked)}</span></div><div className="detail-card"><strong>Status</strong><span>{employee.late ? "Late" : employee.status}</span></div><div className="detail-card"><strong>Shift</strong><span>{employee.shiftStart || "09:00"} - {employee.shiftEnd || "18:00"}</span></div><div className="detail-card"><strong>Date</strong><span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></span></div></div><div className="modal-actions"><button className="secondary-button" disabled={!hasOpenShift} onClick={() => setShowBreak(true)}>Admin: Create Break</button></div><h4>Punches & verification</h4><div className="table-wrap"><table><thead><tr><th>ACTION</th><th>TIME</th><th>DATE</th><th>FACE</th><th>SOURCE</th></tr></thead><tbody>{events.length ? events.map((p) => <tr key={p.id}><td>{p.action}</td><td>{p.time}</td><td>{p.date}</td><td>{p.faceVerified ? "Verified · " + p.faceConfidence.toFixed(1) + "%" : "Manual web"}</td><td>{p.source}</td></tr>) : <tr><td colSpan={5}>No punches for this date.</td></tr>}</tbody></table></div><p className="privacy-note">Employees only use Shift In/Out. Breaks are created by admin; the mobile kiosk will later provide Break In for the employee.</p>{showBreak&&<div className="modal-backdrop nested" onMouseDown={()=>setShowBreak(false)}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-header"><div><h3>Create break</h3><p>Record an authorized break for {employee.name}.</p></div><button className="close-button" onClick={()=>setShowBreak(false)}>×</button></div><label className="field-label">Remarks<textarea value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Reason / permission details" /></label><div className="modal-actions"><button className="secondary-button" onClick={()=>setShowBreak(false)}>Cancel</button><button className="primary-button" onClick={()=>{onBreak(employee.id,remarks);setShowBreak(false);setRemarks("");}}>Start Break</button></div></div></div>}</div></div>;
}

function Field({ label, name, type = "text", value, onChange, required }: { label: string; name?: string; type?: string; value?: string; onChange?: (v: string) => void; required?: boolean }) {
  return <label className="field-label">{label}<input name={name} type={type} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} required={required} /></label>;
}

function SettingToggle({ label, description, enabled, onChange }: { label: string; description: string; enabled: boolean; onChange: (value: boolean) => void }) {
  return <div className="setting-row"><div><strong>{label}</strong><small>{description}</small></div><button type="button" className={enabled ? "toggle on" : "toggle"} onClick={() => onChange(!enabled)} aria-label={label}><span /></button></div>;
}

function PageFrame({ title, subtitle, action, children }: { title: string; subtitle: string; action?: ReactNode; children: ReactNode }) {
  return <><div className="page-title-row"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>{children}</>;
}

function StatCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: string; tone: string }) {
  return <div className="stat-card"><div className={"stat-icon " + tone}>{icon}</div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}

function StatusBadge({ status }: { status: string }) {
  const cls = status.toLowerCase().replaceAll(" ", "-");
  return <span className={"status-badge " + cls}><i />{status}</span>;
}
