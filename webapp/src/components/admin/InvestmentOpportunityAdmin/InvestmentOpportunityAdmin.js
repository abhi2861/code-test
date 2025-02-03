import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab, Table } from '@mui/material';
import React, { useEffect, useState } from 'react';
import callAPI from '../../../commonFunctions/ApiRequests';
import { ReactTable } from '../../shared/components/ReactTable/ReactTable';
import AdminInvestments from './AdminInvestments';
import { currencifyInDollars } from '../../../commonFunctions/CommonMethod';

const InvestmentOpportunityAdmin = (props) => {

  const [tabActive, setTabActive] = useState('1');

  const [isOpenData, setIsOpenData] = useState([])
  const [isUpComingData, setUpComingData] = useState([])
  const [iscompletedData, setCompletedData] = useState([])
  const[deletemsg,setDeletemsg]=useState(null)
  
  const handleTabChange = (event, newValue) => {
    setTabActive(newValue)
  }

  const getInvestment = () => {
    callAPI.get(`./api/v1/investment/getInvestmentOpportunity?status=Open&role=admin`)
      .then((response) => {
        if (response.status === 200) {
          // const notApplied = response?.data?.data && response?.data?.data.filter((item) => item.applied === false)
          let data = response?.data?.data
          if (data && data.length > 0) {
            data = data.map(item => {
              return (
                {
                  id: item?.id,
                  name: item?.name,
                  companyName: item?.company?.name,
                  companyLogo: item?.company?.logo,
                  companyId: item?.company?.id,
                  investmentStatus: item?.investmentStatus,
                  numberofInvestors: item?.totalInvestors ?? 0,
                  totalFundRaised: item?.totalFundRaised ?? 0,
                  startDate: item?.startDate,
                  endDate: item?.endDate,
                  minAmount: item.minAmount,
                  carry: item?.carry,
                  minAmount: item.minAmount,
                  carry: item?.carry,
                  perUnitPrice: item?.perUnitPrice,
                  templateId: item?.templateId,
                  description: item?.description,
                  description: item?.description,
                  documents: item?.document,
                  innerJSX: item?.investorData && item.investorData.length > 0 ? <tr>
                    <td colSpan={6} className='innerTable'>
                      <Table>
                        <thead className='border-bottom-Darker'>
                          <th className='name-in-table'>Investor Name</th>
                          <th className='amount-in-table text-right'>Invested Amount</th>
                          <th className='current-month-in-table text-right'>Current Amount</th>
                        </thead>
                        <tbody>
                          {
                            item.investorData.map(innerItem => {
                              return (
                                <tr>
                                  <td>{innerItem.userName}</td>
                                  <td className='text-right'>{currencifyInDollars(innerItem.amount ?? 0.00)}</td>
                                  <td className='text-right'>{currencifyInDollars(innerItem.currentValue ?? 0.00)}</td>
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
            setIsOpenData(data)
          }
        } else {
          setToasterData({
            show: true,
            type: "error",
            message: response?.message
          });
        }
      })
  }

  const getUpcomingInvestment = () => {
    callAPI.get(`./api/v1/investment/getInvestmentOpportunity?status=Upcoming&role=admin`)
      .then((response) => {
        if (response.status === 200) {
          // const notInterested = response?.data?.data && response?.data?.data.filter((item) => item.interestedYN === false)
          let data = response?.data?.data
          if (data && data.length > 0) {
            data = data.map(item => {
              return (
                {
                  id: item?.id,
                  name: item?.name,
                  companyName: item?.company?.name,
                  companyLogo: item?.company?.logo,
                  companyId: item?.company?.id,
                  investmentStatus: item?.investmentStatus,
                  numberofInvestors: item?.totalInvestors ?? 0,
                  totalFundRaised: item?.totalFundRaised ?? 0,
                  totalFundRaised: item?.totalFundRaised ?? 0,
                  startDate: item?.startDate,
                  endDate: item?.endDate,
                  minAmount: item.minAmount,
                  carry: item?.carry,
                  minAmount: item.minAmount,
                  carry: item?.carry,
                  perUnitPrice: item?.perUnitPrice,
                  templateId: item?.templateId,
                  description: item?.description,
                  description: item?.description,
                  documents: item?.document,
                  innerJSX: item?.investorData && item.investorData.length > 0 ? <tr>
                    <td colSpan={6} className='innerTable'>
                      <Table>
                        <thead>
                          <th className='name-in-table'>Investor Name</th>
                          <th className='amount-in-table text-right'>Invested Amount</th>
                          <th className='current-month-in-table text-right'>Current Amount</th>
                        </thead>
                        <tbody>
                          {
                            item.investorData.map(innerItem => {
                              return (
                                <tr>
                                  <td>{innerItem.userName}</td>
                                  <td className='text-right'>{currencifyInDollars(innerItem.amount ?? 0.00)}</td>
                                  <td className='text-right'>{currencifyInDollars(innerItem.currentValue ?? 0.00)}</td>
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
            setUpComingData(data)
          }

        } else {
          setToasterData({
            show: true,
            type: "error",
            message: response?.message
          });
        }
      })
  }

  const getCompletedInvestment = () => {
    callAPI.get(`./api/v1/investment/getInvestmentOpportunity?status=Closed&role=admin`)
      .then((response) => {
        if (response.status === 200) {
          let data = response?.data?.data
          if (data && data.length > 0) {
            data = data.map(item => {
              return (
                {
                  id: item?.id,
                  name: item?.name,
                  companyName: item?.company?.name,
                  companyLogo: item?.company?.logo,
                  companyId: item?.company?.id,
                  investmentStatus: item?.investmentStatus,
                  numberofInvestors: item?.totalInvestors ?? 0,
                  totalFundRaised: item?.totalFundRaised ?? 0,
                  startDate: item?.startDate,
                  endDate: item?.endDate,
                  minAmount: item.minAmount,
                  carry: item?.carry,
                  perUnitPrice: item?.perUnitPrice,
                  templateId: item?.templateId,
                  description: item?.description,
                  documents: item?.document,
                  innerJSX: item?.investorData && item.investorData.length > 0 ? <tr>
                    <td colSpan={5} className='innerTable'>
                      <Table>
                        <thead>
                          <th className='name-in-table'>Investor Name</th>
                          <th className='amount-in-table text-right'>Invested Amount</th>
                          <th className='current-month-in-table text-right'>Current Amount</th>
                        </thead>
                        <tbody>
                          {
                            item.investorData.map(innerItem => {
                              return (
                                <tr>
                                  <td>{innerItem.userName}</td>
                                  <td className='text-right'>{currencifyInDollars(innerItem.amount ?? 0.00)}</td>
                                  <td className='text-right'>{currencifyInDollars(innerItem.currentValue ?? 0.00)}</td>
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
            setCompletedData(data)
          }

        } else {
          setToasterData({
            show: true,
            type: "error",
            message: response?.message
          });
        }
      })
  }

  const fetchInvestmentData = () => {
    getInvestment();
    getUpcomingInvestment();
    getCompletedInvestment();
  };

  useEffect(() => {
    fetchInvestmentData();
    
  }, [deletemsg])

  return (
    <>

      <div className='default-tabs admin investment-opportunity-wrapper'>
        <TabContext value={tabActive}>
          <Box elevation='1'>
            <TabList
              className='tab-list'
              onChange={handleTabChange}
              textColor='primary'
              indicatorColor='primary'>
              <Tab label={<span>Open {isOpenData.length > 0 ? <span className='table-tab-count'>{isOpenData.length}</span> : ''} </span>}
                value='1' />
              <Tab label={<span>Upcoming {isUpComingData.length > 0 ? <span className='table-tab-count'>{isUpComingData.length}</span> : ''} </span>}
                value='2' />
              <Tab label={<span>Completed {iscompletedData.length > 0 ? <span className='table-tab-count'>{iscompletedData.length}</span> : ''} </span>}
                value='3' />
            </TabList>
          </Box>
          {/* OPEN */}
          <TabPanel value='1' className='p-0'>
            <AdminInvestments setDeletemsg={setDeletemsg} data={isOpenData} setData={setIsOpenData} fetchInvestmentData={() => fetchInvestmentData()} fetchCountData={props.fetchCountData}/>
          </TabPanel>
          <TabPanel value='2' className='p-0'>
            <AdminInvestments setDeletemsg={setDeletemsg} data={isUpComingData} setData={setUpComingData} fetchInvestmentData={() => fetchInvestmentData()} />
          </TabPanel> <TabPanel value='3' className='p-0'>
            <AdminInvestments  data={iscompletedData}setData={setCompletedData} tab='Completed' fetchInvestmentData={() => fetchInvestmentData()} />
          </TabPanel>
        </TabContext>
      </div>
    </>
  );
};

export default InvestmentOpportunityAdmin;
