import React from "react";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const InputText = ({
  sx,
  label,
  id,
  type,
  value,
  onChange,
  error,
  helperText,
  fullWidth,
  margin,
  showPasswordToggle,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <TextField
      InputLabelProps={{ shrink: true }}
      className='w-100'
      sx={sx}
      fullWidth={fullWidth}
      label={label}
      id={id}
      margin={margin}
      type={showPassword ? "text" : type}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      InputProps={
        showPasswordToggle
          ? {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleTogglePassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }
          : null
      }
    />
  );
};

export default InputText;
