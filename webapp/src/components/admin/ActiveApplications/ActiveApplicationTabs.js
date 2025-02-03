import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab, Table } from '@mui/material';
import React, { useEffect, useState } from 'react';
import callAPI from '../../../commonFunctions/ApiRequests';
import Toaster from '../../shared/components/Toaster/Toaster';
import ActiveApplications from './ActiveApplications';
// import { ReactTable } from '../../shared/components/ReactTable/ReactTable';
// import AdminInvestments from './AdminInvestments';
// import { currencifyInDollars } from '../../../commonFunctions/CommonMethod';

const ActiveApplicationTabs = (props) => {

  const [tabActive, setTabActive] = useState('1');
  const [isActiveData, setIsActiveData] = useState([])
  const [isRefundData, setIsRefundData] = useState([])
  const [toasterData, setToasterData] = useState({
    show: false,
    type: "",
    message: "",
});

  const handleTabChange = (event, newValue) => {
    setTabActive(newValue)
  }

  const getIsActiveData = () => {
    callAPI.get(`./api/v1/admin/getActiveApplications?status=Active`)
        .then(response => {
            if (response?.status === 200) {
                setIsActiveData(response?.data?.data)
            } else {
                setToasterData({
                    show: true,
                    type: "error",
                    message: response?.message,
                });

            }
        })
}
  const getIsRefundData = () => {
    callAPI.get(`./api/v1/admin/getActiveApplications?status=Refund`)
        .then(response => {
            if (response?.status === 200) {
                setIsRefundData(response?.data?.data)
            } else {
                setToasterData({
                    show: true,
                    type: "error",
                    message: response?.message,
                });

            }
        })
}


  useEffect(() => {
    getIsActiveData();
    getIsRefundData()
  }, [])

   //toaster function
   const handleToasterClose = () => {
    setToasterData({ ...toasterData, show: false });
};

  return (
    <>
     {toasterData && (
                <Toaster
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    message={toasterData.message}
                    severity={toasterData.type}
                    show={toasterData.show}
                    handleClose={handleToasterClose}
                />
            )}

      <div className='default-tabs admin'>
        <TabContext value={tabActive}>
          <Box elevation='1'>
            <TabList
              className='tab-list'
              onChange={handleTabChange}
              textColor='primary'
              indicatorColor='primary'>
              <Tab label={<span>Active {isActiveData.length > 0 ? <span className='table-tab-count'>{isActiveData.length}</span>: ''} </span>}
                value='1' />
              <Tab label={<span>Refund {isRefundData.length > 0 ? <span className='table-tab-count'>{isRefundData.length}</span>: ''} </span>} 
                value='2' />
            </TabList>
          </Box>
          {/* OPEN */}
          <TabPanel value='1' className='p-0'>
            <ActiveApplications data={isActiveData} tab="active" fetchInvestmentData={getIsActiveData}  fetchCountData={props.fetchCountData}/>
          </TabPanel>
          <TabPanel value='2' className='p-0'>
            <ActiveApplications data={isRefundData} tab="refund" fetchInvestmentData={getIsRefundData} fetchCountData={props.fetchCountData}/>
          </TabPanel>
        </TabContext>
      </div>
    </>
  );
};

export default ActiveApplicationTabs;
