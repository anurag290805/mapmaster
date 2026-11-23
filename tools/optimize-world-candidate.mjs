// Lossless serialization only: no coordinate rounding or geometry edits.
import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
export function optimizeSvg(svg){
  return svg.replace(/(\sd=")([^"]*)(")/g,(_match,start,path,end)=>start+path.replace(/-?\d+\.\d+/g,number=>{
    let value=number.replace(/0+$/,'').replace(/\.$/,'');
    if(Number(value)===0)return '0';
    value=value.replace(/^0\./,'.').replace(/^-0\./,'-.');
    return value;
  })+end);
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
  if(!process.argv[2]||!process.argv[3])throw new Error('Usage: node tools/optimize-world-candidate.mjs input.svg output.svg');
  const original=readFileSync(process.argv[2],'utf8'), optimized=optimizeSvg(original);
  writeFileSync(process.argv[3],optimized);
  console.log(`Original ${Buffer.byteLength(original)} bytes; optimized ${Buffer.byteLength(optimized)} bytes`);
}
