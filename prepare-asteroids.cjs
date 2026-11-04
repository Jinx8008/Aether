const fs=require('fs');
const path=require('path');
const sharp=require('sharp');
const source='C:/Users/HP/Downloads';
const target='C:/Users/HP/Documents/aether/public/asteroids';
(async()=>{
 for(const name of ['asteroid','met01_meteor','meteorite']){
  const src=path.join(source,name),dest=path.join(target,name);
  fs.mkdirSync(path.join(dest,'textures'),{recursive:true});
  fs.copyFileSync(path.join(src,'scene.bin'),path.join(dest,'scene.bin'));
  fs.copyFileSync(path.join(src,'license.txt'),path.join(dest,'license.txt'));
  const doc=JSON.parse(fs.readFileSync(path.join(src,'scene.gltf'),'utf8'));
  for(let i=0;i<(doc.images||[]).length;i++){
   const entry=doc.images[i],filename='texture-'+i+'.jpg';
   await sharp(path.join(src,entry.uri)).resize({width:1024,height:1024,fit:'inside',withoutEnlargement:true}).flatten({background:'#808080'}).jpeg({quality:76,mozjpeg:true}).toFile(path.join(dest,'textures',filename));
   entry.uri='textures/'+filename;
  }
  fs.writeFileSync(path.join(dest,'scene.gltf'),JSON.stringify(doc));
  console.log(name,'optimized');
 }
})().catch(e=>{console.error(e);process.exit(1)});
