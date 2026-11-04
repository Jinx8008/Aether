"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Html, useGLTF, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as ControlsType } from "three-stdlib";
import { orbitalPosition, orbitalPath, spinDays, tiltDegrees } from "./orbitalMath";
export type Planet={name:string;radius:number;orbit:number;speed:number;color:string;diameter:string;period:string;fact:string};
export const planets:Planet[]=[
{name:"Mercury",radius:.3,orbit:5.5,speed:4.15,color:"#a99e94",diameter:"4,879 km",period:"88 days",fact:"The smallest planet in our solar system."},
{name:"Venus",radius:.55,orbit:8,speed:1.62,color:"#e8bd87",diameter:"12,104 km",period:"225 days",fact:"The hottest planet, wrapped in dense clouds."},
{name:"Earth",radius:.62,orbit:11,speed:1,color:"#4c9bc9",diameter:"12,742 km",period:"365 days",fact:"Our ocean-covered home and the only known world with life."},
{name:"Mars",radius:.45,orbit:14,speed:.53,color:"#b96445",diameter:"6,779 km",period:"687 days",fact:"A rusty world with the tallest volcano in the solar system."},
{name:"Jupiter",radius:1.5,orbit:19,speed:.084,color:"#cba17e",diameter:"139,820 km",period:"11.9 years",fact:"The largest planet, famous for its Great Red Spot."},
{name:"Saturn",radius:1.25,orbit:25,speed:.034,color:"#dbc79a",diameter:"116,460 km",period:"29.4 years",fact:"A majestic gas giant surrounded by icy rings."},
{name:"Uranus",radius:.95,orbit:31,speed:.012,color:"#8ed5da",diameter:"50,724 km",period:"84 years",fact:"An ice giant that spins almost on its side."},
{name:"Neptune",radius:.9,orbit:37,speed:.006,color:"#416ec7",diameter:"49,244 km",period:"165 years",fact:"A distant blue ice giant with powerful winds."}];
const surfaceFiles: Record<string,string> = {
 mercury:"Material.002_diffuse.jpeg",venus:"Material.002_diffuse.jpeg",
 earth:"Material.002_diffuse.jpeg",mars:"Material.002_diffuse.jpeg",
 jupiter:"Material.002_diffuse.jpeg",saturn:"Material.002_diffuse.jpeg",
 uranus:"Material.002_baseColor.jpeg",neptune:"Material.002_diffuse.jpeg",
 moon:"Material.002_diffuse.jpeg"
};
function Model({name,radius}:{name:string;radius:number}){
 const {scene}=useGLTF("/models/"+name.toLowerCase()+"/scene.gltf");
 const texture=useTexture("/models/"+name.toLowerCase()+"/textures/"+(surfaceFiles[name.toLowerCase()]??"material_baseColor.jpeg"));
 const copy=useMemo(()=>{
  const root=scene.clone(true);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.flipY=false;
  root.traverse(obj=>{
   if(!(obj instanceof THREE.Mesh))return;
   const isRing=name.toLowerCase()==="saturn" && /ring/i.test(obj.name);
   if(isRing)return;
   const old=obj.material as THREE.MeshStandardMaterial;
   const mat=new THREE.MeshStandardMaterial({
    map:texture,color:0xffffff,roughness:1,metalness:0,
    emissive:new THREE.Color("#ffffff"),emissiveMap:texture,emissiveIntensity:name.toLowerCase()==="sun"?.9:.12,
    side:old?.side??THREE.FrontSide
   });
   obj.material=mat;
  });
  const bounds=new THREE.Box3().setFromObject(root);
  const size=bounds.getSize(new THREE.Vector3());
  const center=bounds.getCenter(new THREE.Vector3());
  root.position.sub(center);
  const wrapper=new THREE.Group();
  wrapper.add(root);
  wrapper.scale.setScalar((radius*2)/Math.max(size.x,size.y,size.z,.001));
  return wrapper;
 },[scene,radius,name,texture]);
 return <primitive object={copy}/>;
}
function Timekeeper({epoch,paused,speed,mode,onTimeChange}:{epoch:React.RefObject<number>;paused:boolean;speed:number;mode:"real"|"cinematic";onTimeChange:(ms:number)=>void}){
 const elapsed=useRef(0);useFrame((_,dt)=>{if(!paused)epoch.current+=Math.min(dt,.1)*1000*speed*(mode==="real"?1:86400);elapsed.current+=dt;if(elapsed.current>.5){elapsed.current=0;onTimeChange(epoch.current)}});return null;
}
function Moon({epoch}:{epoch:React.RefObject<number>}){
 const group=useRef<THREE.Group>(null);
 useFrame(()=>{if(!group.current)return;const phase=(epoch.current-Date.UTC(2000,0,1,12))/86400000/27.321661*Math.PI*2;group.current.position.set(Math.cos(phase)*1.25,Math.sin(phase*.5)*.08,Math.sin(phase)*1.25);group.current.rotation.y=phase});
 return <group ref={group}><Suspense fallback={<mesh><sphereGeometry args={[.17,16,12]}/><meshStandardMaterial color="#b7b7b7"/></mesh>}><Model name="moon" radius={.17}/></Suspense><Html center position={[0,.38,0]} distanceFactor={32} style={{pointerEvents:"none"}}><span className="aether-planet-label">MOON</span></Html></group>;
}
function PlanetBody({p,epoch,showOrbits,onSelect,positions}:{p:Planet;epoch:React.RefObject<number>;showOrbits:boolean;onSelect:(p:Planet)=>void;positions:React.RefObject<Map<string,THREE.Vector3>>}){
 const group=useRef<THREE.Group>(null),spin=useRef<THREE.Group>(null);
 const path=useMemo(()=>new THREE.BufferGeometry().setFromPoints(orbitalPath(p.name,p.orbit,Date.now())),[p.name,p.orbit]);
 useEffect(()=>()=>path.dispose(),[path]);
 useFrame(()=>{const pos=orbitalPosition(p.name,epoch.current,p.orbit);group.current?.position.copy(pos);if(spin.current)spin.current.rotation.y=(epoch.current-Date.UTC(2000,0,1,12))/86400000/Math.abs(spinDays[p.name])*Math.PI*2;positions.current.set(p.name,pos)});
 return <>{showOrbits&&<lineLoop geometry={path}><lineBasicMaterial color="#426078" transparent opacity={.27}/></lineLoop>}<group ref={group}>
 <group rotation={[0,0,tiltDegrees[p.name]*Math.PI/180]}><group ref={spin}><Suspense fallback={<mesh><sphereGeometry args={[p.radius,32,24]}/><meshStandardMaterial color={p.color}/></mesh>}><Model name={p.name} radius={p.radius}/></Suspense></group></group>
 <mesh onClick={e=>{e.stopPropagation();onSelect(p)}}><sphereGeometry args={[p.radius*1.18,24,16]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
 {p.name==="Earth"&&<Moon epoch={epoch}/>}
 <Html center position={[0,p.radius+.65,0]} distanceFactor={32} style={{pointerEvents:"none"}}><span className="aether-planet-label">{p.name.toUpperCase()}</span></Html></group></>;
}
function Camera({selected,reset,positions}:{selected:Planet|null;reset:number;positions:React.RefObject<Map<string,THREE.Vector3>>}){
 const controls=useRef<ControlsType>(null);const {camera}=useThree();const previous=useRef<THREE.Vector3|null>(null);
 useFrame((_,dt)=>{if(!selected||!controls.current)return;const pos=positions.current.get(selected.name);if(!pos)return;const target=controls.current.target;if(!previous.current){previous.current=pos.clone();camera.position.copy(pos.clone().add(new THREE.Vector3(selected.radius*5+2,selected.radius*3+2,selected.radius*7+3)));target.copy(pos)}else{const delta=pos.clone().sub(previous.current);camera.position.add(delta);target.add(delta);previous.current.copy(pos)}controls.current.update()});
 useEffect(()=>{previous.current=null;if(selected)return;const target=new THREE.Vector3(),desired=new THREE.Vector3(0,38,69),start=performance.now(),from=camera.position.clone(),fromTarget=controls.current?.target.clone()??target;let raf=0;function tick(t:number){const u=Math.min((t-start)/900,1),e=1-(1-u)**3;camera.position.lerpVectors(from,desired,e);controls.current?.target.lerpVectors(fromTarget,target,e);controls.current?.update();if(u<1)raf=requestAnimationFrame(tick)}raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)},[selected,reset,camera]);return <OrbitControls ref={controls} enableDamping minDistance={.7} maxDistance={180}/>;
}
export default function SolarSystem({selected,onSelect,paused,speed,showOrbits,reset,mode,onTimeChange,resetTime}:{selected:Planet|null;onSelect:(p:Planet)=>void;paused:boolean;speed:number;showOrbits:boolean;reset:number;mode:"real"|"cinematic";onTimeChange:(ms:number)=>void;resetTime:number}){
 const positions=useRef(new Map<string,THREE.Vector3>()),epoch=useRef(Date.now());
 useEffect(()=>{epoch.current=Date.now();onTimeChange(epoch.current)},[resetTime,onTimeChange]);
 return <div className="absolute inset-0"><Canvas dpr={[1,1.5]} camera={{position:[0,38,69],fov:55}}><color attach="background" args={["#030712"]}/><ambientLight intensity={.7}/><pointLight position={[0,0,0]} intensity={1800} color="#ffe2a7"/><Stars radius={180} depth={90} count={3500} factor={4} fade/>
 <Suspense fallback={<mesh><sphereGeometry args={[2.7,48,32]}/><meshBasicMaterial color="#ffbf62"/></mesh>}><Model name="sun" radius={2.7}/></Suspense>
 <Timekeeper epoch={epoch} paused={paused} speed={speed} mode={mode} onTimeChange={onTimeChange}/>{planets.map(p=><PlanetBody key={p.name} p={p} epoch={epoch} showOrbits={showOrbits} onSelect={onSelect} positions={positions}/>)}<Camera selected={selected} reset={reset} positions={positions}/></Canvas></div>;
}
