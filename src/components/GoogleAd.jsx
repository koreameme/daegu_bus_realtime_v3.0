import React, { useEffect } from 'react';

const GoogleAd = () => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('[GoogleAd] Error initializing adsbygoogle:', e);
        }
    }, []);

    return (
        <div
            className="ad-container fixed-bottom-banner"
            style={{
                width: '100%',
                height: '50px',
                textAlign: 'center',
                background: '#f8f9fa',
                zIndex: 990, // Lower than BottomNav (1000)
                position: 'fixed',
                bottom: 0,
                left: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderTop: '1px solid #e2e8f0'
            }}
        >
            <ins className="adsbygoogle"
                style={{ display: 'inline-block', width: '100%', height: '40px' }}
                data-ad-client="ca-pub-8780669609800607"
                data-ad-slot="4685750113"></ins>
            <span style={{ fontSize: '9px', color: '#999', display: 'block', lineHeight: '10px' }}>ADVERTISEMENT</span>
        </div>
    );
};

export default GoogleAd;
