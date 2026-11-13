import orderReducer, { getAllOrdersAsync, orderReceived } from './OrderSlice'

describe('real-time order updates',()=>{
  it('updates a received order once and keeps newest orders first',()=>{
    const olderOrder={
      _id:'order-older',
      user:'customer-1',
      createdAt:'2026-01-01T10:00:00.000Z',
      total:10
    }
    const newOrder={
      _id:'order-newer',
      user:'customer-1',
      createdAt:'2026-01-02T10:00:00.000Z',
      total:20
    }
    let state=orderReducer(undefined,{type:'test/initialize'})
    state=orderReducer(state,orderReceived(olderOrder))
    state=orderReducer(state,orderReceived(newOrder))
    state=orderReducer(state,orderReceived({...newOrder,total:25}))

    expect(state.orders).toHaveLength(2)
    expect(state.orders.map((order)=>order._id)).toEqual(['order-newer','order-older'])
    expect(state.orders[0].total).toBe(25)
  })

  it('keeps a received order if an older list request completes afterward',()=>{
    const newOrder={
      _id:'order-live',
      user:'customer-1',
      createdAt:'2026-01-02T10:00:00.000Z',
      total:20
    }
    let state=orderReducer(undefined,{type:'test/initialize'})
    state=orderReducer(state,orderReceived(newOrder))
    state=orderReducer(state,getAllOrdersAsync.fulfilled([],'stale-request'))

    expect(state.orders.map((order)=>order._id)).toEqual(['order-live'])
  })
})
