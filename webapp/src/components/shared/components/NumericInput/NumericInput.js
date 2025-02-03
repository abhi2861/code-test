import React from "react";
import { TextField } from "@mui/material";
import { NumericFormat } from "react-number-format";

const NumericInput = (props) => {
  return (
    <NumericFormat
      InputLabelProps={{ shrink: true }}
      customInput={TextField}
      fullWidth={true}
      label={props.label}
      value={props.value}
      sx={props.sx}
      thousandSeparator={props.thousandSeparator}
      prefix={props.prefix}
      suffix={props.suffix}
      decimalScale={props.decimalScale}
      allowNegative={props.allowNegative}
      onChange={props.onChange}
      error={props.error}
      helperText={props.helperText}
      disabled={props.disabled}
      {...props}

    />
  );
};

export default NumericInput;
