import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './components/shared/common/common.scss'
import './app.scss';
import UserDashboard from './components/user/Dashboard';
import { Suspense } from 'react';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import "react-datepicker/dist/react-datepicker.css"
import AdminDashboard from './components/admin/Dashboard';
import { useNavigate, useLocation } from "react-router-dom";
import CreateCompany from './components/admin/CreateCompany/CreateCompany';
import Social from './components/Auth/social';
import CreateNewBulletin from './components/admin/CreateNewBulletin/CreateNewBulletin';
import CompanyDetailsUser from './components/user/CompanyDetailsUser/CompanyDetailsUser';
import InvestmentOpportunities from './components/user/InvestmentOpportunities/InvestmentOpportunities';
import FairMarketValue from './components/admin/FareMarketValue/FairMarketValue';
import CreateInvestmentOpportunityNew from './components/admin/CreateInvestmentOpportunity/CreateInvestementOpportunityNew';
import UserDocuments from './components/admin/Documents/UserDocuments';
import Documents from './components/user/Documents/Documents';
import SurveyDetailsAdmin from './components/admin/SuveyDetails/SurveyDetailsAdmin';
import PageNotFound from './components/PageNotFound/PageNotFound';
import ResetPassword from './components/Auth/ResetPassword';
import LandingPage from './components/user/LandingPage/LandingPage';
import CreateApplicationPage from '../src/components/createapplications/CreateApplicationPage';
import { useSelector, useDispatch } from 'react-redux';
import 'swiper/swiper-bundle.css';
import ForgotPassword from './components/Auth/ForgotPassword';
import { setPartnerDetails, setHideTeam } from './store/commonReducer';
import callAPI from './commonFunctions/ApiRequests';
import LogoPng from './assets/Logos/vibhuLogoPng.png';
import { Create } from '@mui/icons-material';

