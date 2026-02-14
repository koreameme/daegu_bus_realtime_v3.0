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
            className="ad-container"
            style={{
                width: '100%',
                textAlign: 'center',
                background: '#f8f9fa',
                zIndex: 1001,
                position: 'fixed',
                bottom: 0,
                left: 0,
                minHeight: '50px'
            }}
        >
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-8780669609800607"
                data-ad-slot="1234567890" // Placeholder slot ID
                data-ad-format="horizontal"
                data-full-width-responsive="true"></ins>
            <span style={{ fontSize: '10px', color: '#999', display: 'block' }}>ADVERTISEMENT</span>
        </div>
    );
};

export default GoogleAd;
