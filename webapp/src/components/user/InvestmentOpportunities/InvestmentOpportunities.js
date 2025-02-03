import { Box, Tab } from '@mui/material'
import React, { useState, useEffect } from 'react'
import Header from '../../Header/Header'
import './InvestmentOpportunities.scss'
import callAPI from '../../../commonFunctions/ApiRequests'
import Toaster from '../../shared/components/Toaster/Toaster'
import Loader from '../../shared/components/Loader/Loader'
import { TabContext, TabList, TabPanel } from '@mui/lab';
import InvestmentDetails from '../InvestmentDetails/InvestmentDetails'
import Footer from '../../Footer/Footer'
import CompanyCommunitySentiment from '../CompanyDetailsUser/CompanyCommunitySentiment'


const InvestmentOpportunities = () => {
    const [tabActive, setTabActive] = useState('1');
    const [isOpenData, setIsOpenData] = useState([])
    const [isUpComingData, setUpComingData] = useState([])
    const [isClosedData, setClosedData] = useState([])
    const [loading, setLoading] = useState(false)
    const [toasterData, setToasterData] = useState({
        show: false,
        type: "",
        message: "",
    });

    const getInvestment = () => {
        // setLoading(true)
        callAPI.get(`./api/v1/investment/getInvestmentOpportunity?status=Open&role=user`)
            .then((response) => {
                if (response.status === 200) {
                    // const notApplied = response?.data?.data && response?.data?.data.filter((item) => item.applied === false)
                    setIsOpenData(response?.data?.data)
                    // setLoading(false)
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
        callAPI.get(`./api/v1/investment/getInvestmentOpportunity?status=Upcoming&role=user`)
            .then((response) => {
                if (response.status === 200) {
                    // const notInterested = response?.data?.data && response?.data?.data.filter((item) => item.interestedYN === false)
                    setUpComingData(response?.data?.data)
                } else {
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response?.message
                    });
                }
            })
    }
    const getClosedInvestment = () => {
        callAPI.get(`./api/v1/investment/getInvestmentOpportunity?status=Closed&role=user`)
            .then((response) => {
                if (response.status === 200) {
                    // const notContacted = response?.data?.data && response?.data?.data.filter((item) => item.contactedYN === false)
                    setClosedData(response?.data?.data)
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
        getClosedInvestment();
    };

    useEffect(() => {
        fetchInvestmentData()
    }, [])

    const handleTabChange = (event, newValue) => {
        setTabActive(newValue)
    }

    //toaster function
    const handleToasterClose = () => {
        setToasterData({ ...toasterData, show: false });
    };
    return (
        <div className='pageWrapperFix'>
            {/* <CompanyCommunitySentiment/> */}
            {toasterData && (
                <Toaster
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    message={toasterData.message}
                    severity={toasterData.type}
                    show={toasterData.show}
                    handleClose={handleToasterClose}
                />
            )}
            <Header />
            <Loader show={loading} />
            <div className="container flex-grow-1">

                <div>
                    <div className="heading-section d-flex justify-content-between">
                        <h4>Investment Opportunities</h4>
                    </div>
                </div>

                <div className='default-tabs'>
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
                                <Tab label={<span>Closed {isClosedData.length > 0 ? <span className='table-tab-count'>{isClosedData.length}</span> : ''} </span>}
                                    value='3' />
                            </TabList>
                        </Box>
                        {/* OPEN */}
                        <TabPanel value='1' className='p-0'>
                            {/* <InvestmentDetails data={isOpenData} /> */}
                            <InvestmentDetails data={isOpenData} fetchInvestmentData={fetchInvestmentData} />
                        </TabPanel>
                        {/* UPCOMING */}
                        <TabPanel value='2' className='p-0'>
                            <InvestmentDetails data={isUpComingData} fetchInvestmentData={fetchInvestmentData} />
                        </TabPanel>
                        {/* CLOSED */}
                        <TabPanel value='3' className='p-0'>
                            <InvestmentDetails data={isClosedData} fetchInvestmentData={fetchInvestmentData} />
                        </TabPanel>
                    </TabContext>
                </div>

            </div>
            <Footer />

        </div>
    )
}

export default InvestmentOpportunities