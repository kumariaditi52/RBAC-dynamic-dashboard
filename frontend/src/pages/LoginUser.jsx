import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Rocket from '../assests/Rocket.jpg';
import Lottie from 'lottie-react';
import background from '../assests/background.json';

const LoginUser = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebugInfo('');

    console.log("=== LOGIN ATTEMPT START ===");
    console.log("Login attempt with:", formData);

    try {
      // Client-side validation
      if (!formData.email.trim()) {
        throw new Error("Email is required");
      }
      if (!formData.password.trim()) {
        throw new Error("Password is required");
      }

      setDebugInfo("Sending login request...");

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      console.log("Login response status:", response.status);
      setDebugInfo(`Response status: ${response.status}`);

      const responseText = await response.text();
      console.log("Login response text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid response from server");
      }

      console.log("Login response data:", data);

      if (!response.ok) {
        console.log("Login failed:", data);
        setDebugInfo(`Login failed: ${data.message}`);
        throw new Error(data.message || 'Login failed');
      }

      // Login successful
      console.log("Login successful, user data:", data.user);
      setDebugInfo("Login successful, redirecting...");
      
      login(data);
      console.log("Login context updated, navigating to dashboard...");
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
      
    } catch (err) {
      console.error('=== LOGIN ERROR ===', err);
      setError(err.message || 'Login failed. Please try again.');
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      console.log("=== LOGIN ATTEMPT END ===");
    }
  };

  const handleSignUpRedirect = () => {
    navigate('/signup');
  };

  return (
    <div className="hero bg-white min-h-screen">
      <div className="hero-content flex lg:flex-row-reverse items-stretch gap-0 h-auto">
        <div className="card bg-slate-200 w-full max-w-sm shrink-0 shadow-2xl lg:rounded-l-none rounded-l-2xl">
          <form className="card-body" onSubmit={handleSubmit}>
            <h1 className="text-5xl font-bold text-gray-700">Login</h1>
            
            {/* Debug Info */}
            {debugInfo && (
              <div className="alert alert-info mb-4">
                <span className="text-sm">{debugInfo}</span>
              </div>
            )}
            
            {error && (
              <div className="alert alert-error mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-500">{error}</span>
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg text-gray-700">Email *</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered text-lg bg-slate-50 focus:bg-white"
                required
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg text-gray-700">Password *</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="input input-bordered text-lg bg-slate-50 focus:bg-white"
                required
                disabled={loading}
              />
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className={`btn text-white text-lg ${loading ? 'btn-disabled bg-gray-400' : 'btn-primary bg-blue-700 hover:bg-blue-800'}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
          <p className="mb-6 text-center">
            Don't have an account? 
            <button 
              type="button"
              onClick={handleSignUpRedirect} 
              className="text-blue-500 font-semibold hover:underline ml-2"
              disabled={loading}
            >
              Sign Up
            </button>
          </p>
        </div>
        
        <div className="hidden lg:block flex-1">
          <img src={Rocket} alt="Rocket" className="h-full w-full object-cover rounded-l-2xl" />
        </div>
      </div>
    </div>
  );
};

export default LoginUser;
