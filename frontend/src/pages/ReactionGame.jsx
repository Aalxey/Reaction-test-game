import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Zap, RotateCcw, LayoutDashboard, Trophy, ShieldAlert, ShieldCheck, Timer } from 'lucide-react';
import { API_BASE_URL } from '../config';

const ReactionGame = () => {
    const navigate = useNavigate();
    const savedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    // Check authentication
    useEffect(() => {
        if (!savedUser.token) {
            navigate('/login');
        }
    }, [navigate, savedUser.token]);

    // Game States: 'idle', 'waiting', 'ready', 'result', 'early', 'finished'
    const [gameState, setGameState] = useState('idle');
    const [saveStatus, setSaveStatus] = useState('idle');
    const [startTime, setStartTime] = useState(0);
    const [reactionTime, setReactionTime] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const timeoutRef = useRef(null);

    const MAX_ATTEMPTS = 3;

    const startGame = () => {
        if (gameState === 'finished') {
            setAttempts([]);
            setSaveStatus('idle');
        }

        setGameState('waiting');
        setReactionTime(null);
        const delay = Math.floor(Math.random() * 3000) + 2000;

        timeoutRef.current = setTimeout(() => {
            setGameState('ready');
            setStartTime(Date.now());
        }, delay);
    };

    const handleClick = () => {
        if (gameState === 'idle') {
            startGame();
        } else if (gameState === 'waiting') {
            clearTimeout(timeoutRef.current);
            setGameState('early');
            toast.warning("Jumped the Gun!", {
                description: "Wait for the green signal to initiate response.",
                icon: <ShieldAlert size={16} />
            });
        } else if (gameState === 'ready') {
            const endTime = Date.now();
            const time = endTime - startTime;
            setReactionTime(time);

            const newAttempts = [...attempts, time];
            setAttempts(newAttempts);

            if (newAttempts.length === MAX_ATTEMPTS) {
                setGameState('finished');
                saveScore(newAttempts);
            } else {
                setGameState('result');
            }
        } else if (gameState === 'result' || gameState === 'early') {
            startGame();
        } else if (gameState === 'finished') {
            setAttempts([]);
            setGameState('idle');
        }
    };

    const getRankMessage = (avg) => {
        if (avg < 200) return { rank: "GODLIKE", color: "text-amber-400", sub: "Elite cognitive profile detected." };
        if (avg < 250) return { rank: "PRO GAMER", color: "text-indigo-400", sub: "Response time exceeds average parameters." };
        if (avg < 300) return { rank: "OPERATIVE", color: "text-emerald-400", sub: "Standard performance levels maintained." };
        if (avg < 400) return { rank: "CITIZEN", color: "text-slate-400", sub: "Baseline cognitive latency observed." };
        return { rank: "SLOTH", color: "text-rose-500", sub: "Significant processing delay detected." };
    };

    const saveScore = async (finalAttempts) => {
        const avg = Math.round(finalAttempts.reduce((a, b) => a + b, 0) / finalAttempts.length);
        setSaveStatus('saving');
        const saveToast = toast.loading("Archiving Results", {
            description: "Transmitting telemetry to central archive..."
        });

        try {
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
            if (!user) {
                setSaveStatus('error');
                toast.error("Telemetry Error", { id: saveToast, description: "Identity context lost." });
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/games/scores/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${user.token}`
                },
                body: JSON.stringify({
                    score: avg,
                    game_type: 'reaction_time'
                })
            });

            if (!response.ok) {
                setSaveStatus('error');
                toast.error("Archive Failed", { id: saveToast, description: "Protocol rejected by central core." });
            } else {
                setSaveStatus('saved');
                toast.success("Protocol Complete", {
                    id: saveToast,
                    description: "Neural performance data archived.",
                    icon: <ShieldCheck size={16} className="text-emerald-400" />
                });
            }
        } catch (error) {
            setSaveStatus('error');
            toast.error("Transmission Failure", { id: saveToast, description: "Uplink interrupted." });
        }
    };

    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    const getStateConfig = () => {
        switch (gameState) {
            case 'idle':
                return {
                    bg: 'bg-[#020305]',
                    icon: <div className="p-8 rounded-[40px] bg-indigo-500/5 border border-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.1)]"><Zap size={80} className="text-indigo-400" /></div>,
                    title: 'NEURAL LINK',
                    text: 'Tap anywhere to initiate protocol',
                    subtext: 'Wait for green, then respond instantly.'
                };
            case 'waiting':
                return {
                    bg: 'bg-rose-950/20',
                    icon: <div className="p-8 rounded-[40px] bg-rose-500/10 border border-rose-500/20 animate-pulse"><Timer size={80} className="text-rose-400" /></div>,
                    title: 'STAND BY',
                    text: `SEQUENCE ${attempts.length + 1} / ${MAX_ATTEMPTS}`,
                    subtext: 'Response inhibition active...'
                };
            case 'ready':
                return {
                    bg: 'bg-emerald-500',
                    icon: <Zap size={100} className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]" />,
                    title: 'RESPOND!',
                    text: 'IMMEDIATE ACTION REQUIRED',
                    subtext: ''
                };
            case 'result':
                return {
                    bg: 'bg-indigo-600',
                    icon: <Zap size={80} className="text-white" />,
                    title: `${reactionTime}ms`,
                    text: 'Protocol Step Complete',
                    subtext: 'Tap to continue the sequence.'
                };
            case 'early':
                return {
                    bg: 'bg-amber-600',
                    icon: <ShieldAlert size={80} className="text-white" />,
                    title: 'PRE-EMPTIVE',
                    text: 'Neural inhibition failure.',
                    subtext: 'Tap to retry sequence step.'
                };
            case 'finished':
                const avg = Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
                const { rank, color, sub } = getRankMessage(avg);
                return {
                    bg: 'bg-[#020305]',
                    icon: <div className={`p-8 rounded-[40px] bg-white/5 border border-white/10`}><Trophy size={80} className={color} /></div>,
                    title: `${avg}ms`,
                    text: rank,
                    subtext: sub,
                    isResult: true
                };
            default:
                return { bg: 'bg-[#020305]' };
        }
    };

    const config = getStateConfig();

    return (
        <div
            className={`min-h-screen w-full transition-all duration-500 ease-out cursor-pointer select-none flex flex-col items-center justify-center relative overflow-hidden ${config.bg}`}
            onMouseDown={handleClick}
        >
            <AnimatePresence>
                {gameState === 'idle' || gameState === 'finished' ? (
                    <div className="aura-container"><div className="aura-blob aura-1"></div><div className="aura-blob aura-2"></div></div>
                ) : null}
            </AnimatePresence>

            <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    navigate('/dashboard');
                }}
                className="absolute top-6 left-6 md:top-8 md:left-8 p-2.5 md:p-3 rounded-2xl glass-panel-bright hover:scale-110 active:scale-90 transition-all z-50 text-white"
            >
                <ArrowLeft size={20} className="md:w-6 md:h-6" />
            </button>

            <motion.div
                key={gameState}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                className="text-center p-6 md:p-8 z-10 w-full max-w-4xl"
            >
                <div className="flex justify-center mb-8">
                    {config.icon}
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter font-outfit">
                    {config.title}
                </h1>

                <p className="text-xl md:text-2xl text-white/90 font-black uppercase tracking-[0.2em] mb-3">
                    {config.text}
                </p>

                {config.subtext && (
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.1em] max-w-md mx-auto leading-relaxed">
                        {config.subtext}
                    </p>
                )}

                {config.isResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12"
                    >
                        <div className="flex flex-wrap gap-3 md:gap-6 justify-center mb-10 md:mb-12">
                            {attempts.map((time, i) => (
                                <div key={i} className="flex flex-col items-center px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl glass-panel-bright min-w-[80px]">
                                    <span className="text-indigo-400 text-[9px] md:text-[10px] uppercase font-black tracking-widest mb-1">Step {i + 1}</span>
                                    <span className="text-white text-xl md:text-2xl font-black">{time}<small className="text-[10px] md:text-xs ml-0.5 md:ml-1 opacity-50">ms</small></span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center relative z-20">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/dashboard');
                                }}
                                className="flex items-center gap-2 px-8 py-4 rounded-2xl glass-panel-bright text-white font-black text-xs uppercase tracking-widest hover:border-white/20"
                            >
                                <LayoutDashboard size={18} /> Exit Protocol
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    startGame();
                                }}
                                className="flex items-center gap-2 px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(99,102,241,0.4)]"
                            >
                                <RotateCcw size={18} /> Re-Initialize
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/leaderboard');
                                }}
                                className="flex items-center gap-2 px-8 py-4 rounded-2xl glass-panel-bright text-white font-black text-xs uppercase tracking-widest hover:border-white/20"
                            >
                                <Trophy size={18} /> Global Archive
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {gameState === 'idle' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-12 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]"
                >
                    Reaction Games Hub v2.0
                </motion.div>
            )}
        </div>
    );
};

export default ReactionGame;
