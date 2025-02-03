import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  CircularProgress,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import LpLogo from "../../assets/Logos/lp.svg";
import Toaster from "../shared/components/Toaster/Toaster";
import callAPI from "../../commonFunctions/ApiRequests";
import './ResetPassword.scss'
import {useSelector} from 'react-redux';

const ResetPassword = (props) => {

  const { search } = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({});
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toasterData, setToasterData] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [partnerDetails, setPartnerDetails] = useState({})


  useEffect(() => {

    const urlSearchParams = new URLSearchParams(search);
    const email = urlSearchParams.get("email");
    const token = urlSearchParams.get("resetToken");
    const userEmail = JSON.parse(localStorage?.getItem('userDetails'))?.email

    setEmail(email || userEmail)
    setToken(token)

  }, [search]);

  const handleToasterClose = () => {
    setToasterData({ ...toasterData, show: false });
  };

  const handleTogglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword((prevShowPassword) => !prevShowPassword);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(
        (prevShowConfirmPassword) => !prevShowConfirmPassword
      );
    }
  };


  const validateForm = (data, field) => {
    const newErrors = { ...errors };

    if (field === 'password' || !field) {
      if (!data.password) {
        newErrors.password = "Password is required";
      } else {
        let passwordRequirements = [];

        if (!/(?=.*[a-z])/.test(data.password)) {
          passwordRequirements.push("At least 1 small letter");
        }

        if (!/(?=.*[A-Z])/.test(data.password)) {
          passwordRequirements.push("At least 1 capital letter");
        }

        if (!/(?=.*\d)/.test(data.password)) {
          passwordRequirements.push("At least 1 numeric value");
        }

        if (!/(?=.*[@$!%*?&])/.test(data.password)) {
          passwordRequirements.push("At least 1 special character");
        }

        if (data.password.length < 8) {
          passwordRequirements.push("At least 8 characters");
        }

        if (passwordRequirements.length > 0) {
          newErrors.password = (
            <div>
              Password must contain:
              <br />
              <ul className="password-message-ul">
                {passwordRequirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          );
        } else {
          delete newErrors.password;
        }
      }
    }

    if (field === 'confirmPassword' || !field) {
      if (!data.confirmPassword) {
        newErrors.confirmPassword = "Confirm Password is required";
      } else if (data.confirmPassword !== data.password) {
        newErrors.confirmPassword = "Passwords do not match";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;  
  };

  const handleChange = (field, value) => {

    if (errors.submit) {
      delete errors.submit;
    }

    validateForm({ ...formData, [field]: value }, field);

    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value
    }));
  };

  const handleSubmit = (e)=>{
    e.preventDefault();
    if (validateForm(formData)) {
      const req = {
        email: email || formData?.email,
        newPassword: formData?.password,
        confirmPassword: formData?.confirmPassword
      }

      setLoading(true)

      if(token){
        callAPI.post(`./api/v1/reset/resetPassword/${token}`, req)
        .then((response) => {
            if (response.status === 200) {
              setLoading(false);
              setToasterData({
                show: true,
                type: "success",
                message: response?.data?.message,
              });

              setTimeout(() => {
                navigate("/");
              }, 1000)
              
            } else {
              setLoading(false);
              setErrors({ ...errors, submit: response?.message });
            }
          })

      }else{
        callAPI.post(`./api/v1/email/changePassword`, req)
        .then((response) => {
            if (response.status === 200) {
              setLoading(false);
              setToasterData({
                show: true,
                type: "success",
                message: response?.data?.message,
              });

              setTimeout(() => {
                navigate("/");
              }, 1000)
              
            } else {
              setLoading(false);
              setErrors({ ...errors, submit: response?.message });
            }
          })
      }  
    }
  }

  useEffect(()=>{
        callAPI.get('./api/v1/auth/getPartnerDetails')
          .then(response => {
              if(response.status == 200){
                setPartnerDetails(response.data?.data)
                const newFavicon = response.data?.data?.favIcon;
				        const newTitle = response.data?.data?.companyName;
                let faviconElement = document.querySelector("link[rel~='icon']");
                if(!faviconElement) {
                  faviconElement = document.createElement('link');
                  faviconElement.rel = 'icon';
                  faviconElement.href = newFavicon;
                  document.head.appendChild(faviconElement);
                }
				        faviconElement.href = newFavicon;
				        document.title = newTitle
              }
          })    
    },[])

  return (
    <Box
      className="ResetPasswordPage"
      sx={{
        backgroundColor: "#F3F4F6",
        display: "flex",
        paddingY: "60px",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "8px",
        minHeight: '100vh'
      }}
    >
      {toasterData && (
        <Toaster
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          message={toasterData.message}
          severity={toasterData.type}
          show={toasterData.show}
          handleClose={handleToasterClose}
        />
      )}
      <form onSubmit={handleSubmit} className='sign-up-form'>
        <Box
          sx={{
            backgroundColor: "#ffffff",
            width: "600px",
            boxShadow: "0px 6px 18px rgba(0,0,0,.06)",
            display: "flex",
            justifyContent: "center",
            gap: 2,
            borderRadius: 3,
          }}
          className="resetpassword_signup"
        >
          <Box sx={{ width: "100%", paddingX: 5, paddingY: 6 }} className="formBoxSignup">
            <Box className="logo-box" sx={{ marginBottom: 3, display: "flex", justifyContent: "center" }}>
              <img src={partnerDetails?.logo ?? LpLogo} alt="Logo" />
            </Box>

            <Stack spacing={2}>
                  <Stack direction={"row"} spacing={2}>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "100%" }}
                      label="Email Address"
                      id="email"
                      margin="normal"
                      value={email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      disabled={true}
                    />
                  </Stack>

                  <Stack direction={"column"} spacing={2} className='password-row'>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "100%" }}
                      label="Password"
                      id="password"
                      margin="normal"
                      type={showPassword ? "text" : "password"}
                      onChange={(e) => handleChange("password", e.target.value)}
                      value={formData?.password || ""}
                      error={!!errors?.password}
                      helperText={errors?.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                handleTogglePasswordVisibility("password")
                              }
                            >
                              {showPassword ? (
                                <VisibilityOff className="view-password-icon" />
                              ) : (
                                <Visibility className="view-password-icon" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      InputLabelProps={{ shrink: true }}
                      // autoFocus={true}
                      // InputLabelProps={{ shrink: true }}
                      sx={{ width: "100%" }}
                      label="Confirm Password"
                      id="confirmPassword"
                      margin="normal"
                      type={showConfirmPassword ? "text" : "password"}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      value={formData?.confirmPassword || ""}
                      error={!!errors?.confirmPassword}
                      helperText={errors?.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                handleTogglePasswordVisibility(
                                  "confirmPassword"
                                )
                              }
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff className="view-password-icon" />
                              ) : (
                                <Visibility className="view-password-icon" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
            </Stack>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2, p: 1 }}
              disabled={loading}
              className='default-btn'
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : ("Submit")
              }
            </Button>
            {errors.submit && (
              <Typography variant="body2" color="error" mt={2}>
                {errors.submit}
              </Typography>
            )}
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default ResetPassword;