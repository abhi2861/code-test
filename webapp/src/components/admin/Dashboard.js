import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import { Button, Box, Typography, Stack, Card, CardContent, Tabs, Tab, IconButton, TextField, TablePagination, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Grid } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TotalInvestedIcon from '../../assets/InfoWidgets/total-invested.svg'
import Header from '../Header/Header';
import CompanyDetails from './Company/CompanyDetails';
import ActiveApplications from './ActiveApplications/ActiveApplications';
import ActiveApplication from '../../assets/InfoWidgets/active-apps-icon.svg'
import Companies from '../../assets/InfoWidgets/companies-icon.svg'
import FundsRaisedIcon from '../../assets/InfoWidgets/funds-raised-icon.svg'
import Users from '../../assets/InfoWidgets/users-icon.svg'
import { KeyboardArrowDown, KeyboardArrowUp, FilterList } from '@material-ui/icons';
import User from './AdminDashboardTabs/User';
import CommonFunctions from '../CommonFunctions/CommonFunctions';
import './AdminDashboard.scss'
import callAPI from '../../commonFunctions/ApiRequests';
import { useLocation, useNavigate } from 'react-router-dom';
import InvestmentOpportunityAdmin from './InvestmentOpportunityAdmin/InvestmentOpportunityAdmin';
import ActiveApplicationTabs from './ActiveApplications/ActiveApplicationTabs';
import Footer from '../Footer/Footer';
import UserTabs from './AdminDashboardTabs/UserTabs';



