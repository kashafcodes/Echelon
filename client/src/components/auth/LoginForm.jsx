import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function LoginForm({ onSuccess, onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setForgotPasswordMsg("");

    if (!email.trim() || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

    try {
      setLoading(true);
      const data = await login(email.trim(), password, rememberMe);
      setSuccess(`Welcome back, ${data.user?.name || "Member"}!`);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(data.user);
        }
      }, 700);
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotPasswordMsg(
      "Password reset link has been dispatched to your email if registered. Please contact support@lokart.com for immediate help.",
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error ? (
        <div className="rounded border border-vermilion/30 bg-vermilion/10 p-3 text-sm text-vermilion">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded border border-teal/30 bg-teal/10 p-3 text-sm text-teal">
          {success}
        </div>
      ) : null}

      {forgotPasswordMsg ? (
        <div className="rounded border border-terai/40 bg-sand p-3 text-xs text-charcoal">
          {forgotPasswordMsg}
        </div>
      ) : null}

      {/* Email Address */}
      <div>
        <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
          Email Address *
        </label>
        <input
          type="email"
          autoComplete="email"
          placeholder="e.g. sita@example.com"
          value={email}
          disabled={loading}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full border border-charcoal/20 bg-ivory px-3.5 py-2.5 text-sm text-charcoal focus:border-teal focus:outline-none"
        />
      </div>

      {/* Password with Show/Hide toggle */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold tracking-wider text-charcoal uppercase">
            Password *
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-xs text-teal hover:underline"
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative mt-1">
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-charcoal/20 bg-ivory px-3.5 py-2.5 pr-14 text-sm text-charcoal focus:border-teal focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-charcoal/60 hover:text-charcoal"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2">
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          disabled={loading}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 border-charcoal/30 text-teal accent-teal focus:ring-teal"
        />
        <label htmlFor="remember-me" className="text-xs text-charcoal/80">
          Remember me on this browser (extended secure session)
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-vermilion py-3 text-center text-sm font-medium tracking-wide text-ivory transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin text-ivory"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Signing In...
          </span>
        ) : (
          "Sign In to LokArt"
        )}
      </button>

      {/* Switch to Register */}
      <div className="border-t border-charcoal/10 pt-4 text-center">
        <p className="text-xs text-charcoal/80">
          Do not have an account yet?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-semibold text-teal hover:underline"
          >
            Register Here
          </button>
        </p>
      </div>
    </form>
  );
}
