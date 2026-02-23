import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

// Define functions first
const register = (username, email, password,role) => {
    return axios.post(API_URL + "register", {
        username,
        email,
        password,
        role
    });
};

const login = (identifier, password) => {
    return axios.post(API_URL + "login", { identifier, password })
        .then((response) => {
            if (response.data.token) {
                localStorage.setItem("user", JSON.stringify(response.data));
            }
            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem("user");
};

const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null; // Added safety check here
};

// Bundle them into one object
const AuthService = {
    register,
    login,
    logout,
    getCurrentUser
};

// THE MOST IMPORTANT LINE
export default AuthService;