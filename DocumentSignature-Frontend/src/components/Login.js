import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    AuthService.login(identifier, password).then(
      (response) => {
        // SUCCESS: response usually contains { username, email, role, accessToken }
        // We ensure it is saved to localStorage so Dashboard.js can read it
        localStorage.setItem("user", JSON.stringify(response));

        Swal.fire({
          icon: 'success',
          title: 'Welcome Back!',
          text: `Logged in successfully as ${response.username}`,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          // Navigate to dashboard and force a refresh to sync localStorage state
          navigate("/dashboard");
          window.location.reload(); 
        });
      },
      (error) => {
        const resMessage =
          (error.response && error.response.data && error.response.data.message) ||
          error.message ||
          error.toString();

        setLoading(false);
        
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: resMessage,
          confirmButtonColor: '#dc3545'
        });
      }
    );
  };

  return (
    <div className="col-md-12">
      <div className="card card-container p-4 shadow-lg mx-auto border-0"
           style={{ 
             maxWidth: "420px",
             marginTop: "70px",
             borderRadius: "15px",
             animation: "fadeIn 0.8s ease-in-out",
             backgroundColor: "#fff"
           }}>
        
        <div className="text-center mb-4">
          <h2 className="fw-bold text-primary">Login</h2>
          <p className="text-muted">Secure Access to Your Documents</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group mb-3">
            <label className="mb-1 fw-semibold">Username or Email</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Enter your credentials"
              style={{ fontSize: '1rem' }}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-4">
            <label className="mb-1 fw-semibold">Password</label>
            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="••••••••"
              style={{ fontSize: '1rem' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            className="btn btn-primary w-100 py-2 fw-bold shadow-sm" 
            disabled={loading}
            style={{ 
              borderRadius: '8px', 
              transition: 'all 0.3s ease',
              height: '48px'
            }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-muted small">
            Don't have an account? <span 
              onClick={() => navigate('/register')} 
              style={{ color: '#0d6efd', cursor: 'pointer', fontWeight: '600' }}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(13, 110, 253, 0.4) !important;
        }
        .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
        }
      `}</style>
    </div>
  );
};

export default Login;