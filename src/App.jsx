import { useState } from 'react'

const regions = [
  'United States','Canada','United Kingdom','Australia','Dubai (UAE)','Singapore','Hong Kong','India','Europe (EU Standard CV)'
]
const types = [
  'Chronological','Functional','Combination','Infographic','Profile','Targeted','Nontraditional','Mini-Resume'
]
const tones = ['Formal','Concise','Creative','Executive']

function App() {
  const [mode, setMode] = useState('landing')
  const [subMode, setSubMode] = useState('upload')
  const [file, setFile] = useState(null)
  const [basic, setBasic] = useState({ name:'', email:'', phone:'', location:'', summary:'', education:[], experience:[], skills:[], certifications:[], achievements:[], target_role:'' })
  const [skillInput, setSkillInput] = useState('')
  const [options, setOptions] = useState({ region: regions[0], resume_type: types[0], tone: tones[0] })
  const [result, setResult] = useState(null)
  const [ats, setAts] = useState(null)
  const [loading, setLoading] = useState(false)

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const startUpload = () => { setMode('builder'); setSubMode('upload') }
  const startBasic = () => { setMode('builder'); setSubMode('basic') }

  const handleUpload = async () => {
    if(!file) { alert('Please select a file (PDF/DOCX/TXT)'); return }
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${backend}/api/parse-upload`,{ method:'POST', body: form })
      const data = await res.json()
      setResult(data.extracted)
      setAts(72)
    } catch (e) {
      console.error(e)
      alert('Upload failed')
    } finally { setLoading(false) }
  }

  const handleGenerate = async () => {
    if(!basic.name || !basic.email){
      alert('Please enter at least name and email')
      return
    }
    setLoading(true)
    try {
      const payload = { basic, options }
      const res = await fetch(`${backend}/api/generate-from-basic`, {
        method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload)
      })
      const data = await res.json()
      setResult(data.resume)
      setAts(data.ats_score)
    } catch (e) {
      console.error(e)
      alert('Generation failed')
    } finally { setLoading(false) }
  }

  const handleOptimize = async () => {
    if(!result) return
    setLoading(true)
    try {
      const res = await fetch(`${backend}/api/optimize`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ resume: result, options }) })
      const data = await res.json()
      setResult(data.resume)
      setAts(data.ats_score)
    } catch (e) {
      console.error(e)
      alert('Optimization failed')
    } finally { setLoading(false) }
  }

  const addSkill = () => {
    if(skillInput.trim()){
      setBasic(b=>({ ...b, skills:[...b.skills, skillInput.trim()] }))
      setSkillInput('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="px-6 py-4 border-b bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-blue-600" />
            <span className="font-bold text-lg">AI Resume Builder</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm text-gray-600">
            <span>Region</span>
            <select className="border rounded px-2 py-1" value={options.region} onChange={e=>setOptions(o=>({ ...o, region:e.target.value }))}>{regions.map(r=> <option key={r}>{r}</option>)}</select>
            <span>Type</span>
            <select className="border rounded px-2 py-1" value={options.resume_type} onChange={e=>setOptions(o=>({ ...o, resume_type:e.target.value }))}>{types.map(r=> <option key={r}>{r}</option>)}</select>
            <span>Tone</span>
            <select className="border rounded px-2 py-1" value={options.tone} onChange={e=>setOptions(o=>({ ...o, tone:e.target.value }))}>{tones.map(r=> <option key={r}>{r}</option>)}</select>
          </div>
        </div>
      </header>

      {mode==='landing' && (
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Build or Transform Your Resume with AI</h1>
            <p className="mt-3 text-slate-600">Upload an existing resume or start with basic details. Get ATS-friendly, region-specific, beautifully formatted results in minutes.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={startUpload} className="bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-700">Upload Resume</button>
              <button onClick={startBasic} className="bg-white text-blue-700 border border-blue-200 px-5 py-3 rounded-lg hover:bg-blue-50">Start from Scratch</button>
            </div>
          </div>
        </main>
      )}

      {mode==='builder' && (
        <main className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-6">
          <section className="bg-white rounded-xl shadow p-6 space-y-4">
            <div className="flex gap-2">
              <button onClick={()=>setSubMode('upload')} className={`px-3 py-2 rounded ${subMode==='upload'?'bg-blue-600 text-white':'bg-gray-100'}`}>Upload Resume</button>
              <button onClick={()=>setSubMode('basic')} className={`px-3 py-2 rounded ${subMode==='basic'?'bg-blue-600 text-white':'bg-gray-100'}`}>Start from Scratch</button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 md:hidden">
              <select className="border rounded p-2" value={options.region} onChange={e=>setOptions(o=>({ ...o, region:e.target.value }))}>{regions.map(r=> <option key={r}>{r}</option>)}</select>
              <select className="border rounded p-2" value={options.resume_type} onChange={e=>setOptions(o=>({ ...o, resume_type:e.target.value }))}>{types.map(r=> <option key={r}>{r}</option>)}</select>
              <select className="border rounded p-2" value={options.tone} onChange={e=>setOptions(o=>({ ...o, tone:e.target.value }))}>{tones.map(r=> <option key={r}>{r}</option>)}</select>
            </div>

            {subMode==='upload' ? (
              <div className="space-y-3">
                <input type="file" accept=".pdf,.docx,.txt" onChange={e=>setFile(e.target.files?.[0])} />
                <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading}>{loading?'Processing…':'Extract & Rebuild'}</button>
                <p className="text-xs text-gray-500">Supported: PDF, DOCX, TXT</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input className="border rounded p-2" placeholder="Name" value={basic.name} onChange={e=>setBasic(b=>({...b, name:e.target.value}))}/>
                  <input className="border rounded p-2" placeholder="Email" value={basic.email} onChange={e=>setBasic(b=>({...b, email:e.target.value}))}/>
                  <input className="border rounded p-2" placeholder="Phone" value={basic.phone} onChange={e=>setBasic(b=>({...b, phone:e.target.value}))}/>
                  <input className="border rounded p-2" placeholder="Location" value={basic.location} onChange={e=>setBasic(b=>({...b, location:e.target.value}))}/>
                </div>
                <textarea className="border rounded p-2 w-full" rows={3} placeholder="Career Objective / Summary" value={basic.summary||''} onChange={e=>setBasic(b=>({...b, summary:e.target.value}))}></textarea>

                <div className="flex gap-2">
                  <input className="border rounded p-2 flex-1" placeholder="Add a skill and press +" value={skillInput} onChange={e=>setSkillInput(e.target.value)} />
                  <button onClick={addSkill} className="px-3 py-2 bg-gray-200 rounded">+</button>
                </div>
                {basic.skills.length>0 && (
                  <div className="flex flex-wrap gap-2">
                    {basic.skills.map((s,i)=> <span key={i} className="px-2 py-1 text-sm bg-gray-100 rounded">{s}</span>)}
                  </div>
                )}

                <button onClick={handleGenerate} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading}>{loading?'Generating…':'Generate Resume'}</button>
              </div>
            )}

            {result && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">ATS Score: {ats ?? '—'}</p>
                  <button onClick={handleOptimize} className="text-blue-600 hover:underline">Optimize</button>
                </div>
              </div>
            )}
          </section>

          <section className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-3">Live Preview</h3>
            {!result ? (
              <p className="text-gray-500">Upload a resume or generate from basics to preview.</p>
            ) : (
              <div className="prose max-w-none">
                <h1 className="text-2xl font-bold">{result.name}</h1>
                <p className="text-sm text-gray-600">{[result.email, result.phone, result.location].filter(Boolean).join(' • ')}</p>
                {result.summary && <p className="mt-3">{result.summary}</p>}
                {result.skills && result.skills.length>0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold">Skills</h4>
                    <ul className="list-disc ml-5">
                      {result.skills.map((s,i)=> <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {result.experience && result.experience.length>0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold">Experience</h4>
                    <ul className="space-y-2">
                      {result.experience.map((e,i)=> (
                        <li key={i}>
                          <div className="font-medium">{e.title} • {e.company}</div>
                          <div className="text-sm text-gray-600">{[e.location, e.start_date && `${e.start_date} - ${e.end_date||'Present'}`].filter(Boolean).join(' • ')}</div>
                          {e.bullets && e.bullets.length>0 && (
                            <ul className="list-disc ml-5 text-sm mt-1">
                              {e.bullets.map((b,j)=> <li key={j}>{b}</li>)}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.education && result.education.length>0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold">Education</h4>
                    <ul className="space-y-1">
                      {result.education.map((e,i)=> (
                        <li key={i} className="text-sm">
                          <span className="font-medium">{e.degree||''} {e.field?`in ${e.field}`:''}</span> — {e.school} {e.end_date?`(${e.end_date})`:''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      )}

      <footer className="text-center text-xs text-gray-500 py-6">ATS-friendly • Region-aware • LLM-ready</footer>
    </div>
  )
}

export default App
