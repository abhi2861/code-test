import React, { useMemo, useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Box,
  Typography,
  LinearProgress,
  Grid,
  Snackbar,
  Table,
  Tooltip
} from "@mui/material";

import Header from "../Header/Header";
import "./Dashboard.scss";
// Company LOGOS
import callAPI from "../../commonFunctions/ApiRequests";
import Loader from "../shared/components/Loader/Loader";
import Toaster from "../shared/components/Toaster/Toaster";
import { ReactTable } from "../shared/components/ReactTable/ReactTable";
// import { useNavigate } from 'react-router-dom';
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import RightPanel from "./UserDashboard/RightPanel";
import { convertToBaseFormatDate, currencifyInDollars } from "../../commonFunctions/CommonMethod";
import AnchorDrawer from "../shared/components/OverlaySlider/AnchorDrawer";
import { KeyboardArrowDown, KeyboardArrowRight, KeyboardArrowUp } from "@material-ui/icons";
import Footer from "../Footer/Footer";
// import UploadKycModel from "../shared/components/Upload KYC/UploadKycModel";

const Dashhboard = () => {

  const userData = JSON.parse(localStorage.getItem('userDetails'))



  // -------------Material Table---------------
  const [investmentsData, setInvestmentsData] = useState([]);
  const [totalInvestmentAmount, setTotalInvestmentAmount] = useState('');
  const [totalCurrentAmount, setTotalCurrentAmount] = useState('');
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opportunity, setOpportunity] = useState(false);
  const [progressInvestment, setProgressInvestment] = useState()

  const [innerTableVisibility, setInnerTableVisibility] = useState({});

  const [surveyData, setSurveyData] = useState([]);

  const [isOpenData, setIsOpenData] = useState([])
 
  const toggleInnerTable = (index) => {
    setInnerTableVisibility(prevState => ({
      ...prevState,
      [index]: !prevState[index]
    }));
  }

  const navigate = useNavigate()
  const [toasterData, setToasterData] = useState({
    show: false,
    type: "",
    message: "",
  });



  //for Investments table
  const getinvestments = () => {
    setLoading(true)
    callAPI.get(`./api/v1/investment/getUserInvestment?status=Closed`)
      .then(response => {
        if (response?.status === 200) {

          if (response?.data?.data?.investments && response?.data?.data?.investments.length > 0) {
            let data = response?.data?.data?.investments.map(item => {
              return (
                {
                  "id": item?.id,
                  "name": item?.name,
                  "logo": item?.logo,
                  "fmvValue": item?.fmvValue,
                  "fmvVEffectiveDate": item?.fmvVEffectiveDate,
                  "fmvVExpirationDate": item?.fmvVExpirationDate,
                  "fmvlastFairMarketValue": item?.fmvlastFairMarketValue,
                  "userInvestments": item?.userInvestments,
                  "totalCurrentValue": item?.totalCurrentValue,
                  "totalInvested": item?.totalInvested,
                  "innerJSX": item?.userInvestments && item.userInvestments.length > 0 ? <tr>
                    <td colSpan={6} className='innerTable'>
                      <Table className="user-applications-inner-table">
                        <thead>
                          <th className="investment-in-table">Investment Name</th>
                          <th className="amount-in-table">Invested Amount</th>
                          <th className="current-amt-in-table">Current Amount</th>
                          <th className="requested-data-in-table">Requested Date</th>
                        </thead>
                        <tbody>
                          {
                            item?.userInvestments?.map(innerItem => {
                              return (
                                <tr>
                                  <td>{innerItem?.InvestmentOpportunity?.name}</td>
                                  <td>{currencifyInDollars(innerItem?.amount ?? 0.00)}</td>
                                  <td>{currencifyInDollars(innerItem?.currentValue ?? 0.00)}</td>
                                  <td>{convertToBaseFormatDate(innerItem?.requestedDate, false, true, 'MMMM', false)}</td>
                                </tr>
                              )
                            })
                          }

                        </tbody>
                      </Table>
                    </td>
                  </tr> : null,
                }
              )
            })
            setInvestmentsData(data)
          }

          // setInvestmentsData(response?.data?.data?.investments)
          setTotalInvestmentAmount(response?.data?.data?.totalInvested)
          setTotalCurrentAmount(response?.data?.data?.totalCurrentValue)
          setLoading(false)
        } else {
          setToasterData({
            show: true,
            type: "error",
            message: response?.message,
          });
          setLoading(false)
        }
      })
  }

  const getOpenInvestment = () => {
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


  //for investment progress 

  const investmentProgress = () => {
    callAPI.get('./api/v1/investment/getAllUserInvestment')
      .then((response) => {
        if (response.status === 200) {
          const notClosedData = response?.data?.data?.filter((item) => item.status !== "Rejected" && item.status !== "Closed" && item.status !== "Initiate Refund" && item.status !== "Refund Received")
          setProgressInvestment(notClosedData)
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
    getinvestments();
    investmentProgress();
    getOpenInvestment();
  }, [])

  useEffect(() => {
    setColumns([
      {
        Header: 'Company',
        accessor: row => row?.name,
        className: 'company-name-in-table',
        Cell: localProps =>
          <div className='d-flex align-items-center company-info-in-table'>
            <div className='company-logo-in-table'>
              <img src={localProps.row.original?.logo} />
            </div>
            <b>{localProps.row.original?.name}</b>
          </div>
      },
      {
        Header: 'Total Invested Amount',
        accessor: row => row?.totalInvested,
        className: 'company-name-in-table',
        Cell: localProps =>
          <div className='d-flex align-items-center company-info-in-table'>
            <p>
              {currencifyInDollars(localProps.row.original?.totalInvested ?? 0)}
            </p>
          </div>
      },
      {
        Header: 'Total Current Amount',
        accessor: row => row?.totalCurrentValue,
        className: 'company-name-in-table',
        Cell: localProps =>
          <div className='d-flex align-items-center company-info-in-table'>
            <p>
              {currencifyInDollars(localProps.row.original?.totalCurrentValue ?? 0)}
            </p>
          </div>
      }
    ])
  }, [investmentsData])

  useEffect(() => {
    setOpportunity(false);
  }, []);

  //toaster function
  const handleToasterClose = () => {
    setToasterData({ ...toasterData, show: false });
  };

  const handlenavigate = () => {
    navigate('/InvestmentOpportunities')
  }

  const handleUploadAgree = () => {
    setUploadPromptVisible(false); // Close the popup
    setShowUploadField(true); // Show the document upload field
};
  function getProgressBarValue(status) {
    switch (status) {
      case 'Applied':
        return 11.11;
      case 'Approved':
        return 22.22;
      case 'Doc Sent to Investor':
        return 33.33;
      case 'Doc Signed By Investor':
        return 44.44;
      case 'Funds Transfer Initiated':
        return 55.55;
      case 'Funds Received':
        return 66.66;
      case 'Investment Completed':
        return 77.77;
      case 'Doc Signed By Zen Invest':
        return 88.88;
      case 'Closed':
        return 100;
      default:
        return 0;
    }
  }


  //get dynamic color based on status

  const getColor = (status) => {
    switch (status) {
      case "Applied":
        return "#A67905";
      case "Approved":
        return "#A67905";
      case "Doc Sent to Investor":
        return "#A67905";
      case "Doc Signed By Investor":
        return "#001061";
      case "Initiate Payment":
        return "#001061";
      case "Funds Received":
        return "#001061";
      case "Investment Completed":
        return "#69A26E";
      case "Doc Signed By Zen Invest":
        return "#69A26E";
      case "Closed":
        return "#69A26E";

      default:
        return "black";
    }
  };


  const getSurvey = () => {
    callAPI
      .get(`./api/v1/survey/getInterestSurvey`)
      .then((response) => {
        if (response.status === 200) {
          setSurveyData(response?.data?.data);
        } else {
          setToasterData({
            show: true,
            type: "error",
            message: response?.message,
          });
        }
      });
  };

  useEffect(() => {
    getSurvey();
  }, []);


  return (
    <div className="user-dashboard-wrapper d-flex flex-column">
      {toasterData && (
        <Toaster
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          message={toasterData.message}
          severity={toasterData.type}
          show={toasterData.show}
          handleClose={handleToasterClose}
        />
      )}
      <Snackbar
        open={true}
        autoHideDuration={6000}
        message={<marquee>There are new investment oppurtunities open for you! Click here</marquee>}
        elevation={0}
        onClick={() => { handlenavigate() }}
        className="alert-snack-bar"
      />
      <Header />
      <div className="d-flex flex-grow-1">
        <div className="container user-dashboard-container flex-grow-1 padding-right-0">
          <div className="user-dashboard-content">
            <div className="left-panel">
              <div className="heading-section d-flex justify-content-between align-items-center">
                <h3 className="welcome-text">Welcome {userData.firstName} {userData.lastName.charAt(0)}</h3>
              </div>
              <div className="user-heading-section d-flex justify-content-between align-items-center">
                {/* <div className="user-profile">{userData?.firstName.charAt(0)} {userData?.lastName.charAt(0)}</div> */}
                <div className="counts-wrapper">
                  <div className="d-flsex align-items-center user-profile">
                    <p className="infoWidgetValue">Total Invested Amount</p>
                    <b className="infoWidgetLabel text-right">{currencifyInDollars(totalInvestmentAmount ?? 0)}</b>
                  </div>
                  <div className="d-flsex align-items-center user-profile">
                    <p className={`infoWidgetValue `}>Current value</p>
                    <b className={`infoWidgetLabel ${Number(totalCurrentAmount) > Number(totalInvestmentAmount) ? 'complete-status' : Number(totalCurrentAmount) === Number(totalInvestmentAmount) ? '' : 'risk-status'}`}>{currencifyInDollars(totalCurrentAmount ?? 0)}</b>
                  </div>
                </div>
              </div>
              <Loader show={loading} />
              {/* <div className='company-details-wrapper'>
              <ReactTable
                columns={columns}
                data={investmentsData}
                // title='Applications'
                expandable={true}
              />
            </div> */}
              <div className="heading-section my-investments">
                <h4>My Investments</h4>
              </div>
              <div>
                {investmentsData.length > 0 ?
                  investmentsData.map((data) => {
                    return <div className="user-inv-cards default-box-shadow-1">

                      <div className="user-dashboard-inv-header">

                        <div className='header d-flex align-items-center company-info-in-table'>
                          <div className="d-flex align-items-center investment-in-table">
                            <div className="toggle-arrow" onClick={() => toggleInnerTable(data.id)}>
                              {innerTableVisibility[data.id] ? <KeyboardArrowUp /> : <KeyboardArrowRight />}
                            </div>
                            <div className='company-logo-in-table'>
                              <img src={data?.logo} />
                            </div>
                            <b className="company-name">{data?.name}</b>
                          </div>
                          <p className="total-inv-amt amount-in-table current-amt-in-table">
                            <p className="user-amt-label">Invested Amount</p><br /> <b>{currencifyInDollars(data?.totalInvested ?? 0)}</b>
                          </p>
                          <p className="total-current-amt current-amt-in-table">
                            <p className="user-amt-label">Current Amount</p><br /> <b>{currencifyInDollars(data?.totalCurrentValue ?? 0)}</b>
                          </p>
                        </div>
                        {innerTableVisibility[data.id] && <div className='defaut-table innerTable'>
                          <div className="user-applications-inner-table">
                            <div className="inner-table-header d-flex align-items-center border-bottom-Darker">
                              <div className="investment-in-table">Investment Opportunity</div>
                              <div className="amount-in-table">Invested Amount</div>
                              <div className="current-amt-in-table">Current Amount</div>
                            </div>
                            <div>
                              {
                                data?.userInvestments?.map(innerItem => {
                                  return (
                                    <div className="inner-table-content d-flex align-items-center border-bottom-Darker">
                                      <div className="investment-in-table">{innerItem?.InvestmentOpportunity?.name}</div>
                                      <div className="amount-in-table">{currencifyInDollars(innerItem?.amount ?? 0.00)}</div>
                                      <div className="current-amt-in-table">{currencifyInDollars(innerItem?.currentValue ?? 0.00)}</div>
                                    </div>
                                  )
                                })
                              }

                            </div>
                          </div>
                        </div>}
                      </div>

                    </div>
                  }) : <div className="welcome-message">
                    <div className="welcome-msg-body">
                      <p>Welcome aboard! We're thrilled to have you here. Investing is more than just numbers – it's about crafting a future you're proud of. We're committed to providing you with the support and resources you need to navigate this journey with confidence. Take a moment to explore the <Link className="link-opportunity" to={'/InvestmentOpportunities'}>Investment Opportunities</Link> waiting for you . We're here to help you every step of the way.</p>
                    </div>
                  </div>
                }
              </div>

              <Box height={18}></Box>
              <div className="rounded-borders-card investment-status-wrap">
                <div className="padding-15 border-bottom-D9D9D9">
                  <h4>Investment Progress</h4>
                </div>
                <div>
                  {
                    progressInvestment && progressInvestment?.length > 0 ?

                      <div className="padding-15 investment-status-records">
                        {
                          progressInvestment?.map((investment) =>

                            <div className="investment-progress-details">

                              <Grid container className="mb-15px investment-progress-details-subcontaint justify-content-between">
                                <Grid item lg={5.5} className="flex-basis investment-progress-values">
                                  <div className="company-logo">
                                    <span className="logo">
                                      <img src={investment?.investmentOpportunity?.company?.logo} alt="logo" />
                                    </span>
                                    <div>
                                      <b className="company-name">{investment?.investmentOpportunity?.company?.name}</b>
                                      {/* <p className="d-block">May 15 - August 10, 2024</p> */}
                                    </div>
                                  </div>
                                </Grid>
                                <Grid item lg={5} className="flex-basis investment-progress-values">
                                  <b className="d-block">Investment Name</b>
                                  <p className="company-name investment-name-progress">{investment?.investmentOpportunity?.name}</p>
                                </Grid>
                                <Grid lg={1.5} item className="flex-basis investment-progress-values">
                                  <b className="d-block">Invested Amount</b>
                                  <p className="company-name">{currencifyInDollars(investment?.amount ?? 0)}</p>
                                </Grid>
                              </Grid>

                              <div className="progess-bar-wrapper">
                                <LinearProgress variant="determinate" value={getProgressBarValue(investment?.status)} />
                                {/* <div className="progress-bar-segments">
                                  {
                                    investment?.statusHistories && investment?.statusHistories.length > 0 ? investment?.statusHistories?.map((investupdate) =>
                                      <span style={{ backgroundColor: getColor(investupdate?.status) }}></span>
                                    ) : ""
                                  }
                                </div> */}
                                <div className="progress-bar-segments">
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                </div>
                              </div>
                              <div className="progress-status-label">
                                {
                                  investment?.statusHistories && investment?.statusHistories.length > 0 ? investment?.statusHistories?.map((investupdate) =>
                                    <span className="beginning-status">{investupdate?.status}<br />
                                      <span>{convertToBaseFormatDate(investupdate?.date, false, true, 'MMMM', true) ? convertToBaseFormatDate(investupdate?.date, false, true, 'MMMM', true) : "-"}</span>
                                    </span>
                                  ) : ""


                                }
                              </div>

                            </div>
                          )
                        }
                      </div>
                      : <div className="padding-15 no-records progress-bar-segments text-center"><p>No Progress Status</p> </div>
                  }
                </div>
              </div>

            </div>

          </div>
        </div>
        <div className='header-side-nav invisible'>
          <AnchorDrawer 
            title='SURVEY' 
            openInvCount={isOpenData.length} 
            surveyCount={surveyData.length}>
            <RightPanel 
            surveyData={surveyData} />
          </AnchorDrawer>
        </div>
        {/* <UploadKycModel
                open={!userData?.kycApproved }
                onClose={userData?.kycApproved }
            /> */}
      </div>
      <Footer />
    </div>
  )
};

export default Dashhboard;
