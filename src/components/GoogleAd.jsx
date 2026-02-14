import React, { useEffect } from 'react';

const GoogleAd = ({ isFixed = true }) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('[GoogleAd] Error initializing adsbygoogle:', e);
        }
    }, []);

    const adStyle = isFixed ? {
        zIndex: 1001,
        position: 'fixed',
        bottom: 0,
        left: 0,
        background: '#f8f9fa',
    } : {
        margin: '20px 0',
        background: '#fff',
        borderRadius: '8px',
        padding: '10px'
    };

    return (
        <div
            className={`ad-container ${isFixed ? 'fixed' : 'inline'}`}
            style={{
                width: '100%',
                textAlign: 'center',
                minHeight: '60px',
                ...adStyle
            }}
        >
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-8780669609800607"
                data-ad-slot="4685750113"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
            <span style={{ fontSize: '10px', color: '#999', display: 'block' }}>ADVERTISEMENT</span>
        </div>
    );
};

export default GoogleAd;
