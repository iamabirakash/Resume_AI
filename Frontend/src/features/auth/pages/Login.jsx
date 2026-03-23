import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({ email, password })
        navigate('/')
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7f9fb] px-6">
                <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-4xl bg-white px-8 py-10 text-center shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#111c2d] border-t-transparent" />
                    <div>
                        <p className="font-display text-2xl font-bold text-[#191c1e]">Welcome Back</p>
                        <p className="mt-2 text-sm text-[#45464d]">Please wait while we restore your workspace.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f7f9fb] font-sans text-[#191c1e] selection:bg-[#d0e1fb]">
            <header className="absolute top-0 z-50 flex w-full items-center justify-between bg-transparent px-12 py-8">
                <Link to="/" className="font-display text-4xl font-bold tracking-wider text-white">
                    Resume Analyzer
                </Link>

                {/* <nav className="hidden items-center gap-8 md:flex">
                    <Link
                        to="/register"
                        className="rounded-lg bg-[#111c2d] px-6 py-2 font-semibold text-white transition-all hover:opacity-80"
                    >
                        Sign Up
                    </Link>
                </nav> */}
            </header>

            <main className="relative flex max-h-screen flex-col items-stretch md:flex-row">
                <section className="relative hidden overflow-hidden md:block md:w-[60%]">
                    <div className="absolute inset-0 z-10 bg-[#111c2d]/20 mix-blend-multiply" />
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRhL9khKYawvOG14QbTAhOv4Vhf7eFFc_SS1qqK3r1PzKBb6K8Rv3y7qd4pDlGXAkavaphttP8_9t0zB-iCbxvSRJvTAzQSCCySCbbGSN01PywxbthawkHgnt08-MYnUbSBnVjm1RGD7mOzUIHHZ7HOA8EfH1HsnBus-xjTK0KqenVq19WBTk-MeMNmSWcQ4t_Jvo7dJCHgIRVMn4zbFrWrT3hbiG01O5SwjOjnr4V5JzBeVCXdRyEx7RlzgpqZvCCP09P1f9zYQ"
                        alt="Modern professional office interior"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 z-20 bg-linear-to-tr from-[#111c2d] via-transparent to-transparent opacity-60" />

                    <div className="absolute bottom-24 left-12 z-30 max-w-xl">
                        <h1 className="font-display mb-4 text-6xl font-extrabold tracking-tight text-white">
                            AI-Powered <br /> Resume Builder
                        </h1>
                        <p className="max-w-md text-lg font-light leading-relaxed text-[#bcc7de]">
                            Craft your professional future with AI-driven precision and sophisticated design. Your career, elevated.
                        </p>
                    </div>
                </section>

                <section className="relative flex w-full items-center justify-center bg-[#f7f9fb] p-8 md:w-[40%]">
                    <div className="absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-[#f2f4f6] opacity-50 blur-3xl" />

                    <div className="relative z-10 w-full max-w-md">
                        <div className="mb-12">
                            <h2 className="font-display text-center mb-2 text-3xl font-bold tracking-tight text-[#191c1e]">
                                Welcome Back
                            </h2>
                            <p className="font-medium text-[#45464d]">
                                Please enter your credentials to access your secure workspace.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-bold uppercase tracking-[0.2em] text-[#45464d]"
                                >
                                    Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full rounded-md border-none bg-[#e0e3e5] px-4 py-4 text-[#191c1e] outline-none transition-all placeholder:text-[#76777d] focus:bg-white focus:ring-2 focus:ring-[#008cc7]/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="block text-xs font-bold uppercase tracking-[0.2em] text-[#45464d]"
                                    >
                                        Password
                                    </label>
                                    <a
                                        className="text-xs font-semibold text-[#004c6e] underline-offset-4 hover:underline"
                                        href="#"
                                    >
                                        Forgot Password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full rounded-md border-none bg-[#e0e3e5] px-4 py-4 text-[#191c1e] outline-none transition-all placeholder:text-[#76777d] focus:bg-white focus:ring-2 focus:ring-[#008cc7]/30"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group flex w-full items-center justify-center gap-2 rounded-md bg-[#111c2d] py-4 font-semibold text-white shadow-[0_20px_40px_rgba(25,28,30,0.06)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    <span>Sign In</span>
                                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                                        arrow_forward
                                    </span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-12 text-center">
                            <p className="text-[#45464d]">
                                Don&apos;t have an account?
                                <Link
                                    to="/register"
                                    className="ml-1 font-bold text-black underline-offset-4 hover:underline"
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </div>

                        <div className="mx-auto flex w-fit items-center justify-center gap-3 rounded-full bg-[#f2f4f6] px-4 py-3">
                            <span
                                className="material-symbols-outlined text-sm text-[#008cc7]"
                                style={{ fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' }}
                            >
                                verified_user
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#004c6e]">
                                Encrypted Session
                            </span>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="absolute bottom-0 z-50 hidden w-full items-center justify-between bg-transparent px-12 md:flex">
                <div className="text-xs font-medium text-slate-400">
                    © 2026 Resume Analyzer. All rights reserved.
                </div>
            </footer>
        </div>
    )
}

export default Login
