import * as THREE from "three";
// Low-precision J2000 mean orbital elements (AU, degrees and degrees/Julian century).
// Appropriate for visualization, NOT navigation or precise ephemerides.
const elements: Record<string,number[]> = {
 Mercury:[.38709927,.20563593,7.00497902,252.250324,77.4577963,48.3307659,.00000037,.00001906,-.00594749,149472.6741,.16047689,-.12534081],
 Venus:[.72333566,.00677672,3.39467605,181.9790995,131.6024672,76.6798434,.0000039,-.00004107,-.0007889,58517.81539,.00268329,-.27769418],
 Earth:[1.00000261,.01671123,-.00001531,100.4645717,102.9376819,0,.00000562,-.00004392,-.01294668,35999.37245,.32327364,0],
 Mars:[1.52371034,.0933941,1.84969142,-4.55343205,-23.94362959,49.55953891,.00001847,.00007882,-.00813131,19140.30268,.44441088,-.29257343],
 Jupiter:[5.202887,.04838624,1.30439695,34.39644051,14.72847983,100.47390909,-.00011607,-.00013253,-.00183714,3034.74613,.21252668,.20469106],
 Saturn:[9.53667594,.05386179,2.48599187,49.95424423,92.59887831,113.66242448,-.0012506,-.00050991,.00193609,1222.49362,-.41897216,-.28867794],
 Uranus:[19.18916464,.04725744,.77263783,313.23810451,170.9542763,74.01692503,-.00196176,-.00004397,-.00242939,428.48202785,.40805281,.04240589],
 Neptune:[30.06992276,.00859048,1.77004347,-55.12002969,44.96476227,131.78422574,.00026291,.00005105,.00035372,218.45945325,-.32241464,-.00508664],
};
const rad=Math.PI/180;
export function orbitalPosition(name:string,epochMs:number,visualOrbit:number){
 const v=elements[name];if(!v)return new THREE.Vector3();
 const T=(epochMs-Date.UTC(2000,0,1,12))/(86400000*36525);
 const a=v[0]+v[6]*T,e=v[1]+v[7]*T,i=(v[2]+v[8]*T)*rad,L=(v[3]+v[9]*T)*rad,wbar=(v[4]+v[10]*T)*rad,node=(v[5]+v[11]*T)*rad;
 let M=((L-wbar)%(Math.PI*2)+Math.PI*2)%(Math.PI*2),E=M;
 for(let j=0;j<8;j++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
 const x=a*(Math.cos(E)-e),y=a*Math.sqrt(1-e*e)*Math.sin(E),w=wbar-node;
 const cw=Math.cos(w),sw=Math.sin(w),co=Math.cos(node),so=Math.sin(node),ci=Math.cos(i),si=Math.sin(i);
 const X=(co*cw-so*sw*ci)*x+(-co*sw-so*cw*ci)*y;
 const Y=(so*cw+co*sw*ci)*x+(-so*sw+co*cw*ci)*y;
 const Z=(sw*si)*x+(cw*si)*y;
 return new THREE.Vector3(X/a*visualOrbit,Z/a*visualOrbit,Y/a*visualOrbit);
}
export function orbitalPath(name:string,visualOrbit:number,epochMs:number){
 // Sample one full orbit at its physical period, capturing eccentricity and tilt.
 const days:Record<string,number>={Mercury:87.969,Venus:224.701,Earth:365.256,Mars:686.98,Jupiter:4332.59,Saturn:10759.22,Uranus:30688.5,Neptune:60182};
 return Array.from({length:240},(_,i)=>orbitalPosition(name,epochMs+i/240*days[name]*86400000,visualOrbit));
}
// Sidereal axial rotation periods, in Earth days. Negative means retrograde.
export const spinDays:Record<string,number>={Mercury:58.646,Venus:-243.025,Earth:.99726968,Mars:1.025957,Jupiter:.41354,Saturn:.44401,Uranus:-.71833,Neptune:.67125};
export const tiltDegrees:Record<string,number>={Mercury:.034,Venus:177.36,Earth:23.44,Mars:25.19,Jupiter:3.13,Saturn:26.73,Uranus:97.77,Neptune:28.32};
