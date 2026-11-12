import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  Navigate, Outlet, useLocation,
  Route, RouterProvider, createBrowserRouter, createRoutesFromElements
} from "react-router-dom";
import { selectIsAuthChecked, selectLoggedInUser } from './features/auth/AuthSlice';
import { Logout } from './features/auth/components/Logout';
import { Protected } from './features/auth/components/Protected';
import { useAuthCheck } from "./hooks/useAuth/useAuthCheck";
import { useFetchLoggedInUserDetails } from "./hooks/useAuth/useFetchLoggedInUserDetails";
import { AddProductPage, AdminOrdersPage, CartPage, CheckoutPage, ForgotPasswordPage, HomePage, LoginPage, OrderSuccessPage, OtpVerificationPage, ProductDetailsPage, ProductUpdatePage, ResetPasswordPage, SignupPage, UserOrdersPage, UserProfilePage, WishlistPage } from './pages';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminStatisticsPage } from './pages/AdminStatisticsPage';
import { CategoryProductsPage } from './pages/CategoryProductsPage';
import { SalespersonPage } from './pages/SalespersonPage';
import { SalespersonOrderRequestPage } from './pages/SalespersonOrderRequestPage';
import { AdminSalesRequestsPage } from './pages/AdminSalesRequestsPage';
import { AdminSalespeoplePage } from './pages/AdminSalespeoplePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { WhatsAppFloatButton } from './components/WhatsAppFloatButton';
import { queryClient } from './config/queryClient';
import { Footer } from './features/footer/Footer';

function AppLayout() {
  const location = useLocation();
  const isAuthChecked=useSelector(selectIsAuthChecked)
  const loggedInUser=useSelector(selectLoggedInUser)
  const isAdmin=Boolean(loggedInUser?.isAdmin)
  const isSalesperson=Boolean(loggedInUser?.isSalesperson)
  const isAuthPage=['/signup','/login','/verify-otp','/forgot-password','/logout'].includes(location.pathname)
    || location.pathname.startsWith('/reset-password/')
  const isOrderSuccessPage=location.pathname.startsWith('/order-success/')
  const isOrdersPage=location.pathname==='/orders'
  const isCartPage=location.pathname==='/cart'
  const isCheckoutPage=location.pathname==='/checkout'
  const isProductDetailsPage=location.pathname.startsWith('/product-details/')

  return (
    <Box sx={{minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <Box component="main" sx={{flex:'1 0 auto',display:'flex',flexDirection:'column'}}>
        <Outlet />
      </Box>
      {!isAuthPage && !isOrderSuccessPage && !isOrdersPage && !isCartPage && !isCheckoutPage && !isProductDetailsPage && <Footer/>}
      {isAuthChecked && !isAuthPage && !isAdmin && !isSalesperson && <WhatsAppFloatButton/>}
    </Box>
  );
}

function App() {

  const isAuthChecked=useSelector(selectIsAuthChecked)
  const loggedInUser=useSelector(selectLoggedInUser)
  const isAdmin=Boolean(loggedInUser?.isAdmin)
  const isSalesperson=Boolean(loggedInUser?.isSalesperson)


  useAuthCheck();
  useFetchLoggedInUserDetails(loggedInUser);


  const routes = useMemo(()=>createBrowserRouter(
    createRoutesFromElements(
      <Route element={<AppLayout/>}>
        <Route path='/signup' element={<SignupPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/verify-otp' element={<OtpVerificationPage/>}/>
        <Route path='/forgot-password' element={<ForgotPasswordPage/>}/>
        <Route path='/reset-password/:userId/:passwordResetToken' element={<ResetPasswordPage/>}/>
        <Route exact path='/logout' element={<Logout/>}/>
        <Route exact path='/product-details/:id' element={<ProductDetailsPage/>}/>

        {
          isAdmin?(
            // admin routes
            <>
            <Route path='/' element={<Protected><AdminOrdersPage/></Protected>}/>
            <Route path='/admin/dashboard' element={<Protected><AdminDashboardPage/></Protected>}/>
            <Route path='/admin/product-update/:id' element={<Protected><ProductUpdatePage/></Protected>}/>
            <Route path='/admin/add-product' element={<Protected><AddProductPage/></Protected>}/>
            <Route path='/admin/orders'  element={<Protected><AdminOrdersPage/></Protected>}/>
            <Route path='/admin/statistics' element={<Protected><AdminStatisticsPage/></Protected>}/>
            <Route path='/admin/sales-requests' element={<Protected><AdminSalesRequestsPage/></Protected>}/>
            <Route path='/admin/salespeople' element={<Protected><AdminSalespeoplePage/></Protected>}/>
            <Route path='*' element={<Navigate to={'/admin/orders'}/>}/>
            </>
          ):isSalesperson?(
            <>
            <Route path='/' element={<Protected><SalespersonOrderRequestPage/></Protected>}/>
            <Route path='/sales/dashboard' element={<Protected><SalespersonPage/></Protected>}/>
            <Route path='/sales/request-order' element={<Protected><SalespersonOrderRequestPage/></Protected>}/>
            <Route path='/profile' element={<Protected><UserProfilePage/></Protected>}/>
            <Route path='*' element={<Navigate to={'/sales/request-order'}/>}/>
            </>
          ):(
            // user routes
            <>
            <Route path='/' element={<HomePage/>}/>
            <Route path='/cart' element={<Protected><CartPage/></Protected>}/>
            <Route path='/profile' element={<Protected><UserProfilePage/></Protected>}/>
            <Route path='/checkout' element={<Protected><CheckoutPage/></Protected>}/>
            <Route path='/order-success/:id' element={<Protected><OrderSuccessPage/></Protected>}/>
            <Route path='/orders' element={<Protected><UserOrdersPage/></Protected>}/>
            <Route path='/wishlist' element={<Protected><WishlistPage/></Protected>}/>
            <Route path='/category/:id' element={<CategoryProductsPage/>}/>
            </>
          )
        }

        <Route path='*' element={<NotFoundPage/>} />

      </Route>
    )
  ),[isAdmin,isSalesperson])

  
  return (
    <>
      <QueryClientProvider client={queryClient}>
        {isAuthChecked && <RouterProvider router={routes}/>}
      </QueryClientProvider>
    </>
  );
}

export default App;
