import React, { useEffect, useState } from 'react';
import { Button, Grid, Box, Typography } from '@mui/material';

import callAPI from '../../../commonFunctions/ApiRequests'
import { ReactTable } from '../../shared/components/ReactTable/ReactTable';
import CustomSelect from '../../shared/components/CustomSelect/CustomSelect';
import Header from '../../Header/Header';
import Toaster from '../../shared/components/Toaster/Toaster';
import Loader from '../../shared/components/Loader/Loader';
import { convertToBaseFormatDate, currencifyInDollars } from '../../../commonFunctions/CommonMethod';
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined';
import './SurveyDetailsAdmin.scss'
import CustomTooltip from '../../shared/components/CustomTooltip/CustomTooltip';
import Footer from '../../Footer/Footer';

const SurveyDetailsAdmin = () => {

  const [surveys, setSurveys] = useState({})
  const [selectedSurvey, setSelectedSurvey] = useState()
  const [getSurveyData, setGetSurveyData] = useState(null)
  const [columns, setColumns] = useState([])
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hideSelectBox, setHideSelectBox] = useState(false);
  const [toasterData, setToasterData] = useState({
    type: '',
    show: false,
    message: ''
  })

  // for get survyes dropdown
  const getAllSurvey = () => {
    setLoading(true)
    callAPI.get(`./api/v1/survey/getAllSurvey`)
      .then((response) => {
        if (response.status === 200) {

          const surveys = response.data?.data?.map((item) => {
            return ({
              value: item?.id,
              label: `${item?.name} (${item?.companyName})`,
            })
          })

          setSurveys(surveys)

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
  // for get survyes details
  const getSurveyDetails = () => {
    setLoading(true)
    const req = {
      "id": selectedSurvey?.value,
      "name": selectedSurvey?.name
    }

    callAPI.post(`./api/v1/survey/getInterestCapture`, req)
      .then((response) => {
        if (response.status === 200) {

          setGetSurveyData(response?.data?.data)
          // setHideSelectBox(true);
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

  useEffect(() => {
    getAllSurvey()
  }, [])

  useEffect(() => {
    setColumns([
      {
        Header: 'Name',
        className: 'company-name-in-table',
        accessor: row => row?.firstName + row?.lastName,
        Cell: localProps => <b>{localProps.row.original?.firstName} {localProps.row.original?.lastName}</b>
      },
      {
        Header: 'Amount',
        className: 'amount-in-table text-right',
        accessor: 'amount',
        Cell: localProps => <p>{currencifyInDollars(localProps.value ?? 0)}</p>
      },
      {
        Header: 'Date',
        accessor: row => row?.date,
        className: 'date-in-table',

        Cell: localProps => <p>{convertToBaseFormatDate(localProps.row.original?.date)}</p>
      },
      // {
      //   Header: 'Status',
      //   className: 'status-in-table',
      //   accessor: row => row?.status,
      //   Cell: localProps => <p>{localProps.row.original?.status.length > 0 ? localProps.row.original?.status : "-"}</p>
      // },
    ])
  }, [getSurveyData])


  const handleChange = (key, value) => {

    if (value) {
      setErrors(null)
    }

    let name;
    const machedSurvey = surveys.filter(survey => survey.value === value);
    if (machedSurvey.length > 0) {
      name = machedSurvey[0].label;
    }

    const surveyObj = {
      ...selectedSurvey,
      name,
      value
    }

    setSelectedSurvey(surveyObj)

  };

  const handleSearchButtonClicked = () => {
    const dropdownError = {};

    if (!selectedSurvey) {
      dropdownError.survey = 'Please select a survey'
    }

    if (Object.keys(dropdownError).length > 0) {
      setErrors(dropdownError);
      return;
    }

    getSurveyDetails()
    setHideSelectBox(true);
  }

  //for toaster
  const handleToasterClose = () => {
    setToasterData({ ...toasterData, show: false });
  };

  return (
    <div className='pageWrapperFix'>
      <Header role='admin' />
      {toasterData && (
        <Toaster
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          message={toasterData.message}
          severity={toasterData.type}
          show={toasterData.show}
          handleClose={handleToasterClose}
        />
      )}
      <Loader show={loading} />

      <div className='container survey-details-wrapper flex-grow-1'>
        {!hideSelectBox && (
          <>
            <Box className='heading-section'>
              <h4>Survey</h4>
            </Box>

            <Grid container className='align-items-start config-primary-actions'>
              <Grid lg={4} item className='mr-15px mt-5px select-template'>
                <CustomSelect
                  options={surveys}
                  value={selectedSurvey}
                  label={'Select Survey'}
                  Obejctkey={'survey'}
                  onChange={(key, option) => handleChange('survey', option)}
                  sx={{ width: '50%' }}
                  error={!!errors?.survey}
                  helperText={errors?.survey}
                />
              </Grid>
              <Grid lg={'auto'} item className='search-btn'>
                <Button className='default-btn' variant="contained" onClick={handleSearchButtonClicked} sx={{ marginTop: '3px' }}>Search</Button>
              </Grid>
            </Grid>
          </>
        )}

        {getSurveyData?.surveyName && (
          <div className="survey-name-container">
            <h4 className='survey-title'>{getSurveyData?.surveyName ?? '-NA-'}
              <CustomTooltip title="Change Survey" placement="right">
    <ModeEditOutlinedIcon className='surveyEditAdmin' onClick={() => {setHideSelectBox(false); setGetSurveyData(null);}} />
              </CustomTooltip>
            </h4>
            {/* Render edit icon */}

          </div>
        )}

        {

          getSurveyData &&

          <>

            <Grid container className='surveyCardContainer' spacing={2}>
              {/* <Grid item className='surveyCard'>
                <Typography variant='h6'>Survey Name</Typography>
                <Typography className='line-clamp-1'>{getSurveyData?.surveyName ?? '-NA-'}</Typography>
              </Grid> */}
              {/* <Grid item className='surveyCard' >
                <Typography variant='h6'>Interested People</Typography>
                <Typography>{getSurveyData?.totalInterestedPeople ?? 0}</Typography>
              </Grid> */}
              <Grid item className='surveyCard'>
                <Typography variant='h6'>Interested People</Typography>
                <Typography>{getSurveyData?.
                  totalInterestedPeople
                  ?? 0}</Typography>
              </Grid>
              <Grid item className='surveyCard'>
                <Typography variant='h6'>Total Funds</Typography>
                <Typography>{currencifyInDollars(getSurveyData?.sumOfAmount
                ) ?? 0}</Typography>
              </Grid>
              {/* <Grid item className='surveyCard'>
                <Typography variant='h6'>Percentage Committed</Typography>
                <Typography>{getSurveyData?.totalPercentage ?? 0}%</Typography>
              </Grid> */}
            </Grid>

            <ReactTable
              classname={"surveyTable"}
              columns={columns}
              data={getSurveyData?.users || []}
              title='Survey Response'
              expandable={false}
            />
          </>
        }
      </div>
      <Footer />
    </div>
  )
}

export default SurveyDetailsAdmin