import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    partnerDetails:{},
    hideTeam: true
}

const commonReducer = createSlice({
    name:'commonReducer',
    initialState,
    reducers:{
        setPartnerDetails : (state,action) => {
            return {
                ...state,
                partnerDetails : action.payload  
            }
        },
        setHideTeam : (state,action) => {
            return {
                ...state,
                hideTeam : action.payload  
            }
        }
    }
})

export const { setPartnerDetails, setHideTeam } = commonReducer.actions;

export default commonReducer.reducer