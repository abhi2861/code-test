import React, { useEffect, useState } from 'react';
import './CompanyCommunitySentiment.scss'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Box, TextField } from '@mui/material';
import { Button } from '@mui/material';
import callAPI from '../../../commonFunctions/ApiRequests';
import Toaster from '../../shared/components/Toaster/Toaster';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined';
import CustomTooltip from '../../shared/components/CustomTooltip/CustomTooltip';
import ConfirmPopUp from '../../shared/components/ConfirmPopUp/ConfirmPopUp';
import Loader from '../../shared/components/Loader/Loader';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatTime } from '../../../commonFunctions/CommonMethod';

const CompanyCommunitySentiment = (props) => {

  const userDetails = JSON.parse(localStorage.getItem('userDetails'));

  const UserID = userDetails?.id;

  const [toasterData, setToasterData] = useState({
    show: false,
    type: '',
    message: ''
  })
  const [subscribeStatus, setSubscribeStatus] = useState('Subscribe');
  const [message, setMessage] = useState('');
  const [data, setData] = useState([
    { name: 'Subscribe', value: 100 },
    { name: 'Unsubscribe', value: 0 },
  ]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false)
  const [showAll, setShowAll] = useState(false);
  // const colors = ['#4caf50', '#9e9e9e'];
  const colors = ['#28a745', '#dc3545']; // Green for Subscribe, Red for Unsubscribe
  const grayColor = '#c0c0c0';
  const emptyData = [
    { name: 'zeroValue', value: 100 },
  ];
  const [editingCommentId, setEditingCommentId] = useState("");
  const [deleteModel, setDeleteModel] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [expandedIds, setExpandedIds] = useState([]);
  const [error, setError] = useState("");

  const visibleComments = comments?.filter((_, index) => true || index < 3);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    getComments()
  }, [])

  const handleMessageChange = (e) => {
    const input = e.target.value;

    if (!input) {
      setError("Comment is required");
    } else {
      setError("");
    }

    setMessage(input);
  };

  const getComments = () => {
    const req = {
      investmentId: props?.id,
      // "status":"Closed"///////
    }
    setLoading(true);
    callAPI.post('/api/v1/comment/getComments', req)
      .then((response) => {
        if (response.status === 200) {
          setLoading(false)
          setComments(response?.data?.data?.commentDetails)
          const data = response?.data?.data;
          setSubscribeStatus(data?.subscribeStatus)
      let subscribePercentage = parseFloat(data?.subscribePercentage?.replace('%', '') || 0);
      let unsubscribePercentage = parseFloat(data?.unsubscribePercentage?.replace('%', '') || 0);

      let pieData = [
        { name: 'Subscribe', value: subscribePercentage },
        { name: 'Unsubscribe', value: unsubscribePercentage },
      ];

      if (subscribePercentage === 0 && unsubscribePercentage === 0) {
        pieData = [        
          { name: 'Subscribe', value: 0 },
          { name: 'Unsubscribe', value: 0 },];
      }

      setData(pieData);

        } else {
          setLoading(false)
          setToasterData({
            show: true,
            type: "error",
            message: response?.message,
          });
        }
      })
  }

  const Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAlgMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAwQBAgUGB//EADAQAAICAQEFBgYBBQAAAAAAAAABAgMREgQhMUFRExQiMmFxBTNSU4GhkSNCYoKx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD7iAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQTufCH8sCZyUeLwRu5LgskDbby2YAld0uiMdrL0IwQSq580jeN0ee4rmQLaeeBkqRk4+V4Jq7VLc9zKJQAAAAAAAAAAAIb548K58QNbZ6nhcCMwCAAaW3Qpjqk/Zc2BuDm2bbbJ+Hwr9kfebs/MkB1gUKdukt1yTX1LiXoyUoqSaafNAZMmABPTZnc/wAExTzjf0LNc9cfXmUbgAAAAAAAw3hZKsnqeSe54gVgAAIDaSbbxg5F9rusc3wfBdEdLa3jZrPbH7OSUAAEC1sFumzs2/DLh6MqmYvTJSXFPIHaBlmCKElMsS9yMAXQYi8pMyUAAAAAEO0PyogJto4x/JCQAABpfDtKZxXFrccc7ZQ2zZtMnZWsxe9roUUwAEDeiHaXQjjizRb3hLLfQ6WxbP2S1z875dEBaMAEUAAFqn5aNyOn5aJCgAAAAAhvW5MgLdkdUWioAABABVv22Nb01pTfXkVZbXc35seiRRes2Smbzp0v/F4Iu4V/XP8ARU7zd9yQ7zd9yQHSqoqq8sVnrzJTkd5u+5I3htt0XvxNdGB0wQ0bTC5YW6X0smIABmMdUkgLVaxBI2AKAAAAAAVro6ZbuDLJrOOqLQFQqbdfoj2cX4mt/oi4008Pkce+eu6cvUCMABAAAAABlNxacW01zR1dmu7avLxqW5pdTklv4dLFrjyaA6BPRH+5/gjrhrfpzLKWFhBWQAAAAAAAAABpOCkvXkeevqspscbItP8A6ekNLaq7oabIqS9QPNA6N/wua30S1L6ZbmUbKrK3/UrlH3QRoAAABNVst93krljq1hAQlz4ZRZO5WJeBJ5kWtn+FxjiV71P6VwOjGKisJYS4JBSMVFYRkAAAAAAAAAAAAAAAGGsmQBFLZqJeaqD/ANTXuezfZh/BOAI4UVQ8lcI+0SQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//2Q=='
  const handleClick = () => {
    const commentData = {
      investmentId: props?.id,
      comment: "",
      subscribe: subscribeStatus === 'Subscribe' ? "Yes" : "No",
    };
    callAPI
      .post("api/v1/comment/createComment", commentData)
      .then((response) => {
        if (response.status === 200) {
          setToasterData({
            show: true,
            type: "success",
            message: response?.data?.message,
          });
          setLoading(false)
        } else {
          setToasterData({
            show: true,
            type: "error",
            message: response?.message,
          });
          setLoading(false)
        }
        getComments()
      })
  };

  const handleToasterClose = () => {
    setToasterData({ ...toasterData, show: false });
  };

  const handlePostClick = () => {

    if (!message.trim()) {
      setError("Comment cannot be empty.");
      return;
    }
  
    setError("");

    const commentReq = {
      investmentId: props?.id,
      comment: message,
      id: editingCommentId || null,
    };
    setLoading(true);

    const apiMethod = editingCommentId ? callAPI.put : callAPI.post;
    const apiUrl = editingCommentId
      ? "api/v1/comment/updateComment"
      : "api/v1/comment/createComment";

    apiMethod(apiUrl, commentReq)
      .then((response) => {
        if (response.status === 200) {
          setLoading(false);
          setToasterData({
            show: true,
            type: "success",
            message: response.data.message,
          });
          setLoading(false)
          setMessage("")
          setEditingCommentId("")
          getComments()
        } else {
          setLoading(false);
          setToasterData({
            show: true,
            type: "error",
            message: response.message,
          });
          setLoading(false)
        }
      })
  }

  const deleteComment = () => {

    const commentReq = {
      id: deleteId,
    };
    setLoading(true);

    callAPI
      .post("api/v1/comment/deleteComment", commentReq)
      .then((response) => {
        if (response.status === 200) {
          setLoading(false);
          setToasterData({
            show: true,
            type: "success",
            message: response.data.message,
          });
          setLoading(false)
          setDeleteModel(false)
          getComments()
        } else {
          setLoading(false);
          setToasterData({
            show: true,
            type: "error",
            message: response.message,
          });
          setDeleteModel(false)
          setLoading(false)
        }
      })
  }

  const handleCommentClick = (comment) => {
    setMessage(comment?.comment);
    setEditingCommentId(comment?.id);
  };

  const toggleCommentsVisibility = () => {
    setShowAll((prev) => !prev);
  };

  return (
    <div className="main-conatiner">
      <Loader show={loading} />
      <ConfirmPopUp
        open={deleteModel}
        message='delete'
        agreeOnClick={() => deleteComment()}
        denyOnClick={() => { setDeleteModel(false) }}
        primaryAction='Yes'
        secondaryAction='No'
      />
      {toasterData && (
        <Toaster
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          message={toasterData.message}
          severity={toasterData.type}
          show={toasterData.show}
          handleClose={handleToasterClose}
        />
      )}
      <div className="community-container">
        <div className="community-sentiment-box">
          <div className='community_text_div'>
            <h4 className='community-text'>Community Sentiments</h4>
          </div>
          <div className="pie-chart-box">
            <PieChart width={300} height={300}>
              {
                data[1].value === 0 && data[0].value === 0 ?

                <Pie
                outerRadius={100}
                innerRadius={60}
                startAngle={90}
                endAngle={450}
                paddingAngle={5}

                data={emptyData}
                dataKey="value"
                fill="green"
                style={{ cursor: 'pointer', outline: 'none' }}
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={grayColor} />
                ))}
            </Pie>
                  :
                  <Pie
                    data={data}
                    dataKey="value"
                    outerRadius={100}
                    innerRadius={60}
                    startAngle={90}
                    endAngle={450}
                    paddingAngle={5}
                    style={{ cursor: 'pointer', outline: 'none' }}
                  >
                    {
                      (
                        data.map((entry, index) => (
                          <Cell className='ROOF_TOP' key={`cell-${index}`} fill={colors[index]} />
                        ))
                      )
                    }
                  </Pie>}
              <Tooltip />
              <Legend />
            </PieChart>
            <div className="indicators-box">
              {data.map((entry, index) => (
                <div className="indicator" key={index}>
                  <div className="dot" style={{ backgroundColor: colors[index] }}></div>
                  <span>{entry.value}% {entry.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="money-control">
            <div className="Percent-box">
              <h1 className="percentText">100%</h1>
            </div>
            <div className="money-control-box">
              <h4>of moneycontrol users recommend <span className='buying_text'>buying</span></h4>
            </div>
          </div>
          <div className="invest-view-container">
            <h4>What's your call on today</h4>
            {/* <a className='a_tag'>Read <span>28</span> investor views</a> */}
          </div>
          <div className='Button_box'>
            <div className="button-container">
              <Button
                variant="contained"
                className={subscribeStatus === 'Unsubscribe' ? "unsubscribe-button" : "subscribe-button"}
                color={subscribeStatus === 'Unsubscribe' ? "primary" : "grey"}
                onClick={handleClick}
              >
                {subscribeStatus}
              </Button>
            </div>
          </div>
        </div>
        <div className="post-comments-box">
          <Box
            display="flex"
            alignItems="flex-start" 
            justifyContent="flex-start"
            width="100%"
            margin="20px auto"
          >
            <TextField
              placeholder="Post your comment here"
              className='comment_input'
              variant="outlined"
              fullWidth
              value={message}
              onChange={handleMessageChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ maxLength: 600 }}
              error={Boolean(error)}
              helperText={error}
            />
            <Button
              variant="contained"
              color="primary"
              className="comment_button"
              onClick={handlePostClick}
            >
              {editingCommentId ? "Update" : "Post"}
            </Button>
          </Box>

          <div className="mapContainer w-100">
            {Array.isArray(visibleComments) && visibleComments?.length > 0 ? (
              visibleComments.map((comment, index) => (
                <Box
                  key={index}
                  className="comment-box-container"
                >
                  <Box
                    className="comment-box-image-container"
                  >
                    <Box className="image-container"
                    >
                      <img
                        className="imageAvtar"
                        src={Image}
                        alt="User Avatar"
                      />
                    </Box>
                    <Box>
                      <h4 className='commentors_name'>{comment?.username}</h4>
                    </Box>
                  </Box>
                  <Box className='the_comment_section'>
                    <Box className='the_comment_p'>
                      <p className='comment_text mb-5px' onClick={() => toggleExpand(comment?.id)}>
                        {expandedIds.includes(comment?.id)
                          ? comment?.comment
                          : comment?.comment.length > 70
                            ? <p className='comment_text'>{`${comment?.comment.substring(0, 70)}`}<i className='view_more cursor-pointer'>View more</i></p>
                            : comment?.comment
                        }
                      </p>

                      {
                        comment.userId == UserID ?
                          <>
                            <CustomTooltip title="Edit" placement="bottom" className='comment_action_button'>
                              <ModeEditOutlinedIcon className='action-icon icon-color cursor-pointer' onClick={() => handleCommentClick(comment)} />
                            </CustomTooltip>
                            <CustomTooltip title="Delete" placement="bottom" className='comment_action_button'>
                              <DeleteIcon
                                className='action-icon icon-color cursor-pointer'
                                onClick={() => {
                                  setDeleteId(comment?.id);
                                  setDeleteModel(true);
                                }}
                                variant="outlined"
                              />
                            </CustomTooltip>
                          </>
                          :
                          <></>
                      }

                    </Box>
                    <Box className="d-flex timespan_section">
                      <AccessTimeIcon className="icon-color view-doc" />
                      <small className='ml-5px mb-5px'>
                        {formatTime(comment?.updatedAt)}
                      </small>
                    </Box>
                  </Box>

                </Box>
              ))
            ) : (
              <p>No comments available.</p>
            )}
          </div>
          {/* <div className="seemore-container mt-5px">
            {comments.length > 3 && (
              <div>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={toggleCommentsVisibility}
                >
                  {showAll ? "Show Less" : "See More"}
                </Button>
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default CompanyCommunitySentiment
