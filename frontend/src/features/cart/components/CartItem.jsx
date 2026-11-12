import React from 'react'
import { Box, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import RemoveIcon from '@mui/icons-material/Remove'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { deleteCartItemByIdAsync, updateCartItemByIdAsync } from '../CartSlice'

const formatPrice = (price) => new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}).format(price)

export const CartItem = ({ id, thumbnail, title, category, brand, price, quantity, stockQuantity, isUnlimitedStock, productId }) => {
    const dispatch = useDispatch()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down(600))

    const handleAddQty = () => {
        if (isUnlimitedStock || quantity < stockQuantity) {
            dispatch(updateCartItemByIdAsync({ _id: id, quantity: quantity + 1 }))
        }
    }

    const handleRemoveQty = () => {
        if (quantity === 1) {
            dispatch(deleteCartItemByIdAsync(id))
        } else {
            dispatch(updateCartItemByIdAsync({ _id: id, quantity: quantity - 1 }))
        }
    }

    return (
        <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={2}
            sx={{ p: { xs: 2, sm: 2.5 }, alignItems: { xs: 'stretch', sm: 'flex-start' }, backgroundColor: '#fff' }}
        >
            <Stack
                component={Link}
                to={`/product-details/${productId}`}
                sx={{
                    width: { xs: '100%', sm: 104 },
                    height: { xs: 200, sm: 112 },
                    flex: '0 0 auto',
                    borderRadius: 2.5,
                    backgroundColor: '#f5f6f8',
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box component="img" src={thumbnail} alt={title} sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 1 }} />
            </Stack>

            <Stack sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
                    <Stack sx={{ minWidth: 0 }}>
                        {brand && (
                            <Typography
                                variant="caption"
                                sx={{ alignSelf: 'flex-start', mb: 0.6, px: 0.8, py: 0.15, borderRadius: 0.6, backgroundColor: '#f0f1f4', color: '#3e434d', fontWeight: 700 }}
                            >
                                {brand}
                            </Typography>
                        )}
                        <Typography
                            component={Link}
                            to={`/product-details/${productId}`}
                            sx={{ textDecoration: 'none', color: '#20232a', fontWeight: 600, lineHeight: 1.45, '&:hover': { color: 'primary.main' } }}
                        >
                            {title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            {category}
                        </Typography>
                    </Stack>

                    <Stack alignItems="flex-end" spacing={0.5} sx={{ flex: '0 0 auto' }}>
                        <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>EGP {formatPrice(price * quantity)}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                            EGP {formatPrice(price)} each
                        </Typography>
                        <IconButton
                            aria-label={`${'Remove'} ${title} ${'from cart'}`}
                            size="small"
                            onClick={() => dispatch(deleteCartItemByIdAsync(id))}
                            sx={{ mt: 0.2, border: '1px solid #e6e7eb', borderRadius: 1.5, color: '#555' }}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Stack>

                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mt: 1.5, gap: 1, flexWrap: 'wrap' }}
                >
                    <Typography variant="caption" sx={{ color: '#47745a', backgroundColor: '#edf7ef', px: 1, py: 0.45, borderRadius: 1 }}>
                        {isUnlimitedStock || stockQuantity > 0 ? 'In stock' : 'Out of stock'}
                    </Typography>
                    <Stack direction="row" alignItems="center" sx={{ border: '1px solid #e1e2e6', borderRadius: 1.5, overflow: 'hidden' }}>
                        <IconButton aria-label={"Decrease quantity"} size="small" onClick={handleRemoveQty} sx={{ borderRadius: 0 }}>
                            <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ minWidth: 28, textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                            {quantity}
                        </Typography>
                        <IconButton aria-label={"Increase quantity"} size="small" onClick={handleAddQty} disabled={!isUnlimitedStock && quantity >= stockQuantity} sx={{ borderRadius: 0 }}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Stack>
            </Stack>
        </Stack>
    )
}
