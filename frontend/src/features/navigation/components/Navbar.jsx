import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Autocomplete, Badge, BottomNavigation, BottomNavigationAction, Box, Button, CircularProgress, InputAdornment, Stack, TextField, useMediaQuery, useTheme } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { selectUserInfo } from '../../user/UserSlice'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { selectCartItems } from '../../cart/CartSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { selectWishlistItems } from '../../wishlist/WishlistSlice'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import TuneIcon from '@mui/icons-material/Tune'
import { selectProductIsFilterOpen, toggleFilters } from '../../products/ProductSlice'
import { selectCategories } from '../../categories/CategoriesSlice'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import { fetchProducts } from '../../products/ProductApi'
import { getRootCategories } from '../../categories/categoryUtils'

const brandRed = '#c62828'

export const Navbar=({isProductList=false})=> {
  const [anchorElUser, setAnchorElUser] = React.useState(null)
  const userInfo=useSelector(selectUserInfo)
  const cartItems=useSelector(selectCartItems)
  const loggedInUser=useSelector(selectLoggedInUser)
  const categories=useSelector(selectCategories)
  const rootCategories=getRootCategories(categories)
  const navigate=useNavigate()
  const dispatch=useDispatch()
  const theme=useTheme()
  const is480=useMediaQuery(theme.breakpoints.down(480))
  const isMobile=useMediaQuery(theme.breakpoints.down('sm'))
  const location=useLocation()
  const wishlistItems=useSelector(selectWishlistItems)
  const isProductFilterOpen=useSelector(selectProductIsFilterOpen)
  const isCustomer=!loggedInUser?.isAdmin && !loggedInUser?.isSalesperson
  const isAdmin=Boolean(loggedInUser?.isAdmin)
  const isSalesperson=Boolean(loggedInUser?.isSalesperson)
  const isMobileStorefront=isCustomer && isMobile
  const [searchText,setSearchText]=React.useState('')
  const [searchProducts,setSearchProducts]=React.useState([])
  const [isLoadingSearchProducts,setIsLoadingSearchProducts]=React.useState(false)
  const [searchProductsError,setSearchProductsError]=React.useState(false)
  const searchRequestStarted=React.useRef(false)

  React.useEffect(()=>{
    if(searchText.trim().length<2 || searchRequestStarted.current) return

    searchRequestStarted.current=true
    setIsLoadingSearchProducts(true)
    setSearchProductsError(false)
    fetchProducts({user:true})
      .then(({data})=>setSearchProducts(data))
      .catch(()=>{
        searchRequestStarted.current=false
        setSearchProductsError(true)
      })
      .finally(()=>setIsLoadingSearchProducts(false))
  },[searchText])

  const matchingProducts=searchProducts
    .filter((product)=>product.title?.toLowerCase().includes(searchText.trim().toLowerCase()))
    .slice(0,8)
  const searchOptions=[
    ...matchingProducts.map((product)=>({type:'product',id:product._id,label:product.title})),
    ...categories.map((category)=>({type:'category',id:category._id,label:category.name}))
  ]

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorElUser(null)
  }

  const handleToggleFilters=()=>{
    dispatch(toggleFilters())
  }

  const handleBack=()=>{
    if(location.key==='default'){
      navigate(isSalesperson?'/sales/request-order':isAdmin?'/admin/orders':'/',{replace:true})
      return
    }

    navigate(-1)
  }

  const settings = loggedInUser ? [
    {name:isSalesperson?'الرئيسية':'Home',to:isSalesperson?"/sales/request-order":"/"},
    {name:isSalesperson?'الملف الشخصي':'Profile',to:loggedInUser?.isAdmin?"/admin/profile":"/profile"},
    ...(!isSalesperson && !isAdmin?[{name:'My orders',to:'/orders'}]:[]),
    ...(isAdmin?[{name:'Manage salespeople',to:'/admin/salespeople'}]:[]),
    ...(isSalesperson?[{name:'لوحة المبيعات',to:'/sales/dashboard'}]:[]),
  ] : [
    {name:'تسجيل الدخول',to:'/login'},
    {name:'إنشاء حساب',to:'/signup'}
  ]

  return (
    <>
    <AppBar
      position="sticky"
      dir="ltr"
      lang={isSalesperson?'ar':undefined}
      sx={{
        backgroundColor:brandRed,
        boxShadow:"none",
        color:"#fff",
        ...(isSalesperson?{fontFamily:'Cairo, Tahoma, sans-serif','& *:not(svg)':{fontFamily:'Cairo, Tahoma, sans-serif'}}:{})
      }}
    >
      <Toolbar sx={{
        minHeight:{xs:'3.75rem',sm:'4.25rem'},
        px:{xs:1.5,sm:3},
        gap:{xs:1,sm:2},
        display:"flex",
        justifyContent:"space-between"
      }}>
        <Stack direction="row" alignItems="center" spacing={{xs:.75,sm:1.5}} sx={{minWidth:0,flexShrink:0}}>
          {location.pathname!=='/' && (
            <IconButton
              onClick={handleBack}
              aria-label="Go back"
              sx={{color:'inherit',p:.5}}
            >
              <ArrowBackRoundedIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to={isSalesperson?"/sales/request-order":isAdmin?"/admin/orders":"/"}
            sx={{
              display:'flex',
              alignItems:'center',
              color:'inherit',
              textDecoration:'none',
              fontWeight:800,
              letterSpacing:{xs:'.08rem',sm:'.16rem'},
              fontSize:{xs:'.95rem',sm:'1.2rem'},
              fontFamily:'Arial, Helvetica, sans-serif',
              textTransform:'uppercase'
            }}
          >
            ETMAN GROUP
          </Typography>
        </Stack>

        {isAdmin && (
          <Box
            component="nav"
            aria-label={'Admin navigation'}
            sx={{
              display:'flex',
              justifyContent:'center',
              alignItems:'center',
              gap:{xs:.5,sm:2},
              flex:1,
              minWidth:0,
              overflowX:'auto',
              whiteSpace:'nowrap',
              scrollbarWidth:'none',
              '&::-webkit-scrollbar':{display:'none'}
            }}
          >
            {[
              {name:'احصائيات',to:'/admin/statistics'},
              {name:'طلبات المندوبين',to:'/admin/sales-requests'},
              {name:'طلبات العملاء',to:'/admin/orders'},
              {name:'الأرشيف',to:'/admin/archive'}
            ].map((item)=>(
              <Button
                key={item.to}
                component={Link}
                to={item.to}
                size="small"
                sx={{
                  flexShrink:0,
                  color:'inherit',
                  fontSize:{xs:'.68rem',sm:'.85rem'},
                  px:{xs:.75,sm:1.25},
                  '&:hover':{bgcolor:'rgba(255,255,255,.12)'}
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>
        )}

        {loggedInUser?.isSalesperson && (
          <Box
            component="nav"
            aria-label="التنقل الخاص بمندوب المبيعات"
            sx={{display:'flex',alignItems:'center',gap:{xs:.5,sm:1},flex:1,minWidth:0}}
          >
            <Button
              component={Link}
              to="/sales/dashboard"
              size="small"
              sx={{flexShrink:0,color:'inherit',fontSize:{xs:'.68rem',sm:'.85rem'},px:{xs:.75,sm:1.25}}}
            >
              {'لوحة التحكم'}
            </Button>
            <Button
              component={Link}
              to="/sales/request-order"
              size="small"
              sx={{flexShrink:0,color:'inherit',fontSize:{xs:'.68rem',sm:'.85rem'},px:{xs:.75,sm:1.25}}}
            >
              {'طلب مبيعات'}
            </Button>
          </Box>
        )}

        {isCustomer && categories.length > 0 && (
          <Autocomplete
            options={searchOptions}
            loading={isLoadingSearchProducts}
            groupBy={(option)=>option.type==='product'?'Products':'Categories'}
            getOptionLabel={(option)=>option?.label || ''}
            isOptionEqualToValue={(option,value)=>option.type===value.type && option.id===value.id}
            onInputChange={(_,value)=>setSearchText(value)}
            onChange={(_,option)=>{
              if(option){
                navigate(option.type==='product'?`/product-details/${option.id}`:`/category/${option.id}`)
              }
            }}
            sx={{flex:1,maxWidth:560,minWidth:{xs:80,sm:170},mx:{xs:.25,sm:2}}}
            noOptionsText={searchProductsError?'Unable to load product suggestions':'No matching products or categories'}
            loadingText="Loading suggestions..."
            renderOption={(props,option)=>(
              <Box component="li" {...props} key={`${option.type}-${option.id}`}>
                <Typography>{option.label}</Typography>
              </Box>
            )}
            renderInput={(params)=>(
              <TextField
                {...params}
                placeholder={"Search products or categories"}
                size="small"
                inputProps={{...params.inputProps,'aria-label':'Search products or categories'}}
                InputProps={{
                  ...params.InputProps,
                  startAdornment:(
                    <>
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" sx={{color:'#766666'}} />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment:(
                    <>
                      {isLoadingSearchProducts && <CircularProgress color="inherit" size={16} />}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root':{
                    height:38,
                    borderRadius:2,
                    bgcolor:'#fff',
                    color:'#29232b',
                    py:0,
                    '& fieldset':{borderColor:'rgba(255,255,255,.55)'},
                    '&:hover fieldset':{borderColor:'#f2b8b8'}
                  },
                  '& input::placeholder':{color:'#766666',opacity:1,fontSize:{xs:11,sm:13}}
                }}
              />
            )}
          />
        )}

        <Stack direction="row" alignItems="center" spacing={{xs:.25,sm:1}} sx={{display:isMobileStorefront?'none':'flex'}}>
          {loggedInUser && (
            <Button
              component={Link}
              to="/logout"
              sx={{color:'inherit',fontWeight:600,'&:hover':{bgcolor:'rgba(255,255,255,.12)'}}}
            >
              {'تسجيل خروج'}
            </Button>
          )}
          {!loggedInUser && (
            <Button
              component={Link}
              to="/login"
              state={{from:location}}
              size="small"
              sx={{color:'inherit',fontWeight:700,whiteSpace:'nowrap','&:hover':{bgcolor:'rgba(255,255,255,.12)'}}}
            >
              {'تسجيل دخول'}
            </Button>
          )}

          {isCustomer && !is480 && (
            <Button
              component={Link}
              to="/orders"
              startIcon={<ReceiptLongOutlinedIcon />}
              sx={{color:'inherit',fontWeight:600,'&:hover':{bgcolor:'rgba(255,255,255,.12)'}}}
            >
              {'طلباتي'}
            </Button>
          )}

          {isCustomer && (
            <Tooltip title={"Wishlist"}>
              <IconButton
                component={Link}
                to="/wishlist"
                aria-label={"Open wishlist"}
                sx={{color:'inherit'}}
              >
                <Badge badgeContent={wishlistItems?.length} color="error">
                  <FavoriteBorderIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {isCustomer && (
            <Tooltip title={"Cart"}>
              <IconButton
                onClick={()=>navigate("/cart")}
                aria-label={"Open cart"}
                sx={{color:'inherit'}}
              >
                <Badge badgeContent={cartItems?.length || 0} color="error">
                  <ShoppingCartOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={isSalesperson?"فتح قائمة الحساب":"Open account menu"}>
            <IconButton
              onClick={handleOpenUserMenu}
              aria-label={isSalesperson?"فتح قائمة الحساب":"Open account menu"}
              sx={{color:'inherit',ml:{xs:0,sm:1},borderRadius:2,gap:.75,px:{xs:.5,sm:1}}}
            >
              <Typography
                noWrap
                sx={{
                  maxWidth:{xs:72,sm:140,md:190},
                  fontSize:{xs:'.68rem',sm:'.85rem'},
                  fontWeight:600,
                  color:'inherit'
                }}
              >
                {userInfo?.name || loggedInUser?.name || loggedInUser?.email || ''}
              </Typography>
              <Avatar
                alt={userInfo?.name || loggedInUser?.name || 'Account'}
                sx={{
                  width:32,
                  height:32,
                  bgcolor:'rgba(255,255,255,.18)',
                  color:'inherit'
                }}
              >
                {(userInfo?.name || loggedInUser?.name)?.charAt(0) || <PersonOutlineRoundedIcon fontSize="small" />}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            sx={{mt:isMobileStorefront?0:'45px'}}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{vertical:'top',horizontal:'right'}}
            keepMounted
            transformOrigin={{vertical:isMobileStorefront?'bottom':'top',horizontal:'right'}}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {loggedInUser?.isAdmin && (
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography component={Link} color="text.primary" sx={{textDecoration:"none"}} to="/admin/add-product">
                  {'Add new Product'}
                </Typography>
              </MenuItem>
            )}
            {settings.map((setting) => (
              <MenuItem key={setting.to} onClick={handleCloseUserMenu}>
                <Typography component={Link} color="text.primary" sx={{textDecoration:"none"}} to={setting.to}>
                  {setting.name}
                </Typography>
              </MenuItem>
            ))}
            {isMobileStorefront && loggedInUser && (
              <MenuItem component={Link} to="/logout" onClick={handleCloseUserMenu}>
                Log out
              </MenuItem>
            )}
          </Menu>

          {isCustomer && is480 && (
            <Tooltip title={"My orders"}>
              <IconButton component={Link} to="/orders" aria-label={"Open orders"} sx={{color:'inherit'}}>
                <ReceiptLongOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}

          

          {loggedInUser?.isAdmin && <Button variant="contained" color="inherit" sx={{color:brandRed}}>{'Admin'}</Button>}
          {isProductList && (
            <IconButton onClick={handleToggleFilters} aria-label={"Toggle filters"} sx={{color:'inherit'}}>
              <TuneIcon sx={{color:isProductFilterOpen?"#fff":"inherit"}} />
            </IconButton>
          )}
        </Stack>
        {isMobileStorefront && !loggedInUser && (
          <Button
            component={Link}
            to="/login"
            state={{from:location}}
            size="small"
            sx={{
              flexShrink:0,
              px:1,
              minWidth:0,
              color:brandRed,
              bgcolor:'#fff',
              fontSize:{xs:'.68rem',sm:'.8rem'},
              fontWeight:700,
              whiteSpace:'nowrap',
              '&:hover':{bgcolor:'#fff5f5'}
            }}
          >
            {'تسجيل دخول'}
          </Button>
        )}
      </Toolbar>

      {isCustomer && categories.length > 0 && !isMobileStorefront && (
        <Box
          component="nav"
          aria-label={"Product categories"}
          sx={{
            bgcolor:'#fff',
            borderBottom:'1px solid #f1d0d0',
            color:'#3b3030'
          }}
        >
          <Box sx={{
            display:'flex',
            alignItems:'center',
            gap:{xs:1.5,sm:2.5},
            px:{xs:2,sm:3},
            minHeight:42,
            overflowX:'auto',
            whiteSpace:'nowrap',
            scrollbarWidth:'none',
            '&::-webkit-scrollbar':{display:'none'}
          }}>
            {rootCategories.map((category)=>(
              <Typography
                key={category._id}
                component={Link}
                to={`/category/${category._id}`}
                sx={{
                  flexShrink:0,
                  color:'#3b3030',
                  textDecoration:'none',
                  fontSize:{xs:12,sm:13},
                  fontWeight:600,
                  py:1.25,
                  borderBottom:'2px solid transparent',
                  '&:hover':{color:brandRed,borderBottomColor:brandRed}
                }}
              >
                {category.name}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </AppBar>
    {isMobileStorefront && (
      <>
        <BottomNavigation
          component="nav"
          aria-label="Storefront navigation"
          showLabels
          value={
            location.pathname==='/checkout'
              ? '/cart'
              : ['/','/orders','/wishlist','/cart'].includes(location.pathname)
              ? location.pathname
              : location.pathname.startsWith('/profile')
                ? 'account'
                : false
          }
          sx={{
            position:'fixed',
            left:0,
            right:0,
            bottom:0,
            zIndex:theme.zIndex.appBar,
            height:'calc(64px + env(safe-area-inset-bottom))',
            boxSizing:'border-box',
            pb:'env(safe-area-inset-bottom)',
            bgcolor:'#fff',
            borderTop:'1px solid #eadede',
            '& .MuiBottomNavigationAction-root':{
              minWidth:0,
              px:.25,
              color:'#6b5b5b',
              '&.Mui-selected':{color:brandRed}
            },
            '& .MuiBottomNavigationAction-label':{fontSize:'.62rem'}
          }}
        >
          <BottomNavigationAction component={Link} to="/" value="/" label="Home" icon={<HomeOutlinedIcon />} />
          <BottomNavigationAction component={Link} to="/orders" value="/orders" label="Orders" icon={<ReceiptLongOutlinedIcon />} />
          <BottomNavigationAction component={Link} to="/wishlist" value="/wishlist" label="Wishlist" icon={<Badge badgeContent={wishlistItems?.length} color="error"><FavoriteBorderIcon /></Badge>} />
          <BottomNavigationAction component={Link} to="/cart" value="/cart" label="Cart" icon={<Badge badgeContent={cartItems?.length || 0} color="error"><ShoppingCartOutlinedIcon /></Badge>} />
          <BottomNavigationAction
            value="account"
            label="Profile"
            icon={<PersonOutlineRoundedIcon />}
            onClick={handleOpenUserMenu}
          />
          {isProductList && (
            <BottomNavigationAction
              value="filters"
              label="Filter"
              icon={<TuneIcon />}
              onClick={handleToggleFilters}
              aria-label="Toggle filters"
            />
          )}
        </BottomNavigation>
        <Box aria-hidden="true" sx={{height:'calc(64px + env(safe-area-inset-bottom))'}} />
      </>
    )}
    </>
  )
}
