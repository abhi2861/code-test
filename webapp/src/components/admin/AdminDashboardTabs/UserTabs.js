import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab, Table } from '@mui/material';
import React, { useEffect, useState } from 'react';
import callAPI from '../../../commonFunctions/ApiRequests';
import Toaster from '../../shared/components/Toaster/Toaster';
import UserData from './UserData';
// import { ReactTable } from '../../shared/components/ReactTable/ReactTable';
// import AdminInvestments from './AdminInvestments';
import { currencifyInDollars } from '../../../commonFunctions/CommonMethod';

const UserTabs = (props) => {

  const [tabActive, setTabActive] = useState('1');
  const [userList, setUserList] = useState([])
  const [adminList, setAdminList] = useState([])
  const [loading, setLoading] = useState(false);

  const role = localStorage.getItem('role')
  const [toasterData, setToasterData] = useState({
    show: false,
    type: "",
    message: "",
});

  const handleTabChange = (event, newValue) => {
    setTabActive(newValue)
  }


    const getUserData = () => {
        setLoading(true)
        callAPI.get(`./api/v1/user/usersList?status=Closed&role=${role}`)
            .then(response => {
                if (response?.status === 200) {
                    let data = response?.data?.data
                    let adminList = response?.data?.adminList
                    console.log('response?.data?.data',response?.data?.data)
                    if (data && data.length > 0) {
                        data = data.map(item => {
                            return (
                                {
                                    name: item?.name,
                                    email: item?.email,
                                    // totalInvestments: item?.totalInvestments,
                                    totalInvestments: item?.investmetDetails?.length > 0 ? item?.investmetDetails?.length : 0,
                                    totalFund: item?.totalFund,
                                    lastLoginDate: item?.lastLoginDate,
                                    id: item?.id,
                                    accreditation: item?.accreditation,
                                    innerJSX: item?.investmetDetails && item?.investmetDetails.length > 0 ? <tr>
                                        <td colSpan={6} className='innerTable'>
                                            <Table className='admins-user-table'>
                                                <thead>
                                                    <th className='company-in-table'>Company</th>
                                                    <th className='investment-name-in-table'>Investment Opportunity</th>
                                                    <th className='text-right investment-name-in-table'>Invested Amount</th>
                                                    <th className='text-right current-amount-in-table'>Current Amount</th>

                                                </thead>
                                                <tbody>
                                                    {
                                                        item.investmetDetails.map(innerItem => {
                                                            return (
                                                                <tr>
                                                                    <td className='company-in-table'>
                                                                        <div className='d-flex align-items-center company-info-in-table'>
                                                                            <div className='company-logo-in-table'>
                                                                                <img src={innerItem?.companyLogo} />
                                                                            </div>
                                                                            <b>{innerItem?.companyName}</b>
                                                                        </div>
                                                                    </td>
                                                                    <td className='investment-name-in-table'>{innerItem?.investmentName}</td>
                                                                    <td className='text-right investment-name-in-table'>{currencifyInDollars(innerItem?.amount) ?? 0.00}</td>
                                                                    <td className='text-right current-amount-in-table'>{currencifyInDollars(innerItem?.currentValue ?? 0.00)}</td>

                                                                </tr>
                                                            )
                                                        })
                                                    }
                                                </tbody>
                                            </Table>
                                        </td>
                                    </tr> : null
                                }
                            )
                        })
                        setUserList(data)
                        setAdminList(adminList)
                    }
                    setLoading(false)

                } else {
                    setLoading(false)
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response?.message,
                    });
                }
            })
    }


  useEffect(() => {
    getUserData();
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
              <Tab label={<span>Users {userList.length > 0 ? <span className='table-tab-count'>{userList.length}</span>: ''} </span>}
                value='1' />
              <Tab label={<span>Admin {adminList.length > 0 ? <span className='table-tab-count'>{adminList.length}</span>: ''} </span>} 
                value='2' />
            </TabList>
          </Box>
          {/* OPEN */}
          <TabPanel value='1' className='p-0'>
            <UserData data={userList} tab="user" fetchInvestmentData={getUserData}  fetchCountData={props.fetchCountData}/>
          </TabPanel>
          <TabPanel value='2' className='p-0'>
            <UserData data={adminList} tab="admin" fetchInvestmentData={getUserData} fetchCountData={props.fetchCountData}/>
          </TabPanel>
        </TabContext>
      </div>
    </>
  );
};

export default UserTabs;
