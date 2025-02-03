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
import LpLogo from "../../assets/Logos/lp.svg";
import Toaster from "../shared/components/Toaster/Toaster";
import callAPI from "../../commonFunctions/ApiRequests";
import "./ResetPassword.scss";
import { useNavigate } from "react-router-dom";
import {useSelector} from 'react-redux';

const ForgotPassword = () => {

  const partnerDetails = useSelector(store => store.commonReducer?.partnerDetails)

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toasterData, setToasterData] = useState({
    show: false,
    type: "",
    message: "",
  });

  const navigate = useNavigate()

  const handleToasterClose = () => {
    setToasterData({ ...toasterData, show: false });
  };

  const validateForm = (name, value) => {
    const newErrors = { ...errors };
    if (name === "email") {
      if (!value) {
        newErrors.email = "Email Address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = "Invalid email address";
      } else {
        delete newErrors.email;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmail(value);
    validateForm(name, value);
};

const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm('email', email)) {
      setLoading(true);
      callAPI.post(`./api/v1/email/requestResetPassword`, { email })
        .then((response) => {
          setLoading(false);
          if (response.status === 200) {
            setToasterData({
              show: true,
              type: "success",
              message: response?.data?.message,
            });
            setTimeout(() => {
              window.location.href = "/";
            }, 1000);
          } else {
            setErrors({ ...errors, submit: response?.message });
          }
        })
        .catch((error) => {
          setLoading(false);
          setErrors({ ...errors, submit: error.message });
        });
    }
};

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
        minHeight: "100vh",
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
      <form onSubmit={handleSubmit} className="sign-up-form">
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
          <Box
            sx={{ width: "100%", paddingX: 5, paddingY: 6 }}
            className="formBoxSignup"
          >
            <Box
              className="logo-box"
              sx={{
                marginBottom: 3,
                display: "flex",
                justifyContent: "center",
              }}
            >
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
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Stack>
            </Stack>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2, p: 1 }}
              disabled={loading}
              className="default-btn"
            >
              {loading ? <CircularProgress size={24} /> : "Submit"}
            </Button>
            <Button
              onClick={()=> navigate('/login')}
              variant="outlined"
              fullWidth
              sx={{ mt: 2, p: 1 }}
              disabled={loading}
              className=""
            >
            Back to login
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

export default ForgotPassword;
