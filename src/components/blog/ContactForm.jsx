'use client';

import Script from 'next/script';

export default function ContactForm() {
    return (
        <Script
            src="https://widgets.leadconnectorhq.com/loader.js"
            data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
            data-widget-id="6a1062e1294a01e42fd51926"
            data-source="WEB_USER"
            strategy="lazyOnload"
        />
    );
}
