import { AppBar, Avatar, Button, CircularProgress, Box, Drawer, IconButton, List, ListItem, Modal, TextField, Toolbar } from '@mui/material' //// Import necessary components
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import Logo from '../../assets/Logos/Logo.svg'
import './Header.scss'
import DropdownMenu from '../shared/components/DropdownMenu/DropdownMenu'
import imageURL from '../../assets/Logos/Logo.svg'
import ProfileIcon from '../../assets/Logos/ProfileIcon.svg'
import lockIcon from "../../assets/Icons/lockIcon.svg"
import OTPVerification from '../shared/components/OTPVerification/OTPVerification'
import callAPI from '../../commonFunctions/ApiRequests.js';
import Toaster from '../shared/components/Toaster/Toaster.js'
import Loader from '../shared/components/Loader/Loader.js'



import { useDispatch, useSelector } from 'react-redux';
import { openDrawer, closeDrawer } from '../../store/drawerSlice';
import AnchorDrawer from '../shared/components/OverlaySlider/AnchorDrawer'
import RightPanel from '../user/UserDashboard/RightPanel'

const Header = (props) => {


    const OTPForDocuments = localStorage.getItem('OTPForDocuments')
    const userData = JSON.parse(localStorage.getItem('userDetails'))
    const partnerDetails = useSelector(store => store.commonReducer?.partnerDetails)

    
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isOpenData, setIsOpenData] = useState([])
    const [surveyData, setSurveyData] = useState([]);


    const navigate = useNavigate()
    const location = useLocation()
    const [otpPopup, setOtpPopup] = useState(false)
    

    const [toasterData, setToasterData] = useState({
        show: false,
        type: "",
        message: "",
    });
    const [pageloader, setPageloader] = useState(false);
    const dispatch = useDispatch();


    const email = userData.email // Set the email for sending OTP


    const redirectToDashboard = (role) => {
        if (role === 'admin') {
            navigate('/adminDashboard')
        } else {
            navigate('/dashboard')
        }
    }

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen)
    }

    const isActive = (path) => {
        return location.pathname === path ? 'active' : ''
    }

    const OTPFunction = () => {

        if(OTPForDocuments)
            {
                navigate("/documents");
            }
            else{
                 sendOtp();
            }
      
    }

    const acceptAndEnter = (isValidOtp) => {
        if (isValidOtp) {
            setOtpPopup(false)
            navigate('/documents')
        }
    }

    const sendOtp =  () => {

        const req={"email": email,"userId": userData.id}
        setPageloader(true)
        callAPI.post('./api/v1/email/sendOtp', req)
        .then((response) => {
            if (response?.status === 200) {
                setPageloader(false)
                setToasterData({
                    show: true,
                    type: "success", //// Updated type to success
                    message: "OTP sent successfully", //// Updated message
                });
                setTimeout(()=>{
                    setOtpPopup(true)
                },1000)

            } else {
                setPageloader(false)
                setToasterData({
                    show: true,
                    type: "error",
                    message: response?.message,
                });
            }
        })
    }

    const handleToasterClose = () => {
        setToasterData({ ...toasterData, show: false });
    };


    const handleSurveyClick = () => {
        if (open) {
            dispatch(openDrawer());
        } else {
            dispatch(closeDrawer());
        }
    };

    const getOpenInvestment = () => {
        callAPI.get(`./api/v1/investment/getInvestmentOpportunity?status=Open&role=user`)
            .then((response) => {
                if (response.status === 200) {
                    // const notApplied = response?.data?.data && response?.data?.data.filter((item) => item.applied === false)
                    setIsOpenData(response?.data?.data)
                } else {
                    setToasterData({
                        show: true,
                        type: "error",
                        message: response?.message
                    });
                }
            })
    }

    useEffect(() => {
        getOpenInvestment();
    }, [])

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
        <AppBar position='static' elevation={0} sx={{ py: 0.5 }}>

            {toasterData && (
                <Toaster
                    className="DashboardToaster"
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    message={toasterData.message}
                    severity={toasterData.type}
                    show={toasterData.show}
                    handleClose={handleToasterClose}
                />
            )}

            <Loader show={pageloader}/>

            <OTPVerification
                open={otpPopup}
                message='Enter the OTP'
                agreeOnClick={acceptAndEnter}
                denyOnClick={() => { setOtpPopup(false) }}
                primaryAction='Confirm'
                secondaryAction='Cancel'
                email={email} // Pass the email
            />
            <div className='container'>

                <Toolbar className='toolbar-header'>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={toggleDrawer}
                        className='menu-toggler-mobile'
                    >
                        <MenuIcon />
                    </IconButton>
                    <img className='cursor-pointer header-logo' src={ partnerDetails?.logo ?? Logo} alt='logo' onClick={() => { redirectToDashboard(props.role) }} />
                    {props.role && props.role === 'admin' ? (
                        <List sx={{ display: 'flex', py: 0 }}>
                            <ListItem className={`pipeline hide-mobile ${isActive('/CreateCompany')}`}>
                                <Link to='/CreateCompany'>CREATE COMPANY</Link>
                            </ListItem>
                            <ListItem className={`pipeline hide-mobile ${isActive('/createInvestementOpportunity')}`}>
                                <Link to='/createInvestementOpportunity'>CREATE INVESTMENT OPPORTUNITY</Link>
                            </ListItem>
                            <ListItem className={`pipeline hide-mobile ${isActive('/fairMarketValue')}`}>
                                <Link to='/fairMarketValue'>FMV</Link>
                            </ListItem>
                            <ListItem className={`pipeline hide-mobile ${isActive('/userdocuments')}`}>
                                <Link to='/userdocuments'>DOCUMENTS</Link>
                            </ListItem>
                            <ListItem className={`pipeline hide-mobile ${isActive('/surveyDetailsAdmin')}`}>
                                <Link to='/surveyDetailsAdmin'>SURVEY</Link>
                            </ListItem>
                            <ListItem>
                                <DropdownMenu headerDropdown={true} padding="0" borderRadius='50%' toggler={<Avatar alt="Remy Sharp" src={ProfileIcon} />} />
                            </ListItem>
                        </List>
                    ) : (
                        <List sx={{ display: 'flex', py: 0 }} className='user-navbar'>
                            <ListItem className={`pipeline hide-mobile`} onClick={() => handleSurveyClick(true)}>
                                <a className='cursorPointer'>SUBMIT YOUR INTEREST</a>
                            </ListItem>

                            <ListItem className={`pipeline hide-mobile ${isActive('/InvestmentOpportunities')}`}>
                                <Link to={'/InvestmentOpportunities'}>INVESTMENT OPPORTUNITY</Link>
                            </ListItem>
                            <ListItem onClick={OTPFunction} className={`hide-mobile`}>
                                <a className='cursorPointer'>DOCUMENTS  <span>{!OTPForDocuments ? <img className='lockIcon' src={lockIcon} alt='lock' /> : ""}</span></a>
                            </ListItem>
                            <ListItem>
                                <DropdownMenu headerDropdown={true} padding="0" borderRadius='50%' toggler={<Avatar alt="Remy Sharp" src={ProfileIcon} />} />
                            </ListItem>
                        </List>
                    )}
                </Toolbar>
            </div>
            <Drawer
                anchor="left"
                open={isDrawerOpen}
                onClose={toggleDrawer}
                className='mobile-menu-toggler'
            >
                <div
                    onClick={toggleDrawer}
                    onKeyDown={toggleDrawer}
                >
                    {props.role && props.role === 'admin' ? (
                        <List sx={{ display: 'flex', py: 0 }}>
                            <div className='hamburger-close'>
                                <div className='closeBackground'>
                                    {isDrawerOpen ? <CloseIcon /> : <MenuIcon />}
                                </div>
                            </div>
                            <ListItem className={`pipeline ${isActive('/CreateCompany')}`}>
                                <Link to='/CreateCompany'>CREATE COMPANY</Link>
                            </ListItem>
                            <ListItem className={`pipeline ${isActive('/createInvestementOpportunity')}`}>
                                <Link to='/createInvestementOpportunity'>CREATE INVESTMENT OPPORTUNITY</Link>
                            </ListItem>
                            <ListItem className={`pipeline ${isActive('/fairMarketValue')}`}>
                                <Link to='/fairMarketValue'>FMV</Link>
                            </ListItem>
                            <ListItem className={`pipeline ${isActive('/userdocuments')}`}>
                                <Link to='/userdocuments'>DOCUMENTS</Link>
                            </ListItem>
                            <ListItem className={`pipeline ${isActive('/surveyDetailsAdmin')}`}>
                                <Link to='/surveyDetailsAdmin'>SURVEY</Link>
                            </ListItem>
                        </List>
                    ) : (
                        <List sx={{ display: 'flex', py: 0 }} className='user-navbar'>
                            <div className='hamburger-close'>
                                <div className='closeBackground'>
                                    {isDrawerOpen ? <CloseIcon /> : <MenuIcon />}
                                </div>
                            </div>
                            <ListItem className={`pipeline`} onClick={() => handleSurveyClick(true)}>
                                <a className='cursorPointer'>SUBMIT YOUR INTEREST</a>
                            </ListItem>
                            <ListItem className={`pipeline ${isActive('/InvestmentOpportunities')}`}>
                                <Link to={'/InvestmentOpportunities'}>INVESTMENT OPPORTUNITY</Link>
                            </ListItem>
                            <ListItem onClick={OTPFunction} className={`${isActive('/documents')}`}>
                                <a className='cursorPointer'>DOCUMENTS  <span>{!OTPForDocuments ? <img className='lockIcon' src={lockIcon} alt='lock' /> : ""}</span></a>
                            </ListItem>
                        </List>
                    )}
                </div>
            </Drawer>

            <div className='header-anchor-drawer'>
                <div className={`header-comp header-side-nav ${location.pathname === '/dashboard' ? "" : "invisible"}`}>
                    <AnchorDrawer
                        title='SURVEY'
                        openInvCount={isOpenData.length}
                        surveyCount={surveyData.length}>
                        <RightPanel
                            surveyData={surveyData} />
                    </AnchorDrawer>
                </div>
            </div>
        </AppBar>
    )
}

export default Header
