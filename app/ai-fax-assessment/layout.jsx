export const metadata = {
    title: 'AI Fax Automation Assessment for Rural Hospitals | Texas AI Consulting',
    description:
        'Stop losing clinical hours to legacy fax workflows. A $24,500 AI-driven modernization assessment for rural hospitals — 1-week sprint + 11 months advisory led by an RN with 20+ years of bedside experience. RHTP-aligned.',
    keywords: [
        'AI fax automation',
        'rural hospital modernization',
        'healthcare AI assessment',
        'RHTP readiness',
        'EMR integration',
        'HL7 FHIR',
        'clinical workflow optimization',
        'Texas AI consulting',
        'AI fax assessment',
        'rural health transformation',
        'SDVOSB healthcare',
        'legacy fax modernization',
    ],
    openGraph: {
        title: 'AI Fax & Workflow Modernization Assessment | Texas AI Consulting',
        description:
            'Secure your facility\'s role in the $1.4 Billion Rural Health Transformation Program with an AI-driven modernization roadmap. Led by an RN with 20+ years of bedside experience.',
        url: 'https://texasaiconsulting.com/ai-fax-assessment',
        images: [
            {
                url: '/img/nurse-meta-glasses.jpg',
                width: 1200,
                height: 630,
                alt: 'A nurse using AI-powered smart glasses during a patient assessment — Texas AI Consulting',
            },
        ],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI Fax Automation Assessment for Rural Hospitals',
        description:
            'Stop losing clinical hours to legacy fax workflows. $24,500 fixed-fee AI modernization assessment for rural hospitals.',
        images: ['/img/nurse-meta-glasses.jpg'],
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function AIFaxAssessmentLayout({ children }) {
    return children
}
