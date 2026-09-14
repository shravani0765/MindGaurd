import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { apiClient } from '../services/api';

const LOGIN_FORM = { email: '', password: '' };
const SIGNUP_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirm: '',
  agreeToTerms: false,
};
const FORGOT_FORM = { email: '' };
const RESET_FORM = { password: '', passwordConfirm: '' };

export default function AuthScreen({
  onAuthenticated,
  initialMode = 'login',
  routePath = '/',
  routeToken = '',
}) {
  const [mode, setMode] = useState(routePath === '/reset-password' ? 'reset' : initialMode);
  const [loginForm, setLoginForm] = useState(LOGIN_FORM);
  const [signupForm, setSignupForm] = useState(SIGNUP_FORM);
  const [forgotForm, setForgotForm] = useState(FORGOT_FORM);
  const [resetForm, setResetForm] = useState(RESET_FORM);
  const [banner, setBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function runVerification() {
      if (routePath === '/verify-email' && routeToken) {
        setIsSubmitting(true);
        try {
          const response = await apiClient.verifyEmail(routeToken);
          setBanner({ type: 'success', text: response.message || 'Email verified. You can log in now.' });
          setMode('login');
          window.history.replaceState({}, '', '/');
        } catch (error) {
          setBanner({ type: 'error', text: error.message || 'Verification link is invalid or expired.' });
          setMode('login');
        } finally {
          setIsSubmitting(false);
        }
      }
    }

    void runVerification();
  }, [routePath, routeToken]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setBanner(null);
    try {
      const session = await apiClient.login(loginForm);
      onAuthenticated(session);
    } catch (error) {
      setBanner({ type: 'error', text: error.message || 'Unable to sign in right now.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setBanner(null);
    try {
      const response = await apiClient.register(signupForm);
      setBanner({
        type: 'success',
        text: response.verificationUrl
          ? `Account created. Open the verification link from email or use this local debug link: ${response.verificationUrl}`
          : response.message || 'Account created. Check your email to verify it.',
      });
      setMode('login');
      setLoginForm((prev) => ({ ...prev, email: signupForm.email }));
      setSignupForm(SIGNUP_FORM);
    } catch (error) {
      setBanner({ type: 'error', text: error.message || 'Unable to create your account.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setBanner(null);
    try {
      const response = await apiClient.requestPasswordReset(forgotForm.email);
      setBanner({
        type: 'success',
        text: response.resetUrl
          ? `Reset link generated for local testing: ${response.resetUrl}`
          : response.message || 'If that email exists, a reset link has been sent.',
      });
      setForgotForm(FORGOT_FORM);
    } catch (error) {
      setBanner({ type: 'error', text: error.message || 'Unable to start password reset.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setBanner(null);
    try {
      const response = await apiClient.confirmPasswordReset(routeToken, resetForm.password, resetForm.passwordConfirm);
      setBanner({ type: 'success', text: response.message || 'Password updated. You can log in now.' });
      setResetForm(RESET_FORM);
      setMode('login');
      window.history.replaceState({}, '', '/');
    } catch (error) {
      setBanner({ type: 'error', text: error.message || 'Unable to reset password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card glass-panel">
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-card__header auth-card__header--gradient">
              <h1>Login to your account</h1>
              <p>Welcome back, please log in using your details below</p>
            </div>

            <div className="auth-card__body">
              {banner && <StatusBanner banner={banner} />}

              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="auth-input"
                  required
                />
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                  className="auth-input"
                  required
                />
              </label>

              <button type="submit" className="auth-submit" disabled={isSubmitting}>
                Log In
              </button>

              <button type="button" className="auth-inline-link" onClick={() => setMode('forgot')}>
                Forgot password?
              </button>

              <p className="auth-switch-copy">
                New user?{' '}
                <button type="button" className="auth-text-link" onClick={() => setMode('signup')}>
                  Sign up now
                </button>
              </p>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="auth-form">
            <div className="auth-card__header auth-card__header--solid">
              <h1>Sign up</h1>
              <p>Your check-ins stay protected with encrypted transport and private account access.</p>
            </div>

            <div className="auth-card__body">
              {banner && <StatusBanner banner={banner} />}

              <div className="auth-grid auth-grid--two">
                <label className="auth-field">
                  <span>First Name</span>
                  <input
                    type="text"
                    value={signupForm.firstName}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, firstName: event.target.value }))}
                    className="auth-input"
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Last Name</span>
                  <input
                    type="text"
                    value={signupForm.lastName}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, lastName: event.target.value }))}
                    className="auth-input"
                    required
                  />
                </label>
              </div>

              <div className="auth-note auth-note--info">
                This account needs to be in the name of whoever is receiving support
              </div>

              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(event) => setSignupForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="auth-input"
                  required
                />
              </label>

              <div className="auth-grid auth-grid--two">
                <label className="auth-field">
                  <span>Password</span>
                  <input
                    type="password"
                    value={signupForm.password}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, password: event.target.value }))}
                    className="auth-input"
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Repeat Password</span>
                  <input
                    type="password"
                    value={signupForm.passwordConfirm}
                    onChange={(event) => setSignupForm((prev) => ({ ...prev, passwordConfirm: event.target.value }))}
                    className="auth-input"
                    required
                  />
                </label>
              </div>

              <label className="auth-check">
                <input
                  type="checkbox"
                  checked={signupForm.agreeToTerms}
                  onChange={(event) => setSignupForm((prev) => ({ ...prev, agreeToTerms: event.target.checked }))}
                />
                <span>
                  I agree to the Terms of Service and understand this app supports wellness check-ins, not emergency care.
                </span>
              </label>

              <div className="auth-row auth-row--between">
                <p className="auth-switch-copy">
                  Already have an account?{' '}
                  <button type="button" className="auth-text-link" onClick={() => setMode('login')}>
                    Log in now
                  </button>
                </p>

                <button type="submit" className="auth-submit auth-submit--right" disabled={isSubmitting}>
                  Continue
                </button>
              </div>

              <div className="auth-note auth-note--danger">
                <div className="auth-note__title">
                  <AlertTriangle size={16} />
                  <span>If you are in a life threatening situation — don't use this site</span>
                </div>
                <p>Call or text 988 for immediate crisis support, call 911 or go to the nearest emergency room for immediate danger, and use SAMHSA's 1-800-662-HELP for treatment referrals.</p>
              </div>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="auth-form">
            <div className="auth-card__header auth-card__header--gradient">
              <h1>Reset your password</h1>
              <p>Enter your email and we will send a secure reset link if the account exists.</p>
            </div>

            <div className="auth-card__body">
              {banner && <StatusBanner banner={banner} />}

              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  value={forgotForm.email}
                  onChange={(event) => setForgotForm({ email: event.target.value })}
                  className="auth-input"
                  required
                />
              </label>

              <button type="submit" className="auth-submit" disabled={isSubmitting}>
                Send reset link
              </button>

              <p className="auth-switch-copy">
                Remembered it?{' '}
                <button type="button" className="auth-text-link" onClick={() => setMode('login')}>
                  Back to log in
                </button>
              </p>
            </div>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleReset} className="auth-form">
            <div className="auth-card__header auth-card__header--gradient">
              <h1>Create a new password</h1>
              <p>Use a password you have not used before and keep it private.</p>
            </div>

            <div className="auth-card__body">
              {banner && <StatusBanner banner={banner} />}

              <div className="auth-grid auth-grid--two">
                <label className="auth-field">
                  <span>Password</span>
                  <input
                    type="password"
                    value={resetForm.password}
                    onChange={(event) => setResetForm((prev) => ({ ...prev, password: event.target.value }))}
                    className="auth-input"
                    required
                  />
                </label>

                <label className="auth-field">
                  <span>Repeat Password</span>
                  <input
                    type="password"
                    value={resetForm.passwordConfirm}
                    onChange={(event) => setResetForm((prev) => ({ ...prev, passwordConfirm: event.target.value }))}
                    className="auth-input"
                    required
                  />
                </label>
              </div>

              <button type="submit" className="auth-submit" disabled={isSubmitting || !routeToken}>
                Update password
              </button>

              <p className="auth-switch-copy">
                Want to sign in instead?{' '}
                <button type="button" className="auth-text-link" onClick={() => setMode('login')}>
                  Back to log in
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function StatusBanner({ banner }) {
  return <div className={`auth-status auth-status--${banner.type}`}>{banner.text}</div>;
}