const Dashboard = () => {

	const location = useLocation()
	const locationName = location && location?.state ? location?.state : '';
	const navigate = useNavigate()
	const adminRole = localStorage.getItem('role')

	const [tabActive, setTabActive] = useState('1');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [countData, setCountData] = useState({
		activeApplications: 0,
		companies: 0,
		fundsRaised: 0,
		users: 0
	})

	const [filterText, setFilterText] = useState('');
	const [showColumnFilters, setShowColumnFilters] = useState(false);

	useEffect(() => {
		fetchCountData();
	}, []);

	useEffect(() => {
		if (locationName && locationName?.tabValue) {
			setTabActive(locationName?.tabValue)
		}
	}, [])

	const fetchCountData = async () => {

		callAPI.get(`./api/v1/user/getCounts`)
			.then(response => {
				if (response?.status === 200) {
					setCountData(response?.data?.data);
				} else {
					setToasterData({
						show: true,
						type: "error",
						message: response?.message,
					});
				}
			})
	};
	const handleFilterTextChange = event => {
		setFilterText(event.target.value);
	};
	const toggleColumnFilters = () => {
		setShowColumnFilters(!showColumnFilters);
	};
	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};
	const handleChangeRowsPerPage = event => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};

	const dispatch = useDispatch();
	const role = useSelector((state) => state.auth.role);


	const handleLogout = () => {
		dispatch(logout());
	};

	const handleTabChange = (event, newValue) => {
		setTabActive(newValue)
	}

	const columns = [
		{ id: 'company', label: 'Company', minWidth: 100 },
		{ id: 'investedAmount', label: 'Invested Amount', minWidth: 100 },
		{ id: 'carry', label: 'Carry', minWidth: 100 },
		{ id: 'fairMarketValue', label: 'Fair Market Value', minWidth: 100 },
		{ id: 'effectiveDate', label: 'Effective Date', minWidth: 100 },
	];

	const data = [
		{
			id: 1, company: 'Amazon', investedAmount: '$106.89', carry: '$6.24', fairMarketValue: '$227.69', effectiveDate: 'June 18, 2024',
			subRows: [
				{ investedAmount: '$106.89', carry: '$6.24', fairMarketValue: '$227.69', effectiveDate: 'June 18, 2024' },
				{ investedAmount: '$106.89', carry: '$6.24', fairMarketValue: '$227.69', effectiveDate: 'June 18, 2024' },
				{ investedAmount: '$106.89', carry: '$6.24', fairMarketValue: '$227.69', effectiveDate: 'June 18, 2024' },
				{ investedAmount: '$106.89', carry: '$6.24', fairMarketValue: '$227.69', effectiveDate: 'June 18, 2024' }
			]
		}
		// Add more data objects as needed...
	];

	const filteredData = data.filter(row =>
		columns.some(column =>
			String(row[column.id]).toLowerCase().includes(filterText.toLowerCase())
		)
	);


	return (
		<div className='pageWrapperFix'>
			<Header role='admin' />
			<div className='container admin-dashboard-wrapper flex-grow-1'>

				{/* <Grid container> */}

				{/* <Grid item lg={9} className='pr-15px'> */}
				<Box className='heading-section'>
					<h4>Admin Dashboard</h4>
				</Box>
				<div className='info-widget-tabs table-with-info-scroller'>
					<TabContext value={tabActive}>
						<Box elevation='1' className='admin-top-widget'>
							<TabList
								onChange={handleTabChange}
								textColor='primary'
								indicatorColor='primary'>

								<Tab 
									label={
									<div className="text-center">
										<div className='d-flex align-items-center justify-content-center'>
											<img src={ActiveApplication} alt='total-icon' />
											<Typography className='infoWidgetLabel' variant="infoWidgetLabel" component="p">
												Active Applications
											</Typography>
										</div>
										<div>
											<Typography className='infoWidgetValue' variant="infoWidgetValue" gutterBottom component="p">
												{countData?.activeApplications ?? 0}
											</Typography>

										</div>
									</div>
								}
									className='info-widget-cards'
									value='1' />
								<Tab label={
									<div className="text-center">
										<div className="d-flex align-items-center">
											<img src={Companies} alt='total-icon' />
											<Typography className='infoWidgetLabel' variant="infoWidgetLabel" component="p">
												Companies
											</Typography>
										</div>
										<div>
											<Typography className='infoWidgetValue' variant="infoWidgetValue" gutterBottom component="p">
												{countData?.companies ?? 0}
											</Typography>
										</div>
									</div>
								}
									className='info-widget-cards'
									value='2' />
								<Tab label={
									<div className="text-center">
										<div className='d-flex align-items-center'>
											<img src={FundsRaisedIcon} alt='total-icon' />
											<Typography className='infoWidgetLabel' variant="infoWidgetLabel" component="p">
												Investment Opportunity
											</Typography>
										</div>
										<div>
											<Typography className='infoWidgetValue' variant="infoWidgetValue" gutterBottom component="p">
												{countData?.totalInvestments ?? 0}
											</Typography>

										</div>
									</div>
								}
									className='info-widget-cards'
									value='3' />
								<Tab label={
									<div className="text-center">
										<div className='d-flex align-items-center'>
											<img src={Users} alt='total-icon' />
											<Typography className='infoWidgetLabel' variant="infoWidgetLabel" component="p">
												Users
											</Typography>
										</div>
										<div>
											<Typography className='infoWidgetValue' variant="infoWidgetValue" gutterBottom component="p">
												{countData?.users ?? 0}
											</Typography>
										</div>
									</div>
								}
									className='info-widget-cards'
									value='4' />
							</TabList>
						</Box>
						{/* ACTIVE APPLICATIONS */}
						<TabPanel value='1' className='p-0'>
							<ActiveApplicationTabs fetchCountData={fetchCountData} />
						</TabPanel>
						<TabPanel value='2' className='p-0'>
							<CompanyDetails />
						</TabPanel>
						<TabPanel value='3' className='p-0'>
							<InvestmentOpportunityAdmin fetchCountData={fetchCountData} />
						</TabPanel>
						{/* USERS TABLE */}
						<TabPanel value='4' className='p-0'>
							{adminRole.toLowerCase() === 'admin'? <User /> : <UserTabs />}
						</TabPanel>
					</TabContext>
				</div>
				{/* </Grid> */}
				{/* <Grid item lg={3}>
						<CommonFunctions />
					</Grid> */}
				{/* </Grid> */}
			</div>
			<Footer />
		</div>
	);
};

export default Dashboard;
