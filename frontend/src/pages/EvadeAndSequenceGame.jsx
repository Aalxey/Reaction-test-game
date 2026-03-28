import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, RefreshCcw, LayoutDashboard, ShieldAlert, Zap, X } from 'lucide-react';
import { API_BASE_URL } from '../config';

const EvadeAndSequenceGame = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const savedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    // Auth Check
    useEffect(() => {
        if (!savedUser.token) {
            navigate('/login');
        }
    }, [navigate, savedUser.token]);

    // --- GAME STATE ---
    // 'idle', 'playing', 'gameover'
    const [gameState, setGameState] = useState('idle');
    const [score, setScore] = useState(0);
    const [misses, setMisses] = useState(0);
    const [level, setLevel] = useState(1);

    // Sequence State
    const [nextExpected, setNextExpected] = useState(1);
    const [sequenceNodes, setSequenceNodes] = useState([]);

    // Minibar State (Threat)
    const [threatPos, setThreatPos] = useState({ x: 0, y: 0, distance: 100, angle: 0 });
    const [canEvade, setCanEvade] = useState(false);
    const [isEvading, setIsEvading] = useState(false);

    // Refs for Loop
    const requestRef = useRef();
    const threatRef = useRef({ distance: 100, angle: 0 });
    const gameStateRef = useRef('idle');
    const sequenceTimeoutRef = useRef(null);
    const handleMissRef = useRef(null);
    const nodeActiveStartTimeRef = useRef(Date.now());
    const missesCountRef = useRef(0);

    // Constants
    const MAX_MISSES = 3;
    const CENTER_X = 60; // minibar center
    const CENTER_Y = 60;
    const RING_RADIUS = 35; // activation ring
    const CORE_RADIUS = 5;  // fail core

    // --- LOGIC: SEQUENCE ---
    const generateSequence = useCallback((currentLevel) => {
        const numNodes = 5; // Always 1-5
        const newNodes = [];

        // Reduce minimum spacing slightly as levels increase to allow more nodes to fit
        const minDistanceSq = Math.max(25, 225 - (currentLevel * 10)); // 15% distance, scales down

        for (let i = 1; i <= numNodes; i++) {
            let x, y;
            let attempts = 0;
            let found = false;

            while (attempts < 200 && !found) {
                // Generate x between 10% to 90%, y between 15% to 85%
                x = 10 + Math.random() * 80;
                y = 15 + Math.random() * 70;

                let overlap = false;

                // Static UI element avoidance maps
                // Minibar Top-Left Zone (avoid roughly x < 30, y < 45)
                if (x < 30 && y < 45) overlap = true;
                // Evade Button Bottom-Right Zone (x > 75, y > 75)
                else if (x > 75 && y > 75) overlap = true;
                // Stats Top-Right Zone
                else if (x > 75 && y < 25) overlap = true;
                // Back/Close Top area
                else if (y < 12) overlap = true;

                // Check distance against existing nodes to prevent overlap
                if (!overlap) {
                    for (const node of newNodes) {
                        const dx = x - node.xVal;
                        const dy = y - node.yVal;
                        if ((dx * dx + dy * dy) < minDistanceSq) {
                            overlap = true;
                            break;
                        }
                    }
                }

                if (!overlap) found = true;
                attempts++;
            }

            // Fallback if max attempts reached
            if (!found) {
                x = 20 + Math.random() * 60;
                y = 20 + Math.random() * 60;
            }

            newNodes.push({
                id: i,
                number: i,
                active: true,
                xVal: x,  // Store raw number for distance math
                yVal: y,
                x: `${x}%`,
                y: `${y}%`,
                size: window.innerWidth < 768 ? '48px' : '64px'
            });
        }

        setSequenceNodes(newNodes);
        setNextExpected(1);
        nodeActiveStartTimeRef.current = Date.now();

        if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
        const durationSec = Math.max(2, 6 - currentLevel * 0.5);
        sequenceTimeoutRef.current = setTimeout(() => {
            if (handleMissRef.current) handleMissRef.current('Time expired');
        }, durationSec * 1000);
    }, []);

    const handleNodeClick = (number) => {
        if (gameState !== 'playing') return;

        if (number === nextExpected) {
            // Calculate how long this specific node has been the "active" target
            const durationSec = Math.max(2, 6 - level * 0.5);
            const timeElapsed = (Date.now() - nodeActiveStartTimeRef.current) / 1000;

            // If it has shrunk past 85% of its lifetime, it is considered too small to click
            if (timeElapsed > durationSec * 0.85) {
                // Manually trigger the timeout miss behavior early
                if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
                handleMiss('Too slow! Node shrank away.');
                return;
            }

            // Correct click
            setSequenceNodes(prev => prev.map(n => n.number === number ? { ...n, active: false } : n));

            // Level Complete Check
            if (number === sequenceNodes.length) {
                if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
                const nextLevel = level + 1;
                setLevel(nextLevel);
                generateSequence(nextLevel);
                toast.success(`Level ${nextLevel}`, { id: 'level-up', duration: 1000 });
            } else {
                setNextExpected(prev => prev + 1);
                setScore(prev => prev + 10);
                nodeActiveStartTimeRef.current = Date.now();

                // Restart timer for NEXT node
                if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
                const durationSec = Math.max(2, 6 - level * 0.5);
                sequenceTimeoutRef.current = setTimeout(() => {
                    if (handleMissRef.current) handleMissRef.current('Time expired');
                }, durationSec * 1000);
            }
        } else {
            // Wrong click
            handleMiss('Sequence error');
        }
    };

    // --- LOGIC: MINIBAR ---
    const resetThreat = () => {
        const angle = Math.random() * Math.PI * 2;
        threatRef.current = { distance: 100, angle };
        setThreatPos({
            distance: 100,
            angle,
            x: Math.cos(angle) * 100,
            y: Math.sin(angle) * 100
        });
        setCanEvade(false);
    };

    const handleEvadeClick = () => {
        if (!canEvade || gameState !== 'playing') return;

        setIsEvading(true);
        setScore(prev => prev + 25); // Bonus score for evading
        setTimeout(() => setIsEvading(false), 200);

        resetThreat();
    };

    const handleMiss = (reason) => {
        if (gameStateRef.current !== 'playing') return;

        missesCountRef.current += 1;
        setMisses(missesCountRef.current);

        if (missesCountRef.current >= MAX_MISSES) {
            gameOver();
        } else {
            toast.error(`Miss: ${reason}`, { id: 'miss', duration: 1500 });
            // Reset states slightly to allow recovery
            if (reason.includes("core")) resetThreat();

            if (reason === 'Time expired' || reason === 'Too slow! Node shrank away.') {
                // The node shrank completely or was clicked too late. They missed it.
                // we remove that node (mark it inactive) and move on to the NEXT expected node.
                setNextExpected(currentNext => {
                    const advancedNext = currentNext + 1;

                    setSequenceNodes(nodes => {
                        const newNodes = nodes.map(n => n.number === currentNext ? { ...n, active: false } : n);

                        // Check if that was the LAST node in the sequence
                        if (currentNext === nodes.length) {
                            if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
                            // The timeout runs asynchronously, so we must rely on setLevel callback to safely get current level
                            setLevel(prevLvl => {
                                const nextLevel = prevLvl + 1;
                                generateSequence(nextLevel);
                                toast.success(`Level ${nextLevel}`, { id: 'level-up', duration: 1000 });
                                return nextLevel;
                            });
                        } else {
                            // Start timer for the *next* node
                            nodeActiveStartTimeRef.current = Date.now();
                            if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
                            // For duration, we just use the current level
                            setLevel(prevLvl => {
                                const durationSec = Math.max(2, 6 - prevLvl * 0.5);
                                sequenceTimeoutRef.current = setTimeout(() => {
                                    if (handleMissRef.current) handleMissRef.current('Time expired');
                                }, durationSec * 1000);
                                return prevLvl;
                            });
                        }
                        return newNodes;
                    });
                    return advancedNext;
                });
            }
        }
    };

    // Keep reference updated for timeout callback
    useEffect(() => {
        handleMissRef.current = handleMiss;
    }, [handleMiss]);

    const saveScore = async (finalScore) => {
        const saveToast = toast.loading("Archiving Results", {
            description: "Transmitting telemetry to central archive..."
        });

        try {
            const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
            if (!user) {
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
                    score: finalScore,
                    game_type: 'evade_and_sequence'
                })
            });

            if (!response.ok) {
                toast.error("Archive Failed", { id: saveToast, description: "Protocol rejected by central core." });
            } else {
                toast.success("Protocol Complete", {
                    id: saveToast,
                    description: "High score data archived.",
                });
            }
        } catch (error) {
            toast.error("Transmission Failure", { id: saveToast, description: "Uplink interrupted." });
        }
    };

    const gameOver = () => {
        if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
        setGameState('gameover');
        gameStateRef.current = 'gameover';
        toast.error("SYSTEM COMPROMISED", { description: "You have been overwhelmed.", duration: 3000 });

        // Save the score!
        // We use state `score` however React state might be slightly stale if triggered sequentially,
        // so we use a fallback if needed, but in this isolated event, `score` is usually accurate since misses don't give score.
        saveScore(score);
    };

    const startGame = async () => {
        // Request Fullscreen
        if (containerRef.current) {
            try {
                if (containerRef.current.requestFullscreen) {
                    await containerRef.current.requestFullscreen();
                } else if (containerRef.current.webkitRequestFullscreen) {
                    await containerRef.current.webkitRequestFullscreen();
                }

                // Attempt Orientation Lock
                if (screen.orientation && screen.orientation.lock) {
                    await screen.orientation.lock('landscape').catch(() => {
                        console.log('Orientation lock not supported on this device/browser');
                    });
                }
            } catch (err) {
                console.error('Fullscreen request failed:', err);
            }
        }

        setScore(0);
        setMisses(0);
        missesCountRef.current = 0;
        setLevel(1);
        setGameState('playing');
        gameStateRef.current = 'playing';
        generateSequence(1);
        resetThreat();
    };

    // Game Loop
    const updateLoop = useCallback(() => {
        if (gameStateRef.current === 'playing') {
            // Calculate speed based on level
            const speed = 0.2 + (level * 0.05);

            let { distance, angle } = threatRef.current;
            distance -= speed;

            if (distance <= CORE_RADIUS) {
                // Hit the core
                handleMiss('Threat reached core');
            }

            if (distance > 0) {
                threatRef.current = { distance, angle };
                setThreatPos({
                    distance,
                    angle,
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance
                });

                // Update evade status
                if (distance <= RING_RADIUS && distance > CORE_RADIUS) {
                    setCanEvade(true);
                } else {
                    setCanEvade(false);
                }
            }
        }
        requestRef.current = requestAnimationFrame(updateLoop);
    }, [level]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updateLoop);
        return () => cancelAnimationFrame(requestRef.current);
    }, [updateLoop]);


    // --- RENDERING ---
    const speedLabel = level < 3 ? 'Easy' : level < 6 ? 'Medium' : level < 9 ? 'Hard' : 'Extreme';

    return (
        <div 
            ref={containerRef}
            className="min-h-screen w-full bg-[#11131A] text-white overflow-hidden relative font-outfit select-none landscape-only"
        >
            {/* Rotation Overlay (Visible only in portrait @media) */}
            <div className="rotate-overlay">
                <div className="w-24 h-24 mb-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group">
                    <div className="iphone-vibrate text-4xl">📱</div>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-gradient-primary">
                    Landscape Required
                </h2>
                <p className="text-slate-400 font-bold tracking-widest uppercase text-sm max-w-[250px] leading-relaxed">
                    Please rotate your device <br/> to access the terminal
                </p>
                <div className="mt-12 flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse [animation-delay:200ms]" />
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse [animation-delay:400ms]" />
                </div>
            </div>

            {/* Background Details */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Back Button */}
            <button
                onClick={() => {
                    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                    navigate('/dashboard');
                }}
                className="absolute top-4 left-4 md:top-6 md:left-6 p-2.5 md:p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors z-50 text-slate-300 hover:text-white"
            >
                <ArrowLeft size={18} className="md:w-5 md:h-5" />
            </button>

            {/* Close Button X (Matches standard UI usually) */}
            <button
                onClick={() => {
                    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                    navigate('/dashboard');
                }}
                className="hidden md:block absolute top-6 left-1/2 -translate-x-1/2 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors z-50 text-slate-400"
            >
                <X size={16} />
            </button>


            {/* Top Stats Panel */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1 z-50 bg-black/40 md:bg-transparent p-2 md:p-0 rounded-xl backdrop-blur-sm md:backdrop-blur-none border border-white/5 md:border-none">
                <div className="flex flex-col items-end">
                    <div className="text-2xl md:text-4xl font-black leading-none">{score}</div>
                    <div className={`text-[10px] md:text-sm font-bold tracking-widest uppercase ${misses > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {misses}/{MAX_MISSES}
                    </div>
                </div>
                <div className="h-8 w-px bg-white/10 md:hidden" />
                <div className="flex flex-col items-end md:items-end">
                    <div className="text-[10px] md:text-sm font-bold tracking-widest text-amber-400 uppercase">
                        Next: {nextExpected}
                    </div>
                    <div className="text-[9px] md:text-xs font-bold tracking-widest text-emerald-400 uppercase">
                        {speedLabel}
                    </div>
                </div>
            </div>

            {/* Minibar (Threat Tracker) - Moved to be more responsive */}
            <div className={`absolute top-20 left-4 md:top-24 md:left-6 p-1 rounded-2xl bg-white/5 backdrop-blur-md border z-40 transition-colors duration-300 ${isEvading ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]' : canEvade ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'border-indigo-500/20'}`}>
                <div className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] rounded-xl bg-[#090A0F] relative overflow-hidden flex items-center justify-center scale-90 md:scale-100">
                    {/* Ring */}
                    <motion.div
                        className={`absolute w-[45px] h-[45px] md:w-[70px] md:h-[70px] rounded-full border-2 ${canEvade ? 'border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'border-indigo-500/30'} flex items-center justify-center`}
                        animate={{ scale: canEvade ? [1, 1.05, 1] : 1 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    >
                        {/* Danger zone glow */}
                        {canEvade && <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-md" />}
                    </motion.div>

                    {/* Core */}
                    <div className="absolute w-[6px] md:w-[10px] h-[6px] md:h-[10px] bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]" />

                    {/* Threat Dot */}
                    <div
                        className="absolute w-[6px] md:w-[8px] h-[6px] md:h-[8px] bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,1)] transition-transform duration-75"
                        style={{
                            transform: `translate(${threatPos.x * (window.innerWidth < 768 ? 0.6 : 1)}px, ${threatPos.y * (window.innerWidth < 768 ? 0.6 : 1)}px)`
                        }}
                    />
                </div>
            </div>

            {/* EVADE Button Bottom Right - Responsive size */}
            <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-50">
                <button
                    onClick={handleEvadeClick}
                    disabled={!canEvade || gameState !== 'playing'}
                    className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center font-black text-sm md:text-xl tracking-widest uppercase transition-all duration-300 ${canEvade && gameState === 'playing'
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:scale-105 active:scale-95'
                        : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                        }`}
                >
                    EVADE
                </button>
            </div>


            {/* --- GAME PLAY AREA --- */}
            <AnimatePresence>
                {gameState === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50"
                    >
                        <ShieldAlert size={80} className="text-purple-500 mb-6 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
                        <h1 className="text-6xl font-black text-white uppercase tracking-tighter mb-4">Evade & Sequence</h1>
                        <p className="text-slate-400 font-bold tracking-widest uppercase max-w-md text-center leading-relaxed mb-10 text-sm">
                            Click nodes in numerical order. <br /> Do not let the threat reach the core. <br /> Use EVADE when threat enters the red ring.
                        </p>
                        <button
                            onClick={startGame}
                            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-black tracking-widest uppercase shadow-[0_10px_30px_rgba(99,102,241,0.3)] hover:scale-105 active:scale-95 transition-transform"
                        >
                            Initialize Protocol
                        </button>
                    </motion.div>
                )}

                {gameState === 'gameover' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/80 backdrop-blur-md z-50"
                    >
                        <div className="w-32 h-32 rounded-full border-4 border-rose-500/50 flex items-center justify-center mb-6">
                            <span className="text-6xl">💀</span>
                        </div>
                        <h1 className="text-6xl font-black text-white uppercase tracking-tighter mb-2 text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.5)]">
                            SYSTEM FAILURE
                        </h1>
                        <div className="flex gap-8 mb-10 mt-6">
                            <div className="text-center">
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Final Score</div>
                                <div className="text-4xl font-black text-white">{score}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Level Reached</div>
                                <div className="text-4xl font-black text-white">{level}</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={startGame}
                                className="px-8 py-4 bg-white text-black rounded-2xl font-black tracking-widest uppercase hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                            >
                                <RefreshCcw size={18} /> Retry
                            </button>
                            <button
                                onClick={() => {
                                    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
                                    navigate('/dashboard');
                                }}
                                className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black tracking-widest uppercase hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/20"
                            >
                                <LayoutDashboard size={18} /> Dashboard
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sequence Nodes Layer */}
            {gameState === 'playing' && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <AnimatePresence>
                        {sequenceNodes.filter(n => n.active).map((node) => {
                            const isActive = node.number === nextExpected;
                            return (
                                <motion.button
                                    key={isActive ? `${node.id}-${misses}` : node.id}
                                    initial={{ scale: 0, opacity: 0 }}
                                    // If active, run the shrinking timer. If not active, just pulse in to full size and stay there.
                                    animate={{
                                        scale: isActive ? [1, 1.2, 1, 0.4] : 1,
                                        opacity: 1
                                    }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{
                                        scale: {
                                            // Only stretch out the duration if it's the active shrinking one
                                            times: isActive ? [0, 0.1, 0.2, 1] : undefined,
                                            duration: isActive ? Math.max(2, 6 - level * 0.5) : 0.4,
                                            ease: isActive ? "linear" : "easeOut"
                                        },
                                        opacity: { duration: 0.2 }
                                    }}
                                    onClick={() => handleNodeClick(node.number)}
                                    className={`absolute rounded-full flex items-center justify-center font-black z-30 pointer-events-auto border-2 transition-colors ${isActive
                                        ? 'bg-blue-600 hover:bg-blue-500 border-blue-400 text-white shadow-[0_0_30px_rgba(37,99,235,0.8)] z-40'
                                        : 'bg-indigo-900/50 hover:bg-indigo-800/80 border-indigo-500/50 text-indigo-200'
                                        }`}
                                    style={{
                                        left: node.x,
                                        top: node.y,
                                        width: node.size,
                                        height: node.size,
                                        fontSize: `calc(${node.size} * 0.4)`,
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                >
                                    {node.number}
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default EvadeAndSequenceGame;
