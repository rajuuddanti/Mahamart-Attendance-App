"use client";

import { useState } from "react";

const navItems = [
  { label: "Dashboard", icon: "▦" },
  { label: "Employees", icon: "♙" },
  { label: "Locations", icon: "⌖" },
  { label: "Attendance", icon: "◷" },
  { label: "Reports", icon: "▤" },
  { label: "Users & Roles", icon: "♙" },
  { label: "Settings", icon: "⚙" },
];

const attendance = [
  { name: "Rahul Kumar", id: "EMP001", location: "Head Office", time: "09:02 AM", status: "Present", avatar: "RK" },
  { name: "Suresh Babu", id: "EMP002", location: "Head Office", time: "09:11 AM", status: "On Break", avatar: "SB" },
  { name: "Priya Sharma", id: "EMP003", location: "Head Office", time: "08:58 AM", status: "Present", avatar: "PS" },
  { name: "Arun Kumar", id: "EMP004", location: "Head Office", time: "—", status: "Not Checked In", avatar: "AK" },
  { name: "Divya Reddy", id: "EMP005", location: "Head Office", time: "09:17 AM", status: "Present", avatar: "DR" },
];

const punches = [
  { employee: "Suresh Babu", action: "Break Out", time: "12:42 PM" },
  { employee: "Divya Reddy", action: "Shift In", time: "09:17 AM" },
  { employee: "Rahul Kumar", action: "Shift In", time: "09:02 AM" },
  { employee: "Priya Sharma", action: "Shift In", time: "08:58 AM" },
];

export default function Dashboard() {
  const [active, setActive] = useState("Dashboard");

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
            <button
              key={item.label}
              className={active === item.label ? "nav-item active" : "nav-item"}
              onClick={() => setActive(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="office-chip">
            <span className="online-dot" />
            <div>
              <strong>Head Office</strong>
              <small>1 location active</small>
            </div>
          </div>
          <div className="user-mini">
            <div className="avatar">RA</div>
            <div>
              <strong>Admin</strong>
              <small>Company Admin</small>
            </div>
            <span className="more">•••</span>
          </div>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <div className="eyebrow">MONDAY, SEPTEMBER 21, 2026</div>
            <h1>{active}</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notifications">♢<span className="notification-dot" /></button>
            <div className="top-user">
              <div className="avatar">RA</div>
              <div>
                <strong>Admin</strong>
                <small>Company Admin</small>
              </div>
              <span>⌄</span>
            </div>
          </div>
        </header>

        <div className="page">
          <div className="welcome-row">
            <div>
              <h2>Good morning, Admin 👋</h2>
              <p>Here&apos;s what&apos;s happening with attendance today.</p>
            </div>
            <button className="primary-button">+ Add Employee</button>
          </div>

          <section className="stats-grid">
            <StatCard label="Present" value="8" detail="+2 from yesterday" icon="✓" tone="green" />
            <StatCard label="Absent" value="2" detail="2 employees" icon="×" tone="red" />
            <StatCard label="On Break" value="1" detail="Currently away" icon="◌" tone="orange" />
            <StatCard label="Not Checked In" value="1" detail="Expected today" icon="○" tone="blue" />
          </section>

          <section className="dashboard-grid">
            <div className="panel attendance-panel">
              <div className="panel-header">
                <div>
                  <h3>Today&apos;s Attendance</h3>
                  <p>Live status across your team</p>
                </div>
                <button className="ghost-button">View all →</button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>EMPLOYEE</th>
                      <th>LOCATION</th>
                      <th>SHIFT IN</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((person) => (
                      <tr key={person.id}>
                        <td>
                          <div className="employee-cell">
                            <div className="avatar small">{person.avatar}</div>
                            <div><strong>{person.name}</strong><small>{person.id}</small></div>
                          </div>
                        </td>
                        <td>{person.location}</td>
                        <td>{person.time}</td>
                        <td><StatusBadge status={person.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h3>Recent Activity</h3>
                  <p>Latest attendance punches</p>
                </div>
              </div>
              <div className="activity-list">
                {punches.map((punch, index) => (
                  <div className="activity" key={punch.employee + punch.time}>
                    <div className={index === 0 ? "activity-dot orange" : "activity-dot"} />
                    <div className="activity-body">
                      <strong>{punch.employee}</strong>
                      <span>{punch.action}</span>
                    </div>
                    <time>{punch.time}</time>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="quick-row">
            <div className="quick-card">
              <span className="quick-icon">♙</span>
              <div><strong>12 Employees</strong><small>Manage your team</small></div>
              <span className="arrow">→</span>
            </div>
            <div className="quick-card">
              <span className="quick-icon">⌖</span>
              <div><strong>1 Location</strong><small>Head Office</small></div>
              <span className="arrow">→</span>
            </div>
            <div className="quick-card">
              <span className="quick-icon">▤</span>
              <div><strong>Reports</strong><small>View attendance reports</small></div>
              <span className="arrow">→</span>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: string; tone: string }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-badge ${cls}`}><i />{status}</span>;
}