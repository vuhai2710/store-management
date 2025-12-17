// src/components/homepage/OnSaleSlider.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Clock, Flame } from 'lucide-react';
import { formatPrice, getImageUrl } from '../../utils/formatUtils';
import { productsService } from '../../services/productsService';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/styles';

/**
 * OnSaleSlider - Slider component for products on sale (Flash Sale)
 * Fetches data once on mount, countdown updates locally without refetching
 */
const OnSaleSlider = ({ handleViewProductDetail, onLoginClick, onShopClick }) => {
    const { isAuthenticated } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [countdowns, setCountdowns] = useState({});
    const [overallCountdown, setOverallCountdown] = useState(undefined);
    const sliderRef = useRef(null);
    const autoScrollRef = useRef(null);

    // Items to show based on screen width
    const itemsToShow = 4;

    // Fetch products on sale ONCE on mount
    useEffect(() => {
        const fetchProductsOnSale = async () => {
            try {
                if (!isAuthenticated) {
                    setProducts([]);
                    setLoading(false);
                    return;
                }
                setLoading(true);
                const data = await productsService.getProductsOnSale();
                console.log('🔥 Flash Sale API Response:', data);
                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching products on sale:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsOnSale();
    }, [isAuthenticated]);

    // Calculate time left for countdown
    const calculateTimeLeft = useCallback((endTime) => {
        if (!endTime) return undefined;

        let end;
        // Handle different date formats from API
        if (Array.isArray(endTime)) {
            // Java LocalDateTime comes as array: [year, month, day, hour, minute, second, nano]
            const [yearRaw, monthRaw, dayRaw, hourRaw = 0, minuteRaw = 0, secondRaw = 0] = endTime;
            const year = Number(yearRaw);
            const month = Number(monthRaw);
            const day = Number(dayRaw);
            const hour = Number(hourRaw);
            const minute = Number(minuteRaw);
            const second = Number(secondRaw);
            if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
                end = new Date(year, month - 1, day, hour, minute, second);
            } else {
                return undefined;
            }
        } else if (typeof endTime === 'string') {
            end = new Date(endTime);
            if (isNaN(end.getTime())) {
                const normalized = endTime.includes(' ') ? endTime.replace(' ', 'T') : endTime;
                end = new Date(normalized);
            }
            if (isNaN(end.getTime())) {
                const m = endTime.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
                if (m) {
                    const year = Number(m[1]);
                    const month = Number(m[2]);
                    const day = Number(m[3]);
                    const hour = Number(m[4]);
                    const minute = Number(m[5]);
                    const second = Number(m[6] ?? 0);
                    end = new Date(year, month - 1, day, hour, minute, second);
                }
            }
            if (isNaN(end.getTime())) {
                // dd/MM/yyyy HH:mm:ss (common in VN locale)
                const m = endTime.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
                if (m) {
                    const day = Number(m[1]);
                    const month = Number(m[2]);
                    const year = Number(m[3]);
                    const hour = Number(m[4] ?? 0);
                    const minute = Number(m[5] ?? 0);
                    const second = Number(m[6] ?? 0);
                    end = new Date(year, month - 1, day, hour, minute, second);
                }
            }
        } else if (endTime instanceof Date) {
            end = endTime;
        } else if (typeof endTime === 'object') {
            // Some serializers send LocalDateTime as an object
            // Examples:
            // - { year, monthValue, dayOfMonth, hour, minute, second, nano }
            // - { year, month, day, hour, minute, second }
            const year = Number(endTime.year);
            const month = Number(endTime.monthValue ?? endTime.month);
            const day = Number(endTime.dayOfMonth ?? endTime.day);
            const hour = Number(endTime.hour ?? 0);
            const minute = Number(endTime.minute ?? 0);
            const second = Number(endTime.second ?? 0);

            if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
                end = new Date(year, month - 1, day, hour, minute, second);
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }

        if (isNaN(end.getTime())) {
            return undefined; // Invalid date
        }

        const difference = end - new Date();

        if (difference <= 0) {
            return null; // Expired
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }, []);

    // Update countdown timers every second WITHOUT refetching
    useEffect(() => {
        if (products.length === 0) return;

        const updateCountdowns = () => {
            const newCountdowns = {};
            let minSecondsLeft = Infinity;
            let minTimeLeft;

            products.forEach(product => {
                const timeLeft = calculateTimeLeft(product.promotionEndTime);
                if (timeLeft) {
                    newCountdowns[product.productId] = timeLeft;

                    const secondsLeft =
                        (timeLeft.days || 0) * 24 * 60 * 60 +
                        (timeLeft.hours || 0) * 60 * 60 +
                        (timeLeft.minutes || 0) * 60 +
                        (timeLeft.seconds || 0);
                    if (secondsLeft < minSecondsLeft) {
                        minSecondsLeft = secondsLeft;
                        minTimeLeft = timeLeft;
                    }
                }
            });

            setCountdowns(newCountdowns);
            setOverallCountdown(minTimeLeft);
        };

        updateCountdowns();
        const timer = setInterval(updateCountdowns, 1000);

        return () => clearInterval(timer);
    }, [products, calculateTimeLeft]);

    // Auto-scroll
    useEffect(() => {
        if (products.length <= itemsToShow) return;

        autoScrollRef.current = setInterval(() => {
            setCurrentIndex(prev => {
                const maxIndex = Math.max(0, products.length - itemsToShow);
                return prev >= maxIndex ? 0 : prev + 1;
            });
        }, 4000);

        return () => {
            if (autoScrollRef.current) {
                clearInterval(autoScrollRef.current);
            }
        };
    }, [products.length, itemsToShow]);

    // Navigate to previous slide
    const handlePrev = () => {
        if (autoScrollRef.current) {
            clearInterval(autoScrollRef.current);
        }
        setCurrentIndex(prev => (prev === 0 ? Math.max(0, products.length - itemsToShow) : prev - 1));
    };

    // Navigate to next slide
    const handleNext = () => {
        if (autoScrollRef.current) {
            clearInterval(autoScrollRef.current);
        }
        const maxIndex = Math.max(0, products.length - itemsToShow);
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    };

    // Format countdown display
    const formatCountdown = (timeLeft) => {
        if (!timeLeft) return null;

        const pad = (num) => String(num).padStart(2, '0');

        return (
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                {timeLeft.days > 0 && (
                    <span style={countdownItemStyle}>
                        <span style={countdownValueStyle}>{pad(timeLeft.days)}</span>
                        <span style={countdownLabelStyle}>ngày</span>
                    </span>
                )}
                <span style={countdownItemStyle}>
                    <span style={countdownValueStyle}>{pad(timeLeft.hours)}</span>
                    <span style={countdownLabelStyle}>giờ</span>
                </span>
                <span style={{ color: '#dc3545', fontWeight: 'bold' }}>:</span>
                <span style={countdownItemStyle}>
                    <span style={countdownValueStyle}>{pad(timeLeft.minutes)}</span>
                    <span style={countdownLabelStyle}>phút</span>
                </span>
                <span style={{ color: '#dc3545', fontWeight: 'bold' }}>:</span>
                <span style={countdownItemStyle}>
                    <span style={countdownValueStyle}>{pad(timeLeft.seconds)}</span>
                    <span style={countdownLabelStyle}>giây</span>
                </span>
            </div>
        );
    };

    // Styles
    const countdownItemStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#fff3f3',
        padding: '0.25rem 0.4rem',
        borderRadius: '0.375rem',
        minWidth: '40px',
    };

    const countdownValueStyle = {
        fontSize: '0.875rem',
        fontWeight: 'bold',
        color: '#dc3545',
    };

    const countdownLabelStyle = {
        fontSize: '0.625rem',
        color: '#6c757d',
        textTransform: 'uppercase',
    };

    const productCardStyle = {
        minWidth: 'calc(25% - 0.75rem)',
        maxWidth: 'calc(25% - 0.75rem)',
        backgroundColor: '#fff',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.3s, box-shadow 0.3s',
        position: 'relative',
        flexShrink: 0,
    };

    const discountBadgeStyle = {
        position: 'absolute',
        top: '0.75rem',
        left: '0.75rem',
        backgroundColor: '#dc3545',
        color: '#fff',
        padding: '0.375rem 0.75rem',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        zIndex: 2,
    };

    const navButtonStyle = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transition: 'transform 0.2s, background-color 0.2s',
        zIndex: 10,
    };

    if (loading) {
        return (
            <section style={{ padding: '4rem 0', backgroundColor: '#f0f4f8' }}>
                <div style={styles.container}>
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '3px solid #e9ecef',
                            borderTopColor: '#dc3545',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto'
                        }} />
                    </div>
                </div>
            </section>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (products.length === 0) {
        return (
            <section style={{ padding: '4rem 0', backgroundColor: '#fff5f5' }}>
                <div style={styles.container}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)',
                                padding: '0.75rem',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Flame size={28} color="#fff" />
                            </div>
                            <div>
                                <h2 style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 'bold',
                                    margin: 0,
                                    background: 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                    Flash Sale 🔥
                                </h2>
                                <p style={{ color: '#6c757d', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                                    Hiện chưa có sản phẩm Flash Sale.
                                </p>
                            </div>
                        </div>

                        {onShopClick && (
                            <button
                                onClick={onShopClick}
                                style={{ ...styles.buttonSecondary, padding: '0.75rem 1.25rem' }}
                            >
                                Xem sản phẩm
                            </button>
                        )}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section style={{ padding: '4rem 0', background: 'linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%)' }}>
            <div style={styles.container}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)',
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Flame size={28} color="#fff" />
                        </div>
                        <div>
                            <h2 style={{
                                fontSize: '1.75rem',
                                fontWeight: 'bold',
                                margin: 0,
                                background: 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                Flash Sale 🔥
                            </h2>
                            <p style={{ color: '#6c757d', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                                Ưu đãi có thời hạn, nhanh tay kẻo lỡ!
                            </p>
                        </div>
                    </div>

                    {/* Overall countdown indicator */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: '#fff',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.75rem',
                        boxShadow: '0 2px 8px rgba(220, 53, 69, 0.15)',
                    }}>
                        <Clock size={18} color="#dc3545" />
                        {overallCountdown ? (
                            formatCountdown(overallCountdown)
                        ) : (
                            <span style={{ color: '#dc3545', fontWeight: '600', fontSize: '0.875rem' }}>
                                --:--:--
                            </span>
                        )}
                    </div>
                </div>

                {/* Slider Container */}
                <div style={{ position: 'relative' }}>
                    {/* Previous Button */}
                    {products.length > itemsToShow && (
                        <button
                            onClick={handlePrev}
                            style={{ ...navButtonStyle, left: '-22px' }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#f8f9fa';
                                e.target.style.transform = 'translateY(-50%) scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#fff';
                                e.target.style.transform = 'translateY(-50%)';
                            }}
                        >
                            <ChevronLeft size={24} color="#333" />
                        </button>
                    )}

                    {/* Products Track */}
                    <div style={{ overflow: 'hidden', borderRadius: '0.75rem' }}>
                        <div
                            ref={sliderRef}
                            style={{
                                display: 'flex',
                                transition: 'transform 0.5s ease-in-out',
                                transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
                                gap: '1rem',
                            }}
                        >
                            {products.map((product) => (
                                <div
                                    key={product.productId}
                                    style={productCardStyle}
                                    onClick={() => handleViewProductDetail && handleViewProductDetail(product.productId)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                                    }}
                                >
                                    {/* Discount Badge */}
                                    {product.discountLabel && (
                                        <div style={discountBadgeStyle}>
                                            <Flame size={14} />
                                            {product.discountLabel}
                                        </div>
                                    )}

                                    {/* Product Image */}
                                    <div style={{
                                        height: '180px',
                                        backgroundColor: '#f8f9fa',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '1rem',
                                        overflow: 'hidden',
                                    }}>
                                        {product.image ? (
                                            <img
                                                src={getImageUrl(product.image)}
                                                alt={product.name}
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    objectFit: 'contain',
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentNode.innerHTML = '<span style="font-size: 4rem;">📦</span>';
                                                }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '4rem' }}>📦</span>
                                        )
                                        }
                                    </div>

                                    {/* Product Info */}
                                    <div style={{ padding: '1rem' }}>
                                        {/* Product Name */}
                                        <h3 style={{
                                            fontSize: '0.95rem',
                                            fontWeight: '600',
                                            marginBottom: '0.75rem',
                                            color: '#212529',
                                            lineHeight: '1.4',
                                            height: '2.8em',
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }}>
                                            {product.name}
                                        </h3>

                                        {/* Prices */}
                                        <div style={{ marginBottom: '0.75rem' }}>
                                            <span style={{
                                                fontSize: '1.125rem',
                                                fontWeight: 'bold',
                                                color: '#dc3545',
                                                display: 'block',
                                            }}>
                                                {formatPrice(product.discountedPrice)}
                                            </span>
                                            <span style={{
                                                fontSize: '0.875rem',
                                                color: '#6c757d',
                                                textDecoration: 'line-through',
                                            }}>
                                                {formatPrice(product.originalPrice)}
                                            </span>
                                        </div>

                                        {/* Countdown */}
                                        <div style={{
                                            borderTop: '1px solid #e9ecef',
                                            paddingTop: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            {(countdowns[product.productId] || overallCountdown) ? (
                                                formatCountdown(countdowns[product.productId] || overallCountdown)
                                            ) : (
                                                <span style={{ color: '#dc3545', fontSize: '0.8rem', fontWeight: '500' }}>--:--:--</span>
                                            )}
                                        </div>

                                        {/* Stock indicator */}
                                        {product.remainingStock && product.remainingStock < 10 && (
                                            <div style={{
                                                marginTop: '0.5rem',
                                                padding: '0.375rem 0.5rem',
                                                backgroundColor: '#fff3cd',
                                                borderRadius: '0.375rem',
                                                textAlign: 'center',
                                                fontSize: '0.75rem',
                                                color: '#856404',
                                                fontWeight: '500',
                                            }}>
                                                ⚡ Chỉ còn {product.remainingStock} sản phẩm
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Next Button */}
                    {products.length > itemsToShow && (
                        <button
                            onClick={handleNext}
                            style={{ ...navButtonStyle, right: '-22px' }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#f8f9fa';
                                e.target.style.transform = 'translateY(-50%) scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#fff';
                                e.target.style.transform = 'translateY(-50%)';
                            }}
                        >
                            <ChevronRight size={24} color="#333" />
                        </button>
                    )}
                </div>

                {/* Dots indicator */}
                {products.length > itemsToShow && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginTop: '1.5rem',
                    }}>
                        {Array.from({ length: Math.ceil(products.length - itemsToShow + 1) }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                style={{
                                    width: currentIndex === index ? '24px' : '8px',
                                    height: '8px',
                                    borderRadius: '4px',
                                    backgroundColor: currentIndex === index ? '#dc3545' : '#e9ecef',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* CSS Animation for spinner */}
            <style>
                {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
            </style>
        </section>
    );
};

export default OnSaleSlider;
