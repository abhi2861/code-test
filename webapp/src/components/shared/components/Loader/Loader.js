import React from 'react';
import { CircularProgress, Backdrop } from '@mui/material';

const Loader = (props) => {
  return (
    <Backdrop sx={{  zIndex: 2, backgroundColor: 'rgba(0, 0, 0, 0.6)'}} open={props.show}>
      <CircularProgress />
    </Backdrop>
  );
};

export default Loader;
