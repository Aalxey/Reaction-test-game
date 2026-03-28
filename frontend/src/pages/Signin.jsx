import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { User, Mail, Lock, Eye, EyeOff, Zap, ShieldAlert, ArrowRight, Fingerprint } from 'lucide-react'
import { auth } from '../utils/auth'
import { API_BASE_URL } from '../config'
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

function Signin() {
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      if (formData.password.length < 6) newErrors.password = 'Min 6 characters'
      else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Need uppercase'
      else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Need number'
    }

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords mismatch'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Registration Blocked", {
        description: "Please fulfill all security requirements.",
        icon: <ShieldAlert size={16} />
      });
      return
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Uplink Established", {
          description: "Verification code transmitted to your terminal.",
          icon: <Fingerprint size={16} className="text-indigo-400" />
        });
        setStep(2);
      } else {
        toast.error("Handshake Failed", {
          description: data.error || "Signup protocol rejected.",
          icon: <ShieldAlert size={16} />
        });
        setErrors(prev => ({ ...prev, form: data.error }));
      }
    } catch (error) {
      toast.error("Transmission Error", {
        description: "Failed to reach the authentication server.",
        icon: <ShieldAlert size={16} />
      });
    } finally {
      setLoading(false);
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Identity Verified", {
          description: "Neural link synchronized. You may now proceed.",
          icon: <Zap size={16} className="text-yellow-400" />
        });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast.error("Verification Rejected", {
          description: data.error || "Incorrect sequence detected.",
          icon: <ShieldAlert size={16} />
        });
        setErrors(prev => ({ ...prev, otp: data.error }));
      }
    } catch (error) {
      toast.error("Neural Drift Detected", {
        description: "Protocol interrupted by network instability.",
        icon: <ShieldAlert size={16} />
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <motion.div
        className="login-wrapper"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="login-header">
          <motion.h1 variants={itemVariants}>{step === 1 ? 'JOIN' : 'VERIFY'}</motion.h1>
          <motion.p variants={itemVariants} className="text-indigo-400 font-bold tracking-[0.3em] text-[10px] uppercase">Initiating Onboarding Sequence</motion.p>
        </div>

        <motion.div variants={itemVariants} className="auth-card-glass">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="signup-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSignup}
                className="login-form"
              >
                <div className="form-field">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Identity String" />
                  </div>
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-field">
                  <label>Email Point</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="user@yeaos.io" />
                  </div>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-field">
                  <label>Access Key</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Secret Hash"
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-field">
                  <label>Repeat Key</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Hash"
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
                  {loading ? 'TRANSMITTING...' : 'INITIATE JOIN'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOtp}
                className="login-form"
              >
                <div className="otp-display-text mb-2">
                  Enter the 6-digit sequence sent to <br /> <span className="highlight">{formData.email}</span>
                </div>

                <div className="form-field">
                  <label>Verification Sequence</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="otp-input-center"
                    />
                  </div>
                  {errors.otp && <span className="error-message text-center">{errors.otp}</span>}
                </div>

                <motion.button
                  type="submit"
                  className="auth-btn-primary"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'SYNCHRONIZING...' : 'VERIFY IDENTITY'}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-4 text-xs font-bold tracking-widest text-center w-full text-slate-500 hover:text-white uppercase transition-colors"
                >
                  Abort Protocol
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="login-footer">
            <p>Identity already exists?</p>
            <Link to="/login" className="register-link hover:text-indigo-400 transition-colors">Resume Session</Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Signin
