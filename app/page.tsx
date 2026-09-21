"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Employee = {
  id: string;
  name: string;
  location: string;
  shiftIn: string;
  status: "Present" | "On Break" | "Not Checked In" | "Absent";
  avatar: string;
};

type Punch = {
  employee: string;
  action: string;
  time: string;
};

const navItems = [
  { label: "Dashboard", icon: "▦" },
  { label: "Employees", icon: "♙" },
  { label: "Locations", icon: "⌖" },
  { label: "Attendance", icon: "◷" },
  { label: "Reports", icon: "▤" },
  { label: "Users & Roles", icon: "♙" },
  { label: "Settings", icon: "⚙" },
];

const initialEmployees: Employee[] = [
  { name: "Rahul Kumar", id: "EMP001", location: "Head Office", shiftIn: "09:02 AM", status: "Present", avatar: "RK" },
  { name: "Suresh Babu", id: "EMP002", location: "Head Office", shiftIn: "09:11 AM", status: "On Break", avatar: "SB" },
  { name: "Priya Sharma", id: "EMP003", location: "Head Office", shiftIn: "08:58 AM", status: "Present", avatar: "PS" },
  { name: "Arun Kumar", id: "EMP004", location: "Head Office", shiftIn: "—", status: "Not Checked In", avatar: "AK" },
  { name: "Divya Reddy", id: "EMP005", location: "Head Office", shiftIn: "09:17 AM", status: "Present", avatar: "DR" },
  { name: "Kiran Rao", id: "EMP006", location: "Head Office", shiftIn: "09:06 AM", status: "Present", avatar: "KR" },
  { name: "Meena Devi", id: "EMP007", location: "Head Office", shiftIn: "09:20 AM", status: "Present", avatar: "MD" },
  { name: "Vikram Singh", id: "EMP008", location: "Head Office", shiftIn: "09:14 AM", status: "Present", avatar: "VS" },
  { name: "Anita Reddy", id: "EMP009", location: "Head Office", shiftIn: "—", status: "Absent", avatar: "AR" },
  { name: "Ravi Teja", id: "EMP010", location: "Head Office", shiftIn: "09:28 AM", status: "Present", avatar: "RT" },
  { name: "Lakshmi Rao", id: "EMP011", location: "Head Office", shiftIn: "09:04 AM", status: "Present", avatar: "LR" },
  { name: "Manoj Kumar", id: "EMP012", location: "Head Office", shiftIn: "—", status: "Not Checked In", avatar: "MK" },
];

const initialPunches: Punch[] = [
  { employee: "Suresh Babu", action: "Break Out", time: "12:42 PM" },
  { employee: "Divya Reddy", action: "Shift In", time: "09:17 AM" },
  { employee: "Rahul Kumar", action: "Shift In", time: "09:02 AM" },
  { employee: "Priya Sharma", action: "Shift In", time: "08:58 AM" },
];

function todayLabel() {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", month: "long", day: "2-digit", year: "numeric" }).format(new Date()).toUpperCase();
}

function nowLabel() {
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date());
}

