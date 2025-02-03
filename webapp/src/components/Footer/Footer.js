import React from 'react'
import { Box, Typography } from '@mui/material'
import './Footer.scss'
import {useSelector} from 'react-redux';

const Footer = (props) => {

  const partnerDetails = useSelector(store => store.commonReducer?.partnerDetails)

  return (
    <Box className={`${props.zeroTopMargin ? 'mt-0' : ''} footerWrapper d-flex align-items-center justify-content-center`}>
        <Typography>
        Copyright © {new Date().getFullYear()} {partnerDetails?.companyName ?? 'Vibhu Venture Partners' }. All rights reserved.
        </Typography>
    </Box>
  )
}

export default Footer