import { useState, useEffect, useCallback, useRef } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, ScatterChart, Scatter } from "recharts";
import { C, STYLE, INDICES, STAGE2, SECTORS, FILINGS, CONCALLS, RSIS_STOCKS } from "./constants/config";

const sparkData = (base, n=12) => Array.from({length:n},(_,i)=>({v:base+Math.sin(i*.8)*base*.15+Math.random()*base*.1}));

// ─── Sub-components ───────────────────────────────────────────────────────────

function IndexBar() {
  return (
    <div style={{background:C.bg1,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:0,overflowX:"auto",flexShrink:0}}>
      <div style={{padding:"0 14px",borderRight:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:C.green}} className="pulse"/>
        <span style={{fontSize:10,fontWeight:700,letterSpacing:1.5,color:C.cyan}}>LIVE</span>
      </div>
      {INDICES.map(idx=>(
        <div key={idx.name} style={{padding:"6px 16px",borderRight:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{fontSize:9,color:C.text2,letterSpacing:.6,marginBottom:2}}>{idx.name}</div>
          <div style={{display:"flex",gap:6,alignItems:"baseline"}}>
            <span className="mono" style={{fontSize:12,fontWeight:600}}>{idx.val}</span>
            <span className="mono" style={{fontSize:10,color:idx.up?C.green:C.red}}>{idx.pct}</span>
          </div>
        </div>
      ))}
      <div style={{marginLeft:"auto",padding:"0 14px",flexShrink:0}}>
        <span style={{fontSize:10,color:C.text2}}>10 May 2025, 14:44 IST</span>
      </div>
    </div>
  );
}

function NavBar({active, setActive}) {
  const tabs = [
    {id:"stage2",label:"Stage 2 Engine",icon:"⬡"},
    {id:"sector",label:"Sector Rotation",icon:"◑"},
    {id:"filings",label:"Filing Intelligence",icon:"◉"},
    {id:"concall",label:"Concall & Earnings",icon:"◎"},
    {id:"rsis",label:"RSIS Scoring",icon:"◐"},
    {id:"corpintel",label:"Corp Intelligence",icon:"◈"},
  ];
  return (
    <div style={{background:C.bg1,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:2,padding:"0 12px",flexShrink:0}}>
      <div style={{marginRight:12,paddingRight:12,borderRight:`1px solid ${C.border}`}}>
        <span style={{fontSize:11,fontWeight:700,letterSpacing:2,color:C.cyan}}>ALPHA</span>
        <span style={{fontSize:11,fontWeight:300,letterSpacing:2,color:C.text1}}>IQ</span>
      </div>
      {tabs.map(t=>(
        <button key={t.id} className={`btn${active===t.id?" btn-active":""}`} onClick={()=>setActive(t.id)}
          style={{margin:"8px 2px",display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:10}}>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
      <div style={{marginLeft:"auto",display:"flex",gap:4}}>
        <button className="btn" style={{padding:"4px 10px"}}>⌕ Search</button>
        <button className="btn" style={{padding:"4px 10px"}}>⚙</button>
      </div>
    </div>
  );
}

function ScoreBadge({score}) {
  const col = score>=80?C.green:score>=65?C.cyan:score>=50?C.amber:C.red;
  return (
    <span className="mono" style={{fontWeight:700,fontSize:14,color:col}}>{score}</span>
  );
}

function MiniSparkline({data, color}) {
  return (
    <ResponsiveContainer width={60} height={24}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false}/>
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Module 1: Stage 2 Engine ─────────────────────────────────────────────────
function Stage2Module({setAiContext}) {
  const [sort,setSort]=useState("score");
  const [filter,setFilter]=useState("all");
  const sorted = [...STAGE2].sort((a,b)=>b[sort]-a[sort]);
  const filtered = filter==="all"?sorted:sorted.filter(s=>s.stage.toLowerCase().includes(filter));
  return (
    <div className="fade-in" style={{display:"flex",gap:8,height:"100%",overflow:"hidden"}}>
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",gap:8}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[["Market Leaders","Stage 2","18","green"],["Emerging","Emerging","6","cyan"],["Failed BOs","Stage 3","3","amber"],["Avoid","Stage 4","4","red"]].map(([l,_,v,c])=>(
            <div key={l} className="panel" style={{flex:1,minWidth:120,padding:"10px 14px"}}>
              <div style={{fontSize:9,color:C.text2,letterSpacing:.8,marginBottom:4,textTransform:"uppercase"}}>{l}</div>
              <div className="mono" style={{fontSize:22,fontWeight:600,color:C[c]}}>{v}</div>
              <div style={{fontSize:10,color:C.text2,marginTop:2}}>stocks detected</div>
            </div>
          ))}
        </div>
        <div className="panel" style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <div className="panel-hd">
            <span className="panel-hd-title">Stage 2 Intelligence — CNX500 Universe</span>
            <div style={{display:"flex",gap:4}}>
              {["all","stage 2","emerging","stage 4"].map(f=>(
                <button key={f} className={`btn${filter===f?" btn-active":""}`} style={{padding:"3px 8px",fontSize:10}} onClick={()=>setFilter(f)}>{f}</button>
              ))}
            </div>
          </div>
          <div style={{overflowY:"auto",flex:1}}>
            <table className="tbl">
              <thead><tr>
                {[["Stock","stock"],["RS","rs"],["Stage","stage"],["P/50D","p50"],["P/200D","p200"],["Vol Exp","vol"],["EG%","eg"],["Score","score"]].map(([l,k])=>(
                  <th key={k} onClick={()=>setSort(k)} style={{cursor:"pointer",userSelect:"none"}}>
                    {l} {sort===k?"▼":""}
                  </th>
                ))}
                <th>Action</th>
              </tr></thead>
              <tbody>
                {filtered.map(s=>(
                  <tr key={s.ticker} style={{cursor:"pointer"}} onClick={()=>setAiContext(s)}>
                    <td>
                      <div style={{fontWeight:500}}>{s.name}</div>
                      <div style={{fontSize:10,color:C.text2,marginTop:1}}>{s.ticker} · {s.sector}</div>
                    </td>
                    <td><span className="mono" style={{color:s.rs>80?C.green:s.rs>65?C.cyan:C.amber}}>{s.rs}</span></td>
                    <td>
                      <span className={`tag tag-${s.stage==="Stage 2"?"green":s.stage==="Emerging"?"cyan":s.stage==="Stage 3"?"amber":"red"}`}>
                        {s.stage}
                      </span>
                    </td>
                    <td><span className="mono" style={{color:parseFloat(s.p50)>0?C.green:C.red}}>{s.p50}</span></td>
                    <td><span className="mono" style={{color:parseFloat(s.p200)>0?C.green:C.red}}>{s.p200}</span></td>
                    <td><span className="mono" style={{color:parseFloat(s.vol)>0?C.green:C.red}}>{s.vol}</span></td>
                    <td><span className="mono up">{s.eg}</span></td>
                    <td><ScoreBadge score={s.score}/></td>
                    <td>
                      <button className="btn" style={{padding:"3px 8px",fontSize:10}} onClick={e=>{e.stopPropagation();window.open(`https://www.tradingview.com/chart/?symbol=NSE:${s.ticker}`,'_blank')}}>
                        📈 TV
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Module 2: Sector Rotation ────────────────────────────────────────────────
function SectorModule({setAiContext}) {
  const sectorSparkData = SECTORS.map(s=>({...s,spark:sparkData(s.score,12)}));
  return (
    <div className="fade-in" style={{display:"flex",gap:8,height:"100%",overflow:"hidden"}}>
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",gap:8}}>
        <div className="panel" style={{padding:"12px 14px"}}>
          <div style={{fontSize:10,color:C.text2,letterSpacing:.8,marginBottom:8,textTransform:"uppercase"}}>Sector Heatmap — Relative Strength vs CNX500</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
            {sectorSparkData.map(s=>{
              const col=s.trend==="up"?C.green:C.red;
              const bg=s.trend==="up"?C.greenBg:C.redBg;
              return (
                <div key={s.name} onClick={()=>setAiContext({type:"sector",...s})} style={{
                  background:bg,border:`1px solid ${s.trend==="up"?"rgba(0,229,160,.2)":"rgba(255,77,106,.2)"}`,
                  borderRadius:4,padding:"8px 10px",cursor:"pointer",transition:"all .2s"
                }}>
                  <div style={{fontSize:11,fontWeight:500,marginBottom:4,color:C.text0}}>{s.name}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                    <span className="mono" style={{fontSize:16,fontWeight:700,color:col}}>{s.score}</span>
                    <span style={{fontSize:10,color:col}}>{s.mom}</span>
                  </div>
                  <div style={{marginTop:4}}>
                    <MiniSparkline data={s.spark} color={col}/>
                  </div>
                  <div style={{fontSize:9,color:C.text2,marginTop:2}}>Breadth {s.breadth} · {s.bos} BOs</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel" style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <div className="panel-hd">
            <span className="panel-hd-title">Sector Rotation Rankings</span>
            <span style={{fontSize:10,color:C.text2}}>Sorted by RS Score</span>
          </div>
          <div style={{overflowY:"auto",flex:1}}>
            <table className="tbl">
              <thead><tr>
                <th>#</th><th>Sector</th><th>RS Score</th><th>Momentum</th><th>Breadth</th><th>Vol Flow</th><th>Earn Mom</th><th>Inst Flow</th><th>BOs</th>
              </tr></thead>
              <tbody>
                {SECTORS.map((s,i)=>(
                  <tr key={s.name} style={{cursor:"pointer"}} onClick={()=>setAiContext({type:"sector",...s})}>
                    <td><span className="mono" style={{color:C.text2}}>{i+1}</span></td>
                    <td><span style={{fontWeight:500}}>{s.name}</span></td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <ScoreBadge score={s.rs}/>
                        <div style={{width:60}}>
                          <div className="score-bar">
                            <div className="score-fill" style={{width:`${s.rs}%`,background:s.trend==="up"?C.green:C.red}}/>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><span className="mono" style={{color:parseFloat(s.mom)>0?C.green:C.red}}>{s.mom}</span></td>
                    <td><span className="mono">{s.breadth}</span></td>
                    <td><span className="mono" style={{color:parseFloat(s.vol)>0?C.green:C.red}}>{s.vol}</span></td>
                    <td><span className="mono" style={{color:parseFloat(s.eg)>0?C.green:C.red}}>{s.eg}</span></td>
                    <td>
                      <span className={`tag tag-${s.flow==="Strong"?"green":s.flow==="Outflow"?"red":"amber"}`}>{s.flow}</span>
                    </td>
                    <td><span className="mono" style={{color:C.cyan}}>{s.bos}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Module 3: Filing Intelligence ────────────────────────────────────────────
function FilingModule({setAiContext}) {
  const [filterType,setFilterType]=useState("all");
  const types=["all","Order Win","Guidance Upgrade","Capacity Expansion","Promoter Buying","Leadership Change","QIP"];
  const filtered=filterType==="all"?FILINGS:FILINGS.filter(f=>f.type===filterType);
  return (
    <div className="fade-in" style={{display:"flex",gap:8,height:"100%",overflow:"hidden"}}>
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",gap:8}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {types.map(t=>(
            <button key={t} className={`btn${filterType===t?" btn-active":""}`} style={{padding:"4px 10px",fontSize:10}} onClick={()=>setFilterType(t)}>{t}</button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:C.green}} className="pulse"/>
            <span style={{fontSize:10,color:C.text2}}>Auto-refresh every 2min</span>
          </div>
        </div>
        <div className="panel" style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <div className="panel-hd">
            <span className="panel-hd-title">Exchange Filing Intelligence — BSE + NSE</span>
            <span className="tag tag-green" style={{fontSize:9}}>● {FILINGS.length} today</span>
          </div>
          <div style={{overflowY:"auto",flex:1}}>
            {filtered.map((f,i)=>(
              <div key={i} onClick={()=>setAiContext({type:"filing",...f})} style={{
                padding:"12px 14px",borderBottom:`1px solid ${C.text3}`,cursor:"pointer",transition:"background .15s",
              }} onMouseEnter={e=>e.currentTarget.style.background=C.bg2}
                 onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <span className="mono" style={{fontSize:10,color:C.text2,minWidth:38,flexShrink:0,marginTop:2}}>{f.time}</span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                      <span style={{fontWeight:600,fontSize:13}}>{f.name}</span>
                      <span className="mono" style={{fontSize:10,color:C.text2}}>{f.ticker}</span>
                      <span className={`tag tag-${f.tag}`}>{f.type}</span>
                      <span style={{marginLeft:"auto",fontSize:10,fontWeight:600,color:f.score.startsWith("+")?C.green:C.red}}>
                        RSIS {f.score}
                      </span>
                    </div>
                    <div style={{fontSize:12,color:C.text1,lineHeight:1.5}}>{f.summary}</div>
                    <div style={{marginTop:5,display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:10,color:C.text2}}>Impact:</span>
                      <span style={{fontSize:10,fontWeight:600,color:f.impact==="Very Positive"?C.green:f.impact==="Positive"?C.greenDim:f.impact==="Caution"?C.amber:C.text2}}>
                        {f.impact}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Module 4: Concall Intelligence ───────────────────────────────────────────
function ConcallModule({setAiContext}) {
  const [selected,setSelected]=useState(CONCALLS[0]);
  const score=v=>{const col=v>=80?C.green:v>=65?C.cyan:C.amber;return(<span className="mono" style={{color:col,fontWeight:700}}>{v}</span>);};
  return (
    <div className="fade-in" style={{display:"flex",gap:8,height:"100%",overflow:"hidden"}}>
      <div style={{width:200,display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
        {CONCALLS.map(c=>(
          <div key={c.ticker} className="panel" onClick={()=>setSelected(c)} style={{
            padding:"10px 12px",cursor:"pointer",borderColor:selected.ticker===c.ticker?C.cyan:C.border,transition:"all .15s"
          }}>
            <div style={{fontWeight:600,fontSize:12}}>{c.name}</div>
            <div style={{fontSize:10,color:C.text2,marginTop:2}}>{c.quarter}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
              <ScoreBadge score={c.curr_score}/>
              <span style={{fontSize:10,color:c.curr_score>c.prev_score?C.green:C.red}}>
                {c.curr_score>c.prev_score?"▲":"▼"} {Math.abs(c.curr_score-c.prev_score)}
              </span>
              <span style={{marginLeft:"auto"}}>
                <span className={`tag tag-${c.tone==="Improved"?"green":c.tone==="Stable"?"cyan":"amber"}`}>{c.tone}</span>
              </span>
            </div>
          </div>
        ))}
        <div className="panel" style={{padding:"10px 12px",opacity:.5,textAlign:"center"}}>
          <div style={{fontSize:10,color:C.text2}}>+14 more concalls</div>
          <div style={{fontSize:10,color:C.text2}}>Upload transcript →</div>
        </div>
      </div>
      <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",gap:8}}>
        <div className="panel" style={{padding:"14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div>
              <div style={{fontSize:15,fontWeight:600}}>{selected.name} — {selected.quarter} Concall Intelligence</div>
              <div style={{fontSize:11,color:C.text2,marginTop:2}}>AI-powered analysis · Management quality scoring</div>
            </div>
            <div style={{marginLeft:"auto",textAlign:"right"}}>
              <div style={{fontSize:9,color:C.text2,marginBottom:2}}>CONCALL SCORE</div>
              <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                <span className="mono" style={{fontSize:28,fontWeight:700,color:selected.verdictColor}}>{selected.curr_score}</span>
                <span style={{fontSize:12,color:selected.curr_score>selected.prev_score?C.green:C.red}}>
                  {selected.curr_score>selected.prev_score?"▲":"▼"} from {selected.prev_score}
                </span>
              </div>
            </div>
          </div>
          <div style={{padding:"10px 14px",background:selected.verdictColor+"18",border:`1px solid ${selected.verdictColor}40`,borderRadius:4,marginBottom:12}}>
            <span style={{fontSize:11,fontWeight:600,color:selected.verdictColor}}>◈ VERDICT: {selected.verdict}</span>
          </div>
          <div className="grid-4" style={{marginBottom:12}}>
            {[["Confidence",selected.confidence],["Clarity",selected.clarity],["Honesty",selected.honesty],["Consistency",selected.consistency]].map(([l,v])=>(
              <div key={l} style={{background:C.bg2,borderRadius:4,padding:"8px 10px"}}>
                <div style={{fontSize:9,color:C.text2,marginBottom:4}}>{l}</div>
                {score(v)}
                <div style={{marginTop:4}} className="score-bar">
                  <div className="score-fill" style={{width:`${v}%`,background:v>=80?C.green:v>=65?C.cyan:C.amber}}/>
                </div>
              </div>
            ))}
          </div>
          <div className="grid-2" style={{marginBottom:8}}>
            <div>
              <div style={{fontSize:10,color:C.green,fontWeight:600,marginBottom:6}}>✓ POSITIVE SIGNALS</div>
              {selected.positive.map((p,i)=>(<div key={i} style={{fontSize:11,color:C.text1,padding:"3px 0",borderBottom:`1px solid ${C.text3}`}}>+ {p}</div>))}
            </div>
            <div>
              <div style={{fontSize:10,color:C.red,fontWeight:600,marginBottom:6}}>✗ RED FLAGS</div>
              {selected.negative.map((n,i)=>(<div key={i} style={{fontSize:11,color:C.text1,padding:"3px 0",borderBottom:`1px solid ${C.text3}`}}>− {n}</div>))}
            </div>
          </div>
        </div>
        <div className="grid-3" style={{gap:8}}>
          {[["Demand Commentary",selected.demand,"cyan"],["Margin Outlook",selected.margin,"green"],["Capex Plans",selected.capex,"amber"]].map(([l,v,c])=>(
            <div key={l} className="panel" style={{padding:"12px 14px"}}>
              <div style={{fontSize:10,color:C[c],fontWeight:600,letterSpacing:.6,marginBottom:6}}>{l.toUpperCase()}</div>
              <div style={{fontSize:11,color:C.text1,lineHeight:1.6}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Module 5: RSIS Scoring ────────────────────────────────────────────────────
function RSISModule({setAiContext}) {
  const [selected,setSelected]=useState(RSIS_STOCKS[0]);
  return (
    <div className="fade-in" style={{display:"flex",gap:8,height:"100%",overflow:"hidden"}}>
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",gap:8}}>
        <div className="panel" style={{padding:"14px"}}>
          <div style={{fontSize:10,color:C.text2,letterSpacing:.8,marginBottom:8,textTransform:"uppercase"}}>RSIS — Relative Stock Intelligence Score</div>
          <div style={{display:"flex",gap:8,overflowX:"auto"}}>
            {RSIS_STOCKS.map(s=>{
              const col=s.score>=80?C.green:s.score>=65?C.cyan:s.score>=50?C.amber:C.red;
              const delta=s.score-s.prev;
              return (
                <div key={s.ticker} onClick={()=>setSelected(s)} style={{
                  flexShrink:0,width:110,background:selected.ticker===s.ticker?col+"18":C.bg2,
                  border:`1px solid ${selected.ticker===s.ticker?col:C.border}`,
                  borderRadius:4,padding:"10px 10px",cursor:"pointer",textAlign:"center",transition:"all .2s"
                }}>
                  <div style={{fontSize:10,fontWeight:500,marginBottom:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                  <div className="mono" style={{fontSize:28,fontWeight:700,color:col,lineHeight:1}}>{s.score}</div>
                  <div style={{fontSize:10,color:delta>0?C.green:C.red,marginTop:2}}>{delta>0?"▲":"▼"}{Math.abs(delta)}</div>
                  <div style={{marginTop:6}}>
                    <span className={`tag tag-${s.score>=80?"green":s.score>=65?"cyan":s.score>=50?"amber":"red"}`} style={{fontSize:8}}>
                      {s.verdict}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel" style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <div className="panel-hd">
            <span className="panel-hd-title">Score Breakdown — {selected.name}</span>
            <button className="btn" style={{padding:"3px 8px",fontSize:10}} onClick={()=>setAiContext(selected)}>AI Deep Dive ↗</button>
          </div>
          <div style={{padding:"14px",overflow:"auto",flex:1}}>
            <div className="grid-2" style={{gap:12,marginBottom:12}}>
              <div>
                <div style={{fontSize:10,color:C.text2,marginBottom:8}}>SCORE COMPOSITION (out of 100)</div>
                {[
                  ["Technical Leadership",selected.tech,25,C.cyan],
                  ["Earnings Quality",selected.earn,20,C.green],
                  ["Concall Intelligence",selected.concall,25,C.purple],
                  ["Sector Strength",selected.sector,15,C.amber],
                  ["Filing Intelligence",selected.filing,15,C.red],
                ].map(([l,v,max,col])=>(
                  <div key={l} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:11,color:C.text1}}>{l}</span>
                      <span className="mono" style={{fontSize:11}}><span style={{color:col}}>{v}</span><span style={{color:C.text2}}>/{max}</span></span>
                    </div>
                    <div className="score-bar">
                      <div className="score-fill" style={{width:`${(v/max)*100}%`,background:col}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{fontSize:10,color:C.text2,marginBottom:8}}>WHY SCORE CHANGED</div>
                <div style={{padding:"10px 12px",background:C.bg2,borderRadius:4,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:11,color:C.text2,marginBottom:8}}>
                    Score <span className="mono" style={{color:C.amber}}>{selected.prev}</span> → <span className="mono" style={{color:selected.vc}}>{selected.score}</span>
                    <span style={{color:selected.score>selected.prev?C.green:C.red,marginLeft:4}}>
                      ({selected.score>selected.prev?"▲":"▼"}{Math.abs(selected.score-selected.prev)} pts)
                    </span>
                  </div>
                  {selected.change.map((c,i)=>(
                    <div key={i} style={{fontSize:11,color:C.text1,padding:"4px 0",borderBottom:`1px solid ${C.text3}`,display:"flex",gap:6}}>
                      <span style={{color:C.green}}>+</span>{c}
                    </div>
                  ))}
                </div>
                <div style={{marginTop:10}}>
                  <div style={{fontSize:10,color:C.text2,marginBottom:6}}>ENTRY/EXIT GUIDANCE</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {[["Ideal Buy Zone","₹3,180–3,280",C.green],["Add-on Level","₹3,450",C.greenDim],["Stop Loss","₹2,980",C.red],["Risk/Reward","1:3.2",C.cyan],["25% Book","₹3,800",C.amber],["Full Exit","₹4,200",C.amber]].map(([l,v,c])=>(
                      <div key={l} style={{background:C.bg2,borderRadius:3,padding:"6px 8px"}}>
                        <div style={{fontSize:9,color:C.text2}}>{l}</div>
                        <div className="mono" style={{fontSize:12,fontWeight:600,color:c,marginTop:1}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="panel" style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <div className="panel-hd">
                <span className="panel-hd-title">All RSIS Rankings</span>
              </div>
              <table className="tbl">
                <thead><tr>
                  <th>Stock</th><th>Score</th><th>Change</th><th>Tech</th><th>Earn</th><th>Concall</th><th>Sector</th><th>Filing</th><th>Verdict</th>
                </tr></thead>
                <tbody>
                  {RSIS_STOCKS.map((s,i)=>{
                    const delta=s.score-s.prev;
                    return (
                      <tr key={s.ticker} style={{cursor:"pointer",fontWeight:selected.ticker===s.ticker?600:400}} onClick={()=>setSelected(s)}>
                        <td><span style={{marginRight:6,color:C.text2,fontSize:10}}>{i+1}.</span>{s.name}</td>
                        <td><ScoreBadge score={s.score}/></td>
                        <td><span className="mono" style={{color:delta>0?C.green:C.red}}>{delta>0?"▲":"▼"}{Math.abs(delta)}</span></td>
                        {[s.tech,s.earn,s.concall,s.sector,s.filing].map((v,j)=>(
                          <td key={j}><span className="mono" style={{fontSize:11}}>{v}</span></td>
                        ))}
                        <td><span className={`tag tag-${s.score>=80?"green":s.score>=65?"cyan":s.score>=50?"amber":"red"}`}>{s.verdict}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Module 6: Corp Intelligence (Knowledge Base Matrix) ─────────────────────
const QUICK_STOCKS = [
  {name:"Reliance",ticker:"RELIANCE"},
  {name:"Infosys",ticker:"INFY"},
  {name:"HDFC Bank",ticker:"HDFCBANK"},
  {name:"TCS",ticker:"TCS"},
  {name:"Zomato",ticker:"ZOMATO"},
  {name:"Dixon Tech",ticker:"DIXON"},
  {name:"Kaynes",ticker:"KAYNES"},
  {name:"Suzlon",ticker:"SUZLON"},
  {name:"KEI Ind.",ticker:"KEI"},
  {name:"Polycab",ticker:"POLYCAB"},
  {name:"Bajaj Finance",ticker:"BAJFINANCE"},
  {name:"IRFC",ticker:"IRFC"},
];

const SECTION_META = [
  {key:"1",label:"Business Core & Revenue",icon:"◉",color:"cyan"},
  {key:"2",label:"Supply Chain & Ecosystem",icon:"◈",color:"amber"},
  {key:"3",label:"Product Matrix & Pipeline",icon:"◐",color:"green"},
  {key:"4",label:"Capex & Guidance Tracker",icon:"◎",color:"purple"},
  {key:"5",label:"Management & Governance",icon:"⬡",color:"red"},
  {key:"6",label:"Valuation & Risk Matrix",icon:"◑",color:"amber"},
];

function CorpIntelModule() {
  const [company, setCompany] = useState("");
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("1");
  const [analyzed, setAnalyzed] = useState(null);

  const buildPrompt = (co, tk) => `You are an elite institutional equity research analyst and an expert in the Indian stock market, operating with a strict "Techno-Funda" investment framework. Your task is to construct an exhaustive, data-driven Corporate Knowledge Base Matrix for the company specified below.

Bypass generic corporate descriptions and superficial data. Provide granular, forensic-level detail utilizing precise corporate vocabulary (e.g., EBITDA margins, gross margins, asset-turnover, capacity utilization, structural levers, localized policy adjustments).

Build the Corporate Knowledge Base Matrix for: ${co}${tk ? ` (NSE: ${tk})` : ""}

Structure your entire response using these exact headings:

### 1. BUSINESS CORE & REVENUE STRUCTURING
* **Business Summary:** Provide a punchy, 3-4 sentence institutional-grade breakdown of the company's core economic moat, pricing power dynamics, business model, and structural positioning within its industry value chain.
* **Granular Revenue Segments:** Outline a precise breakdown of revenue streams (by business vertical, product category, geography, and cyclical vs. structural streams). Use percentage estimates or absolute numbers based on recent filings if known.
* **KPI Tracking Matrix:** Detail the 4-5 non-financial and operational key performance indicators (KPIs) critical to tracking this company's execution.

### 2. SUPPLY CHAIN & INDUSTRIAL ECOSYSTEM
* **Client Portfolio & Concentration:** Detail key institutional, corporate, or government client segments. Explicitly outline any client concentration risks, dependency metrics, and stickiness/switching costs.
* **Supplier & Input Dependency:** Identify core raw material inputs or technology suppliers. Highlight any critical vulnerabilities, currency exposures, or supply chain bottlenecks.
* **Competitor Benchmarking:** Map out direct and indirect peers within the Indian and global landscape. Delineate this company's relative market share, cost leadership status, or technological differentiation compared to its top 3 competitors.

### 3. PRODUCT MATRIX & PIPELINE LIFECYCLE
* **Core Product Portfolio:** Map out existing legacy products/services, their margins (High/Mid/Low), and their current lifecycle stage (Growth, Mature, Cash Cow).
* **R&D Pipeline & New Launches:** Detail recent product launches or upcoming R&D innovations. Specify how these new offerings expand the Total Addressable Market (TAM) or improve blended margin profiles.

### 4. FORWARD-LOOKING CAPEX & GUIDANCE TRACKER
* **Order Book Dynamics & Execution Runway:** Detail the current order book size, its book-to-bill ratio, execution timelines, and historical order inflows.
* **Historical Management Guidance:** List the specific targets management has historically given vs. actual execution regarding revenue growth, margin expansion, and asset commissioning.
* **Capex & Capacity Expansion Plans:** Detail ongoing and planned capital expenditure cycles, target commissioning timelines, expected asset-turnover ratios, and funding mechanisms.

### 5. MANAGEMENT CREDIBILITY & GOVERNANCE NOTES
* **Management Quality & Track Record:** Evaluate key management leaders (promoters, CEO, CFO). Highlight past capital allocation choices, capital return metrics (ROCE/ROE tracking), and alignment of interest with minority shareholders.
* **Political, Regulatory & Institutional Links:** Systematically map out potential political dependencies, regulatory scrutiny, historical tax disputes, or corporate governance flags to monitor closely.

### 6. VALUATION & FINANCIAL RISK MATRIX
* **Core Risk Architecture:** Explicitly list 3-4 existential or major operational risks (e.g., regulatory changes, technology obsolescence, commodity price cycles, working capital elongation).
* **Valuation & Capital Allocation Notes:** Analyze current valuation relative to historical cycles and sector peers. Provide guidance on structural earnings quality, working capital cycle efficiency (debtor days, inventory days), and free cash flow (FCF) conversion rates.

Ensure the tone is entirely objective, analytical, and highly structured—tailored for a sophisticated portfolio manager. No generic filler words. Focus deeply on structural data and corporate realities.`;

  const parseSections = (text) => {
    if (!text) return {};
    const sections = {};
    const parts = text.split(/(?=###\s+\d+\.)/);
    parts.forEach(part => {
      const match = part.match(/###\s+(\d+)\./);
      if (match) sections[match[1]] = part.replace(/###\s+\d+[^\n]*\n/, "").trim();
    });
    return sections;
  };

  const renderSection = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} style={{height:6}}/>;
      // Bullet with bold label: * **Label:** content
      const bulletBold = line.match(/^\*\s+\*\*([^*]+)\*\*[:\s]*(.*)/);
      if (bulletBold) {
        return (
          <div key={i} style={{marginBottom:10,paddingLeft:0}}>
            <div style={{fontSize:10,color:C.cyan,fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginBottom:3}}>
              ◈ {bulletBold[1]}
            </div>
            <div style={{fontSize:11.5,color:C.text1,lineHeight:1.75,paddingLeft:10,borderLeft:`2px solid ${C.border}`}}>
              {renderInlineBold(bulletBold[2])}
            </div>
          </div>
        );
      }
      // Sub-bullet
      if (line.match(/^\s+[-*•]\s+/)) {
        return (
          <div key={i} style={{fontSize:11,color:C.text2,padding:"2px 0 2px 16px",display:"flex",gap:6}}>
            <span style={{color:C.cyan,flexShrink:0}}>·</span>
            <span>{renderInlineBold(line.replace(/^\s+[-*•]\s+/,""))}</span>
          </div>
        );
      }
      return (
        <div key={i} style={{fontSize:11.5,color:C.text1,lineHeight:1.75,marginBottom:2}}>
          {renderInlineBold(line)}
        </div>
      );
    });
  };

  const renderInlineBold = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**")
        ? <span key={i} style={{color:C.text0,fontWeight:600}}>{p.slice(2,-2)}</span>
        : <span key={i}>{p}</span>
    );
  };

  const handleGenerate = async () => {
    const co = company.trim();
    if (!co) return;
    setLoading(true); setResult(null); setError(null); setActiveSection("1");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{role:"user",content:buildPrompt(co, ticker.trim())}]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.map(b=>b.text||"").join("");
      setResult(text);
      setAnalyzed({name:co,ticker:ticker.trim()});
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const sections = parseSections(result);

  return (
    <div className="fade-in" style={{display:"flex",gap:8,height:"100%",overflow:"hidden",flexDirection:"column"}}>
      {/* Header Search Bar */}
      <div className="panel" style={{padding:"12px 14px",flexShrink:0}}>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
          <div style={{flex:1,display:"flex",gap:6}}>
            <input
              value={company}
              onChange={e=>setCompany(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleGenerate()}
              placeholder="Company name  e.g. Bajaj Finance"
              style={{flex:2,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:3,padding:"6px 10px",color:C.text0,fontSize:12,outline:"none"}}
            />
            <input
              value={ticker}
              onChange={e=>setTicker(e.target.value.toUpperCase())}
              placeholder="Ticker (opt.)"
              style={{flex:1,maxWidth:120,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:3,padding:"6px 10px",color:C.text0,fontSize:12,outline:"none",fontFamily:"monospace"}}
            />
            <button
              className="btn btn-active"
              onClick={handleGenerate}
              disabled={loading||!company.trim()}
              style={{padding:"6px 16px",fontSize:11,fontWeight:700,letterSpacing:.5,opacity:(!company.trim()||loading)?0.5:1}}
            >
              {loading?"Generating...":"⬡ Build Matrix"}
            </button>
          </div>
          {analyzed&&(
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",background:C.cyanBg,border:`1px solid ${C.border}`,borderRadius:3}}>
              <span style={{fontSize:10,color:C.cyan,fontWeight:600}}>{analyzed.name}</span>
              {analyzed.ticker&&<span className="mono" style={{fontSize:9,color:C.text2}}>NSE:{analyzed.ticker}</span>}
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:9,color:C.text2,letterSpacing:.6,marginRight:4}}>QUICK SELECT:</span>
          {QUICK_STOCKS.map(s=>(
            <button key={s.ticker} className="btn" style={{padding:"2px 8px",fontSize:9}}
              onClick={()=>{setCompany(s.name);setTicker(s.ticker);}}>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{flex:1,overflow:"hidden",display:"flex",gap:8}}>
        {/* Section Nav */}
        <div style={{width:200,display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
          {SECTION_META.map(s=>{
            const hasData = sections[s.key];
            return (
              <div key={s.key}
                className="panel"
                onClick={()=>hasData&&setActiveSection(s.key)}
                style={{
                  padding:"10px 12px",cursor:hasData?"pointer":"default",
                  borderColor:activeSection===s.key?C[s.color]:C.border,
                  opacity:result&&!hasData?0.4:1,transition:"all .15s"
                }}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:12,color:C[s.color]}}>{s.icon}</span>
                  <div>
                    <div style={{fontSize:9,color:C.text2,letterSpacing:.4}}>SECTION {s.key}</div>
                    <div style={{fontSize:10,fontWeight:500,color:activeSection===s.key?C[s.color]:C.text1,marginTop:1}}>{s.label}</div>
                  </div>
                  {hasData&&<span style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:C[s.color],flexShrink:0}}/>}
                </div>
              </div>
            );
          })}
          {analyzed&&(
            <div className="panel" style={{padding:"10px 12px",marginTop:4}}>
              <div style={{fontSize:9,color:C.text2,letterSpacing:.6,marginBottom:6}}>QUICK LINKS</div>
              {[
                {l:"Chart",url:`https://www.tradingview.com/chart/?symbol=NSE:${analyzed.ticker||analyzed.name.replace(/\s/g,"")}`},
                {l:"BSE Filings",url:`https://www.bseindia.com/`},
                {l:"Screener",url:`https://www.screener.in/company/${analyzed.ticker||analyzed.name}/`},
              ].map(lk=>(
                <div key={lk.l} style={{marginBottom:4}}>
                  <button className="btn" style={{width:"100%",fontSize:10,padding:"3px 6px",textAlign:"left"}}
                    onClick={()=>window.open(lk.url,"_blank")}>↗ {lk.l}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Panel */}
        <div className="panel" style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {!result&&!loading&&!error&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:12,color:C.text3}}>◈</div>
              <div style={{fontSize:14,fontWeight:600,color:C.text1,marginBottom:6}}>Corporate Knowledge Base Matrix</div>
              <div style={{fontSize:11,color:C.text2,maxWidth:340,lineHeight:1.7}}>
                Enter a company name above to generate a forensic-level, 6-section institutional intelligence report covering business model, supply chain, product pipeline, capex guidance, management quality, and valuation risks.
              </div>
              <div style={{marginTop:20,display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
                {["EBITDA Margins","Moat Analysis","Revenue Segments","ROCE/ROE","Order Book","Risk Architecture"].map(t=>(
                  <span key={t} style={{padding:"3px 10px",background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,fontSize:10,color:C.text2}}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {loading&&(
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
              <div style={{width:28,height:28,border:`2px solid ${C.border}`,borderTopColor:C.cyan,borderRadius:"50%"}} className="spin"/>
              <div style={{fontSize:12,color:C.text2}}>Building Corporate Knowledge Base for <span style={{color:C.cyan}}>{company}</span>...</div>
              <div style={{fontSize:10,color:C.text3}}>Generating forensic-level institutional intelligence</div>
            </div>
          )}

          {error&&(
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
              <div style={{padding:"12px 16px",background:C.redBg,border:`1px solid ${C.red}40`,borderRadius:4,fontSize:11,color:C.red,maxWidth:400}}>{error}</div>
            </div>
          )}

          {result&&sections[activeSection]&&(
            <>
              <div className="panel-hd" style={{flexShrink:0}}>
                <span style={{fontSize:10,color:C[SECTION_META.find(s=>s.key===activeSection)?.color]||C.cyan,marginRight:6}}>
                  {SECTION_META.find(s=>s.key===activeSection)?.icon}
                </span>
                <span className="panel-hd-title">
                  {SECTION_META.find(s=>s.key===activeSection)?.label} — {analyzed?.name}
                </span>
                <div style={{marginLeft:"auto",display:"flex",gap:4}}>
                  {SECTION_META.map(s=>(
                    <button key={s.key}
                      className={`btn${activeSection===s.key?" btn-active":""}`}
                      style={{padding:"2px 7px",fontSize:9,minWidth:22}}
                      onClick={()=>sections[s.key]&&setActiveSection(s.key)}
                      disabled={!sections[s.key]}>
                      {s.key}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
                {renderSection(sections[activeSection])}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AI Panel ────────────────────────────────────────────────────────────────
function AIPanel({context}) {
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState(null);

  const buildPrompt = (ctx) => {
    if (!ctx) return null;
    if (ctx.type==="sector") {
      return `You are an elite Indian equity market analyst at a top hedge fund.
Provide a sharp, institutional-grade sector commentary for: ${ctx.name}
RS Score: ${ctx.rs}/100 | Momentum: ${ctx.mom} | Breadth: ${ctx.breadth} | Earnings Growth: ${ctx.eg}

Structure your response with these exact sections (keep each concise, 2-3 sentences max):
**SECTOR THESIS**: Why this sector is ${ctx.trend==="up"?"leading":"lagging"} right now.
**MACRO DRIVERS**: Key policy/macro tailwinds or headwinds.
**RISK FACTORS**: 2 specific risks to monitor.
**TOP PICKS**: Name 2-3 stock archetypes that fit the sector setup.
**CONVICTION**: Rate conviction as High/Medium/Low with one-line reason.
Keep it punchy, data-driven, hedge-fund style. No fluff.`;
    }
    if (ctx.type==="filing") {
      return `You are an elite Indian equity market analyst.
Analyze this BSE/NSE filing and provide institutional-grade commentary:

Company: ${ctx.name} (${ctx.ticker})
Filing Type: ${ctx.type}
Summary: ${ctx.summary}
Impact: ${ctx.impact}

Provide:
**MATERIALITY ASSESSMENT**: Is this filing material? Why?
**RSIS IMPACT**: How does this change the stock's scoring? (${ctx.score} already applied)
**EXECUTION RISK**: Key risks in delivering on this announcement.
**TRADING IMPLICATION**: Short-term vs long-term perspective.
Be concise, direct, institutional. No retail-style hype.`;
    }
    return `You are an elite Indian equity market analyst at a top hedge fund.
Provide a sharp institutional analysis for: ${ctx.name} (${ctx.ticker})

Stage: ${ctx.stage || "N/A"} | RSIS Score: ${ctx.score || "N/A"} | Sector: ${ctx.sector}
RS vs CNX500: ${ctx.rs || "N/A"} | Earnings Growth: ${ctx.eg || "N/A"} | Volume Expansion: ${ctx.vol || "N/A"}

Structure your response with these exact sections:
**WHY OUTPERFORMING**: Core business and structural reason for RS strength.
**RECENT TRIGGERS**: 2-3 specific catalysts driving the move.
**ENTRY THESIS**: Why a serious investor should pay attention now.
**RISK FACTORS**: 2 specific risks that could derail the thesis.
**MANAGEMENT QUALITY**: Based on public information, rate management credibility.
**VERDICT**: One sharp sentence on conviction level.
Institutional tone. Concise. No retail language.`;
  };

  const getAI = useCallback(async () => {
    if (!context) return;
    const prompt = buildPrompt(context);
    if (!prompt) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{role:"user",content:prompt}]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.map(b=>b.text||"").join("");
      setResult(text);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  },[context]);

  useEffect(()=>{if(context)getAI();},[context]);

  const renderResult = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p,i)=>{
      if(p.startsWith("**")&&p.endsWith("**")) {
        return <span key={i} style={{color:C.cyan,fontWeight:600}}>{p.slice(2,-2)}</span>;
      }
      return <span key={i}>{p}</span>;
    });
  };

  return (
    <div style={{width:280,display:"flex",flexDirection:"column",gap:8,flexShrink:0,overflow:"hidden"}}>
      <div className="panel" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div className="panel-hd">
          <span className="panel-hd-title">AI Intelligence Panel</span>
          {context&&<button className="btn" style={{padding:"2px 8px",fontSize:10}} onClick={getAI}>↺</button>}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px"}}>
          {!context&&(
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <div style={{fontSize:24,marginBottom:8}}>◈</div>
              <div style={{fontSize:11,color:C.text2}}>Click any stock, sector, or filing to generate AI intelligence</div>
            </div>
          )}
          {loading&&(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{width:20,height:20,border:`2px solid ${C.border}`,borderTopColor:C.cyan,borderRadius:"50%",margin:"0 auto 8px"}} className="spin"/>
              <div style={{fontSize:11,color:C.text2}}>Generating intelligence...</div>
            </div>
          )}
          {error&&(
            <div style={{padding:10,background:C.redBg,border:`1px solid ${C.red}40`,borderRadius:4,fontSize:11,color:C.red}}>
              {error}
            </div>
          )}
          {result&&(
            <div style={{fontSize:11,color:C.text1,lineHeight:1.7}}>
              {context&&<div style={{marginBottom:10,padding:"6px 8px",background:C.cyanBg,borderRadius:3,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,color:C.cyan,fontWeight:600}}>{context.name||context.ticker||"Analysis"}</div>
              </div>}
              {renderResult(result)}
            </div>
          )}
        </div>
      </div>
      <div className="panel" style={{padding:"10px 14px"}}>
        <div style={{fontSize:10,color:C.text2,letterSpacing:.8,marginBottom:6,textTransform:"uppercase"}}>Alert Engine</div>
        {[
          {t:"Stage 2 Breakout",c:"KAYNES",col:C.green},
          {t:"Large Order Win",c:"TDPOWERSYS",col:C.cyan},
          {t:"RS Spike",c:"SUZLON",col:C.cyan},
          {t:"Guidance Upgrade",c:"KEI",col:C.green},
          {t:"Leadership Change",c:"NEWGEN",col:C.red},
        ].map((a,i)=>(
          <div key={i} style={{display:"flex",gap:6,alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${C.text3}`}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:a.col,flexShrink:0}} className="pulse"/>
            <div>
              <div style={{fontSize:10,fontWeight:500}}>{a.t}</div>
              <div style={{fontSize:9,color:C.text2}}>{a.c}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [module,setModule]=useState("stage2");
  const [aiContext,setAiContext]=useState(null);

  const moduleMap = {
    stage2: <Stage2Module setAiContext={setAiContext}/>,
    sector: <SectorModule setAiContext={setAiContext}/>,
    filings: <FilingModule setAiContext={setAiContext}/>,
    concall: <ConcallModule setAiContext={setAiContext}/>,
    rsis: <RSISModule setAiContext={setAiContext}/>,
    corpintel: <CorpIntelModule/>,
  };

  return (
    <>
      <style>{STYLE}</style>
      <div style={{display:"flex",flexDirection:"column",height:"100vh",background:C.bg0}}>
        <IndexBar/>
        <NavBar active={module} setActive={v=>{setModule(v);setAiContext(null);}}/>
        <div style={{flex:1,overflow:"hidden",display:"flex",gap:8,padding:"8px"}}>
          {moduleMap[module]}
          {module !== "corpintel" && <AIPanel context={aiContext}/>}
        </div>
        <div style={{padding:"4px 12px",background:C.bg1,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",flexShrink:0}}>
          <span style={{fontSize:9,color:C.text2}}>AlphaIQ · Indian Market Intelligence Platform · Personal Use</span>
          <span style={{fontSize:9,color:C.text2}}>Data: BSE/NSE · AI: Claude · Charts: TradingView</span>
        </div>
      </div>
    </>
  );
}
