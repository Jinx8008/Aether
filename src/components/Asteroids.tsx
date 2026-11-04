"use client";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type AsteroidKind = "asteroid" | "met01_meteor" | "meteorite";
const kinds: AsteroidKind[] = ["asteroid","met01_meteor","meteorite"];
const TAU=Math.PI*2;
function rand(seed:number){const x=Math.sin(seed*127.1+78.233)*43758.5453;return x-Math.floor(x);}
type Rock={kind:AsteroidKind;radius:number;phase:number;incline:number;node:number;ecc:number;size:number;spin:number;tilt:number;period:number};
function createRocks():Rock[]{
 const result:Rock[]=[];
 // Illustrative orbital populations, not measured individual asteroid ephemerides.
 // A sparse cinematic sample across inner, main-belt, and outer regions, not an accurate population census.
 for(let i=0;i<54;i++){
  const r=rand(i+4),belt=i<16,near=i>=16&&i<36,trojan=i>=36&&i<44;
  const radius=belt?15.6+r*2.1:near?7.8+r*7.2:trojan?18.1+r*2.1:21+r*15;
  const phase=trojan?(i%2?Math.PI/3:-Math.PI/3)+rand(i+45)*.5:rand(i+11)*TAU;
  result.push({
   kind:kinds[i%3],radius,phase,
   incline:(rand(i+17)-.5)*(belt?.26:near?.5:.35),
   node:rand(i+23)*TAU,ecc:rand(i+29)*(near?.24:.12),
   size:(.045+Math.pow(rand(i+37),3)*.22)*(i%13===0?1.6:1),
   spin:.2+rand(i+41)*.8,tilt:rand(i+43)*TAU,
   period:Math.pow(radius/11,1.5)*365.25
  });
 }
 return result;
}
function AsteroidAsset({kind,size}:{kind:AsteroidKind;size:number}){
 const {scene}=useGLTF("/asteroids/"+kind+"/scene.gltf");
 const object=useMemo(()=>{
  const root=scene.clone(true);
  const box=new THREE.Box3().setFromObject(root);
  const dimensions=box.getSize(new THREE.Vector3());
  const center=box.getCenter(new THREE.Vector3());
  root.position.sub(center);
  const outer=new THREE.Group();outer.add(root);
  outer.scale.setScalar(size*2/Math.max(dimensions.x,dimensions.y,dimensions.z,.001));
  return outer;
 },[scene,size]);
 return <primitive object={object}/>;
}
function RockBody({rock,epoch}:{rock:Rock;epoch:React.RefObject<number>}){
 const position=useRef<THREE.Group>(null),rotation=useRef<THREE.Group>(null);
 useFrame(()=>{
  const days=(epoch.current-Date.UTC(2000,0,1,12))/86400000;
  const angle=rock.phase+days/rock.period*TAU;
  const r=rock.radius*(1-rock.ecc*rock.ecc)/(1+rock.ecc*Math.cos(angle));
  const x=r*Math.cos(angle),z=r*Math.sin(angle);
  const y=z*Math.sin(rock.incline);
  const flatZ=z*Math.cos(rock.incline);
  const c=Math.cos(rock.node),s=Math.sin(rock.node);
  position.current?.position.set(x*c-flatZ*s,y,x*s+flatZ*c);
  if(rotation.current){rotation.current.rotation.y=rock.tilt+days*rock.spin*.04;rotation.current.rotation.x=rock.tilt*.45+days*rock.spin*.013;}
 });
 return <group ref={position}><group ref={rotation}><AsteroidAsset kind={rock.kind} size={rock.size}/></group></group>;
}
export default function Asteroids({epoch}:{epoch:React.RefObject<number>}){
 const rocks=useMemo(createRocks,[]);
 return <group>{rocks.map((rock,i)=><RockBody key={i} rock={rock} epoch={epoch}/>)}</group>;
}
