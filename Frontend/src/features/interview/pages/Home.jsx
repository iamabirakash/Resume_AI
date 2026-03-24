import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useInterview } from '../hooks/useInterview.js'

const formatDate = (value) => {
    if (!value) return 'N/A'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return 'N/A'
    return d.toLocaleDateString('en-US')
}

const scoreTone = (score = 0) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700'
    if (score >= 60) return 'bg-cyan-50 text-cyan-700'
    return 'bg-rose-50 text-rose-700'
}

const LoadingView = () => (
    <main className="flex min-h-screen items-center justify-center bg-[#e9edf2]">
        <div className="rounded-lg border border-[#d8dde5] bg-white px-5 py-3 text-sm font-semibold text-[#2a3750]">Loading dashboard...</div>
    </main>
)

const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const [jobDescription, setJobDescription] = useState('')
    const [selfDescription, setSelfDescription] = useState('')
    const [selectedFileName, setSelectedFileName] = useState('')
    const resumeInputRef = useRef()
    const navigate = useNavigate()

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current?.files?.[0]
        const data = await generateReport({ jobDescription, selfDescription, resumeFile })
        if (data?._id) navigate(`/interview/${data._id}`)
    }

    if (loading) return <LoadingView />

    return (
        <div className="min-h-screen bg-[#e9edf2] text-[#1b263b]">
            <div className="flex min-h-screen">
                <aside className="hidden w-64 shrink-0 border-r border-[#dce2ea] bg-[#f5f7fa] p-6 lg:flex lg:flex-col">
                    <div>
                        <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-black">Obsidian Slate</h1>
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#72819b]">Executive Suite</p>
                    </div>
                    <nav className="mt-10 space-y-1">
                        <a href="#" className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 font-semibold text-cyan-700">
                            <span className="material-symbols-outlined">dashboard</span>Dashboard
                        </a>
                        <a href="#" className="flex items-center gap-3 rounded-lg px-4 py-3 text-[#647692] hover:bg-white/80">
                            <span className="material-symbols-outlined">description</span>Resumes
                        </a>
                        <a href="#" className="flex items-center gap-3 rounded-lg px-4 py-3 text-[#647692] hover:bg-white/80">
                            <span className="material-symbols-outlined">auto_awesome</span>AI Optimizer
                        </a>
                        <a href="#" className="flex items-center gap-3 rounded-lg px-4 py-3 text-[#647692] hover:bg-white/80">
                            <span className="material-symbols-outlined">layers</span>Templates
                        </a>
                        <a href="#" className="flex items-center gap-3 rounded-lg px-4 py-3 text-[#647692] hover:bg-white/80">
                            <span className="material-symbols-outlined">bar_chart</span>Analytics
                        </a>
                    </nav>
                    <div className="mt-auto">
                        <button className="w-full rounded-lg bg-[#0f1f37] py-3 text-base font-bold text-white">Create New Resume</button>
                        <div className="mt-5 space-y-1 text-[#647692]">
                            <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/80">
                                <span className="material-symbols-outlined">settings</span>Settings
                            </a>
                            <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/80">
                                <span className="material-symbols-outlined">help_outline</span>Support
                            </a>
                        </div>
                    </div>
                </aside>

                <main className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-20 border-b border-[#dce2ea] bg-white/95">
                        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
                            <div className="flex items-center gap-8">
                                <p className="font-display text-3xl font-bold text-[#111a2b]">Resume Architect</p>
                                <nav className="hidden gap-6 text-lg font-semibold text-[#5e708d] md:flex">
                                    <a href="#" className="hover:text-[#111a2b]">Drafts</a>
                                    <a href="#" className="hover:text-[#111a2b]">Archive</a>
                                </nav>
                            </div>
                            <label className="hidden w-72 items-center gap-2 rounded-lg bg-[#eef2f6] px-3 py-2 md:flex">
                                <span className="material-symbols-outlined !text-base text-[#8d99ae]">search</span>
                                <input type="text" placeholder="Search strategy..." className="w-full bg-transparent text-sm text-[#677892] outline-none" />
                            </label>
                        </div>
                    </header>

                    <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
                        <h2 className="font-display text-5xl font-extrabold tracking-tight text-black">Build Your Custom Prep Plan</h2>
                        <p className="mt-2 max-w-3xl text-2xl text-[#667794]">
                            Synthesize your career narrative with target role requirements to generate an elite-level interview strategy.
                        </p>

                        <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_360px]">
                            <div className="space-y-8">
                                <div className="grid gap-7 md:grid-cols-2">
                                    <div className="rounded-xl border border-[#dce2ea] bg-white p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="font-display text-3xl font-bold uppercase text-[#0f172a]">Target Job Description</h3>
                                            <span className="rounded-sm bg-[#0f1f37] px-2 py-1 text-xs font-bold uppercase text-white">Required</span>
                                        </div>
                                        <textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste the full job posting text here..."
                                            className="h-[410px] w-full resize-none rounded-lg border border-[#d6dce6] bg-[#edf2f7] p-4 text-base text-[#455571] outline-none focus:border-cyan-600"
                                        />
                                    </div>

                                    <div className="rounded-xl border border-[#dce2ea] bg-white p-6">
                                        <h3 className="font-display text-3xl font-bold uppercase text-[#0f172a]">Your Profile</h3>
                                        <label htmlFor="resume" className="mt-4 flex h-[318px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-cyan-300 bg-[#f8fcff] px-5 text-center hover:bg-cyan-50">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                                            </div>
                                            <p className="mt-4 text-2xl font-bold text-[#0f172a]">
                                                Click to upload <span className="text-cyan-700">or drag and drop</span>
                                            </p>
                                            <p className="mt-2 text-lg text-[#93a1b6]">{selectedFileName || 'PDF, DOCX (Max 10MB)'}</p>
                                            <input
                                                ref={resumeInputRef}
                                                hidden
                                                id="resume"
                                                type="file"
                                                accept=".pdf,.docx"
                                                onChange={(e) => setSelectedFileName(e.target.files?.[0]?.name || '')}
                                            />
                                        </label>
                                        <label className="mt-6 block text-sm font-bold uppercase tracking-[0.18em] text-[#7e8ea9]">Quick self-description</label>
                                        <input
                                            value={selfDescription}
                                            onChange={(e) => setSelfDescription(e.target.value)}
                                            className="mt-2 w-full rounded-lg border border-[#d6dce6] bg-[#edf2f7] px-4 py-3 text-lg text-[#455571] outline-none focus:border-cyan-600"
                                            placeholder="e.g. Senior Product Designer with 8+ years exp..."
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-between gap-6 rounded-xl border border-cyan-200 bg-white p-6 md:flex-row">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold text-[#0f172a]">Privacy Encrypted</p>
                                            <p className="text-xl text-[#647692]">Your data is processed via secure executive-grade AI protocols.</p>
                                        </div>
                                    </div>
                                    <button onClick={handleGenerateReport} className="w-full rounded-lg bg-black px-10 py-4 text-lg font-extrabold uppercase tracking-[0.14em] text-white md:w-auto">
                                        Generate my interview strategy
                                    </button>
                                </div>
                            </div>

                            <aside className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-[#7e8ea9]">History</h3>
                                    <button className="text-sm font-bold uppercase text-cyan-700">View All</button>
                                </div>
                                {reports.length > 0 ? (
                                    reports.slice(0, 4).map((report) => (
                                        <button
                                            key={report._id}
                                            onClick={() => navigate(`/interview/${report._id}`)}
                                            className="w-full rounded-xl border border-[#dce2ea] bg-white p-5 text-left"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <h4 className="text-3xl font-bold text-[#0f172a]">{report.title || 'Untitled Position'}</h4>
                                                <span className={`rounded px-2 py-1 text-sm font-bold uppercase ${scoreTone(report.matchScore)}`}>
                                                    {report.matchScore ?? 0}% Match
                                                </span>
                                            </div>
                                            <div className="mt-3 flex items-center gap-4 text-lg text-[#647692]">
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined !text-base">business</span>
                                                    <span>{report.company || 'Company'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined !text-base">schedule</span>
                                                    <span>{formatDate(report.createdAt)}</span>
                                                </div>
                                            </div>
                                            <p className="mt-3 text-sm text-[#8ea0bc]">{report.matchScore >= 80 ? 'Ready for review' : 'Strategy generated successfully'}</p>
                                        </button>
                                    ))
                                ) : (
                                    <div className="flex min-h-[220px] items-center justify-center rounded-xl border-2 border-dotted border-[#ced6e3] bg-[#edf2f8] p-8 text-center text-lg text-[#9aa8be]">
                                        Previous iterations will appear here once generated.
                                    </div>
                                )}
                                <div className="relative overflow-hidden rounded-xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80"
                                        alt="Modern office interior"
                                        className="h-[320px] w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#071222] via-[#0d2238]/70 to-transparent p-5 text-white">
                                        <div className="absolute bottom-5 left-5 right-5">
                                            <span className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-400">Pro Advice</span>
                                            <p className="mt-2 text-4xl font-extrabold">The Architectural Narrative</p>
                                            <p className="mt-2 text-base text-slate-200">Mastering the interview is about framing your experience as the answer.</p>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Home
