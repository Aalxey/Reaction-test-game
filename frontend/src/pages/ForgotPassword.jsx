import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldCheck, ShieldAlert, Zap, Key } from 'lucide-react';
import { API_BASE_URL } from '../config';
import './Auth.css'

const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.23, 1, 0.32, 1],
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

function ForgotPassword() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            setErrors({ email: 'Identity point missing' });
            toast.error("Email Required", { icon: <ShieldAlert size={16} /> });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                toast.success("Recovery Initialized", {
                    description: "Authorization code sent to your terminal.",
                    icon: <Key size={16} className="text-indigo-400" />
                });
                setStep(2);
            } else {
                const data = await response.json();
                toast.error("Process Failed", {
                    description: data.error || "Identity not found in archive.",
                    icon: <ShieldAlert size={16} />
                });
            }
        } catch (error) {
            toast.error("Uplink Lost", { icon: <ShieldAlert size={16} /> });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!otp) newErrors.otp = 'OTP required';
        if (!password) {
            newErrors.password = 'New key required';
        } else if (password.length < 6) {
            newErrors.password = 'Min 6 characters';
        }
        if (password !== confirmPassword) newErrors.confirmPassword = 'Mismatch detected';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Security Requirements Unmet", { icon: <ShieldAlert size={16} /> });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password }),
            });

            if (response.ok) {
                toast.success("Key Reconstructed", {
                    description: "Security protocols updated. Redirecting to login...",
                    icon: <ShieldCheck size={16} className="text-emerald-400" />
                });
                setTimeout(() => navigate('/login'), 2000);
            } else {
                const data = await response.json();
                toast.error("Reconstruction Failed", {
                    description: data.error || "Authorization sequence invalid.",
                    icon: <ShieldAlert size={16} />
                });
            }
        } catch (error) {
            toast.error("Critical Fault", { icon: <ShieldAlert size={16} /> });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <motion.div
                className="login-wrapper"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="login-header relative">
                    <button
                        onClick={() => navigate('/login')}
                        className="absolute left-0 top-1 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <motion.h1 variants={itemVariants}>RECOVER</motion.h1>
                    <motion.p variants={itemVariants} className="text-indigo-400 font-bold tracking-[0.3em] text-[10px] uppercase">Identity Restoration Protocol</motion.p>
                </div>

                <motion.div variants={itemVariants} className="auth-card-glass">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onSubmit={handleRequestOtp}
                                className="login-form"
                            >
                                <p className="otp-display-text mb-2">
                                    Provide your registered identity terminal to receive a restoration sequence.
                                </p>

                                <div className="form-field">
                                    <label>Terminal Point</label>
                                    <div className="input-wrapper">
                                        <Mail className="input-icon" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>

                                <motion.button
                                    type="submit"
                                    className="auth-btn-primary"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? 'RECOGNIZING...' : 'INITIATE RECOVERY'}
                                </motion.button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onSubmit={handleResetPassword}
                                className="login-form"
                            >
                                <p className="otp-display-text mb-2">
                                    Authorization transmitted to <span className="highlight">{email}</span>. <br /> Reconstruct your access key.
                                </p>

                                <div className="form-field">
                                    <label>Restoration Code</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="000000"
                                            maxLength={6}
                                            className="otp-input-center"
                                        />
                                    </div>
                                    {errors.otp && <span className="error-message text-center">{errors.otp}</span>}
                                </div>

                                <div className="form-field">
                                    <label>New Access Key</label>
                                    <div className="input-wrapper">
                                        <Lock className="input-icon" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="New Security Key"
                                        />
                                        <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && <span className="error-message">{errors.password}</span>}
                                </div>

                                <div className="form-field">
                                    <label>Verify Key</label>
                                    <div className="input-wrapper">
                                        <Lock className="input-icon" size={18} />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repeat Security Key"
                                        />
                                        <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                                </div>

                                <motion.button
                                    type="submit"
                                    className="auth-btn-primary"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {loading ? 'RECONSTRUCTING...' : 'FINALIZE RECOVERY'}
                                </motion.button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="mt-2 text-xs font-bold tracking-widest text-center w-full text-slate-500 hover:text-white uppercase transition-colors"
                                >
                                    Abort Protocol
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default ForgotPassword
