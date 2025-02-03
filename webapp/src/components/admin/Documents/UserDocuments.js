// App.js
import React, { useEffect, useState, useRef } from 'react';
import { Tabs, Tab, Box, Typography, Grid, FormControl, Button, Modal, TextField, Accordion, AccordionSummary, AccordionDetails, Tooltip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CircularProgress, } from "@mui/material";
import File from '../../../assets/Icons/Files.svg';
import Header from '../../Header/Header';
import './Documents.scss'
import callAPI from '../../../commonFunctions/ApiRequests';
import Toaster from '../../shared/components/Toaster/Toaster';
import Footer from '../../Footer/Footer';
import closeIcon from '../../../assets/Icons/crossIcon.svg';
import ConfirmPopUp from '../../shared/components/ConfirmPopUp/ConfirmPopUp';
import { convertToBaseFormatDate } from '../../../commonFunctions/CommonMethod';
import Folder from '../../../assets/Icons/Folder.svg';
import Arrow from '../../../assets/Icons/Arrow.svg';
import MoveIcon from '../../../assets/Icons/MoveIcon.svg';
import Select from 'react-select';


import crossIcon from '../../../assets/Icons/crossIcon.svg';

import Loader from '../../shared/components/Loader/Loader';



const Documents = () => {







  const [usersData, setUsersData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [uploads, setUploads] = useState(null)
  const [isFileUpload, setIsFileUpload] = useState(null)
  const [path, setPath] = useState([]);
  const [createFolderModel, setCreateFolderModel] = useState(false)
  const [folderName, setFolderName] = useState(null)
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [toasterData, setToasterData] = useState({
    show: false,
    type: '',
    message: ''
  })


  const [userdocuments, setDocuments] = useState({})
  const [mainFolders, setMainFolder] = useState({})
  const [subfolderData, setSubFolderData] = useState({})
  const [showFolder, setShowFolder] = useState(false)
  const [getFolder, setGetFolder] = useState('')
  const [getUserName, setUserName] = useState('')
  const [showSubFolder, setShowSubFolder] = useState(false)
  const [subFolderName, setSubFolderName] = useState('')
  const [stringSubFolder, setStringSubFolder] = useState('')
  const [msgErr, setMsgErr] = useState("")
  const [subFolderPath, setSubFolderPath] = useState(null)
  const [buttonloading, setButtonLoder] = useState(false)
  const [listShow, setListShow] = useState(false)
  const [allFolders, setAllFolders] = useState([])
  const [selectedFileToMove, setSelectedFileToMove] = useState(null);




  const [isOpen, setIsOpen] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [activeMoveFileId, setActiveMoveFileId] = useState(null);

  const fileInputRef = useRef(null);

  const getDocuments = () => {
    setLoading(true)
    callAPI.get(`./api/v1/document/getDocuments?role=admin`)
      .then((response) => {
        if (response.status === 200) {

          if (response?.data?.data && response?.data?.data.length > 0) {
            
            setUsersData(response?.data?.data);
            // documentByUserId(response?.data?.data?.id)
            // setSelectedUser(response?.data?.data?.id);
            // setUserName(`${response?.data?.data[0].firstName} ${response?.data?.data[0].lastName}`)
          }
          setLoading(false)
        } else {
          setLoading(false)
          setToasterData({
            show: true,
            type: "error",
            message: response?.message
          });
        }
      })
  }

  //get documents by userId
  const documentByUserId = (id) => {
    setLoading(true)
    callAPI.get(`./api/v1/document/getFilesByFolderName?userId=${id}`)
      .then((response) => {
        if (response.status === 200) {

          setDocuments(response?.data?.data)
          setLoading(false)
        } else {
          setLoading(false)
          setToasterData({
            show: true,
            type: "error",
            message: response?.message
          });
        }
      })
  }


  //get data by folderName 

  const documentByFolderName = (folderName) => {
    setLoading(true)
    callAPI.get(`./api/v1/document/getFilesByFolderName?userId=${selectedUser}&folderName=${folderName}`)
      .then((response) => {
        if (response?.status === 200) {

          setMainFolder(response?.data?.data)
          setLoading(false)
        } else {
          setLoading(false)
          setToasterData({
            show: true,
            type: "error",
            message: response?.message
          });
        }
      })

  }


  //get data by sub-folder-name
  const getFilesBySubFolder = (folderName) => {
    setLoading(true)
    callAPI.get(`./api/v1/document/getFilesByFolderName?userId=${selectedUser}&folderName=${folderName}`)
      .then((response) => {
        if (response?.status === 200) {
          setSubFolderData(response?.data?.data)
          setLoading(false)
        } else {
          setLoading(false)
          setToasterData({
            show: true,
            type: "error",
            message: response?.message
          });
        }
      })
  }

  const getAllFolderName = () => {



    setLoading(true)
    callAPI.get(`./api/v1/document/getAllFolderName?userId=${selectedUser}`)
      .then((response) => {
        if (response?.status === 200) {
          setAllFolders(response?.data?.data)
          setLoading(false)
        } else {
          setLoading(false)
          setToasterData({
            show: true,
            type: "error",
            message: response?.message
          });
        }
      })
  }

  useEffect(() => {
    getDocuments()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      getAllFolderName();
    }
  }, [selectedUser]);

  const handleTabChange = (event, newValue) => {
    documentByUserId(newValue)
    setSelectedUser(newValue);

    setSubFolderName('')
    setShowFolder(false)
    setGetFolder('')
    setStringSubFolder('')
    const selectedUserName = usersData.find(user => user.id === newValue);
    // if (selectedUser) {
    //   const fullName = `${selectedUserName.firstName} ${selectedUserName.lastName}`;
    //   setUserName(fullName)
    // };
    const fullName = `${selectedUserName.firstName} ${selectedUserName.lastName}`;
      setUserName(fullName)
    setUploads({ ...uploads, documents: null })
    setIsFileUpload(null)

  }


  const handleSelectChange = (selectedOption) => {
    const newValue = selectedOption.value;
    documentByUserId(newValue);
    setSelectedUser(newValue);
  
    setSubFolderName('');
    setShowFolder(false);
    setGetFolder('');
    setStringSubFolder('');
    const selectedUserName = usersData.find(user => user.id === newValue);
  
    if (selectedUser) {
      const fullName = `${selectedUserName.firstName} ${selectedUserName.lastName}`;
      setUserName(fullName);
    }
    setUploads({ ...uploads, documents: null });
    setIsFileUpload(null);
  };


  //for uploading optional file 
  const uploadoptionalFile = async (e) => {
    const file = e.target.files[0];
    const maxSize = 8 * 1024 * 1024
    if (file && file.size <= maxSize) {
      if (!isExcelFile(file)) {
        setIsFileUpload(file);
        const base64 = await convertToBase64(file);
        setUploads({
          ...uploads,
          documents: {
            fileType: file.type,
            base64Data: base64,
            fileName: file.name
          }
        });
        fileInputRef.current.value = null;
      }
    }
    else if (file && file.size > maxSize) {
      setToasterData({
        show: true,
        type: "error",
        message: 'File size exceeds 8MB limit.'
      });
    }
    else {
      setToasterData({
        show: true,
        type: "error",
        message: 'File type not supported. Please select a different file.'
      });
    }
  }


  // Function to check if the file is an Excel sheete
  const isExcelFile = (file) => {
    const acceptedExcelTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    return file && acceptedExcelTypes.includes(file.type);
  };

  // convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result)
      }
      fileReader.onerror = (error) => {
        reject(error)
      }
    })
  }


  //for remove
  const removeFile = () => {
    setIsFileUpload(null)
    setUploads(
      {
        ...uploads,
        documents: null
      }
    )
  }

  const handleClickAddFolder = () => {
    setCreateFolderModel(true)
    setMsgErr("")
  }

  const handleFolderCreate = () => {
    if (folderName && folderName.trim() !== '') {
      // const newPath = [...path, folderName];
      let req
      const newPath = [folderName.trim()];
      const folderPath = path
      const folder_0 = newPath.join('/') + '/';

      if (showFolder) {
        if (showFolder && showSubFolder) {
          return;
        } else {
          req = {
            userId: selectedUser,
            folder_0: getFolder,
            folder_1: folder_0,
            action: "action"
          }
        }
      } else {
        req = {
          userId: selectedUser,
          folder_0: folder_0,
          action: "action"
        }
      }

      setButtonLoder(true)
      callAPI.post('./api/v1/document/documentUpload', req)
        .then((response) => {
          if (response.status === 200) {
            setToasterData({
              show: true,
              type: "success",
              message: "Folder created successfully",
            });

            getAllFolderName()
            if (showFolder) {
              if (showFolder && showSubFolder) {
                return;
              } else {
                documentByFolderName(getFolder)
              }
            } else {
              documentByUserId(selectedUser)
            }
            setButtonLoder(false)
            setCreateFolderModel(false);
          }
          else {
            setButtonLoder(false)
            setToasterData({
              show: true,
              type: "error",
              message: response?.message,
            });
          }
        })

      setPath(newPath);
      setFolderName(null)

    } else {
      setMsgErr("Folder name cannot be empty")
    }

  }

  const handleSetFolderName = (e) => {
    setFolderName(e.target.value)
    setMsgErr("");
  }


  const handleToasterClose = () => {
    setToasterData({ ...toasterData, show: false });
  };

  const handleSubmit = () => {

    let req
    if (!uploads || !uploads.documents) {
      setToasterData({
        show: true,
        type: "error",
        message: 'Please select a file to upload.',
      });
      return;
    }

    const newpath = path
    const folder_0 = path.join('/') + '/';

    if (showFolder) {
      if (showFolder && showSubFolder) {
        let newstring = newpath[0]
        let slicedString = newstring.slice(0, -1).split('/');
        let lastIndexValue = slicedString[slicedString.length - 1];
        req = {
          userId: selectedUser,
          folder_0: getFolder,
          folder_1: lastIndexValue + '/',
          document: uploads?.documents,
          action: "action"
        }
      } else {
        req = {
          userId: selectedUser,
          document: uploads?.documents,
          folder_0: getFolder,
          folder_1: null,
          action: "action"
        }
      }

    } else {
      req = {
        userId: selectedUser,
        document: uploads?.documents,
        folder_0: null,
        folder_1: null,
        action: "action"

      }
    }

    setButtonLoder(true)

    callAPI.post('./api/v1/document/documentUpload', req)
      .then((response) => {
        if (response.status === 200) {
          setToasterData({
            show: true,
            type: "success",
            message: "File uploaded successfully",
          });
          setUploads({ documents: null })
          setIsFileUpload(null)
          if (showFolder) {
            if (showFolder && showSubFolder) {
              getFilesBySubFolder(newpath)
            } else {
              documentByFolderName(getFolder)
            }
          } else {
            documentByUserId(selectedUser)
          }
          setButtonLoder(false)

        }
        else {
          setButtonLoder(false)

          setToasterData({
            show: true,
            type: "error",
            message: response?.message,
          });
        }
      })

  }


  //open folder
  const handleOpenFolder = (foldertype, userName, folderName) => {
    setShowFolder(true)
    setGetFolder(folderName)
    // setUserName(userName)
    setShowSubFolder(false)
    setPath([folderName])
    documentByFolderName(folderName)
    //api-call
  }

  //open sub folder
  const handleOpenSubFolder = (foldertype, userName, folderName) => {
    let slicedString = folderName.slice(0, -1).split('/');

    // Get the last index value
    let lastIndexValue = slicedString[slicedString.length - 1];
    setStringSubFolder(lastIndexValue)
    setShowSubFolder(true)
    setSubFolderName(folderName)
    getFilesBySubFolder(folderName)
    setPath([folderName])
    setSubFolderPath(folderName)
    //api-call
  }



  const handleDocClick = (docLink) => {

    const req = {
      docLink: docLink
    };

    callAPI.post('./api/v1/document/getDocumentLink', req)
      .then((response) => {
        if (response.status === 200) {

          const file = response?.data?.data;

          const newWindow = window.open(file, '_blank');

          if (newWindow) {
            newWindow.focus();
          } else {
            setToasterData({
              show: true,
              type: "error",
              message: 'Please allow popups for this site.'
            });
          }

        }
        else {
          setToasterData({
            show: true,
            type: "error",
            message: response?.message,
          });
        }
      })
  }


  // for handle search
  const handleSearch = (event) => {
    setSearch(event.target.value);
  }

  //back to Mainfolder
  const backToFolder = () => {
    setSubFolderName('')
    setShowFolder(false)
    setGetFolder('')
    setStringSubFolder('')
    setSubFolderPath(null)
  }

  //back to subfolder 
  const backToSubFolder = () => {
    setShowSubFolder(false)
    setStringSubFolder('')
    setSubFolderName('')
    setSubFolderPath(null)
  }

  // handle file deletion
  const handleFileDelete = (fileId,) => {
    const folderPath = path

    callAPI.del(`./api/v1/document/deleteDocument?id=${fileId}`)
      .then((response) => {
        if (response.status === 200) {
          setToasterData({
            show: true,
            type: "success",
            message: response?.data?.message,
          });
          setIsOpen(false);
          if (showFolder) {
            if (showFolder && showSubFolder) {
              getFilesBySubFolder(folderPath)
            } else {
              documentByFolderName(getFolder)
            }
          } else {
            documentByUserId(selectedUser)
          }

        }
        else {
          setToasterData({
            show: true,
            type: "error",
            message: response?.data?.message,
          });
        }
      })
  }

  const toogleOpen = (id) => {

    setIsOpen(true);
    setStoreId(id);
  };


  const settingObjs = () => {
    setButtonLoder(false)
    setCreateFolderModel(false);
    setFolderName("")
    setMsgErr("");
  }


  useEffect(() => {
    if (uploads && uploads.documents) {
      handleSubmit();
    }
  }, [uploads]);


  const outerFolderList = userdocuments?.folder?.map((item) => item.folderName.replace('/', ''))
  const innerFolderList = mainFolders?.folder?.map((item) => {
    let subfolderstring = (item?.folderName).slice(0, -1).split('/');
    let lastsubfolder = subfolderstring[subfolderstring.length - 1];
    return lastsubfolder
  })

  const handleSubmitMove = (folderZero, folderOne) => {


   
    const folderPath = path;



    let req = {
      userId: selectedUser,
      docLink: selectedFileToMove.docLink,
      fileName: selectedFileToMove.fileName,
      id: selectedFileToMove.id,
      uploadedBy: selectedFileToMove.uploadedBy,
      uploadedDate: selectedFileToMove.uploadedDate,
      action: 'move',
      folder_0: folderZero,
      folder_1: folderOne,
    };

    callAPI.post('./api/v1/document/documentUpload', req)
      .then((response) => {
        if (response.status === 200) {
          // documentByUserId(userData?.id)
          setToasterData({
            show: true,
            type: "success",
            message: "File moved successfully",
          });

          documentByUserId(selectedUser);


          if (showFolder) {
            if (showFolder && showSubFolder) {
              getFilesBySubFolder(folderPath);
              documentByFolderName(folderZero);
              documentByUserId(selectedUser);
            } else {
              documentByFolderName(getFolder)
            }
          } else {
            documentByUserId(selectedUser)
          }


        }
        else {
          setButtonLoder(false)
          setToasterData({
            show: true,
            type: "error",
            message: response?.message,
          });

        }
      })

    closeListShow()

  }

  const handleOptionSelect = (option, files) => {

    if (option === 'Delete') {

      toogleOpen(files?.id)

    } else if (option === 'Move') {
      // setActiveMoveFileId(files?.id);
      handleFileListPopup()
      setSelectedFileToMove(files)
    }
  };

  const handleFileListPopup = (fileList) => {
    setListShow(true);
  }

  const closeListShow = () => {
    setListShow(false)
  }

  const handleFolderSelect = (folderZero, folderOne) => {
    handleSubmitMove(folderZero, folderOne)
  };


  return (
    <div className='pageWrapperFix admin-documents-storage-wrapper'>
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
      <div className='flex-100 d-flex documents-header-section'>
        <Box className='user-list-tabs search-user-docs'>
          <TextField
            InputLabelProps={{ shrink: true }}
            label="Search user"
            variant="outlined"
            value={search}
            onChange={handleSearch}
            fullWidth
            className='userSearchBox'
          />
        </Box>
        <p className='select-user-text'>Select User</p>
        <div className='default-react-select mobile-document-view'>
          <Select
            value={usersData.find(user => user.id === selectedUser) ? { value: selectedUser, label: usersData.find(user => user.id === selectedUser).firstName + ' ' + usersData.find(user => user.id === selectedUser).lastName } : null}
            onChange={handleSelectChange}
            options={usersData.map(user => ({ value: user.id, label: `${user.firstName} ${user.lastName}` }))}
            isSearchable
          />
        </div>
        <ConfirmPopUp
          open={isOpen}
          onClose={() => { setIsOpen(false) }}
          message='delete this file'
          agreeOnClick={() => handleFileDelete(storeId)}
          denyOnClick={() => { setIsOpen(false) }}
          primaryAction='Yes'
          secondaryAction='No'
        />
        <Box sx={{ marginLeft: '30px', cursor: "pointer" }} className={selectedUser ? 'visible d-flex align-items-center flex-grow-1 admin-document-margin' : 'hidden'}>
          

          <div className='d-flex flex-wrap breadcrumb-container'>
            <p className='selected-user-name' onClick={() => { backToFolder() }}>
              {getUserName}
            </p>
          </div>
          {
            getFolder ?
              <>
                <img src={Arrow} className='arrowSign' />
                <p className='ml-5px font-noBold' onClick={() => { backToSubFolder() }}>{getFolder?.replace("/", "")}</p>
              </> : ""
          }
          {
            stringSubFolder ? <><img src={Arrow} className='arrowSign' /><p className='ml-5px font-noBold'>{stringSubFolder}</p></> : ''
          }


          <div>

          </div>

          {
            subFolderName === "" ? <Button variant='contained' onClick={handleClickAddFolder}
              sx={{
                marginLeft: '20px',
                borderRadius: '32px',
                fontSize: '16px',

                padding: '0px 10px 3px 10px'
              }}
              className='default-btn add-folder-doc'
            >+ Folder </Button>
              : ''
          }
        </Box>


        <Modal
          open={createFolderModel}
          onClose={settingObjs}
          className='d-flex align-items-center justify-content-center confirm-modal-popup'
        // aria-labelledby="create-survey-modal-title"
        // aria-describedby="create-survey-modal-description"
        >
          <div className="modal-paper">
            <div className='modal-header'>
              <h3>Create a folder</h3>
            </div>
            <div className='modal-body'><TextField
              InputLabelProps={{ shrink: true }}
              //   sx={{ width: "50%" }}
              fullWidth
              label="Enter folder name"
              type="text"
              value={folderName || ""}
              onChange={(e) => {
                handleSetFolderName(e)
              }}
            /></div>
            <p className='msgErrCSS'>{msgErr}</p>
            <div className='modal-actions'>
              <Button className='default-btn' variant="contained" color="primary" onClick={handleFolderCreate}>
                {buttonloading ? <CircularProgress size={24} /> : " Create Folder"}
              </Button>
              <Button className='default-btn' variant='contained' color='secondary' onClick={() => { settingObjs() }}>Cancel</Button>
            </div>
          </div>
        </Modal>

        <Modal
          open={listShow}
          onClose={closeListShow}
          className='d-flex align-items-center justify-content-center confirm-modal-popup'
        >
          <div className="modal-paper folderMove-popup">
            <div className='modal-header folderMove-BigHead'>
              <h3>Move File</h3>
              <span onClick={closeListShow}><img className='documentCross' src={crossIcon} /></span>
            </div>
            <div className='modal-body folderMove-body'>
              <h5 className='folderMove-caption'>Folder List</h5>
              <div className='folderMove-MainList'>
                <div>
                  <Accordion defaultExpanded sx={{ backgroundColor: "ededed", boxShadow: "none" }}>
                    <div className='moveOnClickOuter'>
                      <div className='moveOnClickInner' onClick={() => handleFolderSelect(null, null)}>
                        {allFolders.filter(x => x.type == "root").map(x => (<p
                          key={x.folderName}
                          className='userName-folderMove'>
                          <img src={Folder} alt="PDF Icon" className='folderList-Icon' />
                          {x.folderName}
                        </p>))}
                      </div>
                    </div>
                    <div className='folderViewStructure'>
                      {allFolders.filter(mainfolder => mainfolder.type == "main_folder").map(mainfolder => (
                        <Accordion defaultExpanded className='rootAccodion' sx={{ cursor: "pointer", width: "97%", background: "f5f5f5", boxShadow: "none", borderRadius: "0px !important", paddingLeft: "20px", borderLeft: "1px solid black" }}>
                          <div className='moveOnClickOuter'>
                            <div className='moveOnClickInner' onClick={() => handleFolderSelect(mainfolder.folder_0, mainfolder.folder_1)}>
                              <img src={Folder} alt="PDF Icon" className='folderList-Icon' />
                              {mainfolder.folderName.replace("/", "")}
                            </div>
                          </div>
                          <Accordion
                            defaultExpanded
                            sx={{ display: "flex", flexDirection: "column", alignItems: "end", background: "f5f5f5", boxShadow: "none" }}>
                            <Typography sx={{ width: "97%", backgroundColor: "d0d0d0", borderRadius: "none", paddingLeft: "15px", borderLeft: "1px solid black" }}>
                              {allFolders.filter(x => x.type === "sub_folder" && mainfolder.folderName === x.folder_0).map(x => (
                                <div key={x.folderName} onClick={() => handleFolderSelect(x.folder_0, x.folder_1)} className='folderMove-subFolders'>
                                  <img src={Folder} alt="PDF Icon" className='folderList-Icon' />
                                  {x.folderName.replace("/", "")}
                                </div>
                              ))}
                            </Typography>
                          </Accordion>
                        </Accordion>
                      ))}
                    </div>
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        </Modal>

        <Box>
          <Grid lg={3.8} item className='h-100 d-flex align-items-center upload-doc-file'>
            {/* Upload File */}
            <div className='d-flex upload-company-profile'>
              <FormControl fullWidth>
                <div className={selectedUser ? 'visible upload-file-wrap' : 'hidden'}>

                  <Button variant='outlined' className='upload-action-btn'>
                    UPLOAD FILE
                    <input
                      type="file"
                      ref={fileInputRef}
                      name='companyprofile'
                      onChange={(e) => { uploadoptionalFile(e) }}
                    />
                  </Button>
                </div>
              </FormControl>
            </div>

          </Grid>
        </Box>
      </div>

      <Box className='documents-storage-wrapper d-flex flex-grow-1'>

        <Box className='user-list-tabs'>
          <Tabs className={search ? 'visible' : 'hidden'} orientation="vertical" value={selectedUser} onChange={handleTabChange} sx={{ width: '250px' }}>
            {usersData.filter(user => user.firstName.toLowerCase().includes(search.toLowerCase()) || user.lastName.toLowerCase().includes(search.toLowerCase()) || user.email?.toLowerCase().includes(search?.toLowerCase())).map(user => (
              <Tab
                key={user.id}
                value={user.id}
                label={
                  <div>
                    <div>{`${user.firstName} ${user.lastName}`}</div>
                    <p className='email-in-userlist'>{user.email}</p>
                  </div>
                }
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: '#165aaa',
                    color: '#fff'
                  }
                }} />

            ))}
          </Tabs>
        </Box>

        <Box className={selectedUser ? 'visible user-documents' : 'hidden user-documents'} sx={{ marginLeft: '35px', padding: '20px 0px'}}>



          {
            showFolder ?
              <>



                {/* open-sub-folder */}
                {
                  showFolder && showSubFolder ? <>
                    {
                      (subfolderData && subfolderData?.files?.length > 0) &&
                      <>
                        <p className='theFolderFileName'>
                          Files
                        </p>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                          {
                            subfolderData?.files?.map((file) => {
                              return (
                                <Box className="folder-grid-upper">
                                  <Box className='folder-grids' onClick={() => handleDocClick(file.docLink)} key={file.docLink} sx={{ boxShadow: 1, padding: '20px', borderRadius: 1, margin: '0px 20px 20px 0', cursor: 'pointer' }}>
                                    <img src={File} alt="PDF Icon" className='styleIcons' />
                                    <div className='fileDetails'>
                                      <p className='line-clamp-1'>{file.fileName}</p>
                                      <p className='line-clamp-2'><span>By : </span>{file.uploadedBy}</p>
                                      <p className='line-clamp-3'><span>Date : </span>{convertToBaseFormatDate(file.uploadedDate)}</p>
                                    </div>
                                  </Box>
                                  {/* <div className="CustomizedMenus">
                                    <CustomizedMenus options={activeMoveFileId === file?.id ? innerFolderList : ['Delete', 'Move']} onSelect={(option) => handleOptionSelect(option, file)} />
                                  </div> */}
                                  <Tooltip title={<p className="m-5">Move</p>} placement="bottom">
                                    <span onClick={() => handleOptionSelect("Move", file)} className='fileMoveIcon'><img src={MoveIcon} /></span>
                                  </Tooltip>

                                  {
                                    <Tooltip title={<p className="m-5">Delete</p>} placement="bottom">
                                      <span onClick={() => toogleOpen(file?.id)} className='fileDelteIcon'><img src={closeIcon} /></span>
                                    </Tooltip>
                                  }
                                </Box>
                              )
                            }

                            )
                          }
                        </Box>
                      </>
                    }


                  </>
                    :
                    <div>
                      {
                        mainFolders?.folder && mainFolders?.folder?.length > 0 ?
                          <>
                            <p className='theFolderFileName'>
                              Folders
                            </p>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                              {
                                mainFolders?.folder?.map((folder) => {
                                  let substring = (folder?.folderName).slice(0, -1).split('/');

                                  // Get the last index value
                                  let subIndexValue = substring[substring.length - 1];

                                  return (
                                    <Box onClick={() => { handleOpenSubFolder(folder?.type, folder?.userName, folder?.folderName) }} className='folder-grids' key={folder?.type} sx={{ boxShadow: 1, padding: '20px', borderRadius: 1, margin: '0px 20px 20px 0', cursor: 'pointer' }}>
                                      <img src={Folder} alt="PDF Icon" className='styleIcons' />
                                      <p>{subIndexValue}</p>
                                    </Box>
                                  )
                                }

                                )
                              }
                            </Box>
                          </> : ''
                      }

                    </div>
                }

                <div>

                  {!showSubFolder && mainFolders?.files && mainFolders?.files?.length > 0 ?

                    <>
                      <p className='theFolderFileName'>
                        Files
                      </p>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        <div className='documentViews'>
                          {
                            mainFolders?.files?.map((file) =>

                              <Box className="folder-grid-upper">
                                <Box className='folder-grids' key={file.docLink} onClick={() => handleDocClick(file.docLink)} sx={{ boxShadow: 1, padding: '20px', borderRadius: 1, margin: '0px 20px 20px 0', cursor: 'pointer' }}>
                                  <img src={File} alt="PDF Icon" className='styleIcons' />
                                  <div className='fileDetails'>
                                    <b className='line-clamp-1'>{file.fileName}</b>
                                    <p className='line-clamp-2'><span>By : </span>{file.uploadedBy}</p>
                                    <p className='line-clamp-3'><span>Date : </span>{convertToBaseFormatDate(file.uploadedDate)}</p>
                                  </div>
                                </Box>
                                {/* <div className="CustomizedMenus">
                                  <CustomizedMenus options={activeMoveFileId === file?.id ? innerFolderList : ['Delete', 'Move']} onSelect={(option) => handleOptionSelect(option, file)} />
                                </div> */}
                                {/* <span onClick={() => toogleOpen(file?.id)} className='fileDelteIcon'><img src={closeIcon} /></span> */}
                                <Tooltip title={<p className="m-5">Move</p>} placement="bottom">
                                  <span onClick={() => handleOptionSelect("Move", file)} className='fileMoveIcon'><img src={MoveIcon} /></span>
                                </Tooltip>

                                {
                                  <Tooltip title={<p className="m-5">Delete</p>} placement="bottom">
                                    <span onClick={() => toogleOpen(file?.id)} className='fileDelteIcon'><img src={closeIcon} /></span>
                                  </Tooltip>
                                }
                              </Box>

                            )
                          }
                        </div>
                      </Box>
                    </> : ''
                  }

                </div>


              </> :

              <div>
                {
                  userdocuments?.folder && userdocuments?.folder?.length > 0 ?
                    <>
                      <p className='theFolderFileName'>
                        Folders
                      </p>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {
                          userdocuments?.folder?.map((folder) =>
                            <Box onClick={() => { handleOpenFolder(folder?.type, folder?.userName, folder?.folderName) }} className='folder-grids' key={folder?.type} sx={{ boxShadow: 1, padding: '20px', borderRadius: 1, margin: '0px 20px 20px 0', cursor: 'pointer' }}>
                              <img src={Folder} alt="PDF Icon" className='styleIcons' />
                              <p>{folder?.folderName?.replace("/", "")}</p>
                            </Box>
                          )
                        }
                      </Box>
                    </> : ''
                }

              </div>
          }

          <div>

            {!showFolder && userdocuments?.files && userdocuments?.files?.length > 0 ?

              <>
                <p className='theFolderFileName'>
                  Files
                </p>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <div className='documentViews'>
                    {
                      userdocuments?.files?.map((file) => {

                        return (
                          <Box className="folder-grid-upper">
                            <Box className='folder-grids' key={file.docLink} onClick={() => handleDocClick(file.docLink)} sx={{ boxShadow: 1, padding: '20px', borderRadius: 1, margin: '0px 20px 20px 0', cursor: 'pointer' }}>
                              <img src={File} alt="PDF Icon" className='styleIcons' />
                              <div className='fileDetails'>
                                <p className='line-clamp-1'>{file.fileName}</p>
                                <p className='line-clamp-2'><span>By : </span>{file.uploadedBy}</p>
                                <p className='line-clamp-3'><span>Date : </span>{convertToBaseFormatDate(file.uploadedDate)}</p>
                              </div>
                            </Box>
                            
                            <Tooltip title={<p className="m-5">Move</p>} placement="bottom">
                              <span onClick={() => handleOptionSelect("Move", file)} className='fileMoveIcon'><img src={MoveIcon} /></span>
                            </Tooltip>

                            {
                              <Tooltip title={<p className="m-5">Delete</p>} placement="bottom">
                                <span onClick={() => toogleOpen(file?.id)} className='fileDelteIcon'><img src={closeIcon} /></span>
                              </Tooltip>
                            }
                          </Box>
                        )
                      }

                      )
                    }
                  </div>
                </Box>
              </> : ''
            }

          </div>


        </Box>
      </Box>

      <Footer zeroTopMargin />
    </div >
  );
};

export default Documents;
