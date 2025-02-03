import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import moment from 'moment';
import callAPI from "../../../commonFunctions/ApiRequests";
import { formatCurrency } from "../../../commonFunctions/ConvertIntoCurrency";
import { convertToBaseFormatDate } from "../../../commonFunctions/CommonMethod";
import SampleLogo from "../../../assets/ActionIcons/sample-logo.svg";
import Toaster from "../../shared/components/Toaster/Toaster";
import CustomTooltip from "../../shared/components/CustomTooltip/CustomTooltip";
import InfoIcon from '@mui/icons-material/Info';
import Info from "@mui/icons-material/Info";

const RightPanel = ({ toggleDrawer, surveyData }) => {
  const navigate = useNavigate();
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));

  //toaster
  const [toasterData, setToasterData] = useState({
    show: false,
    type: "",
    message: "",
  });

  const handleOpenCompany = (value) => {
    navigate("/companyDetailsUser", {
      state: { type: "viewCompany", data: value, userDetails: userDetails },
    });
    // props.setClickView(true);
    toggleDrawer();
  };



  const handleToasterClose = () => {
    setToasterData({ ...toasterData, show: false });
  };

  return (
    <div className="right-panel-wrapper">
      {toasterData && (
        <Toaster
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          message={toasterData.message}
          severity={toasterData.type}
          show={toasterData.show}
          handleClose={handleToasterClose}
        />
      )}

      <div className="panel-category-header">
        <h4>Submit Your Interest <span className="survey-count">({surveyData.length})</span></h4>
      </div>
      <div className="right-panel-scroll">
        {surveyData && surveyData?.length > 0 ?
          surveyData?.map((survey, index) => (

            <>
              <div key={index} className="survey-card">
                <div className="d-flex">
                  <div className='survey-logo'>
                    {/* <img src={survey?.company?.logo} height='15' width='30' /> */}
                    {
                      survey && survey?.company?.logo ?
                        <img src={survey?.company?.logo} alt='logo' height='20' width='40' /> :
                        <h2 className='text-white'><span className="placeholder-logo">{survey?.company?.name ? survey?.company?.name.substring(0, 1) : null}</span></h2>
                    }
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex survey-name">
                      <b>{survey?.company?.name}</b>
                      <CustomTooltip title={<p className="mr-15px">Submit Your Interest : {survey?.name}</p>} placement="bottom">
                        <InfoIcon className="info-icon" />
                      </CustomTooltip>
                    </div>
                    <small> {convertToBaseFormatDate(survey?.startDate, false, true, 'MMMM', false)} - {convertToBaseFormatDate(survey?.endDate, false, true, 'MMMM', false)}</small>
                  </div>
                  <div>
                    <Button
                      type="button"
                      className="default-btn"
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        handleOpenCompany(survey);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>

                <div className="survey-fields">
                  <div>
                    <p>Investment Range</p>
                    <b>{survey?.investmentRange}</b>
                  </div>
                </div>

              </div>
            </>
          )) : <p className="text-center">No Surveys Available.</p>}
      </div>
    </div>
  );
};

export default RightPanel;
