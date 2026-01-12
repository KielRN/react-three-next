'use client';

import Script from 'next/script';

export default function ContactForm() {
    return (
        <div className="w-full h-[1600px] md:h-[1400px] bg-white rounded-lg overflow-hidden">
            <iframe
                src="https://link.texasaiconsulting.com/widget/form/m2QtgBWrIRiB0n3BnPwz"
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '3px' }}
                id="inline-m2QtgBWrIRiB0n3BnPwz"
                data-layout="{'id':'INLINE'}"
                data-trigger-type="alwaysShow"
                data-trigger-value=""
                data-activation-type="alwaysActivated"
                data-activation-value=""
                data-deactivation-type="neverDeactivate"
                data-deactivation-value=""
                data-form-name="TX_AI_Website Form"
                data-height="1283"
                data-layout-iframe-id="inline-m2QtgBWrIRiB0n3BnPwz"
                data-form-id="m2QtgBWrIRiB0n3BnPwz"
                title="TX_AI_Website Form"
            >
            </iframe>
            <Script src="https://link.texasaiconsulting.com/js/form_embed.js" strategy="lazyOnload" />
        </div>
    );
}
