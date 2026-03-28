import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { User, Lock, Eye, EyeOff, Zap, ShieldAlert, ArrowRight } from 'lucide-react'
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

function Login() {
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    username: auth.getRememberedUsername() || '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(!!auth.getRememberedUsername())
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setRememberMe(checked)
      return
    }
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.username) newErrors.username = 'Username is required'
    if (!formData.password) newErrors.password = 'Password is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Required fields missing", {
        description: "Please enter your credentials to initiate protocol.",
        icon: <ShieldAlert size={16} />
      });
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        auth.setUser({ 
          username: data.username, 
          token: data.token, 
          email: data.email, 
          is_superuser: data.is_superuser 
        }, rememberMe);
        if (rememberMe) auth.saveUsername(data.username);
        else auth.clearUsername();

        toast.success("Identity Verified", {
          description: `Access granted. Welcome back, ${data.username}.`,
          icon: <Zap size={16} className="text-yellow-400" />
        });

        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        toast.error("Authentication Failed", {
          description: data.error || "Invalid credentials provided.",
          icon: <ShieldAlert size={16} />
        });
        setErrors(prev => ({ ...prev, form: data.error }));
      }
    } catch (error) {
      toast.error("Uplink Error", {
        description: "Encountered a network failure. Check your connection.",
        icon: <ShieldAlert size={16} />
      });
    } finally {
      setLoading(false)
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
          <motion.h1 variants={itemVariants}>LOGIN</motion.h1>
          <motion.p variants={itemVariants} className="text-indigo-400 font-bold tracking-[0.3em] text-[10px] uppercase">Reaction Games Protocol</motion.p>
        </div>

        <motion.div variants={itemVariants} className="auth-card-glass">
          <form onSubmit={handleSubmit} className="login-form">
            <AnimatePresence>
              {errors.form && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="form-error-banner"
                >
                  {errors.form}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div variants={itemVariants} className="form-field">
              <label>Operative ID</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? 'error' : ''}
                  placeholder="Username"
                />
              </div>
              {errors.username && <span className="error-message">{errors.username}</span>}
            </motion.div>

            <motion.div variants={itemVariants} className="form-field">
              <label>Security Key</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </motion.div>

            <motion.div variants={itemVariants} className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={handleChange}
                />
                <span>Keep active session</span>
              </label>
              <Link to="/forgot-password" self className="forgot-link">Recover Key</Link>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  VERIFYING...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  SIGN IN <ArrowRight size={16} />
                </span>
              )}
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="login-footer">
            <p>New operative detected?</p>
            <Link to="/signin" className="register-link hover:text-indigo-400 transition-colors">Initiate Onboarding</Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login
