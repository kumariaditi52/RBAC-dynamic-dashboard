import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Signupimg from "../assests/Signupimg.jpg";

const SignupUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);
  const [debugInfo, setDebugInfo] = useState("");
  const [rolesLoading, setRolesLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch roles from backend on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      setDebugInfo("Fetching roles from backend...");
      console.log("Attempting to fetch roles...");
      
      const response = await fetch("http://localhost:5000/api/roles", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      console.log("Roles response status:", response.status);
      
      if (response.ok) {
        const roles = await response.json();
        console.log("Fetched roles:", roles);
        
        if (roles && roles.length > 0) {
          setRoleOptions(roles);
          setDebugInfo(`Successfully loaded ${roles.length} roles from database`);
        } else {
          console.log("No roles returned from server");
          setDebugInfo("No roles found in database");
          setError("No roles available. Please contact administrator.");
        }
      } else {
        const errorText = await response.text();
        console.log("Failed to fetch roles:", errorText);
        setDebugInfo(`Failed to fetch roles: ${response.status}`);
        setError("Failed to load roles from server");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setDebugInfo(`Error connecting to server: ${error.message}`);
      setError("Cannot connect to server. Please try again later.");
    } finally {
      setRolesLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleRoleChange = (e) => {
    const selectedRoleId = e.target.value;
    console.log("Selected role ID:", selectedRoleId);
    setFormData({ ...formData, role: selectedRoleId });
    if (error) setError(null);
  };

  const handleLoginRedirect = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebugInfo("");

    console.log("=== SIGNUP ATTEMPT START ===");
    console.log("Form data:", formData);
    console.log("Available roles:", roleOptions);

    try {
      // Validation
      if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim() || !formData.role) {
        throw new Error("All fields are required");
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      setDebugInfo("Sending request to backend...");
      console.log("Making API request...");

      const requestData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      console.log("Request data:", requestData);
      setDebugInfo("Request data prepared, sending...");

      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Response received:", response);
      setDebugInfo(`Response status: ${response.status}`);

      const responseText = await response.text();
      console.log("Response text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid JSON response from server");
      }

      if (!response.ok) {
        console.log("Error response:", data);
        setDebugInfo(`Error: ${response.status} - ${data.message}`);
        
        // Show available roles if provided in error response
        if (data.availableRoles && data.availableRoles.length > 0) {
          console.log("Available roles from error:", data.availableRoles);
          setDebugInfo(`Error: ${data.message}. Available roles: ${data.availableRoles.map(r => r.name).join(', ')}`);
        }
        
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      console.log("Parsed data:", data);
      setDebugInfo("Success! User created.");

      // Success
      alert(data.message || "User created successfully!");
      
      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "",
      });
      
      // Navigate to login
      navigate("/");

    } catch (err) {
      console.error("=== SIGNUP ERROR ===", err);
      setError(err.message || "Signup failed. Please try again.");
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      console.log("=== SIGNUP ATTEMPT END ===");
    }
  };

  const retryFetchRoles = () => {
    setError(null);
    fetchRoles();
  };

  return (
    <div className="hero bg-white min-h-screen">
      <div className="hero-content flex lg:flex-row items-stretch gap-0">
        {/* Form Section */}
        <div className="card bg-slate-200 w-full max-w-sm shrink-0 shadow-2xl rounded-r-2xl lg:rounded-r-none"> 
          <form className="card-body" onSubmit={handleSubmit}>
            <h1 className="text-5xl font-bold text-gray-700">Sign Up</h1>
            
            {/* Debug Info */}
            {debugInfo && (
              <div className="alert alert-info mb-4">
                <span className="text-sm">{debugInfo}</span>
              </div>
            )}
            
            {error && (
              <div className="alert alert-error mb-4">
                <span className="text-red-700">{error}</span>
                {error.includes("Cannot connect") && (
                  <button 
                    type="button"
                    onClick={retryFetchRoles}
                    className="btn btn-sm btn-outline mt-2"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg text-gray-700">Username *</span>
              </label>
              <input
                type="text"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                className="input input-bordered text-lg bg-slate-50 focus:bg-white"
                required
                disabled={loading}
                minLength="3"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg text-gray-700">Email *</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
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
                placeholder="Enter password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                className="input input-bordered text-lg bg-slate-50 focus:bg-white"
                required
                disabled={loading}
                minLength="6"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-lg text-gray-700">Role *</span>
              </label>
              {rolesLoading ? (
                <div className="select select-bordered text-lg bg-slate-50 flex items-center justify-center">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span className="ml-2">Loading roles...</span>
                </div>
              ) : roleOptions.length > 0 ? (
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  className="select select-bordered text-lg bg-slate-50 focus:bg-white"
                  required
                  disabled={loading}
                >
                  <option value="">Select Role</option>
                  {roleOptions.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="select select-bordered text-lg bg-slate-50 flex items-center justify-center">
                  <span className="text-red-500">No roles available</span>
                  <button 
                    type="button"
                    onClick={retryFetchRoles}
                    className="btn btn-sm btn-outline ml-2"
                  >
                    Retry
                  </button>
                </div>
              )}
              
              {/* Show available roles for debugging */}
              {roleOptions.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Available roles: {roleOptions.map(r => `${r.name} (${r._id})`).join(', ')}
                </div>
              )}
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className={`btn text-white text-lg ${loading ? 'btn-disabled bg-gray-400' : 'btn-primary bg-blue-700 hover:bg-blue-800'}`}
                disabled={loading || rolesLoading || roleOptions.length === 0}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Signing Up...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
            
            <p className="mb-6 text-center">
              Already have an account? 
              <button 
                type="button"
                onClick={handleLoginRedirect} 
                className="text-blue-500 font-semibold hover:underline ml-2"
                disabled={loading}
              >
                Login
              </button>
            </p>
          </form>
        </div>

        {/* Image Section */}
        <div className="hidden lg:block flex-1 bg-cover bg-center rounded-r-lg">
          <img
            src={Signupimg}
            alt="Signup Illustration"
            className="h-full w-full object-cover rounded-r-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default SignupUser;
