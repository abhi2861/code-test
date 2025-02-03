import React, { useState } from 'react';
import { Snackbar, Alert, Button } from '@mui/material';

const Toaster = (props) => {

  return (
    <div>
      <Snackbar anchorOrigin={props.anchorOrigin} open={props.show} onClose={props.handleClose}
        autoHideDuration={props.autoHideDuration ? props.autoHideDuration : 2000}
      >
        <Alert onClose={props.handleClose} severity={props.severity} variant="filled" sx={{ width: '100%' }}>
          {props.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Toaster;