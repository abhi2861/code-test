import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Stack,
  Divider,
  TextField,
  MenuItem,
  Autocomplete,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import LpLogo from "../../assets/Logos/lp.svg";
import GoogleIcon from "../../assets/Logos/google.svg";
import MicrosoftIcon from "../../assets/Logos/microsoft.svg";
import Toaster from "../shared/components/Toaster/Toaster";
import callAPI from "../../commonFunctions/ApiRequests";
import {useSelector} from 'react-redux';
import './Signup.scss'

const Signup = (props) => {
  const partnerDetails = useSelector(store => store.commonReducer?.partnerDetails)

  const [step1FormData, setStep1FormData] = useState({});
  const [step2FormData, setStep2FormData] = useState({});
  const [investorOptions, setInvestorOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isTokenAvailable, setIsTokenAvailable] = useState(false);
  const [toasterData, setToasterData] = useState({
    show: false,
    type: "",
    message: "",
  });
  const { search } = useLocation();
  const navigate = useNavigate();

  const fetchAccrede = async () => {

		callAPI.get(`./api/v1/pandadocapis/getMasterData?type=accreditation`)
			.then(response => {
				if (response?.status === 200) {
          setInvestorOptions(response.data.data);
				} else {
					setToasterData({
						show: true,
						type: "error",
						message: response?.message,
					});
				}
			})
	};

  useEffect(()=>{
    fetchAccrede()
  }, [])

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(search);
    const Token = urlSearchParams.get("token");
    const id = urlSearchParams.get("userId");
    const firstName = urlSearchParams.get("firstName");
    const lastName = urlSearchParams.get("lastName");
    const email = urlSearchParams.get("socialEmail");
    const refferedBy = urlSearchParams.get("refferedBy");
    if (Token) {
      setIsTokenAvailable(true);
    }

    if (Token && id) {
      setStep2FormData((prevData) => ({
        ...prevData,
        Token,
        id,
        firstName,
        lastName,
        email,
        refferedBy
      }));
      setCurrentStep(2);
    }
  }, [search]);

  const handleChange = (key, value) => {
    let formDataToUpdate;
    if (currentStep === 1) {
      formDataToUpdate = { ...step1FormData, [key]: value };
      setStep1FormData(formDataToUpdate);
    } else {

      if(key === "profileType" && value === "Joint"){
        formDataToUpdate = {
          ...step2FormData,
          institutionName: '',
          [key]:value
        };
        setStep2FormData(formDataToUpdate);

      }else if(key === "profileType" && value === "Institutional"){
        formDataToUpdate = {
          ...step2FormData,
          spouseName: '',
          spouseEmail: '',
          [key]:value

        };
        setStep2FormData(formDataToUpdate);
      }else if(key === "profileType" && value === "Individual"){
        formDataToUpdate = {
          ...step2FormData,

          spouseName: '',
          spouseEmail: '',
          institutionName: '',
          [key]:value
        };


        setStep2FormData(formDataToUpdate);
      }else{
        formDataToUpdate = { ...step2FormData, [key]: value };
        setStep2FormData(formDataToUpdate);
      }


    }

    const validationErrors = validateForm(formDataToUpdate);
    // Update the errors state
    setErrors((prevErrors) => ({
      ...prevErrors,
      [key]: validationErrors[key],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(
      currentStep === 1 ? step1FormData : step2FormData
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      if (currentStep === 1) {
        const { confirmPassword, ...dataWithoutConfirmPassword } =
          step1FormData;

        try {
          setLoading(true);
          const addInStep2 = {
            ...step2FormData,

            firstName: step1FormData.firstName,
            lastName: step1FormData.lastName,
            email: step1FormData.email,
            password: step1FormData.password,
          };
          setLoading(false);

          setStep2FormData(addInStep2);

          localStorage.removeItem("isAuthenticated");
          localStorage.removeItem("role");
          localStorage.removeItem("userDetails");

          setCurrentStep(2);
        } catch (error) {
          console.error("Signup API Error:", error);
        }
      } else {
        try {
          const req = {
            ...step2FormData,
          };

          const headers = {
            "Content-Type": "application/json",
          };

          if (isTokenAvailable) {
            headers["Authorization"] = `Bearer ${step2FormData.Token}`;
          }
          setLoading(true);
          callAPI.post("./api/v1/auth/signup", req).then(async (response) => {
            if (response.status == 201 || response.status == 200) {
              const message = response.data?.message || "Login successful!";
              setToasterData({ show: true, type: "success", message: message });
              localStorage.setItem("token", response.data?.token);
              localStorage.setItem("isAuthenticated", true);
              localStorage.setItem(
                "role",
                response.data?.data?.role?.name
              );
              localStorage.setItem(
                "userDetails",
                JSON.stringify(response.data?.data)
              );
              props.setIsAuthenticated(true);
              setLoading(false);
              let role = response.data?.data?.role?.name.toLowerCase();
              if (role == "admin") {
                navigate("/adminDashboard");
              } else {
                navigate("/dashboard");
              }
            } else {
              setLoading(false);
              setToasterData({
                show: true,
                type: "error",
                message: response.message,
              });
            }
          });
        } catch (error) {
          setLoading(false);
          console.error("Signup API Error:", error);
        }
      }
    }
  };

  const handleToasterClose = () => {
    setToasterData({ ...toasterData, show: false });
  };

  const handleGoogleLogin = async () => {
    window.open("https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?response_type=code&redirect_uri=https%3A%2F%2Fvibhu.techvedhas.com%2Fgoogle%2Fcallback&scope=email%20profile&client_id=490795331201-155krf6hjcb8drpp3slvce8mnud5abmc.apps.googleusercontent.com&service=lso&o2v=2&theme=glif&ddm=0&flowName=GeneralOAuthFlow&prompt=consent", "_self");
  };

  const handleMicrosoftLogin = async () => {
    window.open("https://login.microsoftonline.com/common/oauth2/v2.0/authorize?response_type=code&redirect_uri=https%3A%2F%2Fvibhu.techvedhas.com%2Fauth%2Fopenid%2Freturn&scope=openid%20profile%20offline_access%20User.Read&client_id=4080b1fc-f355-4e8e-8356-9193829d34a4&prompt=login", "_self");
    // window.open("https://vibhu.techvedhas.com/node/azure", "_self");
  };

  const validateForm = (data) => {
    const errors = {};

    // validation rules
    if (currentStep === 1) {
      // Validation for step 1 fields

      if (!data.firstName) {
        errors.firstName = "First Name is required";
      }

      if (!data.lastName) {
        errors.lastName = "Last Name is required";
      }

      if (!data.email) {
        errors.email = "Email Address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Invalid email address";
      }

      if (!data.password) {
        errors.password = "Password is required";
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
          errors.password = (
            <div>
            Password must contain: <br/>
              <ul className="password-message-ul">
                {passwordRequirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          );
        }
      }

      if (!data.confirmPassword) {
        errors.confirmPassword = "Confirm Password is required";
      } else if (data.confirmPassword !== data.password) {
        errors.confirmPassword = "Passwords do not match";
      }
    } else if (currentStep === 2) {
      // Validation for step 2 fields

      if (!data.firstName) {
        errors.firstName = "First Name is required";
      }

      if (!data.lastName) {
        errors.lastName = "Last Name is required";
      }

      if (!data.email) {
        errors.email = "Email Address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = "Invalid email address";
      }

      if (!data.phone) {
        errors.phone = "Phone is required";
      } else if (!/^\d+$/.test(data.phone)) {
        errors.phone = "Please enter only numbers for Phone";
      }else if (!/^[\d()+-]+$/.test(data.phone)) {
        errors.phone = "Please enter only numbers, (), +, and - for Phone";
      }else if (data.phone.length < 10) {
        errors.phone = "Phone number should be at least 10 digits";
      } else if (data.phone.length > 10) {
        errors.phone = "Phone number should be at most 10 digits";
      }

      if (!data.addressline1) {
        errors.addressline1 = "Address Line 1 is required";
      }

      if (!data.city) {
        errors.city = "City is required";
      }

      if (!data.zipcode) {
        errors.zipcode = "Zip Code is required";
      } else if (!/^\d+$/.test(data.zipcode)) {
        errors.zipcode = "Please enter only numbers for Zip Code";
      }

      if (!data.state) {
        errors.state = "State is required";
      }

      if (!data.country) {
        errors.country = "Country is required";
      }

      if (!data.investmentExperience) {
        errors.investmentExperience = "Investment Experience is required";
      }

      if (!data.occupation) {
        errors.occupation = "Occupation is required";
      }

      if (!data.organisationName) {
        errors.organisationName = "Organization is required";
      }

      if (!data.profileType) {
        errors.profileType = "Profile Type is required";
      }

      if (data.profileType === "Joint") {
        if (!data.spouseName) {
          errors.spouseName = "Spouse Name is required";
        }
        if (!data.spouseEmail) {
          errors.spouseEmail = "Spouse Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.spouseEmail)) {
          errors.spouseEmail = "Invalid spouse email address";
        } else if (data.spouseEmail === data.email) {
          errors.spouseEmail = "Spouse Email cannot be the same as primary email";
        }
      }

      if (data.profileType === "Institutional") {
        if (!data.institutionName) {
          errors.institutionName = "Institution Name is required";
        }
      }

      if (!data.accreditation) {
        errors.accreditation = "Investor Status is required";
      }

      if (!data.areaOfExpertise) {
        errors.areaOfExpertise = "Area of Expertise is required";
      }
    }

    return errors;
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

  const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Democratic Republic of the Congo",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "East Timor",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Ivory Coast",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Kosovo",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Korea",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Korea",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ];

  const investmentExperiences = ["Beginner", "Intermediate", "Advanced"];

  const profileTypes = ["Individual", "Joint", "Institutional"];

  return (
    <Box
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
            width: "1140px",
            boxShadow: "0px 6px 18px rgba(0,0,0,.06)",
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            borderRadius: 3,
          }}
          className="signupForm"
        >
          <Box sx={{ width: "60%", paddingX: 5, paddingY: 6 }} className="formBoxSignup">
            <Box sx={{ marginBottom: 3 }} className="logo-box">
              <img src={partnerDetails?.logo ?? LpLogo} alt="Logo" />
            </Box>

            <Stack spacing={2}>
              {currentStep === 1 && (
                <>
                  <Stack direction={"row"} spacing={2}>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "50%" }}
                      label="First Name"
                      id="firstName"
                      margin="normal"
                      type="text"
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      value={step1FormData.firstName || ""}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      onKeyPress={(e) => {
                        const charCode = e.which ? e.which : e.keyCode;
                        if (
                          !(
                            (
                              (charCode >= 65 && charCode <= 90) || // A-Z
                              (charCode >= 97 && charCode <= 122) || // a-z
                              charCode === 8 || // Backspace
                              charCode === 32
                            ) // Space
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />

                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "50%" }}
                      label="Last Name"
                      id="lastName"
                      margin="normal"
                      type="text"
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      value={step1FormData.lastName || ""}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      onKeyPress={(e) => {
                        const charCode = e.which ? e.which : e.keyCode;
                        if (
                          !(
                            (
                              (charCode >= 65 && charCode <= 90) || // A-Z
                              (charCode >= 97 && charCode <= 122) || // a-z
                              charCode === 8 || // Backspace
                              charCode === 32
                            ) // Space
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Stack>

                  <Stack direction={"row"} spacing={2} className='email-row'>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "100%" }}
                      label="Email Address"
                      id="email"
                      margin="normal"
                      onChange={(e) => handleChange("email", e.target.value)}
                      value={step1FormData.email || ""}
                      error={!!errors.email}
                      helperText={errors.email}
                    />
                  </Stack>

                  <Stack direction={"row"} spacing={2} className='password-row'>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "50%" }}
                      label="Password"
                      id="password"
                      margin="normal"
                      type={showPassword ? "text" : "password"}
                      onChange={(e) => handleChange("password", e.target.value)}
                      value={step1FormData.password || ""}
                      error={!!errors.password}
                      helperText={errors.password}
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
                      sx={{ width: "50%" }}
                      label="Confirm Password"
                      id="confirmPassword"
                      margin="normal"
                      type={showConfirmPassword ? "text" : "password"}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      value={step1FormData.confirmPassword || ""}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
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
                </>
              )}

              {currentStep === 2 && (
                <>
                  <Stack direction={"row"} spacing={2}>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "50%" }}
                      label="First Name"
                      id="firstName"
                      margin="normal"
                      type="text"
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      value={step2FormData.firstName || ""}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      onKeyPress={(e) => {
                        const charCode = e.which ? e.which : e.keyCode;
                        if (
                          !(
                            (
                              (charCode >= 65 && charCode <= 90) || // A-Z
                              (charCode >= 97 && charCode <= 122) || // a-z
                              charCode === 8 || // Backspace
                              charCode === 32
                            ) // Space
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />

                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "50%" }}
                      label="Last Name"
                      id="lastName"
                      margin="normal"
                      type="text"
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      value={step2FormData.lastName || ""}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      onKeyPress={(e) => {
                        const charCode = e.which ? e.which : e.keyCode;
                        if (
                          !(
                            (
                              (charCode >= 65 && charCode <= 90) || // A-Z
                              (charCode >= 97 && charCode <= 122) || // a-z
                              charCode === 8 || // Backspace
                              charCode === 32
                            ) // Space
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Stack>

                  <Stack direction={"row"} spacing={2} className='field-row-mobile'>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "50%" }}
                      label="Email Address"
                      id="email"
                      margin="normal"
                      onChange={(e) => handleChange("email", e.target.value)}
                      value={step2FormData.email || ""}
                      error={!!errors.email}
                      // disabled = {isSocialEmail ? true : false}
                      helperText={errors.email}
                    />

                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "50%" }}
                      label="Phone"
                      id="phone"
                      margin="normal"
                      onChange={(e) => handleChange("phone", e.target.value)}
                      value={step2FormData.phone || ""}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      onKeyPress={(e) => {
                        const charCode = e.which ? e.which : e.keyCode;
                        const char = String.fromCharCode(charCode);
                        const allowedChars = [
                          "(",
                          ")",
                          "+",
                          "-",
                          ...Array.from(Array(10).keys()).map(String),
                        ];

                        if (!allowedChars.includes(char)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Stack>

                  <Stack direction={"row"} spacing={2} className='field-row-mobile'>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "50%" }}
                      label="Address Line 1"
                      id="addressline1"
                      margin="normal"
                      onChange={(e) =>
                        handleChange("addressline1", e.target.value)
                      }
                      value={step2FormData.addressline1 || ""}
                      error={!!errors.addressline1}
                      helperText={errors.addressline1}
                    />

                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "50%" }}
                      label="City"
                      id="city"
                      margin="normal"
                      onChange={(e) => handleChange("city", e.target.value)}
                      value={step2FormData.city || ""}
                      error={!!errors.city}
                      helperText={errors.city}
                    />
                  </Stack>

                  <Stack direction={"row"} spacing={2} className='field-row-mobile'>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "50%" }}
                      label="State"
                      id="state"
                      margin="normal"
                      onChange={(e) => handleChange("state", e.target.value)}
                      value={step2FormData.state || ""}
                      error={!!errors.state}
                      helperText={errors.state}
                    />

                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "50%" }}
                      label="Zip Code"
                      id="zipcode"
                      margin="normal"
                      onChange={(e) => handleChange("zipcode", e.target.value)}
                      value={step2FormData.zipcode || ""}
                      error={!!errors.zipcode}
                      helperText={errors.zipcode}
                      onKeyPress={(e) => {
                        const charCode = e.which ? e.which : e.keyCode;
                        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Stack>

                  <Stack direction={"row"} spacing={2} className='field-row-mobile'>
                    <Autocomplete
                      className="auto-complete-field"
                      options={countries}
                      value={step2FormData.country || null}
                      sx={{ width: "50%" }}
                      onChange={(_, value) => handleChange("country", value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          InputLabelProps={{ shrink: true }}
                          label="Country"
                          id="country"
                          error={!!errors.country}
                          helperText={errors.country}
                        />
                      )}
                    />

                    <TextField
                      className="select-field"
                      InputLabelProps={{ shrink: true }}
                      select
                      label="Investment Experience Level"
                      id="investmentExperience"
                      sx={{ width: "50%" }}
                      margin="normal"
                      onChange={(e) =>
                        handleChange("investmentExperience", e.target.value)
                      }
                      value={step2FormData.investmentExperience || ""}
                      error={!!errors.investmentExperience}
                      helperText={errors.investmentExperience}
                    >
                      {investmentExperiences.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Stack direction={"row"} spacing={2} className='field-row-mobile'>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "50%" }}
                      label="Occupation"
                      id="occupation"
                      margin="normal"
                      onChange={(e) =>
                        handleChange("occupation", e.target.value)
                      }
                      value={step2FormData.occupation || ""}
                      error={!!errors.occupation}
                      helperText={errors.occupation}
                    />

                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "50%" }}
                      label="Organization"
                      id="organisationName"
                      margin="normal"
                      onChange={(e) =>
                        handleChange("organisationName", e.target.value)
                      }
                      value={step2FormData.organisationName || ""}
                      error={!!errors.organisationName}
                      helperText={errors.organisationName}
                    />
                  </Stack>

                  <Stack direction={"row"} spacing={2} className='field-row-mobile'>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      select
                      label="Profile Type"
                      id="profileType"
                      sx={
                        step2FormData.profileType === "Institutional"
                          ? { width: "50%" }
                          : { width: "100%" }
                      }
                      margin="normal"
                      onChange={(e) =>
                        handleChange("profileType", e.target.value)
                      }
                      value={step2FormData.profileType || ""}
                      error={!!errors.profileType}
                      helperText={errors.profileType}
                    >
                      {profileTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>

                    {step2FormData.profileType === "Institutional" && (
                      <TextField
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: "50%" }}
                        label="Institution Name"
                        id="institutionName"
                        margin="normal"
                        onChange={(e) =>
                          handleChange("institutionName", e.target.value)
                        }
                        value={step2FormData.institutionName || ""}
                        error={!!errors.institutionName}
                        helperText={errors.institutionName}
                      />
                    )}
                  </Stack>

                  {step2FormData.profileType === "Joint" && (
                    <>
                      <Stack direction={"row"} spacing={2} className='field-row-mobile'>
                        <TextField
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: "50%" }}
                          label="Spouse Name"
                          id="spouseName"
                          margin="normal"
                          onChange={(e) =>
                            handleChange("spouseName", e.target.value)
                          }
                          value={step2FormData.spouseName || ""}
                          error={!!errors.spouseName}
                          helperText={errors.spouseName}
                          onKeyPress={(e) => {
                            const charCode = e.which ? e.which : e.keyCode;
                            if (
                              !(
                                (
                                  (charCode >= 65 && charCode <= 90) || // A-Z
                                  (charCode >= 97 && charCode <= 122) || // a-z
                                  charCode === 8 || // Backspace
                                  charCode === 32
                                ) // Space
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        />

                        <TextField
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: "49%" }}
                          label="Spouse Email"
                          id="spouseEmail"
                          margin="normal"
                          type="email"
                          onChange={(e) =>
                            handleChange("spouseEmail", e.target.value)
                          }
                          value={step2FormData.spouseEmail || ""}
                          error={!!errors.spouseEmail}
                          helperText={errors.spouseEmail}
                        />
                      </Stack>
                    </>
                  )}

                  <Stack direction={"row"} spacing={2} className='field-row-mobile'>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      select
                      label="Investor Status"
                      id="accreditation"
                      sx={{ width: "100%" }}
                      margin="normal"
                      onChange={(e) => handleChange("accreditation", e.target.value)}
                      value={step2FormData.accreditation || ""}
                      error={!!errors.accreditation}
                      helperText={errors.accreditation}
                    >
                      {investorOptions.map((option, index) => (
                        <MenuItem key={index} value={option.value}>
                          {option.value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Stack direction={"row"} spacing={2} className='email-row'>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "100%" }}
                      label="Reffered By"
                      id="referredBy"
                      margin="normal"
                      onChange={(e) => handleChange("referredBy", e.target.value)}
                      value={step2FormData.referredBy || ""}
                      error={!!errors.referredBy}
                      helperText={errors.referredBy}
                    />
                  </Stack>

                  <Stack direction={"row"} spacing={2} className='field-row-mobile'>
                    <TextField
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: "100%" }}
                      label="Area of Expertise"
                      id="areaOfExpertise"
                      multiline
                      // rows={4}
                      margin="normal"
                      onChange={(e) =>
                        handleChange("areaOfExpertise", e.target.value)
                      }
                      value={step2FormData.areaOfExpertise || ""}
                      error={!!errors.areaOfExpertise}
                      helperText={errors.areaOfExpertise}
                    />
                  </Stack>
                </>
              )}
            </Stack>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2, p: 1 }}
              disabled={loading || step2FormData.accreditation === "None of the above"}
              className='default-btn next-btn'
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : currentStep === 1 ? (
                "Next"
              ) : (
                "Sign Up"
              )}
            </Button>

            {currentStep === 1 && (
              <>
                <Divider sx={{ marginTop: 3 }}>OR</Divider>

                <Button
                  onClick={handleGoogleLogin}
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2, p: 1 }}
                  className='default-btn'
                >
                  <img src={GoogleIcon} className="login-logo" /> Sign Up with
                  Google
                </Button>

                <Button
                  onClick={handleMicrosoftLogin}
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2, p: 1 }}
                  className='default-btn'
                >
                  <img src={MicrosoftIcon} className="login-logo" /> Sign Up
                  with Microsoft
                </Button>
              </>
            )}
          </Box>

          <Box
            sx={{ backgroundColor: "#ccc", width: "40%" }}
            className="login-cover-img"
          ></Box>
        </Box>
      </form>
    </Box>
  );
};

export default Signup;