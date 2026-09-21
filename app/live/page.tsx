"use client";

import "./live.css";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Employee={id:string;employee_code:string;full_name:string;location_id:string|null;phone?:string;email?:string;designation?:string;department?:string;active:boolean};
type Location={id:string;name:string};
type Punch={id:string;employee_id:string;action:string;punched_at:string;source:string;face_verified:boolean;face_confidence:number|null};

const actions=["Shift In","Break Out","Break In","Shift Out"];

export default function LiveAttendance(){
 const [session,setSession]=useState<any>(null);
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [employees,setEmployees]=useState<Employee[]>([]);
 const [locations,setLocations]=useState<Location[]>([]);
 const [punches,setPunches]=useState<Punch[]>([]);
 const [profile,setProfile]=useState<any>(null);
 const [locationFilter,setLocationFilter]=useState("all");
 const [selectedDate,setSelectedDate]=useState(new Date().toISOString().slice(0,10));
 const [search,setSearch]=useState("");
 const [selected,setSelected]=useState<Employee|null>(null);
 const [loading,setLoading]=useState(false);
 const [message,setMessage]=useState("");

 useEffect(()=>{supabase.auth.getSession().then(({data})=>setSession(data.session));const {data}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>data.subscription.unsubscribe()},[]);
 useEffect(()=>{if(session) load()},[session]);
 useEffect(()=>{
   if(!session)return;
   const channel=supabase.channel("live-attendance").on("postgres_changes",{event:"*",schema:"public",table:"attendance_punches"},()=>loadPunches()).subscribe();
   return()=>{supabase.removeChannel(channel)};
 },[session]);

 async function load(){
   setLoading(true);
   const {data:p}=await supabase.from("profiles").select("company_id,location_id,full_name,role_id").eq("id",session.user.id).single();
   if(p){setProfile(p)}
   const {data:l,error:le}=await supabase.from("locations").select("id,name").order("name");
   if(le){setMessage(le.message);setLoading(false);return}
   setLocations(l||[]);
   await loadEmployees();
   await loadPunches();
   setLoading(false);
 }
 async function loadEmployees(){
   const {data,error}=await supabase.from("employees").select("id,employee_code,full_name,location_id,phone,email,designation,department,active").eq("active",true).order("full_name");
   if(error)setMessage(error.message); else setEmployees(data||[]);
 }
 async function loadPunches(){
   const {data,error}=await supabase.from("attendance_punches").select("id,employee_id,action,punched_at,source,face_verified,face_confidence").order("punched_at",{ascending:false}).limit(500);
   if(error)setMessage(error.message); else setPunches(data||[]);
 }
 async function signIn(e:FormEvent){e.preventDefault();setLoading(true);const {error}=await supabase.auth.signInWithPassword({email,password});setLoading(false);if(error)setMessage(error.message)}
 async function punch(employee:Employee,action:string){
   if(!profile?.company_id)return;
   setLoading(true);setMessage("");
   const {error}=await supabase.from("attendance_punches").insert({company_id:profile.company_id,employee_id:employee.id,location_id:employee.location_id,action,source:"Web Admin",created_by:session.user.id,face_verified:false});
   setLoading(false);if(error)setMessage(error.message);else setMessage(action+" recorded for "+employee.full_name);
 }
 const visibleEmployees=useMemo(()=>employees.filter(e=>(locationFilter==="all"||e.location_id===locationFilter)&&(e.full_name+" "+e.employee_code).toLowerCase().includes(search.toLowerCase())),[employees,locationFilter,search]);
 const dayPunches=punches.filter(p=>p.punched_at.slice(0,10)===selectedDate);
 const nameById=useMemo(()=>new Map(employees.map(e=>[e.id,e.full_name])),[employees]);
 if(!session)return <div className="live-shell"><div className="live-card auth-card"><div className="brand-mark live-mark">M</div><h1>Mahamart Live Attendance</h1><p>Sign in with a Supabase user to test the real database.</p><form onSubmit={signIn}><input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/><input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/><button className="live-primary" disabled={loading}>{loading?"Signing in...":"Sign in"}</button></form>{message&&<div className="live-error">{message}</div>}</div></div>;
 return <div className="live-shell"><header className="live-header"><div><div className="live-brand">Mahamart Attendance</div><small>LIVE DATABASE TEST</small></div><div className="live-user">{profile?.full_name||session.user.email}<button onClick={()=>supabase.auth.signOut()}>Sign out</button></div></header><main className="live-main"><div className="live-toolbar"><div><h1>Live Attendance</h1><p>Supabase database + realtime punch sync</p></div><div className="live-filters"><input placeholder="Search employee" value={search} onChange={e=>setSearch(e.target.value)}/><select value={locationFilter} onChange={e=>setLocationFilter(e.target.value)}><option value="all">All locations</option>{locations.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select><input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)}/></div></div>{message&&<div className="live-message">{message}</div>}<section className="live-grid"><div className="live-card"><div className="live-card-head"><div><h2>Employees</h2><span>{visibleEmployees.length} shown</span></div></div><div className="live-employees">{visibleEmployees.map(e=><div className="live-employee" key={e.id}><div><strong>{e.full_name}</strong><small>{e.employee_code} · {locations.find(l=>l.id===e.location_id)?.name||"No location"}</small></div><div className="live-actions">{actions.map(a=><button key={a} onClick={()=>punch(e,a)} disabled={loading}>{a}</button>)}</div></div>)}{!visibleEmployees.length&&<div className="empty">No employees. Add/import them from the main prototype or Supabase.</div>}</div></div><div className="live-card"><div className="live-card-head"><div><h2>Live punch feed</h2><span>{dayPunches.length} punches on {selectedDate}</span></div><span className="realtime-dot">● Realtime</span></div><div className="live-feed">{dayPunches.map(p=><div className="live-feed-row" key={p.id}><span className="feed-dot"/><div><strong>{nameById.get(p.employee_id)||"Employee"}</strong><small>{p.action} · {p.source}{p.face_verified?" · Face verified":""}</small></div><time>{new Date(p.punched_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</time></div>)}</div></div></section><div className="live-note">This page is for live database testing. Face recognition is not enabled yet; kiosk punches are currently manual test actions.</div></main></div>
}
