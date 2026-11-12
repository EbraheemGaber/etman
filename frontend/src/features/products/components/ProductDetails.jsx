import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  Rating,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import Favorite from "@mui/icons-material/Favorite";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CachedOutlinedIcon from "@mui/icons-material/CachedOutlined";
import ZoomInOutlinedIcon from "@mui/icons-material/ZoomInOutlined";
import Lottie from "lottie-react";
import { toast } from "react-toastify";
import {
  clearSelectedProduct,
  fetchProductByIdAsync,
  resetProductFetchStatus,
  selectProductFetchStatus,
  selectSelectedProduct,
} from "../ProductSlice";
import {
  addToCartAsync,
  resetCartItemAddStatus,
  selectCartItemAddStatus,
  selectCartItems,
} from "../../cart/CartSlice";
import { selectLoggedInUser } from "../../auth/AuthSlice";
import {
  fetchReviewsByProductIdAsync,
  resetReviewFetchStatus,
  selectReviewFetchStatus,
  selectReviews,
} from "../../review/ReviewSlice";
import { Reviews } from "../../review/components/Reviews";
import {
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
  resetWishlistItemAddStatus,
  resetWishlistItemDeleteStatus,
  selectWishlistItemAddStatus,
  selectWishlistItemDeleteStatus,
  selectWishlistItems,
} from "../../wishlist/WishlistSlice";
import { loadingAnimation } from "../../../assets";

