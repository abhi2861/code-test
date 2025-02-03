
import { Button, Box } from '@mui/material';
import Header from '../Header/Header'
import { useNavigate } from 'react-router-dom';
import Icon from '../../assets/404.png'
import './PageNotFound.scss'


const PageNotFound = () => {

    const navigate = useNavigate()
    const handlenavigate = () => {
        navigate('/')
    }

    return (
        <>
            <Header role="other" />
            <div className='page-not-found-wrapper'>

                <div className='mb-15px page-not-found-img-container'>
                    <img src={Icon} alt="page not found" />
                </div>

                <Box className="mb-15px align-items-center jusify-content-center ">

                    <h4>OOps! page not found...</h4>
                    <p>
                        looks like you're looking for something that doesn't exist
                    </p>

                </Box>
                <div className='mb-15px'>
                    <Button
                        className='default-btn'
                        variant="contained"
                        color="primary"
                        onClick={() => { handlenavigate() }}

                    >
                        Go Back</Button>
                </div>
            </div>
        </>
    )
}

export default PageNotFound;