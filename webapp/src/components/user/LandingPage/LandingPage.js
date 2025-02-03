import React, { useEffect, useRef, useState } from 'react'
import Header from '../../Header/Header'
import './LandingPage.scss'
import { Container, Box, Typography, Button, Grid, Card, CardContent, CardMedia, AppBar, Toolbar, Link } from '@mui/material';
// import Logo from "../../../assets/"
import Logo from '../../../assets/Logos/Logo.svg'
import LogoPng from '../../../assets/Logos/vibhuLogoPng.png';
import EarningIcon from '../../../assets/LandingPage/earning.png'
import InvCardOne from '../../../assets/LandingPage/inv-card-1.png'
import ServiceOne from '../../../assets/LandingPage/services-section/services-1.jpg'
import PortfolioOne from '../../../assets/LandingPage/portfolio-section/portfolio-1.jpg'
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import locationLogo from '../../../assets/Icons/locationLogo.svg'
import locationWhiteLogo from '../../../assets/Icons/location-white.svg'
import mailIcon from '../../../assets/Icons/mailIcon.svg'
import mailWhiteIcon from '../../../assets/Icons/mail-white.svg'
import twitterIcon from '../../../assets/Icons/twitterIcon.svg'
import facebookIcon from '../../../assets/Icons/facebookIcon.svg'
import businessGrowth from '../../../assets/Icons/businessGrowth.svg'
import clientSatisfaction from '../../../assets/Icons/clientSatisfaction.svg'
import linkdinIcon from '../../../assets/Icons/linkdinIcon.svg'
import ArrowUp from '../../../assets/Icons/ArrowUp.svg'
import GrowthStageInvestments from '../../../assets/Icons/GrowthStageInvestments.svg'
import GrowthStageInvestmentsPlant from '../../../assets/Icons/GrowthInvestmentPlant.svg'
import InvestmentCoin from '../../../assets/Icons/InvestmentCoin.svg'
// import chessPlay from '../../../assets/images/ChessPlay.jpg'
// import chessPlay from '../../../assets/images/handshake-7249766_1280.jpg'
import chessPlay from '../../../assets/images/deal-4131445_1280.jpg'
import PhotoGallary from '../../../assets/images/PhotoGallary.png'
import kalyan from '../../../assets/images/kalyan.png'
import satya from '../../../assets/images/satya.png'
import sankra from '../../../assets/images/sankra.png'
import SpaceX from '../../../assets/images/SpaceX.jpg'
import Stripe from '../../../assets/images/Stripe.png'
import Pateron from '../../../assets/images/Pateron.jpg'
import Pensando from '../../../assets/images/pensando.png'

import { motion, useInView } from "framer-motion"
import { useNavigate } from 'react-router-dom';
import callAPI from '../../../commonFunctions/ApiRequests';
import 'swiper/css';
import 'swiper/css/pagination';
import SwiperSlider from '../../shared/components/SwiperSlider/SwiperSlider';
import { useSelector } from 'react-redux';


