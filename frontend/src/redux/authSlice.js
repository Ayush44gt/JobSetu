import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null,
        // false until the first /user/me call has finished
        checked:false
    },
    reducers:{
        // actions
        setUser:(state, action) => {
            state.user = action.payload;
            state.checked = true;
        }
    }
});
export const {setUser} = authSlice.actions;
export default authSlice.reducer;
