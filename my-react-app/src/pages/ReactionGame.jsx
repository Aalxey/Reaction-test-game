import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, RotateCcw } from 'lucide-react';

const ReactionGame = () => {
    const navigate = useNavigate();

    // Game States: 'idle', 'waiting', 'ready', 'result', 'early', 'finished'
    const [gameState, setGameState] = useState('idle');
    const [startTime, setStartTime] = useState(0);
    const [reactionTime, setReactionTime] = useState(null);
    const [attempts, setAttempts] = useState([]); // Store history of times (e.g. [200, 250])
    const timeoutRef = useRef(null);

    const MAX_ATTEMPTS = 3;

    const startGame = () => {
        if (gameState === 'finished') {
            setAttempts([]);
        }

        setGameState('waiting');
        setReactionTime(null);

        // Random delay between 2 and 5 seconds
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
            // Clicked too early
            clearTimeout(timeoutRef.current);
            setGameState('early');
        } else if (gameState === 'ready') {
            // Success
            const endTime = Date.now();
            const time = endTime - startTime;
            setReactionTime(time);

            const newAttempts = [...attempts, time];
            setAttempts(newAttempts);

            if (newAttempts.length === MAX_ATTEMPTS) {
                setGameState('finished');
            } else {
                setGameState('result');
            }
        } else if (gameState === 'result' || gameState === 'early') {
            // Continue to next round
            startGame();
        } else if (gameState === 'finished') {
            // Restart whole game session
            setAttempts([]);
            setGameState('idle');
        }
    };

    // Helper to get message based on average
    const getRankMessage = (avg) => {
        if (avg < 200) return { rank: "Godlike ⚡", color: "text-yellow-400" };
        if (avg < 250) return { rank: "Pro Gamer 🎮", color: "text-blue-400" };
        if (avg < 300) return { rank: "Average Joe 😐", color: "text-slate-400" };
        if (avg < 400) return { rank: "Grandma 👵", color: "text-orange-400" };
        return { rank: "Sloth 🦥", color: "text-red-400" };
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    // UI Configuration based on state
    const getStateConfig = () => {
        switch (gameState) {
            case 'idle':
                return {
                    bg: 'bg-slate-900',
                    icon: <Zap size={64} className="text-blue-400 mb-4" />,
                    title: 'Reaction Test',
                    text: 'Click anywhere to start',
                    subtext: 'Wait for green, then click!'
                };
            case 'waiting':
                return {
                    bg: 'bg-red-600',
                    icon: <div className="text-6xl font-bold text-white/50">...</div>,
                    title: 'Wait for Green',
                    text: `Attempt ${attempts.length + 1} of ${MAX_ATTEMPTS}`,
                    subtext: '(Do not click yet)'
                };
            case 'ready':
                return {
                    bg: 'bg-green-500',
                    icon: <Zap size={80} className="text-white animate-pulse" />,
                    title: 'CLICK!',
                    text: 'Click now!',
                    subtext: ''
                };
            case 'result':
                return {
                    bg: 'bg-blue-600',
                    icon: <Zap size={64} className="text-white mb-4" />,
                    title: `${reactionTime} ms`,
                    text: 'Click to try again.',
                    subtext: `Attempt ${attempts.length} of ${MAX_ATTEMPTS}`
                };
            case 'early':
                return {
                    bg: 'bg-orange-500',
                    icon: <RotateCcw size={64} className="text-white mb-4" />,
                    title: 'Too Early!',
                    text: 'You clicked before green.',
                    subtext: 'Click to try again'
                };
            case 'finished':
                const avg = Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
                const { rank, color } = getRankMessage(avg);
                return {
                    bg: 'bg-slate-900',
                    icon: <Zap size={64} className={`${color} mb-4`} />,
                    title: `${avg} ms`,
                    text: rank,
                    subtext: 'Click to try again',
                    isResult: true // Flag to show detailed list
                };
            default:
                return { bg: 'bg-slate-900' };
        }
    };

    const config = getStateConfig();

    return (
        <div
            className={`min-h-screen w-full transition-colors duration-200 ease-in-out cursor-pointer select-none flex flex-col items-center justify-center ${config.bg}`}
            onMouseDown={handleClick}
        >
            {/* Back Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    navigate('/dashboard');
                }}
                className="absolute top-6 left-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
            >
                <ArrowLeft size={24} />
            </button>

            <div className="text-center p-8 pointer-events-none">
                <div className="flex justify-center transition-all duration-300 transform scale-110">
                    {config.icon}
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
                    {config.title}
                </h1>

                <p className="text-xl md:text-2xl text-white/90 font-medium mb-2">
                    {config.text}
                </p>

                {config.subtext && (
                    <p className="text-white/60 text-lg">
                        {config.subtext}
                    </p>
                )}

                {/* Show attempts history if finished */}
                {config.isResult && (
                    <div className="mt-8 flex gap-4 justify-center">
                        {attempts.map((time, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-slate-500 text-xs uppercase font-bold">Try {i + 1}</span>
                                <span className="text-white text-xl font-mono">{time}ms</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Instruction for 'idle' state */}
            {gameState === 'idle' && (
                <div className="absolute bottom-10 text-slate-500 text-sm">
                    Simple, right? Just wait for the green screen.
                </div>
            )}
        </div>
    );
};

export default ReactionGame;