const LandingPage = () => {

    const partnerDetails = useSelector(store => store.commonReducer?.partnerDetails)
    const hideTeam = useSelector(store => store.commonReducer?.hideTeam)

    const [display, setDisplay] = useState(false);
    const navigate = useNavigate(null)
    const currentYear = new Date().getFullYear();

    const initialSliderData = [
        {
            logo: SpaceX,
            name: 'Space X'
        },
        {
            logo: Stripe,
            name: 'Stripe'
        },
        {
            logo: Pateron,
            name: 'Pateron'
        },
        {
            logo: Pensando,
            name: 'Pensando'
        },
    ]


    const [sliderData, setSliderData] = useState(null)
    const cardVariants = {
        hiddenLeft: { opacity: 0, x: -50 },
        hiddenRight: { opacity: 0, x: 50 },
        hiddenBottom: { opacity: 0, y: 70 },
        visible: { opacity: 1, x: 0, y: 0 },
    };

    const ref0 = useRef(null);
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const ref5 = useRef(null);
    const ref6 = useRef(null);
    const ref7 = useRef(null);
    const ref8 = useRef(null);
    const ref9 = useRef(null);
    const ref10 = useRef(null);


    const inView0 = useInView(ref0, { once: true });
    const inView1 = useInView(ref1, { once: true });
    const inView2 = useInView(ref2, { once: true });
    const inView3 = useInView(ref3, { once: true });
    const inView4 = useInView(ref4, { once: true });
    const inView5 = useInView(ref5, { once: true });
    const inView6 = useInView(ref6, { once: true });
    const inView7 = useInView(ref7, { once: true });
    const inView8 = useInView(ref8, { once: true });
    const inView9 = useInView(ref9, { once: true });
    const inView10 = useInView(ref10, { once: true });

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY === 0) {
                setDisplay(true);
            } else {
                setDisplay(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    const handleClick = (e) => {
        e.preventDefault();
        navigate('/login')
    }
    const handleClickSignUp = (e) => {
        e.preventDefault();
        navigate('/signup')
    }


    useEffect(() => {
        const fetchSliderData = async () => {

            callAPI.get(`./api/v1/dashboard/getAllCompany`)
                .then(response => {
                    if (response?.status === 200) {
                        if (response?.data?.data.length > 0) {
                            setSliderData(response?.data?.data);
                        } else {
                            setSliderData(initialSliderData)
                        }
                    } else {
                        setSliderData(initialSliderData)
                    }
                })
        };

        fetchSliderData();
    }, [])

    // const smoothScroll = (ref) => {
    //     ref.current.scrollIntoView({
    //         behavior: 'smooth',
    //         block: 'start'
    //     });
    // }

    const smoothScroll = (ref) => {
        const offset = -100; // Customize this value as needed
        const elementPosition = ref.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset + offset;
    
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    };


    return (
        <div className="landing-page-wrapper">
            <div className={`scrollToTop ${display ? "transform0" : "transform1"}`}>
                <Button className='scrollupButton' onClick={scrollToTop}>
                    <img src={ArrowUp} />
                </Button>
            </div>
            {/* <Box className="super-header">
                <div className='location-and-id'>
                    <ul className='d-flex'>
                        <li className='superHeaderLi'>
                            <img className='superHeaderLogo' src={locationLogo} />
                            Vibhu Venture Partners Management
                        </li>
                        <li>
                            <img className='superHeaderLogo' src={mailIcon} />
                            info@vibhu.com
                        </li>
                    </ul>
                </div>
                <div className='socialMedia-Links'>
                    <ul className='d-flex'>
                        <li>
                            <img className='superHeaderLogo' src={twitterIcon} />
                        </li>
                        <li>
                            <img className='superHeaderLogo' src={facebookIcon} />
                        </li>
                        <li>
                            <img className='superHeaderLogo' src={linkdinIcon} />
                        </li>
                    </ul>
                </div>
            </Box> */}
            <AppBar position="static" className={`header-landing header-section TopPrevious`}>
                <Toolbar className='navBarFlex'>
                    {/* <img
                        src={Logo} alt='logo-image' className='The-Logo'/> */}
                    {/* <Box sx={{ flexGrow: 1 }} /> */}
                    {/* <embed  src={Logo} className='The-Logo' /> */}
                    <embed  src={ partnerDetails?.logo ?? LogoPng} className='The-LogoPng' />

                    <div className='scrollbarMenu'>
                        <Button onClick={() => smoothScroll(ref4)} color="inherit" className='underline-animation'>Why choose us</Button>
                        <Button onClick={() => smoothScroll(ref6)} color="inherit" className='underline-animation'>Portfolio</Button>
                        {hideTeam ?
                            <Button onClick={() => smoothScroll(ref10)} color="inherit" className='underline-animation'>Team</Button>
                          : null
                        }
                    </div>

                    <div className='header-signing-opts'>
                        <span
                            onClick={() => navigate('/login')}
                            sx={{ px: 2 }}
                            className='buttonForm'>
                            Sign In
                        </span>
                        <span
                            onClick={() => navigate('/signup')}
                            sx={{ px: 2 }}
                            className='buttonForm'
                        >
                            Sign Up
                        </span>
                    </div>
                </Toolbar>
            </AppBar>

            <Box className="hero-section" sx={{ bgcolor: 'primary.main', color: 'white', py: 8, textAlign: 'center' }}>
                <Container className='hero-container'>
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 80 },
                            animate: { opacity: 1, y: 0 },
                        }}
                        initial="hidden"
                        animate="animate"
                        transition={{ duration: 0.5 }}
                    >
                        <Typography variant="h3" gutterBottom>Investing in Future Tech Leaders</Typography>
                        <Typography variant="h5" className='hero-description'> At {`${partnerDetails?.companyName ?? ' Vibhu Venture Partners' }`}, we focus on investing in tech companies with the potential to transform industries and enhance consumers' lives.</Typography>
                    </motion.div>
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 80 },
                            animate: { opacity: 1, y: 0 },
                        }}
                        initial="hidden"
                        animate="animate"
                        transition={{ duration: 0.5, delay: 0.35 }}
                    >
                        <Button
                            href='/signup'
                            color="primary"
                            variant="contained"
                            sx={{ mt: 3, p: 1 }}
                            className='default-btn learn-more-btn'
                        >
                            <span>Learn More</span>
                            <TrendingFlatIcon />
                        </Button>
                    </motion.div>
                </Container>
            </Box>

            <div className='bg-f3f5f8'>
                <div className='investmentContainer'>
                <Container sx={{ py: 8 }} className="cards-series-wrapper">
                    <Grid container spacing={4} className="cards-series">
                        <Grid item xs={12} sm={3} className='card-wrapper-controller'>
                            <motion.div
                                ref={ref2}
                                variants={cardVariants}
                                initial="hiddenBottom"
                                animate={inView2 ? 'visible' : 'hiddenBottom'}
                                transition={{ duration: 0.5 }}
                                className='card-animaton'
                            >
                                <Card className='card-wrapper'>
                                    <CardContent className='card-content-wrapper'>
                                        <img className='EarlyStageInvestments' src={InvestmentCoin} alt='inv-card-1' />
                                    </CardContent>
                                    <CardContent className='card-content-wrapper-text'>
                                        <Typography variant="h6">Early Stage Investments</Typography>
                                        <Typography variant="p">Investments {`${partnerDetails?.companyName ?? 'At Vibhu Venture Partners' }`}, we focus on investing in tech companies with the potential to transform industries and enhance consumers' livesInvestments {`${partnerDetails?.companyName ?? 'At Vibhu Venture Partners' }`}, we focus on investing in tech companies with the potential to transform industries and enhance consumers' lives.</Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    </Grid>
                    <Grid container spacing={4} className="cards-series">
                        <Grid item xs={12} sm={3} className='card-wrapper-controller '>
                            <motion.div
                                ref={ref2}
                                variants={cardVariants}
                                initial="hiddenBottom"
                                animate={inView2 ? 'visible' : 'hiddenBottom'}
                                transition={{ duration: 0.5 }}
                                className='card-animaton'
                            >
                                <Card className='card-wrapper growthImage'>
                                    <CardContent className='card-content-wrapper-text'>
                                        <Typography variant="h6">Growth Stage Investments</Typography>
                                        <Typography variant="p">Investments {`${partnerDetails?.companyName ?? 'At Vibhu Venture Partners' }`}, we focus on investing in tech companies with the potential to transform industries and enhance consumers' livesInvestments {`${partnerDetails?.companyName ?? 'At Vibhu Venture Partners' }`}, we focus on investing in tech companies with the potential to transform industries and enhance consumers' lives</Typography>
                                    </CardContent>
                                    <CardContent className='card-content-wrapper'>
                                        <img className='EarlyStageInvestments' src={GrowthStageInvestmentsPlant} alt='inv-card-1' />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    </Grid>
                </Container>
                </div>

                <Container sx={{ py: 8 }} className="services-section">
                    <motion.div
                        ref={ref4}
                        variants={cardVariants}
                        initial="hiddenLeft"
                        animate={inView4 ? 'visible' : 'hiddenLeft'}
                        transition={{ duration: 0.5 }}
                    >
                        <Box className="service-description">
                            <div className='service-heading'>
                                <div>
                                    <Typography variant='h3'>Why Choose Us</Typography>
                                </div>
                                <div>
                                    <Typography variant='h5'>Partnering with Visionary Leaders</Typography>
                                </div>
                                <div className='description'>
                                    We believe in the power of collaboration to drive innovation and growth. Our team brings a wealth of experience and a hands-on approach to every company we invest in. We partner with founders and help overcome business challenges to achieve their full potential and prepare the company for the next phase of growth.
                                </div>
                            </div>
                        </Box>
                    </motion.div>

                    <motion.div
                        ref={ref5}
                        variants={cardVariants}
                        initial="hiddenRight"
                        animate={inView5 ? 'visible' : 'hiddenRight'}
                        transition={{ duration: 0.5 }}
                    >
                        <Box className="service-image">
                            <img src={chessPlay} />
                        </Box>
                    </motion.div>
                </Container>
                <Container sx={{ py: 8 }} className="services-section2">
                    <div className='service-logos'>
                        <Card className='card'>
                            <CardMedia
                                component="img"
                                image={businessGrowth}
                                alt="Business Growth"
                            />
                            <div className='logoCard-container'>
                                <Typography variant="h5">Supercharge Growth</Typography>
                                <Typography>Through our hands-on approach and connections, we strive to provide the resources your company needs.</Typography>
                            </div>
                        </Card>
                        <Card className='card'>
                            <CardMedia
                                component="img"
                                height="30"
                                image={clientSatisfaction}
                                alt="Client Satisfaction"
                            />
                            <div className='mobile-padding-0 logoCard-container'>
                                <Typography variant="h5">Client Satisfaction</Typography>
                                <Typography>We take pride in building long term relationships by providing exceptional value and regular updates about portfolio companies.</Typography>
                            </div>
                        </Card>
                    </div>
                </Container>
            </div>

            {/* What our clients say */}
            <Box sx={{ bgcolor: 'grey.200', py: 8 }} className="clients-say-wrapper display-none">
                <div className="clients-say">
                    <Typography variant="h4" gutterBottom>What our clients say</Typography>
                </div>

                <Container>

                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="body1">"Borex has transformed our business and secured our future with their expert advice."</Typography>
                                    <Typography variant="h6">- Jane Doe</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="body1">"Highly recommend Borex for anyone looking to secure their financial future."</Typography>
                                    <Typography variant="h6">- John Smith</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
            {/* WEB SLIDERS VIEW */}
            <div className='slider-web-view'>
                <motion.div
                    ref={ref6}
                    variants={cardVariants}
                    initial="hiddenBottom"
                    animate={inView6 ? 'visible' : 'hiddenBottom'}
                    transition={{ duration: 0.5 }}
                >
                    <Container sx={{ py: 8 }} className="recent-projects-wrapper">
                        <Box className="text-center heading-box">
                            <Typography className='projectHeading mb-2' variant="h3" gutterBottom> Our Portfolio </Typography>
                            {/* <Typography className='recentProjectHeading' variant="h3" gutterBottom>Recent Projects</Typography> */}
                        </Box>

                        {sliderData?.length > 3 ?
                            <SwiperSlider sliderData={sliderData} sliderPerView="4" />
                            : <div className='companies-slider'>
                                {
                                    sliderData?.map((slide, index) => (
                                        <>
                                            <div key={index}>
                                                <Grid item className='cardGrid'>
                                                    <Card className='card-wrapper'>
                                                        <img src={slide.logo} alt={slide.logo} />

                                                        {slide.name ? <div className='card-content'>
                                                            <CardContent className='card-content-wrapper'>
                                                                <Typography className='body-detail' variant="h6">{slide.name}</Typography>
                                                            </CardContent>
                                                        </div> : null}
                                                    </Card>
                                                </Grid>
                                            </div>
                                        </>
                                    ))
                                }
                            </div>
                        }

                    </Container>
                </motion.div>
            </div>


            <Box className="newsletter">
                <Container className='newsletter-container'>
                    <div className='section1'>
                        <Typography variant="h4">Need Consultation?</Typography>
                        <Typography variant="contained" className='newsletter-contact'>Email: { partnerDetails?.companyEmail ?? 'info@vibhu.vc'}</Typography>
                    </div>
                    <div className='section2'>
                        <Typography variant="h4">Join Our LP Group</Typography>
                        <div className='subscribe'>
                            {/* <input type='email' placeholder='Join Now' /> */}
                            <button onClick={(e) => handleClickSignUp(e)} className='sub-btn'>Join</button>
                        </div>
                    </div>
                </Container>
            </Box>


            <motion.div
                ref={ref10}
                variants={cardVariants}
                initial="hiddenBottom"
                animate={inView10 ? 'visible' : 'hiddenBottom'}
                transition={{ duration: 0.5 }}
                className={!hideTeam ? "displayNone" : ""}
            >
                <Container sx={{ py: 8 }} className='team-members'>
                    <Box className="team-headings text-center">
                        <Typography variant="h3" gutterBottom>Meet Our Team</Typography>
                        {/* <Typography variant="h3" gutterBottom>Our Creative Team</Typography> */}
                    </Box>
                    <Grid container spacing={4} className='member-container'>
                        <Grid item xs={12} sm={3} className='member-card'>
                            <motion.div
                                ref={ref7}
                                variants={cardVariants}
                                initial="hiddenLeft"
                                animate={inView7 ? 'visible' : 'hiddenLeft'}
                                transition={{ duration: 0.5 }}
                                className='team-animate'
                            >
                                <Card className='imageMedia'>
                                    <div className='media-div'>
                                        <CardMedia
                                            className='imageContainer'
                                            component="img"
                                            image={satya}
                                            alt="Satya Ananthu"
                                        />
                                    </div>
                                    <CardContent className='text-center member-name'>
                                        <Typography variant="h6">Satya Ananthu</Typography>
                                        <Typography className='member-role'>Founding Partner</Typography>
                                        <Typography className='short-description'>Satya is an Angel Investor from the Seattle area. An alumnus of PSG Tech, Yahoo, and Amazon; he combines his passion for consumer internet technology and rich high-tech experience at companies like Yahoo and Amazon to form a strong thesis for startup investments. He reviewed hundreds of startups and led due diligence for several early-stage companies over the last several years. He primarily invests in early-stage startups that have the potential to disrupt industries and/or improve consumer lives in a positive way; and late-stage companies that have the potential to be future market leaders.</Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                            <div className='memberDesc'>
                                <Typography variant="h6">Satya Ananthu</Typography>
                                <Typography className='short-description'>Satya is an Angel Investor from the Seattle area. An alumnus of PSG Tech, Yahoo, and Amazon; he combines his passion for consumer internet technology and rich high-tech experience at companies like Yahoo and Amazon to form a strong thesis for startup investments. He reviewed hundreds of startups and led due diligence for several early-stage companies over the last several years. He primarily invests in early-stage startups that have the potential to disrupt industries and/or improve consumer lives in a positive way; and late-stage companies that have the potential to be future market leaders.</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={3} className='member-card'>
                            <motion.div
                                ref={ref8}
                                variants={cardVariants}
                                initial="hiddenBottom"
                                animate={inView8 ? 'visible' : 'hiddenBottom'}
                                transition={{ duration: 0.5 }}
                                className='team-animate'
                            >
                                <Card className='imageMedia'>
                                    <div className='media-div'>
                                        <CardMedia
                                            className='imageContainer'
                                            component="img"
                                            image={kalyan}
                                            alt="Kalyan Kaki"
                                        />
                                    </div>
                                    <CardContent className='text-center member-name'>
                                        <Typography variant="h6">Kalyan Kaki</Typography>
                                        <Typography className='member-role'>Founding Partner</Typography>
                                        <Typography className='short-description'>18+ years of experience in top Industrial and Technology companies of the world. Expert in Cloud and SaaS fields from the Seattle area, builds Hyperscale cloud for living. Product leader running global programs and partnerships with 10s of millions of budget and 100s of millions in revenue. Learned evaluating companies and opportunities from his dad who is now a retired general manager responsible for reviewing and approving loans for small and medium scale businesses at the biggest bank of India and now combines it with his experience of leading enterprise cloud partnerships to form an investment thesis. Has been an angel investor for the last 10 years and a Pre-IPO investor for the last several years.</Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                            <div className='memberDesc'>
                                <Typography variant="h6">Kalyan Kaki</Typography>
                                <Typography className='short-description'>18+ years of experience in top Industrial and Technology companies of the world. Expert in Cloud and SaaS fields from the Seattle area, builds Hyperscale cloud for living. Product leader running global programs and partnerships with 10s of millions of budget and 100s of millions in revenue. Learned evaluating companies and opportunities from his dad who is now a retired general manager responsible for reviewing and approving loans for small and medium scale businesses at the biggest bank of India and now combines it with his experience of leading enterprise cloud partnerships to form an investment thesis. Has been an angel investor for the last 10 years and a Pre-IPO investor for the last several years.</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={3} className='member-card'>
                            <motion.div
                                ref={ref9}
                                variants={cardVariants}
                                initial="hiddenRight"
                                animate={inView9 ? 'visible' : 'hiddenRight'}
                                transition={{ duration: 0.5 }}
                                className='team-animate'
                            >
                                <Card className='imageMedia'>
                                    <div className='media-div'>
                                        <CardMedia
                                            className='imageContainer'
                                            component="img"
                                            image={sankra}
                                            alt="Sankara Manepalli"
                                        />
                                    </div>
                                    <CardContent className='text-center member-name'>
                                        <Typography variant="h6">Sankara Manepalli</Typography>
                                        <Typography className='member-role'>Founding Partner</Typography>
                                        <Typography className='short-description'>Sankara is an angel investor, entrepreneur, with working experience at successful startups, world-class technology companies, and best-of-breed educational institutions. His passion is evaluating startups & serving the community through Art of Living & SKY Schools. Sankara graduated in computer science from IIT Kanpur & has an MBA from Kellogg School of Management. He was a founding engineer at IPCell, acquired by Cisco, has patents in communication technology, managed few product lines and business development at Cisco.</Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                            <div className='memberDesc'>
                                <Typography variant="h6">Sankara Manepalli</Typography>
                                <Typography className='short-description'>Sankara is an angel investor, entrepreneur, with working experience at successful startups, world-class technology companies, and best-of-breed educational institutions. His passion is evaluating startups & serving the community through Art of Living & SKY Schools. Sankara graduated in computer science from IIT Kanpur & has an MBA from Kellogg School of Management. He was a founding engineer at IPCell, acquired by Cisco, has patents in communication technology, managed few product lines and business development at Cisco.</Typography>
                            </div>
                        </Grid>
                    </Grid>
                </Container>
            </motion.div>


            <Box
                className="footer">
                <Container>
                    <Grid container spacing={3} className='footer-contents'>
                        <Grid item xs={12} sm={6} md={4} className='content'>
                            {/* <Typography variant="h6">Vibhu Venture</Typography> */}
                            {/* <Typography className='financial-text'>Partners Management</Typography> */}
                            <img src={partnerDetails?.logo ?? LogoPng} className='footer-logo' alt='footer-logo'/>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} className='content'>
                            <Typography variant="h6">Contact Info</Typography>
                            <div className='icon-and-text'>
                                <img className='footer-icon' src={mailWhiteIcon} />
                                <Typography>Email:{` ${ partnerDetails?.companyEmail ?? 'info@vibhu.vc' } `}</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} className='content mailingAddress'>
                            <Typography variant="h6">Mailing Address</Typography>
                            {
                                partnerDetails?.address ? 
                                <div>
                                    <Typography className='footer-address'> {partnerDetails.address} </Typography>
                                </div>
                                :
                                <div className='icon-and-text'>
                                <Typography className='footer-address'>
                                    Vibhu Venture Partners Management LLC
                                    <span id='spanHeight'>
                                        2500 Regency Pkwy
                                    </span>
                                    Cary, NC 27518
                                </Typography>
                                </div> 
                            }
                        </Grid>
                    </Grid>
                </Container>
            </Box>
            <Box className="landingPageCopyright">
                <Container>
                    <Typography variant="h6" className='text-center'>
                        © {currentYear} { partnerDetails?.companyName ?? 'Vibhu Venture Partners' }
                    </Typography>
                </Container>
            </Box>
        </div>
    )
}

export default LandingPage