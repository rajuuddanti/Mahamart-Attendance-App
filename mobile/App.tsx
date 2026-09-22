import 'expo-sqlite/localStorage/install';
import 'react-native-url-polyfill/auto';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabase=createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {auth:{storage:localStorage,autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}}
);

type Employee={id:string;employee_code:string;full_name:string;location_id:string|null;remote_punch_allowed:boolean};
type Punch={id:string;employee_id:string;action:string;punched_at:string;face_verified:boolean;face_confidence:number|null};
type Break={id:string;employee_id:string;started_at:string;ended_at:string|null;remarks:string|null};
type Place={id:string;name:string;latitude:number|null;longitude:number|null;geofence_radius_m:number};

function distanceMeters(lat1:number,lon1:number,lat2:number,lon2:number){
 const R=6371000, dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180;
 const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
 return 2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

export default function App(){
 const [session,setSession]=useState<any>(null);
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [employees,setEmployees]=useState<Employee[]>([]);
 const [locations,setLocations]=useState<Place[]>([]);
 const [punches,setPunches]=useState<Punch[]>([]);
 const [breaks,setBreaks]=useState<Break[]>([]);
 const [selected,setSelected]=useState<Employee|null>(null);
 const [loading,setLoading]=useState(false);
 const [punchPlace,setPunchPlace]=useState<string>('');

 useEffect(()=>{supabase.auth.getSession().then(({data})=>setSession(data.session)); const {data}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return()=>data.subscription.unsubscribe()},[]);
 useEffect(()=>{if(session) loadData()},[session]);

 async function signIn(){setLoading(true);const {error}=await supabase.auth.signInWithPassword({email,password});setLoading(false);if(error)Alert.alert('Sign in failed',error.message)}
 async function loadData(){
   const {data:es,error:e}=await supabase.from('employees').select('id,employee_code,full_name,location_id,remote_punch_allowed').eq('active',true).order('full_name');
   if(e){Alert.alert('Database error',e.message);return}
   setEmployees(es||[]);
   if(es?.[0]) setSelected(es[0]);
   const {data:ps}=await supabase.from('attendance_punches').select('id,employee_id,action,punched_at,face_verified,face_confidence').order('punched_at',{ascending:false}).limit(100);
   setPunches(ps||[]);
   const {data:bs}=await supabase.from('attendance_breaks').select('id,employee_id,started_at,ended_at,remarks').is('ended_at',null).order('started_at',{ascending:false});
   setBreaks(bs||[]);
   const {data:ls}=await supabase.from('locations').select('id,name,latitude,longitude,geofence_radius_m').order('name');
   setLocations((ls||[]) as Place[]);
 }
 const today=useMemo(()=>new Date().toISOString().slice(0,10),[]);
 const selectedDayPunches=selected? punches.filter(p=>p.employee_id===selected.id&&p.punched_at.slice(0,10)===today):[];
 const openShift=selectedDayPunches.some(p=>p.action==='Shift In')&&!selectedDayPunches.some(p=>p.action==='Shift Out');
 const openBreak=selected?breaks.find(b=>b.employee_id===selected.id&&b.ended_at===null):null;
 const selectedPlace=selected?locations.find(l=>l.id===selected.location_id):undefined;

 async function verifyGeo(){
   const perm=await Location.requestForegroundPermissionsAsync();
   if(perm.status!=='granted'){Alert.alert('Location required','Allow location access so the kiosk can record the punch location.');return null}
   const pos=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High});
   if(!selectedPlace?.latitude||!selectedPlace?.longitude){
     return {latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy||null,name:'Remote'};
   }
   const d=distanceMeters(pos.coords.latitude,pos.coords.longitude,selectedPlace.latitude,selectedPlace.longitude);
   if(d<=selectedPlace.geofence_radius_m) return {latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy||null,name:selectedPlace.name};
   if(selected?.remote_punch_allowed) return {latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy||null,name:'Remote'};
   Alert.alert('Outside allowed location',`${selected.full_name} is ${Math.round(d)}m from ${selectedPlace.name}. Remote punch is not enabled for this employee.`);
   return null;
 }

 async function punch(action:'Shift In'|'Shift Out'){
   if(!selected||!session) return;
   if(action==='Shift In'&&openShift){Alert.alert('Already checked in','Only Shift Out is available now.');return}
   if(action==='Shift Out'&&!openShift){Alert.alert('Not checked in','Only Shift In is available now.');return}
   const geo=await verifyGeo(); if(!geo) return;
   setLoading(true);
   const profile=(await supabase.from('profiles').select('company_id').eq('id',session.user.id).single()).data;
   const {error}=await supabase.from('attendance_punches').insert({company_id:profile?.company_id,employee_id:selected.id,location_id:selected.location_id,action,source:'Kiosk',created_by:session.user.id,face_verified:false,latitude:geo.latitude,longitude:geo.longitude,accuracy_m:geo.accuracy,geo_verified:true,punch_location_name:geo.name,punch_mode:selected.remote_punch_allowed?'Remote/Kiosk':'Kiosk'});
   setLoading(false);
   if(error) Alert.alert('Punch failed',error.message); else {Alert.alert('Recorded',action+' recorded for '+selected.full_name);loadData()}
 }
 async function breakIn(){
   if(!selected||!openBreak||!session)return;
   if(!(await verifyGeo()))return;
   setLoading(true);
   const {error}=await supabase.from('attendance_breaks').update({ended_at:new Date().toISOString(),ended_by:session.user.id}).eq('id',openBreak.id);
   setLoading(false);
   if(error)Alert.alert('Break In failed',error.message);else{Alert.alert('Break ended','Break In recorded for '+selected.full_name);loadData()}
 }

 if(!session) return <SafeAreaView style={s.auth}><Text style={s.logo}>Mahamart Attendance</Text><Text style={s.title}>Kiosk Login</Text><TextInput style={s.input} placeholder="Manager email" autoCapitalize="none" value={email} onChangeText={setEmail}/><TextInput style={s.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/><TouchableOpacity style={s.button} onPress={signIn} disabled={loading}><Text style={s.buttonText}>{loading?'Signing in...':'Sign in'}</Text></TouchableOpacity></SafeAreaView>;

 return <SafeAreaView style={s.app}><View style={s.header}><View><Text style={s.logo}>Mahamart</Text><Text style={s.sub}>Attendance Kiosk</Text></View><TouchableOpacity onPress={()=>supabase.auth.signOut()}><Text style={s.link}>Sign out</Text></TouchableOpacity></View><Text style={s.section}>Select employee</Text><View style={s.list}>{employees.map(e=><TouchableOpacity key={e.id} style={[s.employee,selected?.id===e.id&&s.selected]} onPress={()=>setSelected(e)}><Text style={s.empName}>{e.full_name}</Text><Text style={s.empCode}>{e.employee_code} · {locations.find(l=>l.id===e.location_id)?.name||'No location'}</Text></TouchableOpacity>)}</View>{selected&&<View style={s.actions}><Text style={s.selectedName}>{selected.full_name}</Text><Text style={s.state}>{openBreak?'Authorized break in progress':openShift?'Checked in':'Not checked in'}</Text>{openBreak?<TouchableOpacity style={s.action} onPress={breakIn} disabled={loading}><Text style={s.actionText}>Break In</Text></TouchableOpacity>:<TouchableOpacity style={s.action} onPress={()=>punch(openShift?'Shift Out':'Shift In')} disabled={loading}><Text style={s.actionText}>{openShift?'Shift Out':'Shift In'}</Text></TouchableOpacity>}</View>}<Text style={s.section}>Recent punches</Text>{punches.slice(0,8).map(p=><Text key={p.id} style={s.punch}>{p.action} · {new Date(p.punched_at).toLocaleString()}</Text>)}</SafeAreaView>
}
const s=StyleSheet.create({auth:{flex:1,padding:28,justifyContent:'center',backgroundColor:'#f6f8f9'},app:{flex:1,padding:18,backgroundColor:'#f6f8f9'},logo:{fontSize:22,fontWeight:'800',color:'#146b4d'},sub:{color:'#73808b'},title:{fontSize:28,fontWeight:'800',marginVertical:14},input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#dfe5e8',borderRadius:10,padding:13,marginVertical:7},button:{backgroundColor:'#146b4d',padding:14,borderRadius:10,marginTop:8},buttonText:{color:'#fff',textAlign:'center',fontWeight:'800'},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:18},link:{color:'#146b4d',fontWeight:'700'},section:{fontWeight:'800',fontSize:15,marginVertical:10},list:{maxHeight:260},employee:{backgroundColor:'#fff',padding:12,borderRadius:10,marginVertical:4,borderWidth:1,borderColor:'#e3e8ea'},selected:{borderColor:'#146b4d',backgroundColor:'#eaf6f0'},empName:{fontWeight:'700'},empCode:{color:'#89949d',fontSize:11,marginTop:2},actions:{backgroundColor:'#fff',padding:14,borderRadius:12,marginVertical:12},selectedName:{fontWeight:'800',fontSize:18,marginBottom:6},state:{color:'#73808b',marginBottom:10},action:{backgroundColor:'#146b4d',padding:13,borderRadius:9},actionText:{color:'#fff',textAlign:'center',fontWeight:'800'},punch:{backgroundColor:'#fff',padding:9,borderRadius:8,marginVertical:3,color:'#44515b'}});
