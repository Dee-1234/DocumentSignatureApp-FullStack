import React, { useState } from "react";
import AuthService from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2

const Register = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [loading, setLoading] = useState(false);

    const handleRegister = (e) => {
        e.preventDefault();
        setLoading(true);

        //const rolesArray = [role];

        //AuthService.register(username, email, password, rolesArray).then(
        AuthService.register(username, email, password, role.toUpperCase()).then(
            (response) => {
                // 1. Professional Success Popup
                Swal.fire({
                    title: 'Registration Successful!',
                    text: 'Your account has been created. You can now log in.',
                    icon: 'success',
                    confirmButtonColor: '#0d6efd',
                    timer: 3000,
                    timerProgressBar: true,
                }).then(() => {
                    navigate("/login");
                });
            },
            (error) => {
                const resMessage =
                    (error.response && error.response.data && error.response.data.message) ||
                    error.message ||
                    error.toString();
                
                // 2. Error Popup
                Swal.fire({
                    title: 'Error!',
                    text: resMessage,
                    icon: 'error',
                    confirmButtonColor: '#dc3545'
                });
                setLoading(false);
            }
        );
    };

    return (
        <div className="col-md-12">
            {/* Added a smooth fade-in animation and better shadow */}
            <div className="card card-container p-4 shadow-lg mx-auto border-0" 
                 style={{ 
                    maxWidth: "450px", 
                    marginTop: "50px", 
                    borderRadius: "15px",
                    animation: "fadeIn 0.8s ease-in-out" 
                 }}>
                
                <div className="text-center mb-4">
                    <h2 className="fw-bold text-primary">Create Account</h2>
                    <p className="text-muted">Join the Document Signature App</p>
                </div>

                <form onSubmit={handleRegister}>
                    <div className="form-group mb-3">
                        <label className="mb-1 fw-semibold">Username</label>
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Enter username"
                            style={{ fontSize: '1rem' }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label className="mb-1 fw-semibold">Email</label>
                        <input
                            type="email"
                            className="form-control form-control-lg"
                            placeholder="name@example.com"
                            style={{ fontSize: '1rem' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group mb-3">
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

                    <div className="form-group mb-4">
                        <label className="mb-1 fw-semibold">I am a...</label>
                        <select 
                            className="form-select form-select-lg" 
                            style={{ fontSize: '1rem' }}
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="user">User (Signer)</option>
                            <option value="admin">Admin (Manager)</option>
                        </select>
                    </div>

                    {/* Interactive Button with Hover scale effect */}
                    <button 
                        className="btn btn-primary w-100 py-2 fw-bold shadow-sm" 
                        disabled={loading}
                        style={{ 
                            borderRadius: '8px', 
                            transition: 'all 0.3s ease' 
                        }}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                            "Create My Account"
                        )}
                    </button>
                </form>
            </div>

            {/* In-page CSS for the subtle animation */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(13, 110, 253, 0.4) !important;
                }
            `}</style>
        </div>
    );
};

export default Register;