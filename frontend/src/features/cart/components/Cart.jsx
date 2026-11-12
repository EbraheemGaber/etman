import React, { useEffect } from 'react'
import { Box, Button, Chip, CircularProgress, Divider, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { SHIPPING, TAXES } from '../../../constants'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { resetCartItemRemoveStatus, selectCartItemRemoveStatus, selectCartItems, selectCartStatus } from '../CartSlice'
import { CartItem } from './CartItem'

const formatPrice = (price) => new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}).format(price)

export const Cart = ({ checkout }) => {
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
            toast.success('Product removed from cart')
        } else if (cartItemRemoveStatus === 'rejected') {
            toast.error('Error removing product from cart, please try again later')
        }
    }, [cartItemRemoveStatus])

    useEffect(() => () => {
        dispatch(resetCartItemRemoveStatus())
    }, [dispatch])

    if (!checkout && items.length === 0) {
        return (
            <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 4, backgroundColor: '#f3f4f7' }}>
                <Paper elevation={0} sx={{ width: '100%', maxWidth: 480, p: { xs: 3, sm: 5 }, borderRadius: 3, textAlign: 'center' }}>
                    {cartStatus === 'idle' || cartStatus === 'pending' ? (
                        <Stack alignItems="center" spacing={2}>
                            <CircularProgress aria-label="Loading cart" />
                            <Typography color="text.secondary">{'Loading your cart...'}</Typography>
                        </Stack>
                    ) : (
                        <Stack alignItems="center" spacing={2}>
                            <ShoppingCartOutlinedIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                            <Typography variant="h5" fontWeight={700}>{'Your cart is empty'}</Typography>
                            <Typography color="text.secondary">
                                {cartStatus === 'rejected'
                                    ? 'We could not load your cart. Please try again later.'
                                    : 'Looks like you have not added anything to your cart yet.'}
                            </Typography>
                            <Button component={Link} to="/" variant="contained" sx={{ mt: 1 }}>
                                {'Continue shopping'}
                            </Button>
                        </Stack>
                    )}
                </Paper>
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '70vh', backgroundColor: '#f3f4f7', py: { xs: 2, md: 4 }, px: { xs: 1.5, md: 3 } }}>
            <Stack
                direction={isMobile ? 'column' : 'row'}
                spacing={3}
                sx={{ width: '100%', maxWidth: 1120, mx: 'auto', alignItems: 'flex-start' }}
            >
                <Stack spacing={2} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 0.5 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#20232a' }}>
                            {checkout ? 'Review your order' : 'Shopping Cart'}
                        </Typography>
                        <Chip
                            label={`${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
                            size="small"
                            sx={{ backgroundColor: '#fff', fontWeight: 600 }}
                        />
                    </Stack>

                    <Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: 3, backgroundColor: '#fff' }}>
                        {items.map((item, index) => (
                            <React.Fragment key={item._id}>
                                <CartItem
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
                                {index < items.length - 1 && <Divider sx={{ borderStyle: 'dashed' }} />}
                            </React.Fragment>
                        ))}
                    </Paper>
                </Stack>

                <Stack spacing={2} sx={{ width: { xs: '100%', md: 340 }, flex: '0 0 auto' }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, backgroundColor: '#fff' }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography sx={{ fontWeight: 700, color: '#20232a' }}>{'Order Summary'}</Typography>
                            <Chip label={`${items.length} ${'items'}`} size="small" sx={{ backgroundColor: '#f5f5f7', fontSize: '0.75rem' }} />
                        </Stack>

                        <Stack spacing={1.6}>
                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                                <Typography variant="body2" color="text.secondary">{'Subtotal'}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>EGP {formatPrice(subtotal)}</Typography>
                            </Stack>
                            <Stack direction="row" justifyContent="space-between" spacing={2}>
                                <Typography variant="body2" color="text.secondary">{'Shipping'}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{checkout ? `EGP ${formatPrice(SHIPPING)}` : 'Calculated at checkout'}</Typography>
                            </Stack>
                            {checkout && (
                                <Stack direction="row" justifyContent="space-between" spacing={2}>
                                    <Typography variant="body2" color="text.secondary">{'Taxes'}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>EGP {formatPrice(TAXES)}</Typography>
                                </Stack>
                            )}
                        </Stack>

                        <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography sx={{ fontWeight: 700 }}>{'Total'}</Typography>
                            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                EGP {formatPrice(checkout ? total : subtotal)}
                            </Typography>
                        </Stack>
                        {!checkout && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                {'Shipping and taxes are calculated at checkout.'}
                            </Typography>
                        )}
                    </Paper>

                    {!checkout && (
                        <>
                            <Button
                                component={Link}
                                to="/checkout"
                                variant="contained"
                                fullWidth
                                sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 700, fontSize: '1rem' }}
                            >
                                {'Checkout'}
                            </Button>
                            <Button
                                component={Link}
                                to="/"
                                variant="outlined"
                                fullWidth
                                sx={{ py: 1.1, borderRadius: 2.5, borderColor: '#d6d8de', color: '#333', backgroundColor: '#fff' }}
                            >
                                {'Continue shopping'}
                            </Button>
                        </>
                    )}
                </Stack>
            </Stack>
        </Box>
    )
}
