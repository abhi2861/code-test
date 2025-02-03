import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import './AnchorDrawer.scss'
import SurveyWhite from "../../../../assets/Icons/survey_white.svg";
import InvOppWhiteIcon from "../../../../assets/Icons/inv_opp_white.svg";
import { Tooltip } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import CustomTooltip from '../CustomTooltip/CustomTooltip';

// NEW: Import useDispatch, useSelector, and Redux actions
import { useDispatch, useSelector } from 'react-redux';
import { openDrawer, closeDrawer, toggleDrawer } from '../../../../store/drawerSlice.js';

export default function AnchorDrawer(props) {

  // removed: useState hook to manage local state
  // const [state, setState] = React.useState({
  //   right: false,
  // });

  // NEW: Use useDispatch to get the dispatch function
  const dispatch = useDispatch();

  const isOpen = useSelector((state) => state.drawer.isOpen);

  const handleToggleDrawer = (open) => () => {
    if (open) {
      dispatch(openDrawer());
    } else {
      dispatch(closeDrawer());
    }
  };

  const location = useLocation();



  return (
    <div className='anchor-drawer-wrapper'>
      <Button className='side-nav-btn' onClick={handleToggleDrawer(true)}>
        <span className='count-badge'>{props.surveyCount}</span>
        <CustomTooltip title="Submit Your Interest" placement="right">
          <img className='side-nav-icon' src={SurveyWhite} alt="Survey Icon" />
        </CustomTooltip>
      </Button>
      <Link className='side-nav-btn' to={'/InvestmentOpportunities'}>
        <span className='count-badge'>{props.openInvCount}</span>
        <CustomTooltip title="Investment Opportunities" placement="right">
          <img className='side-nav-icon' src={InvOppWhiteIcon} alt="Investment Opportunities Icon" />
        </CustomTooltip>
      </Link>
      <Drawer
        anchor="right"
        open={isOpen} // Use isOpen from Redux state
        onClose={handleToggleDrawer(false)} // Use handleToggleDrawer function
      >
        <Box className='close-drawer' sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <CloseIcon onClick={handleToggleDrawer(false)} />
        </Box>
        {React.cloneElement(props.children, { toggleDrawer: handleToggleDrawer(false) })} {/* Pass handleToggleDrawer function */}
      </Drawer>
    </div>
  );
}
