import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import { fetchAllCategories } from './CategoriesApi'

const initialState={
    status:"idle",
    categories:[],
    errors:null
}

export const fetchAllCategoriesAsync=createAsyncThunk(
    'categories/fetchAllCategoriesAsync',
    async()=>{
        const categories=await fetchAllCategories()
        return categories
    },
    {
        condition:(_, {getState})=>{
            const status=getState().CategoriesSlice.status
            return status!=='pending' && status!=='fulfilled'
        }
    }
)

const categorySlice=createSlice({
    name:"categorySlice",
    initialState:initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder
            .addCase(fetchAllCategoriesAsync.pending,(state)=>{
                state.status='pending'
                state.errors=null
            })
            .addCase(fetchAllCategoriesAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                state.categories=action.payload
            })
            .addCase(fetchAllCategoriesAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

    }
})

// exporting selectors
export const selectCategoryStatus=(state)=>state.CategoriesSlice.status
export const selectCategories=(state)=>state.CategoriesSlice.categories
export const selectCategoryErrors=(state)=>state.CategoriesSlice.errors

export default categorySlice.reducer