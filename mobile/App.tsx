import 'expo-sqlite/localStorage/install';
import 'react-native-url-polyfill/auto';
import { useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabase=createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {auth:{storage:localStorage,autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}}
);

type Employee={id:string;employee_code:string;full_name:string;location_id:string|null};
type Punch={id:string;employee_id:string;action:string;punched_at:string;face_verified:boolean;face_confidence:number|null};

export default function App(){
 const [session,setSession]=useState<any>(null);
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [employees,setEmployees]=useState<Employee[]>([]);
 const [punches,setPunches]=useState<Punch[]>([]);
 const [selected,setSelected]=useState<Employee|null>(null);
 const [loading,setLoading]=useState(false);

 useEffect(()=>{supabase.auth.getSession().then(({data})=>setSession(data.session)); const {data}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return()=>data.subscription.unsubscribe()},[]);
 useEffect(()=>{if(session) loadData()},[session]);

 async function signIn(){setLoading(true);const {error}=await supabase.auth.signInWithPassword({email,password});setLoading(false);if(error)Alert.alert('Sign in failed',error.message)}
 async function loadData(){
   const {data:es,error:e}=await supabase.from('employees').select('id,employee_code,full_name,location_id').eq('active',true).order('full_name');
   if(e){Alert.alert('Database error',e.message);return}
   setEmployees(es||[]);
   if(es?.[0]) setSelected(es[0]);
   const {data:ps}=await supabase.from('attendance_punches').select('id,employee_id,action,punched_at,face_verified,face_confidence').order('punched_at',{ascending:false}).limit(30);
   setPunches(ps||[]);
 }
 async function punch(action:string){
   if(!selected||!session) return;
   setLoading(true);
   const {error}=await supabase.from('attendance_punches').insert({company_id:(await supabase.from('profiles').select('company_id').eq('id',session.user.id).single()).data?.company_id,employee_id:selected.id,location_id:selected.location_id,action,source:'Kiosk',face_verified:false});
   setLoading(false);
   if(error) Alert.alert('Punch failed',error.message); else {Alert.alert('Recorded',action+' recorded for '+selected.full_name);loadData()}
 }
 if(!session) return <SafeAreaView style={s.auth}><Text style={s.logo}>Mahamart Attendance</Text><Text style={s.title}>Kiosk Login</Text><TextInput style={s.input} placeholder="Manager email" autoCapitalize="none" value={email} onChangeText={setEmail}/><TextInput style={s.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/><TouchableOpacity style={s.button} onPress={signIn} disabled={loading}><Text style={s.buttonText}>{loading?'Signing in...':'Sign in'}</Text></TouchableOpacity></SafeAreaView>;
 return <SafeAreaView style={s.app}><View style={s.header}><View><Text style={s.logo}>Mahamart</Text><Text style={s.sub}>Attendance Kiosk</Text></View><TouchableOpacity onPress={()=>supabase.auth.signOut()}><Text style={s.link}>Sign out</Text></TouchableOpacity></View><Text style={s.section}>Select employee for live testing</Text><View style={s.list}>{employees.map(e=><TouchableOpacity key={e.id} style={[s.employee,selected?.id===e.id&&s.selected]} onPress={()=>setSelected(e)}><Text style={s.empName}>{e.full_name}</Text><Text style={s.empCode}>{e.employee_code}</Text></TouchableOpacity>)}</View>{selected&&<View style={s.actions}><Text style={s.selectedName}>{selected.full_name}</Text><View style={s.row}><TouchableOpacity style={s.action} onPress={()=>punch('Shift In')}><Text style={s.actionText}>Shift In</Text></TouchableOpacity><TouchableOpacity style={s.action} onPress={()=>punch('Break Out')}><Text style={s.actionText}>Break Out</Text></TouchableOpacity></View><View style={s.row}><TouchableOpacity style={s.action} onPress={()=>punch('Break In')}><Text style={s.actionText}>Break In</Text></TouchableOpacity><TouchableOpacity style={s.action} onPress={()=>punch('Shift Out')}><Text style={s.actionText}>Shift Out</Text></TouchableOpacity></View></View>}<Text style={s.section}>Recent punches</Text>{punches.slice(0,8).map(p=><Text key={p.id} style={s.punch}>{p.action} · {new Date(p.punched_at).toLocaleString()}</Text>)}</SafeAreaView>
}
const s=StyleSheet.create({auth:{flex:1,padding:28,justifyContent:'center',backgroundColor:'#f6f8f9'},app:{flex:1,padding:18,backgroundColor:'#f6f8f9'},logo:{fontSize:22,fontWeight:'800',color:'#146b4d'},sub:{color:'#73808b'},title:{fontSize:28,fontWeight:'800',marginVertical:14},input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#dfe5e8',borderRadius:10,padding:13,marginVertical:7},button:{backgroundColor:'#146b4d',padding:14,borderRadius:10,marginTop:8},buttonText:{color:'#fff',textAlign:'center',fontWeight:'800'},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:18},link:{color:'#146b4d',fontWeight:'700'},section:{fontWeight:'800',fontSize:15,marginVertical:10},list:{maxHeight:260},employee:{backgroundColor:'#fff',padding:12,borderRadius:10,marginVertical:4,borderWidth:1,borderColor:'#e3e8ea'},selected:{borderColor:'#146b4d',backgroundColor:'#eaf6f0'},empName:{fontWeight:'700'},empCode:{color:'#89949d',fontSize:11,marginTop:2},actions:{backgroundColor:'#fff',padding:14,borderRadius:12,marginVertical:12},selectedName:{fontWeight:'800',fontSize:18,marginBottom:10},row:{flexDirection:'row',gap:10,marginTop:8},action:{flex:1,backgroundColor:'#146b4d',padding:13,borderRadius:9},actionText:{color:'#fff',textAlign:'center',fontWeight:'800'},punch:{backgroundColor:'#fff',padding:9,borderRadius:8,marginVertical:3,color:'#44515b'}});
