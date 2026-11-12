import React, { useEffect } from 'react'
import { Box, Button, Chip, CircularProgress, Divider, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { SHIPPING, TAXES } from '../../../constants'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { resetCartItemRemoveStatus, selectCartItemRemoveStatus, selectCartItems, selectCartStatus } from '../CartSlice'
import { CartItem } from './CartItem'

const formatPrice = (price, arabic = false) => new Intl.NumberFormat(
    arabic ? 'ar-EG-u-nu-latn' : 'en-US',
    arabic
        ? { maximumFractionDigits: 2 }
        : { minimumFractionDigits: 2, maximumFractionDigits: 2 }
).format(price)

export const Cart = ({ checkout, arabic: arabicOverride }) => {
    const arabic = arabicOverride ?? !checkout
    const items = useSelector(selectCartItems)
    const cartStatus = useSelector(selectCartStatus)
    const subtotal = items.reduce((total, item) => item.product.price * item.quantity + total, 0)
    const totalItems = items.reduce((total, item) => total + item.quantity, 0)
    const navigate = useNavigate()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down(900))
    const cartItemRemoveStatus = useSelector(selectCartItemRemoveStatus)
    const dispatch = useDispatch()
    const total = subtotal + SHIPPING + TAXES

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
    }, [])

    useEffect(() => {
        if (checkout && cartStatus === 'fulfilled' && items.length === 0) {
            navigate('/cart')
        }
    }, [cartStatus, checkout, items.length, navigate])

    useEffect(() => {
        if (cartItemRemoveStatus === 'fulfilled') {
            toast.success(arabic ? 'تم حذف المنتج من سلة التسوق' : 'Product removed from cart')
        } else if (cartItemRemoveStatus === 'rejected') {
            toast.error(arabic
                ? 'تعذر حذف المنتج من سلة التسوق. يرجى المحاولة لاحقًا.'
                : 'Error removing product from cart, please try again later')
        }
    }, [arabic, cartItemRemoveStatus])

    useEffect(() => () => {
        dispatch(resetCartItemRemoveStatus())
    }, [dispatch])

    if (!checkout && items.length === 0) {
        return (
            <Box
                dir={arabic ? 'rtl' : undefined}
                lang={arabic ? 'ar' : undefined}
                sx={{
                    minHeight: '70vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 2,
                    py: 4,
                    pb: { xs: 'calc(64px + env(safe-area-inset-bottom) + 1rem)', sm: 4 },
                    backgroundColor: '#f3f4f7',
                    ...(arabic ? { fontFamily: 'Cairo, Tahoma, sans-serif', '& *:not(svg)': { fontFamily: 'Cairo, Tahoma, sans-serif' } } : {})
                }}
            >
                <Paper elevation={0} sx={{ width: '100%', maxWidth: 480, p: { xs: 3, sm: 5 }, borderRadius: arabic ? 1 : 3, textAlign: 'center' }}>
                    {cartStatus === 'idle' || cartStatus === 'pending' ? (
                        <Stack alignItems="center" spacing={2}>
                            <CircularProgress aria-label={arabic ? 'جارٍ تحميل السلة' : 'Loading cart'} />
                            <Typography color="text.secondary">{arabic ? 'جارٍ تحميل سلة التسوق...' : 'Loading your cart...'}</Typography>
                        </Stack>
                    ) : (
                        <Stack alignItems="center" spacing={2}>
                            <ShoppingCartOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                            <Typography variant="h5" fontWeight={700}>{arabic ? 'سلة التسوق فارغة' : 'Your cart is empty'}</Typography>
                            <Typography color="text.secondary">
                                {cartStatus === 'rejected'
                                    ? (arabic ? 'تعذر تحميل سلة التسوق. يرجى المحاولة مرة أخرى لاحقًا.' : 'We could not load your cart. Please try again later.')
                                    : (arabic ? 'لم تضف أي منتجات إلى سلة التسوق بعد.' : 'Looks like you have not added anything to your cart yet.')}
                            </Typography>
                            <Button component={Link} to="/" variant="contained" sx={{ mt: 1 }}>
                                {arabic ? 'مواصلة التسوق' : 'Continue shopping'}
                            </Button>
                        </Stack>
                    )}
                </Paper>
            </Box>
        )
    }

    return (
        <Box
            dir={arabic ? 'rtl' : undefined}
            lang={arabic ? 'ar' : undefined}
            sx={{
                minHeight: '70vh',
                backgroundColor: '#f3f4f7',
                py: { xs: 2, md: 4 },
                pb: { xs: 'calc(64px + env(safe-area-inset-bottom) + 1rem)', md: 4 },
                px: { xs: 1.5, md: 3 },
                ...(arabic ? { fontFamily: 'Cairo, Tahoma, sans-serif', '& *:not(svg)': { fontFamily: 'Cairo, Tahoma, sans-serif' } } : {})
            }}
        >
            <Stack
                direction={isMobile ? 'column' : 'row'}
                dir={arabic ? 'ltr' : undefined}
                spacing={3}
                sx={{ width: '100%', maxWidth: arabic ? 840 : 1120, mx: 'auto', alignItems: 'flex-start' }}
            >
                <Stack spacing={2} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                    <Stack direction="row" dir={arabic ? 'rtl' : undefined} alignItems="center" justifyContent="space-between" sx={{ px: 0.5 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#20232a' }}>
                            {checkout ? (arabic ? 'مراجعة طلبك' : 'Review your order') : 'سلة التسوق'}
                        </Typography>
                        <Chip
                            label={arabic
                                ? `${totalItems} ${totalItems === 1 ? 'منتج' : 'منتجات'}`
                                : `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
                            size="small"
                            sx={{ backgroundColor: '#fff', fontWeight: 600, ...(arabic ? { direction: 'rtl' } : {}) }}
                        />
                    </Stack>
                    <Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: arabic ? 0 : 3, backgroundColor: '#fff' }}>
                        {items.map((item, index) => (
                            <React.Fragment key={item._id}>
                                <CartItem
                                    arabic={arabic}
                                    id={item._id}
                                    title={item.product.title}
                                    brand={item.product.brand.name}
                                    category={item.product.category.name}
                                    price={item.product.price}
                                    quantity={item.quantity}
                                    thumbnail={item.product.thumbnail}
                                    stockQuantity={item.product.stockQuantity}
                                    isUnlimitedStock={item.product.isUnlimitedStock}
                                    productId={item.product._id}
                                />
                                {index < items.length - 1 && <Divider sx={{ borderStyle: 'dashed', borderColor: '#e5e5e5' }} />}
                            </React.Fragment>
                        ))}
                    </Paper>
                </Stack>

                <Stack spacing={2} sx={{ width: { xs: '100%', md: arabic ? 280 : 340 }, flex: '0 0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: arabic ? 3 : 3,
                                backgroundColor: arabic && checkout ? '#fffaf9' : '#fff',
                                border: arabic && checkout ? '1px solid #f1dfdd' : 'none',
                                boxShadow: arabic && checkout ? '0 12px 28px rgba(126, 36, 36, 0.05)' : 'none',
                            }}
                        >
                            <Stack direction="row" dir={arabic ? 'rtl' : undefined} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                <Typography sx={{ fontWeight: 800, color: '#1d1d1d', fontSize: arabic && checkout ? '1.5rem' : undefined, fontFamily: arabic && checkout ? 'Cairo, Tahoma, sans-serif' : undefined }}>
                                    {arabic ? 'مراجعة الطلب' : 'Order Summary'}
                                </Typography>
                                <Chip
                                    label={arabic
                                        ? `${items.length} ${items.length === 1 ? 'منتج' : 'منتجات'}`
                                        : `${items.length} items`}
                                    size="small"
                                    sx={{
                                        backgroundColor: arabic && checkout ? '#f9e5e4' : '#f5f5f7',
                                        color: arabic && checkout ? '#b71c1c' : undefined,
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        ...(arabic ? { direction: 'rtl' } : {})
                                    }}
                                />
                            </Stack>

                            <Stack spacing={1.6}>
                                <Stack direction="row" dir={arabic ? 'rtl' : undefined} justifyContent="space-between" spacing={2}>
                                    <Typography variant="body2" color="text.secondary">{arabic ? 'المجموع الفرعي' : 'Subtotal'}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {arabic ? `${formatPrice(subtotal, true)} ج.م` : `EGP ${formatPrice(subtotal)}`}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" dir={arabic ? 'rtl' : undefined} justifyContent="space-between" spacing={2}>
                                    <Typography variant="body2" color="text.secondary">{arabic ? 'الشحن' : 'Shipping'}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {checkout
                                            ? (arabic ? `${formatPrice(SHIPPING, true)} ج.م` : `EGP ${formatPrice(SHIPPING)}`)
                                            : (arabic ? 'يُحسب عند إتمام الطلب' : 'Calculated at checkout')}
                                    </Typography>
                                </Stack>
                                {checkout && (
                                    <Stack direction="row" dir={arabic ? 'rtl' : undefined} justifyContent="space-between" spacing={2}>
                                        <Typography variant="body2" color="text.secondary">{arabic ? 'الضرائب' : 'Taxes'}</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {arabic ? `${formatPrice(TAXES, true)} ج.م` : `EGP ${formatPrice(TAXES)}`}
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>

                            <Divider sx={{ my: 2, borderStyle: 'dashed', borderColor: arabic && checkout ? '#f0d9d5' : undefined }} />
                            <Stack direction="row" dir={arabic ? 'rtl' : undefined} justifyContent="space-between" alignItems="center">
                                <Typography sx={{ fontWeight: 800, fontFamily: arabic && checkout ? 'Cairo, Tahoma, sans-serif' : undefined }}>{arabic ? 'الإجمالي' : 'Total'}</Typography>
                                <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: arabic && checkout ? '#b71c1c' : undefined, fontFamily: arabic && checkout ? 'Cairo, Tahoma, sans-serif' : undefined }}>
                                    {arabic ? `${formatPrice(total, true)} ج.م` : `EGP ${formatPrice(checkout ? total : subtotal)}`}
                                </Typography>
                            </Stack>
                            {!checkout && (
                                <Typography dir="rtl" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                                    {'يتم حساب تكلفة الشحن والضرائب عند إتمام الطلب.'}
                                </Typography>
                            )}
                        </Paper>
                    </motion.div>

                    {!checkout && (
                        <>
                            <Button
                                component={Link}
                                to="/checkout"
                                variant="contained"
                                fullWidth
                                sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 700, fontSize: '1rem' }}
                            >
                                {arabic ? 'إتمام الشراء' : 'Checkout'}
                            </Button>
                            <Button
                                component={Link}
                                to="/"
                                variant="outlined"
                                fullWidth
                                sx={{ py: 1.1, borderRadius: 2.5, borderColor: '#d6d8de', color: '#333', backgroundColor: '#fff' }}
                            >
                                {arabic ? 'مواصلة التسوق' : 'Continue shopping'}
                            </Button>
                        </>
                    )}
                </Stack>
            </Stack>
        </Box>
    )
}
