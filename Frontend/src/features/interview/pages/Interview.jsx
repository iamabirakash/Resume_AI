import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useInterview } from '../hooks/useInterview.js'

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: 'code' },
    { id: 'behavioral', label: 'Behavioral Questions', icon: 'forum' },
    { id: 'roadmap', label: 'Roadmap', icon: 'route' },
]

const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false)

    return (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/35">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-white/4"
            >
                <span className="rounded-xl border border-brand-500/30 bg-brand-500/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">
                    Q{index + 1}
                </span>
                <p className="flex-1 text-sm leading-7 text-white sm:text-base">{item.question}</p>
                <span className={`material-symbols-outlined text-slate-400 transition ${open ? 'rotate-180 text-cyan-200' : ''}`}>
                    expand_more
                </span>
            </button>

            {open && (
                <div className="space-y-4 border-t border-white/10 px-5 py-5">
                    <div className="rounded-[1.25rem] border border-violet-400/20 bg-violet-500/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-200">Intention</p>
                        <p className="mt-2 text-sm leading-7 text-slate-200">{item.intention}</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">Model answer</p>
                        <p className="mt-2 text-sm leading-7 text-slate-200">{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className="relative rounded-3xl border border-white/10 bg-slate-950/30 p-5 sm:p-6">
        <div className="absolute left-6 top-6 h-4 w-4 rounded-full border-4 border-cyan-300 bg-slate-950" />
        <div className="ml-8">
            <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    Day {day.day}
                </span>
                <h3 className="font-display text-2xl font-bold text-white">{day.focus}</h3>
            </div>
            <ul className="mt-5 space-y-3">
                {day.tasks.map((task, index) => (
                    <li key={`${day.day}-${index}`} className="flex items-start gap-3 text-sm leading-7 text-slate-200">
                        <span className="mt-3 h-2 w-2 rounded-full bg-brand-400" />
                        <span>{task}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
)

const LoadingView = () => (
    <main className="flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel flex w-full max-w-md flex-col items-center gap-4 rounded-4xl px-8 py-10 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500/40 border-t-cyan-500" />
            <div>
                <h1 className="font-display text-2xl font-bold text-white">Loading your interview plan</h1>
                <p className="mt-2 text-sm text-slate-300">The dashboard is assembling questions, score, and roadmap.</p>
            </div>
        </div>
    </main>
)

const scoreTheme = (score) => {
    if (score >= 80) {
        return {
            ring: 'from-emerald-400 to-emerald-600',
            badge: 'text-emerald-200 bg-emerald-500/10 border-emerald-400/20',
            text: 'Strong match for this role',
        }
    }

    if (score >= 60) {
        return {
            ring: 'from-amber-300 to-orange-500',
            badge: 'text-amber-200 bg-amber-500/10 border-amber-400/20',
            text: 'Promising fit with a few gaps to close',
        }
    }

    return {
        ring: 'from-rose-300 to-rose-600',
        badge: 'text-rose-200 bg-rose-500/10 border-rose-400/20',
        text: 'Needs more prep before this role feels comfortable',
    }
}

const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical')
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [interviewId])

    if (loading || !report) {
        return <LoadingView />
    }

    const score = scoreTheme(report.matchScore)
    const sections = {
        technical: {
            title: 'Technical Questions',
            count: `${report.technicalQuestions.length} questions`,
            content: report.technicalQuestions.map((q, i) => <QuestionCard key={`tech-${i}`} item={q} index={i} />),
        },
        behavioral: {
            title: 'Behavioral Questions',
            count: `${report.behavioralQuestions.length} questions`,
            content: report.behavioralQuestions.map((q, i) => <QuestionCard key={`behavioral-${i}`} item={q} index={i} />),
        },
        roadmap: {
            title: 'Preparation Roadmap',
            count: `${report.preparationPlan.length}-day plan`,
            content: (
                <div className="relative space-y-4 before:absolute before:bottom-0 before:left-8 before:top-0 before:w-px before:bg-linear-to-b before:from-cyan-300 before:to-transparent">
                    {report.preparationPlan.map((day) => (
                        <RoadMapDay key={day.day} day={day} />
                    ))}
                </div>
            ),
        },
    }

    const activeSection = sections[activeNav]

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,71,111,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(0,183,216,0.18),transparent_26%)]" />

            <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-10">
                <header className="animate-fade-up flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Interview report</p>
                        <h1 className="font-display mt-4 text-balance text-4xl font-extrabold tracking-[-0.05em] text-white sm:text-5xl">
                            {report.title || 'Interview preparation dashboard'}
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                            Switch between question sets, review skill gaps, and export your resume draft when you are ready.
                        </p>
                    </div>

                    <button
                        onClick={() => getResumePdf(interviewId)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 py-4 font-semibold text-white transition hover:bg-white/14"
                    >
                        <span className="material-symbols-outlined text-base">download</span>
                        Download resume PDF
                    </button>
                </header>

                <div className="mt-10 grid gap-8 xl:grid-cols-[17rem_minmax(0,1fr)_20rem]">
                    <nav className="glass-panel animate-fade-up rounded-4xl p-4">
                        <p className="px-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">Sections</p>
                        <div className="mt-4 space-y-2">
                            {NAV_ITEMS.map((item) => {
                                const isActive = activeNav === item.id

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveNav(item.id)}
                                        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                                            isActive
                                                ? 'bg-white text-slate-950 shadow-[0_18px_40px_rgba(255,255,255,0.15)]'
                                                : 'text-slate-300 hover:bg-white/7 hover:text-white'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                        {item.label}
                                    </button>
                                )
                            })}
                        </div>
                    </nav>

                    <main className="glass-panel animate-fade-up-delay scrollbar-none max-h-[calc(100vh-7rem)] overflow-y-auto rounded-4xl p-5 sm:p-7">
                        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-200">Current section</p>
                                <h2 className="font-display mt-2 text-3xl font-bold text-white">{activeSection.title}</h2>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                                {activeSection.count}
                            </span>
                        </div>

                        <div className="mt-6 space-y-4">{activeSection.content}</div>
                    </main>

                    <aside className="animate-fade-up-delay space-y-6">
                        <div className="glass-panel rounded-4xl p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">Match score</p>
                            <div className="mt-5 flex justify-center">
                                <div className={`relative flex h-36 w-36 items-center justify-center rounded-full bg-linear-to-br ${score.ring} p-0.5`}>
                                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-slate-950">
                                        <span className="font-display text-5xl font-extrabold text-white">{report.matchScore}</span>
                                        <span className="text-sm text-slate-400">percent</span>
                                    </div>
                                </div>
                            </div>
                            <p className={`mt-5 rounded-2xl border px-4 py-3 text-sm leading-6 ${score.badge}`}>{score.text}</p>
                        </div>

                        <div className="glass-panel rounded-4xl p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">Skill gaps</p>
                            <div className="mt-5 flex flex-wrap gap-3">
                                {report.skillGaps.map((gap, index) => {
                                    const severityClasses =
                                        gap.severity === 'high'
                                            ? 'border-rose-400/20 bg-rose-500/10 text-rose-200'
                                            : gap.severity === 'medium'
                                                ? 'border-amber-400/20 bg-amber-500/10 text-amber-200'
                                                : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200'

                                    return (
                                        <span
                                            key={`${gap.skill}-${index}`}
                                            className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${severityClasses}`}
                                        >
                                            {gap.skill}
                                        </span>
                                    )
                                })}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default Interview