export const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const product = useSelector(selectSelectedProduct);
  const loggedInUser = useSelector(selectLoggedInUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const is500 = useMediaQuery(theme.breakpoints.down(500));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const canHoverZoom = useMediaQuery("(hover: hover) and (pointer: fine)");
  const cartItems = useSelector(selectCartItems);
  const cartItemAddStatus = useSelector(selectCartItemAddStatus);
  const reviews = useSelector(selectReviews);
  const wishlistItems = useSelector(selectWishlistItems);
  const productFetchStatus = useSelector(selectProductFetchStatus);
  const reviewFetchStatus = useSelector(selectReviewFetchStatus);
  const wishlistItemAddStatus = useSelector(selectWishlistItemAddStatus);
  const wishlistItemDeleteStatus = useSelector(selectWishlistItemDeleteStatus);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageZoomPosition, setImageZoomPosition] = useState(null);

  const isProductAlreadyInCart = cartItems.some(
    (item) => item.product._id === id,
  );
  const isProductAlreadyInWishlist = wishlistItems.some(
    (item) => item.product._id === id,
  );
  const isStorefrontCustomer =
    !loggedInUser?.isAdmin && !loggedInUser?.isSalesperson;
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? Math.ceil(
        reviews.reduce((total, review) => total + review.rating, 0) /
          totalReviews,
      )
    : 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductByIdAsync(id));
      dispatch(fetchReviewsByProductIdAsync(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (cartItemAddStatus === "fulfilled") {
      toast.success("تمت إضافة المنتج إلى السلة");
    } else if (cartItemAddStatus === "rejected") {
      toast.error("تعذر إضافة المنتج إلى السلة، يرجى المحاولة مرة أخرى");
    }
  }, [cartItemAddStatus]);

  useEffect(() => {
    if (wishlistItemAddStatus === "fulfilled") {
      toast.success("تمت إضافة المنتج إلى قائمة الأمنيات");
    } else if (wishlistItemAddStatus === "rejected") {
      toast.error(
        "تعذرت إضافة المنتج إلى قائمة الأمنيات، يرجى المحاولة مرة أخرى",
      );
    }
  }, [wishlistItemAddStatus]);

  useEffect(() => {
    if (wishlistItemDeleteStatus === "fulfilled") {
      toast.success("تمت إزالة المنتج من قائمة الأمنيات");
    } else if (wishlistItemDeleteStatus === "rejected") {
      toast.error(
        "تعذرت إزالة المنتج من قائمة الأمنيات، يرجى المحاولة مرة أخرى",
      );
    }
  }, [wishlistItemDeleteStatus]);

  useEffect(() => {
    if (productFetchStatus === "rejected") {
      toast.error("تعذر تحميل تفاصيل المنتج، يرجى المحاولة مرة أخرى");
    }
  }, [productFetchStatus]);

  useEffect(() => {
    if (reviewFetchStatus === "rejected") {
      toast.error("تعذر تحميل تقييمات المنتج، يرجى المحاولة مرة أخرى");
    }
  }, [reviewFetchStatus]);

  useEffect(
    () => () => {
      dispatch(clearSelectedProduct());
      dispatch(resetProductFetchStatus());
      dispatch(resetReviewFetchStatus());
      dispatch(resetWishlistItemDeleteStatus());
      dispatch(resetWishlistItemAddStatus());
      dispatch(resetCartItemAddStatus());
    },
    [dispatch],
  );

  const handleAddToCart = () => {
    if (!loggedInUser?.isVerified) {
      navigate("/login", { state: { from: location } });
      return;
    }
    dispatch(addToCartAsync({ user: loggedInUser._id, product: id, quantity }));
    setQuantity(1);
  };

  const handleWishlistToggle = () => {
    if (!loggedInUser?.isVerified) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (isProductAlreadyInWishlist) {
      const wishlistItem = wishlistItems.find(
        (item) => item.product._id === id,
      );
      if (wishlistItem) dispatch(deleteWishlistItemByIdAsync(wishlistItem._id));
    } else {
      dispatch(
        createWishlistItemAsync({ user: loggedInUser._id, product: id }),
      );
    }
  };

  const handleProductImageMouseMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setImageZoomPosition({ x, y });
  };

  const priceDisplay = product?.price
    ? new Intl.NumberFormat("en-US").format(product.price)
    : "0";
  return (
    <>
      {productFetchStatus === "rejected" && !product ? (
        <Stack
          dir="rtl"
          lang="ar"
          alignItems="center"
          justifyContent="center"
          sx={{
            minHeight: "60vh",
            p: 3,
            textAlign: "center",
            fontFamily: "Cairo, Tahoma, sans-serif",
            "& *:not(svg)": { fontFamily: "Cairo, Tahoma, sans-serif" },
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>
            {"تعذر تحميل تفاصيل المنتج"}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {"يرجى التأكد من اتصالك بالإنترنت أو إعادة المحاولة."}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              if (id) {
                dispatch(fetchProductByIdAsync(id));
                dispatch(fetchReviewsByProductIdAsync(id));
              }
            }}
            sx={{ px: 4, py: 1.2, borderRadius: 2 }}
          >
            {"إعادة المحاولة"}
          </Button>
        </Stack>
      ) : (
        <Stack
          dir="rtl"
          lang="ar"
          sx={{
            alignItems: "center",
            mb: "2rem",
            backgroundColor: "#f5f5f5",
            fontFamily: "Cairo, Tahoma, sans-serif",
            "& *:not(svg)": { fontFamily: "Cairo, Tahoma, sans-serif" },
          }}
        >
          {(productFetchStatus === "pending" || reviewFetchStatus === "pending") && !product ? (
            <Stack
              width={is500 ? "35vh" : "25rem"}
              height="calc(100vh - 4rem)"
              justifyContent="center"
              alignItems="center"
            >
              <Lottie animationData={loadingAnimation} />
            </Stack>
          ) : (
            <Stack
              sx={{
                width: "100%",
                maxWidth: "1280px",
                px: { xs: 2, lg: 0 },
                py: 3,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  direction: "ltr",
                  gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    md: "repeat(2, minmax(0, 1fr))",
                    lg: "minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1fr)",
                  },
                  gridTemplateAreas: {
                    xs: '"image" "details" "purchase"',
                    md: '"image details" "purchase purchase"',
                    lg: '"image details purchase"',
                  },
                  gap: 2,
                }}
              >
                <Stack
                  sx={{
                    gridArea: "image",
                    position: "relative",
                    minWidth: 0,
                    direction: "rtl",
                    p: { xs: 2, md: 3 },
                    border: "1px solid #e7e7e7",
                    borderRadius: "18px",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,.05)",
                  }}
                >
                  <IconButton
                    aria-label={
                      isProductAlreadyInWishlist
                        ? "إزالة من قائمة الأمنيات"
                        : "إضافة إلى قائمة الأمنيات"
                    }
                    onClick={handleWishlistToggle}
                    sx={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      zIndex: 1,
                      border: "1px solid #eee",
                      backgroundColor: "#fff",
                    }}
                  >
                    {isProductAlreadyInWishlist ? (
                      <Favorite sx={{ color: "#d32f2f" }} />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                  <Box
                    onMouseMove={
                      canHoverZoom ? handleProductImageMouseMove : undefined
                    }
                    onMouseLeave={() => setImageZoomPosition(null)}
                    sx={{
                      minHeight: { xs: 260, md: 360 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 2,
                      position: "relative",
                      overflow: "hidden",
                      cursor: canHoverZoom
                        ? imageZoomPosition
                          ? "zoom-out"
                          : "zoom-in"
                        : "default",
                    }}
                  >
                    <Box
                      component="img"
                      src={
                        product?.images?.[selectedImageIndex] ||
                        product?.thumbnail
                      }
                      alt={product?.title || "صورة المنتج"}
                      sx={{
                        display: "block",
                        width: "100%",
                        maxHeight: 380,
                        objectFit: "contain",
                        transform:
                          canHoverZoom && imageZoomPosition
                            ? "scale(2)"
                            : "scale(1)",
                        transformOrigin: imageZoomPosition
                          ? `${imageZoomPosition.x}% ${imageZoomPosition.y}%`
                          : "center",
                        transition: imageZoomPosition
                          ? "transform 80ms ease-out"
                          : "transform 180ms ease-out",
                      }}
                    />
                    {canHoverZoom && !imageZoomPosition && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{
                          position: "absolute",
                          left: 12,
                          bottom: 12,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: "rgba(255,255,255,.92)",
                          color: "text.secondary",
                          pointerEvents: "none",
                        }}
                      >
                        <ZoomInOutlinedIcon fontSize="small" />
                        <Typography variant="caption">
                          {"مرر المؤشر للتكبير"}
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                  {product?.images?.length > 1 && (
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      sx={{ overflowX: "auto", pt: 1 }}
                    >
                      {product.images.map((image, index) => (
                        <Box
                          key={`${image}-${index}`}
                          component="button"
                          type="button"
                          aria-label={`عرض صورة المنتج ${index + 1}`}
                          onClick={() => setSelectedImageIndex(index)}
                          sx={{
                            width: 56,
                            height: 56,
                            p: 0.5,
                            flex: "0 0 auto",
                            cursor: "pointer",
                            border:
                              selectedImageIndex === index
                                ? `2px solid ${theme.palette.primary.main}`
                                : "1px solid #ddd",
                            borderRadius: 2,
                            backgroundColor: "#fff",
                          }}
                        >
                          <Box
                            component="img"
                            src={image}
                            alt=""
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Stack>

                <Stack
                  sx={{
                    gridArea: "details",
                    minWidth: 0,
                    direction: "rtl",
                    p: { xs: 2.5, md: 3 },
                    border: "1px solid #e7e7e7",
                    borderRadius: "18px",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,.05)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "1.5rem", md: "1.85rem" },
                      fontWeight: 700,
                      lineHeight: 1.35,
                      color: "#101010",
                    }}
                  >
                    {product?.title}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    sx={{ mt: 1.5 }}
                  >
                    <Rating value={averageRating} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      (
                      {totalReviews === 0
                        ? "لا توجد تقييمات"
                        : `${totalReviews} تقييم`}
                      )
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          !product?.isUnlimitedStock &&
                          product?.stockQuantity <= 10
                            ? "error.main"
                            : "success.main",
                        fontWeight: 600,
                      }}
                    >
                      {product?.isUnlimitedStock
                        ? "متوفر"
                        : product?.stockQuantity <= 0
                          ? "غير متوفر"
                          : product?.stockQuantity <= 10
                            ? `متبقي ${product.stockQuantity} فقط`
                            : "متوفر"}
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      mt: 2,
                      color: "#555",
                      lineHeight: 1.8,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {product?.description}
                  </Typography>
                </Stack>

                <Stack
                  sx={{
                    gridArea: "purchase",
                    minWidth: 0,
                    direction: "rtl",
                    alignSelf: "start",
                    p: { xs: 2.5, md: 3 },
                    border: "1px solid #e7e7e7",
                    borderRadius: "18px",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,.05)",
                  }}
                >
                  <Typography sx={{ color: "#666", fontSize: "0.95rem" }}>
                    {"السعر"}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="baseline"
                    sx={{ mt: 0.5, mb: 2.5 }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: "2rem", md: "2.4rem" },
                        fontWeight: 600,
                        lineHeight: 1,
                        color: "#171717",
                      }}
                    >
                      {priceDisplay}
                    </Typography>
                    <Typography sx={{ fontSize: "1rem", color: "#555" }}>
                      جنيه مصري
                    </Typography>
                  </Stack>
                  {product?.priceIsEstimate && (
                    <Typography
                      sx={{
                        color: "warning.dark",
                        fontSize: ".9rem",
                        fontWeight: 600,
                        mb: 2,
                      }}
                    >
                      {"السعر تقديري — يرجى التأكد قبل الشراء"}
                    </Typography>
                  )}
                  {!loggedInUser?.isAdmin && (
                    <>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          mb: 2,
                          display:
                            isMobile && isStorefrontCustomer ? "none" : "flex",
                        }}
                      >
                        <Typography sx={{ fontWeight: 600 }}>
                          {"الكمية"}
                        </Typography>
                        <Stack
                          direction="row"
                          alignItems="center"
                          sx={{
                            border: "1px solid #ddd",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <Button
                            aria-label="تقليل الكمية"
                            onClick={() =>
                              setQuantity((current) => Math.max(1, current - 1))
                            }
                            disabled={quantity <= 1}
                            sx={{
                              minWidth: 42,
                              color: "#333",
                              fontSize: "1.2rem",
                            }}
                          >
                            −
                          </Button>
                          <Typography
                            sx={{ minWidth: 36, textAlign: "center" }}
                          >
                            {quantity}
                          </Typography>
                          <Button
                            aria-label="زيادة الكمية"
                            onClick={() =>
                              setQuantity((current) =>
                                product?.isUnlimitedStock
                                  ? current + 1
                                  : Math.min(
                                      product?.stockQuantity || 1,
                                      current + 1,
                                    ),
                              )
                            }
                            disabled={
                              !product?.isUnlimitedStock &&
                              quantity >= product?.stockQuantity
                            }
                            sx={{
                              minWidth: 42,
                              color: "#333",
                              fontSize: "1.2rem",
                            }}
                          >
                            +
                          </Button>
                        </Stack>
                      </Stack>
                      {isProductAlreadyInCart ? (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => navigate("/cart")}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            backgroundColor: "primary.main",
                            fontWeight: 700,
                            display:
                              isMobile && isStorefrontCustomer
                                ? "none"
                                : "inline-flex",
                          }}
                        >
                          {"عرض السلة"}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={handleAddToCart}
                          disabled={
                            !product?.isUnlimitedStock &&
                            !product?.stockQuantity
                          }
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            backgroundColor: "primary.main",
                            fontWeight: 700,
                            display:
                              isMobile && isStorefrontCustomer
                                ? "none"
                                : "inline-flex",
                            "&:hover": { backgroundColor: "primary.dark" },
                          }}
                        >
                          {"إضافة إلى السلة"}
                        </Button>
                      )}
                    </>
                  )}
                  <Box
                    sx={{ height: "1px", backgroundColor: "#e8e8e8", my: 2.5 }}
                  />
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1.3} alignItems="center">
                      <LocalShippingOutlinedIcon sx={{ color: "#555" }} />
                      <Typography variant="body2">
                        {"توصيل سريع وآمن"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.3} alignItems="center">
                      <CachedOutlinedIcon sx={{ color: "#555" }} />
                      <Typography variant="body2">
                        {"سياسة إرجاع خلال 30 يومًا"}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Box>

              <Stack width="100%" sx={{ mt: 4 }}>
                <Reviews productId={id} averageRating={averageRating} />
              </Stack>
            </Stack>
          )}
        </Stack>
      )}
      {isMobile &&
        isStorefrontCustomer &&
        Boolean(product) && (
          <>
            <Box
              aria-hidden="true"
              sx={{ height: "calc(80px + env(safe-area-inset-bottom))" }}
            />
            <Stack
              component="section"
              aria-label="إضافة المنتج إلى السلة"
              direction="row"
              alignItems="center"
              spacing={1.5}
              dir="rtl"
              lang="ar"
              sx={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: "calc(64px + env(safe-area-inset-bottom))",
                zIndex: theme.zIndex.appBar,
                px: 2,
                py: 1.25,
                bgcolor: "#fff",
                borderTop: "1px solid #e2e2e2",
                boxShadow: "0 -4px 16px rgba(0,0,0,.08)",
                fontFamily: "Cairo, Tahoma, sans-serif",
                "& *:not(svg)": { fontFamily: "Cairo, Tahoma, sans-serif" },
              }}
            >
              {/* Stepper (+ 1 −) */}
              <Stack
                direction="row"
                alignItems="center"
                dir="ltr"
                sx={{
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "#fff",
                  flexShrink: 0,
                  height: 46,
                }}
              >
                <Button
                  aria-label="زيادة الكمية"
                  onClick={() =>
                    setQuantity((current) =>
                      product?.isUnlimitedStock
                        ? current + 1
                        : Math.min(product?.stockQuantity || 1, current + 1),
                    )
                  }
                  disabled={
                    !product?.isUnlimitedStock &&
                    quantity >= product?.stockQuantity
                  }
                  sx={{
                    minWidth: 38,
                    height: "100%",
                    color: "#222",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    p: 0,
                  }}
                >
                  +
                </Button>
                <Typography
                  aria-live="polite"
                  sx={{
                    minWidth: 34,
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#111",
                  }}
                >
                  {quantity}
                </Typography>
                <Button
                  aria-label="تقليل الكمية"
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  disabled={quantity <= 1}
                  sx={{
                    minWidth: 38,
                    height: "100%",
                    color: "#222",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                    p: 0,
                  }}
                >
                  −
                </Button>
              </Stack>

              {/* Add to Cart / View Cart button in the same row */}
              {isProductAlreadyInCart ? (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate("/cart")}
                  sx={{
                    flex: 1,
                    height: 46,
                    borderRadius: 2,
                    backgroundColor: "primary.main",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#fff",
                    whiteSpace: "nowrap",
                    boxShadow: "none",
                    "&:hover": { backgroundColor: "primary.dark" },
                  }}
                >
                  {"عرض السلة"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleAddToCart}
                  disabled={
                    !product?.isUnlimitedStock && !product?.stockQuantity
                  }
                  sx={{
                    flex: 1,
                    height: 46,
                    borderRadius: 2,
                    backgroundColor: "primary.main",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#fff",
                    whiteSpace: "nowrap",
                    boxShadow: "none",
                    "&:hover": { backgroundColor: "primary.dark" },
                  }}
                >
                  {"إضافة إلى السلة"}
                </Button>
              )}
            </Stack>
          </>
        )}
    </>
  );
};