export default function Dashboard() {
  const [active, setActive] = useState("Dashboard");
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [punches, setPunches] = useState<Punch[]>(initialPunches);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const savedEmployees = localStorage.getItem("mahamart-employees");
    const savedPunches = localStorage.getItem("mahamart-punches");
    if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
    if (savedPunches) setPunches(JSON.parse(savedPunches));
  }, []);

  useEffect(() => {
    localStorage.setItem("mahamart-employees", JSON.stringify(employees));
    localStorage.setItem("mahamart-punches", JSON.stringify(punches));
  }, [employees, punches]);

  const stats = useMemo(() => ({
    present: employees.filter((e) => e.status === "Present").length,
    absent: employees.filter((e) => e.status === "Absent").length,
    break: employees.filter((e) => e.status === "On Break").length,
    notIn: employees.filter((e) => e.status === "Not Checked In").length,
  }), [employees]);

  const filteredEmployees = employees.filter((employee) =>
    (employee.name + " " + employee.id + " " + employee.location).toLowerCase().includes(search.toLowerCase())
  );

  function addEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const location = String(form.get("location") || "Head Office").trim();
    if (!name) return;
    const id = "EMP" + String(employees.length + 1).padStart(3, "0");
    const avatar = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
    setEmployees((current) => [...current, { id, name, location, shiftIn: "—", status: "Not Checked In", avatar }]);
    setShowAdd(false);
  }

  function punchEmployee(employeeId: string, action: "Shift In" | "Shift Out" | "Break Out" | "Break In") {
    const employee = employees.find((item) => item.id === employeeId);
    if (!employee) return;
    const time = nowLabel();
    let status: Employee["status"] = employee.status;
    if (action === "Shift In") status = "Present";
    if (action === "Shift Out") status = "Not Checked In";
    if (action === "Break Out") status = "On Break";
    if (action === "Break In") status = "Present";

    setEmployees((current) => current.map((item) =>
      item.id === employeeId
        ? { ...item, status, shiftIn: action === "Shift In" ? time : item.shiftIn }
        : item
    ));
    setPunches((current) => [{ employee: employee.name, action, time }, ...current].slice(0, 12));
  }

  function goTo(label: string) {
    setActive(label);
    setSearch("");
    setShowNotifications(false);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <div className="brand-name">Mahamart</div>
            <div className="brand-subtitle">Attendance</div>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-section">MAIN MENU</div>
          {navItems.map((item) => (
            <button key={item.label} className={active === item.label ? "nav-item active" : "nav-item"} onClick={() => goTo(item.label)}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="office-chip"><span className="online-dot" /><div><strong>Head Office</strong><small>1 location active</small></div></div>
          <div className="user-mini"><div className="avatar">RA</div><div><strong>Admin</strong><small>Company Admin</small></div><span className="more">•••</span></div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div><div className="eyebrow">{todayLabel()}</div><h1>{active}</h1></div>
          <div className="top-actions">
            <div className="notification-wrap">
              <button className="icon-button" aria-label="Notifications" onClick={() => setShowNotifications((value) => !value)}>♢<span className="notification-dot" /></button>
              {showNotifications && <div className="notification-pop"><strong>Notifications</strong><span>Attendance dashboard is live.</span><span>{stats.notIn} employees have not checked in.</span></div>}
            </div>
            <div className="top-user"><div className="avatar">RA</div><div><strong>Admin</strong><small>Company Admin</small></div><span>⌄</span></div>
          </div>
        </header>

        <div className="page">
          {active === "Dashboard" && (
            <DashboardPage stats={stats} employees={employees} punches={punches} onAdd={() => setShowAdd(true)} onGo={goTo} onPunch={punchEmployee} />
          )}

          {active === "Employees" && (
            <PageFrame title="Employees" subtitle={employees.length + " employees in your organization"} action={<button className="primary-button" onClick={() => setShowAdd(true)}>+ Add Employee</button>}>
              <div className="toolbar"><input className="search-input" placeholder="Search name, ID or location..." value={search} onChange={(e) => setSearch(e.target.value)} /><span className="toolbar-count">{filteredEmployees.length} shown</span></div>
              <div className="panel"><div className="table-wrap"><table><thead><tr><th>EMPLOYEE</th><th>ID</th><th>LOCATION</th><th>SHIFT IN</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>
                {filteredEmployees.map((person) => <tr key={person.id}><td><div className="employee-cell"><div className="avatar small">{person.avatar}</div><div><strong>{person.name}</strong><small>{person.id}</small></div></div></td><td>{person.id}</td><td>{person.location}</td><td>{person.shiftIn}</td><td><StatusBadge status={person.status} /></td><td><button className="table-action" onClick={() => punchEmployee(person.id, person.status === "On Break" ? "Break In" : "Shift In")}>{person.status === "On Break" ? "Break In" : "Shift In"}</button></td></tr>)}
              </tbody></table></div></div>
            </PageFrame>
          )}

          {active === "Locations" && <LocationsPage onAdd={() => alert("Location creation will be connected to Supabase next.")} />}
          {active === "Attendance" && <AttendancePage employees={employees} punches={punches} onPunch={punchEmployee} />}
          {active === "Reports" && <ReportsPage employees={employees} />}
          {active === "Users & Roles" && <UsersPage />}
          {active === "Settings" && <SettingsPage />}
        </div>
      </section>

      {showAdd && <div className="modal-backdrop" onMouseDown={() => setShowAdd(false)}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-header"><div><h3>Add Employee</h3><p>Create an employee record for attendance.</p></div><button className="close-button" onClick={() => setShowAdd(false)}>×</button></div><form onSubmit={addEmployee}><label>Employee name<input name="name" required autoFocus placeholder="e.g. Ramesh Kumar" /></label><label>Location<select name="location"><option>Head Office</option><option>Store 1</option><option>Store 2</option></select></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button><button type="submit" className="primary-button">Create Employee</button></div></form></div></div>}
    </main>
  );
}

function DashboardPage({ stats, employees, punches, onAdd, onGo, onPunch }: { stats: { present: number; absent: number; break: number; notIn: number }; employees: Employee[]; punches: Punch[]; onAdd: () => void; onGo: (label: string) => void; onPunch: (id: string, action: "Shift In" | "Shift Out" | "Break Out" | "Break In") => void }) {
  return <>
    <div className="welcome-row"><div><h2>Good morning, Admin 👋</h2><p>Here&apos;s what&apos;s happening with attendance today.</p></div><button className="primary-button" onClick={onAdd}>+ Add Employee</button></div>
    <section className="stats-grid"><StatCard label="Present" value={String(stats.present)} detail="Currently working" icon="✓" tone="green" /><StatCard label="Absent" value={String(stats.absent)} detail="Marked absent" icon="×" tone="red" /><StatCard label="On Break" value={String(stats.break)} detail="Currently away" icon="◌" tone="orange" /><StatCard label="Not Checked In" value={String(stats.notIn)} detail="Expected today" icon="○" tone="blue" /></section>
    <section className="dashboard-grid">
      <div className="panel attendance-panel"><div className="panel-header"><div><h3>Today&apos;s Attendance</h3><p>Live status across your team</p></div><button className="ghost-button" onClick={() => onGo("Attendance")}>View all →</button></div><div className="table-wrap"><table><thead><tr><th>EMPLOYEE</th><th>LOCATION</th><th>SHIFT IN</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>
        {employees.slice(0, 7).map((person) => <tr key={person.id}><td><div className="employee-cell"><div className="avatar small">{person.avatar}</div><div><strong>{person.name}</strong><small>{person.id}</small></div></div></td><td>{person.location}</td><td>{person.shiftIn}</td><td><StatusBadge status={person.status} /></td><td><button className="table-action" onClick={() => onPunch(person.id, person.status === "On Break" ? "Break In" : person.status === "Not Checked In" ? "Shift In" : "Break Out")}>{person.status === "On Break" ? "Break In" : person.status === "Not Checked In" ? "Shift In" : "Break Out"}</button></td></tr>)}
      </tbody></table></div></div>
      <div className="panel"><div className="panel-header"><div><h3>Recent Activity</h3><p>Latest attendance punches</p></div></div><div className="activity-list">{punches.slice(0, 6).map((punch, index) => <div className="activity" key={punch.employee + punch.time + index}><div className={index === 0 ? "activity-dot orange" : "activity-dot"} /><div className="activity-body"><strong>{punch.employee}</strong><span>{punch.action}</span></div><time>{punch.time}</time></div>)}</div></div>
    </section>
    <section className="quick-row"><button className="quick-card" onClick={() => onGo("Employees")}><span className="quick-icon">♙</span><div><strong>{employees.length} Employees</strong><small>Manage your team</small></div><span className="arrow">→</span></button><button className="quick-card" onClick={() => onGo("Locations")}><span className="quick-icon">⌖</span><div><strong>1 Location</strong><small>Head Office</small></div><span className="arrow">→</span></button><button className="quick-card" onClick={() => onGo("Reports")}><span className="quick-icon">▤</span><div><strong>Reports</strong><small>View attendance reports</small></div><span className="arrow">→</span></button></section>
  </>;
}

function PageFrame({ title, subtitle, action, children }: { title: string; subtitle: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <><div className="page-title-row"><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</div>{children}</>;
}

function LocationsPage({ onAdd }: { onAdd: () => void }) {
  return <PageFrame title="Locations" subtitle="Manage stores and office attendance points" action={<button className="primary-button" onClick={onAdd}>+ Add Location</button>}><div className="location-grid"><div className="location-card"><div className="location-top"><span className="location-icon">⌖</span><StatusBadge status="Present" /></div><h3>Head Office</h3><p>Company headquarters · Hyderabad</p><div className="location-meta"><span><strong>12</strong> Employees</span><span><strong>1</strong> Kiosk</span></div></div></div></PageFrame>;
}

function AttendancePage({ employees, punches, onPunch }: { employees: Employee[]; punches: Punch[]; onPunch: (id: string, action: "Shift In" | "Shift Out" | "Break Out" | "Break In") => void }) {
  return <PageFrame title="Attendance" subtitle="View and manage today&apos;s attendance"><div className="attendance-layout"><div className="panel"><div className="panel-header"><div><h3>Today&apos;s Attendance</h3><p>Attendance actions are recorded instantly in this prototype.</p></div></div><div className="table-wrap"><table><thead><tr><th>EMPLOYEE</th><th>STATUS</th><th>SHIFT IN</th><th>ACTIONS</th></tr></thead><tbody>{employees.map((person) => <tr key={person.id}><td><div className="employee-cell"><div className="avatar small">{person.avatar}</div><div><strong>{person.name}</strong><small>{person.id}</small></div></div></td><td><StatusBadge status={person.status} /></td><td>{person.shiftIn}</td><td><div className="action-row"><button className="table-action\" onClick={() => onPunch(person.id, "Shift In")}>Shift In</button><button className="table-action\" onClick={() => onPunch(person.id, "Break Out")}>Break Out</button><button className="table-action\" onClick={() => onPunch(person.id, "Break In")}>Break In</button><button className="table-action\" onClick={() => onPunch(person.id, "Shift Out")}>Shift Out</button></div></td></tr>)}</tbody></table></div></div><div className="panel"><div className="panel-header"><div><h3>Punch Log</h3><p>Latest events</p></div></div><div className="activity-list">{punches.map((punch, index) => <div className="activity" key={punch.employee + punch.time + index}><div className="activity-dot" /><div className="activity-body"><strong>{punch.employee}</strong><span>{punch.action}</span></div><time>{punch.time}</time></div>)}</div></div></div></PageFrame>;
}

function ReportsPage({ employees }: { employees: Employee[] }) {
  const present = employees.filter((e) => e.status === "Present").length;
  const breaks = employees.filter((e) => e.status === "On Break").length;
  return <PageFrame title="Reports" subtitle="Attendance summaries and exports"><div className="report-grid"><div className="report-card"><span>Present today</span><strong>{present}</strong><small>Employees currently working</small></div><div className="report-card"><span>On break</span><strong>{breaks}</strong><small>Employees currently away</small></div><div className="report-card"><span>Total employees</span><strong>{employees.length}</strong><small>Active employee records</small></div></div><div className="panel report-panel"><div className="panel-header"><div><h3>Attendance report</h3><p>Export will be connected to Excel/CSV after Supabase is wired.</p></div><button className="secondary-button" onClick={() => alert("Export is the next backend step.")}>Export Report</button></div><div className="report-note">This prototype keeps attendance data in your browser so we can validate the workflow before connecting the real database.</div></div></PageFrame>;
}

function UsersPage() {
  const [users, setUsers] = useState([{ name: "Raju", email: "admin@mahamart.com", role: "Company Admin", active: true }, { name: "Store Manager", email: "manager@mahamart.com", role: "Store Manager", active: true }]);
  return <PageFrame title="Users & Roles" subtitle="Control who can access the admin system" action={<button className="primary-button" onClick={() => setUsers((u) => [...u, { name: "New User", email: "new@mahamart.com", role: "Supervisor", active: true }])}>+ Add User</button>}><div className="panel"><div className="table-wrap"><table><thead><tr><th>USER</th><th>EMAIL</th><th>ROLE</th><th>STATUS</th></tr></thead><tbody>{users.map((user) => <tr key={user.email}><td><strong>{user.name}</strong></td><td>{user.email}</td><td><span className="role-pill">{user.role}</span></td><td><StatusBadge status={user.active ? "Present" : "Absent"} /></td></tr>)}</tbody></table></div></div></PageFrame>;
}

function SettingsPage() {
  const [enabled, setEnabled] = useState(true);
  const [realtime, setRealtime] = useState(true);
  return <PageFrame title="Settings" subtitle="Configure attendance behavior and application preferences"><div className="settings-grid"><div className="settings-card"><h3>Attendance Rules</h3><SettingToggle label="Allow multiple breaks" description="Employees can record any number of break out/in events." enabled={enabled} onChange={setEnabled} /><SettingToggle label="Realtime dashboard" description="Refresh live attendance activity without manual reload." enabled={realtime} onChange={setRealtime} /></div><div className="settings-card"><h3>Future Integrations</h3><div className="integration-row"><span>Supabase database</span><span className="coming">Next step</span></div><div className="integration-row"><span>Android kiosk + face recognition</span><span className="coming">Later</span></div><div className="integration-row"><span>Excel import / export</span><span className="coming">Later</span></div></div></div></PageFrame>;
}

function SettingToggle({ label, description, enabled, onChange }: { label: string; description: string; enabled: boolean; onChange: (value: boolean) => void }) {
  return <div className="setting-row"><div><strong>{label}</strong><small>{description}</small></div><button className={enabled ? "toggle on" : "toggle"} onClick={() => onChange(!enabled)} aria-label={label}><span /></button></div>;
}

function StatCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: string; tone: string }) {
  return <div className="stat-card"><div className={"stat-icon " + tone}>{icon}</div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}

function StatusBadge({ status }: { status: string }) {
  const cls = status.toLowerCase().replaceAll(" ", "-");
  return <span className={"status-badge " + cls}><i />{status}</span>;
}
