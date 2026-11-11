const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=v=>{const n=Math.hypot(...v);return v.map(x=>x/n)};
const rad=Math.PI/180;

export function orientation(lat,lon){
 const p=lat*rad,t=lon*rad;
 return [[Math.cos(t),0,-Math.sin(t)],
  [-Math.sin(p)*Math.sin(t),Math.cos(p),-Math.sin(p)*Math.cos(t)],
  [Math.cos(p)*Math.sin(t),Math.sin(p),Math.cos(p)*Math.cos(t)]];
}
export function screenPoint(x,y){
 const r=Math.hypot(x,y);
 return r<=1?[x,y,Math.sqrt(Math.max(0,1-r*r))]:[x/r,y/r,0];
}
export function rotate(basis,from,to){
 // Rotate the viewing frame inversely to the drag, keeping the grabbed surface under the cursor.
 const axis=cross(to,from),s=Math.hypot(...axis);
 if(s<1e-8)return basis;
 const u=axis.map(x=>x/s),c=Math.max(-1,Math.min(1,dot(from,to)));
 const column=i=>{
  const v=[0,0,0];v[i]=1;
  const k=cross(u,v),d=dot(u,v);
  return v.map((x,j)=>x*c+k[j]*s+u[j]*d*(1-c));
 };
 const [r,up,f]=[0,1,2].map(i=>{const v=column(i);return basis[0].map((_,j)=>v[0]*basis[0][j]+v[1]*basis[1][j]+v[2]*basis[2][j]);});
 const forward=unit(f),right=unit(cross(up,forward));
 return [right,cross(forward,right),forward];
}
export function coords([x,y,z]){
 return [Math.asin(Math.max(-1,Math.min(1,y)))/rad,Math.atan2(x,z)/rad];
}
export function project(basis,lat,lon){
 const w=orientation(lat,lon)[2];
 return basis.map(v=>dot(v,w));
}
