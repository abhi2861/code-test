import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import InputText from "../shared/components/InputText";
import GoogleIcon from "../../assets/Logos/google.svg";
import MicrosoftIcon from "../../assets/Logos/microsoft.svg";
import "./Login.scss";
import callAPI from "../../commonFunctions/ApiRequests";
import Toaster from "../shared/components/Toaster/Toaster";
import {useSelector} from 'react-redux';

const Login = (props) => {
  const partnerDetails = useSelector(store => store.commonReducer?.partnerDetails)
  const navigate = useNavigate();
  const googleCallbackURI = import.meta.env.VITE_GOOGLE_CALLBACK_URL
  const azureCallbackURI = import.meta.env.VITE_AZURE_CALLBACK_URL
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [toasterData, setToasterData] = useState({
    show: false,
    type: "",
    message: "",
  });

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
    setErrors({ ...errors, [key]: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let req = {};

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      req = {
        ...formData,
      };
      
      setLoading(true);
      callAPI.post("./api/v1/auth/auth", req).then(async (response) => {
        if (response.status === 200) {
          const message = response.data?.message || "Login successful!";
          setToasterData({ show: true, type: "success", message: message });
          localStorage.setItem("token", response.data?.token);
          localStorage.setItem("isAuthenticated", true);
          localStorage.setItem("role", response.data?.data?.role?.name);
          localStorage.setItem(
            "userDetails",
            JSON.stringify(response.data?.data)
          );
          props.setIsAuthenticated(true);
          setLoading(false);
          let role = response.data?.data?.role?.name.toLowerCase();
          if (role === "admin") {
              navigate("/adminDashboard");
            } 
          else if(role.toLowerCase() === "superadmin"){
            navigate("/adminDashboard");
          }  
          else {
                navigate("/dashboard");
              }
        } else {
          setLoading(false);
          setToasterData({
            show: true,
            type: "error",
            message: response?.message,
          });
        }
      });
    }
  };
  const handleToasterClose = () => {
    setToasterData({ ...toasterData, show: false });
  };

  const handleGoogleLogin = async () => {
    window.open(`https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?response_type=code&redirect_uri=${googleCallbackURI}&scope=email%20profile&client_id=490795331201-155krf6hjcb8drpp3slvce8mnud5abmc.apps.googleusercontent.com&service=lso&o2v=2&theme=glif&ddm=0&flowName=GeneralOAuthFlow&prompt=consent`, "_self");
    // window.open("http://localhost:8000/google", "_self");
  };

  const handleMicrosoftLogin = async () => {
    window.open(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_type=code&redirect_uri=${azureCallbackURI}&scope=openid%20profile%20offline_access%20User.Read&client_id=4080b1fc-f355-4e8e-8356-9193829d34a4&prompt=login`, "_self");
    // window.open("http://localhost:8000/azure", "_self");
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Invalid email address";
    }

    if (!data.password) {
      errors.password = "Password is required";
    }

    return errors;
  };

  return (
    <Box className="login-wrapper">
      {toasterData && (
        <Toaster
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          message={toasterData.message}
          severity={toasterData.type}
          show={toasterData.show}
          handleClose={handleToasterClose}
        />
      )}
      <Box className="login-form-wrapper">
        <Typography variant="h5" fontWeight={600}>
          Welcome to {partnerDetails?.companyName ?? 'Vibhu Venture Partners' }
        </Typography>
        <Typography variant="span" sx={{ color: "#757a82", mt: 1 }}>
          Please sign in to continue
        </Typography>

        <Box
          onSubmit={handleSubmit}
          component="form"
          sx={{ mt: 2, width: "90%" }}
        >
          <InputText
            fullWidth
            label="Email Address"
            id="email"
            margin="normal"
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
          />
          <InputText
            fullWidth
            label="Password"
            id="password"
            margin="normal"
            type={showPassword ? "text" : "password"}
            value={formData.password || ""}
            onChange={(e) => handleChange("password", e.target.value)}
            error={Boolean(errors.password)}
            helperText={errors.password}
            showPasswordToggle
          />

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                mt: 1,
              }}
            >
              <Typography onClick={()=>navigate('/forgotPassword')} variant="span" sx={{ color: "#001061", cursor: 'pointer' }}>
                Forgot Password?
              </Typography>
            </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, p: 1 }}
            disabled={loading}
            className='default-btn'
          >
            {loading ? <CircularProgress size={24} /> : "Sign In"}
          </Button>

          <Button
            onClick={() => navigate("/signup")}
            fullWidth
            variant="outlined"
            sx={{ mt: 2, p: 1 }}
            className='default-btn'
          >
            Sign Up
          </Button>

          <Divider sx={{ marginTop: 3 }}>OR</Divider>

          <Button
            onClick={handleGoogleLogin}
            fullWidth
            variant="outlined"
            sx={{ mt: 2, p: 1 }}
            className='default-btn'
          >
            <img src={GoogleIcon} className="login-logo" /> Sign in with Google
          </Button>
          <Button
            onClick={handleMicrosoftLogin}
            fullWidth
            variant="outlined"
            sx={{ mt: 2, p: 1 }}
            className='default-btn'
          >
            <img src={MicrosoftIcon} className="login-logo" /> Sign in with
            Microsoft
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
