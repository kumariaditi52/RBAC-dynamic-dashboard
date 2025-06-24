// Test function to check backend connectivity
export const testBackendConnection = async () => {
  try {
    console.log("Testing backend connection...");
    
    const response = await fetch("https://rbac-system-project.onrender.com/api/auth/signup", {
      method: "OPTIONS", // CORS preflight request
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log("CORS preflight response:", response.status);
    
    // Test with a simple GET request to see if server is responding
    const testResponse = await fetch("https://rbac-system-project.onrender.com/", {
      method: "GET",
    });
    
    console.log("Server response:", testResponse.status);
    return true;
  } catch (error) {
    console.error("Backend connection test failed:", error);
    return false;
  }
};