const App = () => {
	// const successOTP = useSelector((state)=>state.OTP.isSuccess)
    const OTPForDocuments = localStorage.getItem('OTPForDocuments')
	// console.log(localOtp,'yy')

	const location = useLocation();
	const navigate = useNavigate()
	const storedRole = localStorage.getItem('role');
	const { search } = useLocation();
	const dispatch = useDispatch()

	const [isAuthenticated, setIsAuthenticated] = useState(false);

	let localPartnerDetails = localStorage.getItem('partnerDetails')

	useEffect(()=>{
		if(localPartnerDetails && Object.keys(JSON.parse(localPartnerDetails))?.length){
			dispatch(setPartnerDetails(JSON.parse(localPartnerDetails)))
		    let faviconElement = document.querySelector("link[rel~='icon']");
		    if(!faviconElement) {
		    	faviconElement = document.createElement('link');
		    	faviconElement.rel = 'icon';
		    	faviconElement.href = JSON.parse(localPartnerDetails).favIcon;
		    	document.head.appendChild(faviconElement);
		    }
		    faviconElement.href = JSON.parse(localPartnerDetails).favIcon;
		    if (JSON.parse(localPartnerDetails).companyName){
			    document.title = JSON.parse(localPartnerDetails).companyName
		    }
	    }
	},[JSON.parse(localPartnerDetails)?.companyName])

	useEffect(()=>{
		callAPI.get(`./api/v1/dashboard/getTeam`).then(response =>{
		    if(response.data?.status ==  200){
				if(response.data?.data.length){
					dispatch( setHideTeam(false) );
				} else {
					dispatch( setHideTeam(true) );
				}
		    } else {
				dispatch(setHideTeam(true));
			}
		})
	 },[])

	useEffect(()=>{
		if(localPartnerDetails == null){
        callAPI.get('./api/v1/auth/getPartnerDetails')
          .then(response => {
              if(response.status == 200){
				  localStorage.setItem('partnerDetails', JSON.stringify(response.data?.data))
                  dispatch(setPartnerDetails(response.data?.data))

                  const newFavicon = response.data?.data?.favIcon ?? LogoPng;
				  const newTitle = response.data?.data?.companyName ?? 'Vibhu Venture Partners'
                  let faviconElement = document.querySelector("link[rel~='icon']");
                  if(!faviconElement) {
                      faviconElement = document.createElement('link');
                      faviconElement.rel = 'icon';
                      faviconElement.href = newFavicon;
                      document.head.appendChild(faviconElement);
                  }
				  faviconElement.href = newFavicon;
				  document.title = newTitle
              }
          })    
		}  
    },[])

	useEffect(() => {
        localStorage.setItem('mainPath', location.pathname);
    }, []);

	useEffect(() => {

		const storedAuth = localStorage.getItem('isAuthenticated');
		const storedToken = localStorage.getItem('token');
		
		const storedMainPath = localStorage.getItem('mainPath');	

		if (storedToken && storedRole && storedAuth) {
			setIsAuthenticated(true);
			if (storedMainPath) {
                navigate(storedMainPath); 
            }
		}

	}, []);

	useEffect(() => {

		if (location?.state?.isLogout) {
			setIsAuthenticated(location?.state?.isAuthenticated);
		}
	}, [location?.state?.isLogout]);

	useEffect(() => {
		const urlSearchParams = new URLSearchParams(search);
		const Token = urlSearchParams.get("token");
		const userDetails = urlSearchParams.get("userDetails");
		// localStorage.setItem("token", Token);
		// localStorage.setItem("userDetails", userDetails);

		if (Token || storedRole) {
			setIsAuthenticated(true);
		}
	}, [search]);




	return (
		<Routes>
			<Route path="/" element={isAuthenticated ? (storedRole?.toLocaleLowerCase() === "investor" ? <Navigate to='/dashboard' /> : <Navigate to='/admindashboard' />) : <LandingPage />} />
			<Route path="/login" element={<Login setIsAuthenticated={(value) => setIsAuthenticated(value)} />} />
			<Route path="/signup" element={<Signup setIsAuthenticated={(value) => setIsAuthenticated(value)} />} />
			<Route path="/social" element={<Social />} />
			<Route path="/changepassword" element={<ResetPassword />} />
			<Route path="/forgotPassword" element={<ForgotPassword />} />
			<Route path="/createApplication" element={<CreateApplicationPage />}/>
			<Route path="/adminDashboard" element={isAuthenticated ? <Suspense fallback=''><AdminDashboard /></Suspense> : <Navigate to="/" />} />
			<Route path="/dashboard" element={isAuthenticated ? <Suspense fallback=''><UserDashboard setIsAuthenticated={(value) => setIsAuthenticated(value)} /></Suspense> : <Navigate to="/" />} />
			<Route path="/CreateCompany" element={isAuthenticated ? <Suspense fallback=''><CreateCompany setIsAuthenticated={(value) => setIsAuthenticated(value)} /></Suspense> : <Navigate to="/" />} />
			<Route path="/CreateNewBulletin" element={isAuthenticated ? <Suspense fallback=''><CreateNewBulletin setIsAuthenticated={(value) => setIsAuthenticated(value)} /></Suspense> : <Navigate to="/" />} />
			<Route path="/companyDetailsUser" element={isAuthenticated ? <Suspense fallback=''><CompanyDetailsUser setIsAuthenticated={(value) => setIsAuthenticated(value)} /></Suspense> : <Navigate to="/" />} />
			<Route path="/InvestmentOpportunities" element={isAuthenticated ? <Suspense fallback=''><InvestmentOpportunities setIsAuthenticated={(value) => setIsAuthenticated(value)} /></Suspense> : <Navigate to="/" />} />
			<Route path="/fairMarketValue" element={isAuthenticated ? <Suspense fallback=''><FairMarketValue setIsAuthenticated={(value) => setIsAuthenticated(value)} /></Suspense> : <Navigate to="/" />} />
			<Route path="/createInvestementOpportunity" element={isAuthenticated ? <Suspense fallback=''><CreateInvestmentOpportunityNew setIsAuthenticated={(value) => setIsAuthenticated(value)} /></Suspense> : <Navigate to="/" />} />
			<Route path="/userdocuments" element={isAuthenticated ? <Suspense fallback=''><UserDocuments setIsAuthenticated={(value) => setIsAuthenticated(value)} /></Suspense> : <Navigate to="/" />} />
			<Route path={OTPForDocuments ? "/documents" : "/nopagefound"} element={isAuthenticated ? <Suspense fallback=''><Documents setIsAuthenticated={(value) => setIsAuthenticated(value)} /></Suspense> : <Navigate to="/" />} />
			<Route path="/surveyDetailsAdmin" element={isAuthenticated ? <Suspense fallback=''><SurveyDetailsAdmin setIsAuthenticated={(value) => setIsAuthenticated(value)} /></Suspense> : <Navigate to="/" />} />
			<Route path="/LandingPage" element={<LandingPage />} />
			<Route path="*" element={<PageNotFound />} />
		</Routes>
	);
}

export default App;