const neg=r=>r[1].join().includes("!");
function infer(init){const F=new Set(init),D=new Set(),tr=[];
const ok=r=>r[1].every(c=>c.split("|").some(t=>t[0]=="!"?!F.has(t.slice(1)):F.has(t)));
[r=>!neg(r),neg].forEach(sel=>{let ch=1;while(ch){ch=0;const cy=[];RULES.forEach(r=>{if(sel(r)&&!D.has(r[0])&&ok(r)){D.add(r[0]);r[2].forEach(x=>F.add(x));cy.push(r);ch=1}});if(cy.length)tr.push(cy)}});
return{F,tr}}
