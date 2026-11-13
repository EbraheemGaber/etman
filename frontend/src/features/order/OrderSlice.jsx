import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import { createOrder, getAllOrders, getOrderByUserId, updateOrderById } from './OrderApi'


const initialState={
    status:"idle",
    orderUpdateStatus:"idle",
    orderFetchStatus:"idle",
    orders:[],
    realtimeOrderIds:[],
    currentOrder:null,
    errors:null,
    successMessage:null
}

const sortOrdersNewestFirst=(orders)=>[...orders].sort((first,second)=>{
    const firstDate=Date.parse(first.createdAt) || 0
    const secondDate=Date.parse(second.createdAt) || 0
    return secondDate-firstDate || String(second._id).localeCompare(String(first._id))
})

export const createOrderAsync=createAsyncThunk("orders/createOrderAsync",async(order)=>{
    const createdOrder=await createOrder(order)
    return createdOrder
})

export const getAllOrdersAsync=createAsyncThunk("orders/getAllOrdersAsync",async()=>{
    const orders=await getAllOrders()
    return orders
})

export const getOrderByUserIdAsync=createAsyncThunk("orders/getOrderByUserIdAsync",async(id)=>{
    const orders=await getOrderByUserId(id)
    return orders
})

export const updateOrderByIdAsync=createAsyncThunk("orders/updateOrderByIdAsync",async(update)=>{
    const updatedOrder=await updateOrderById(update)
    return updatedOrder
})

const orderSlice=createSlice({
    name:'orderSlice',
    initialState:initialState,
    reducers:{
        orderReceived:(state,action)=>{
            const order=action.payload
            if(!order?._id) return
            const orderId=String(order._id)
            if(!state.realtimeOrderIds.includes(orderId)){
                state.realtimeOrderIds.push(orderId)
            }
            state.orders=sortOrdersNewestFirst([
                order,
                ...state.orders.filter((current)=>String(current._id)!==orderId)
            ])
        },
        resetCurrentOrder:(state)=>{
            state.currentOrder=null
        },
        resetOrderUpdateStatus:(state)=>{
            state.orderUpdateStatus='idle'
        },
        resetOrderFetchStatus:(state)=>{
            state.orderFetchStatus='idle'
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(createOrderAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(createOrderAsync.fulfilled,(state,action)=>{
                state.status='fulfilled'
                state.orders=sortOrdersNewestFirst([action.payload,...state.orders])
                state.currentOrder=action.payload
            })
            .addCase(createOrderAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.error
            })

            .addCase(getAllOrdersAsync.pending,(state)=>{
                state.orderFetchStatus='pending'
            })
            .addCase(getAllOrdersAsync.fulfilled,(state,action)=>{
                state.orderFetchStatus='fulfilled'
                const incomingIds=new Set(action.payload.map((order)=>String(order._id)))
                const realtimeOrders=state.orders.filter((order)=>(
                    state.realtimeOrderIds.includes(String(order._id))
                    && !incomingIds.has(String(order._id))
                ))
                state.orders=sortOrdersNewestFirst([...action.payload,...realtimeOrders])
            })
            .addCase(getAllOrdersAsync.rejected,(state,action)=>{
                state.orderFetchStatus='rejected'
                state.errors=action.error
            })

            .addCase(getOrderByUserIdAsync.pending,(state)=>{
                state.orderFetchStatus='pending'
            })
            .addCase(getOrderByUserIdAsync.fulfilled,(state,action)=>{
                state.orderFetchStatus='fulfilled'
                const incomingIds=new Set(action.payload.map((order)=>String(order._id)))
                const realtimeOrders=state.orders.filter((order)=>(
                    state.realtimeOrderIds.includes(String(order._id))
                    && String(order.user?._id || order.user)===String(action.meta.arg)
                    && !incomingIds.has(String(order._id))
                ))
                state.orders=sortOrdersNewestFirst([...action.payload,...realtimeOrders])
            })
            .addCase(getOrderByUserIdAsync.rejected,(state,action)=>{
                state.orderFetchStatus='rejected'
                state.errors=action.error
            })

            .addCase(updateOrderByIdAsync.pending,(state)=>{
                state.orderUpdateStatus='pending'
            })
            .addCase(updateOrderByIdAsync.fulfilled,(state,action)=>{
                state.orderUpdateStatus='fulfilled'
                const index=state.orders.findIndex((order)=>order._id===action.payload._id)
                state.orders[index]=action.payload
            })
            .addCase(updateOrderByIdAsync.rejected,(state,action)=>{
                state.orderUpdateStatus='rejected'
                state.errors=action.error
            })
    }
})

// exporting reducers
export const {orderReceived,resetCurrentOrder,resetOrderUpdateStatus,resetOrderFetchStatus}=orderSlice.actions

// exporting selectors
export const selectOrderStatus=(state)=>state.OrderSlice.status
export const selectOrders=(state)=>state.OrderSlice.orders
export const selectOrdersErrors=(state)=>state.OrderSlice.errors
export const selectOrdersSuccessMessage=(state)=>state.OrderSlice.successMessage
export const selectCurrentOrder=(state)=>state.OrderSlice.currentOrder
export const selectOrderUpdateStatus=(state)=>state.OrderSlice.orderUpdateStatus
export const selectOrderFetchStatus=(state)=>state.OrderSlice.orderFetchStatus

export default orderSlice.reducer