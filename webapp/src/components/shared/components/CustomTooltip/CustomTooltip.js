import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  tooltip: {
    fontSize: '16px', // Adjust the font size as needed
  },
});

const CustomTooltip = ({ title, children, placement, classes, onClick }) => {
  return (
    <Tooltip arrow title={title} placement={placement} classes={{ tooltip: classes.tooltip }}>
      <span className='d-inline-flex' onClick={onClick}>{children}</span>
    </Tooltip>
  );
};

export default withStyles(styles)(CustomTooltip);


