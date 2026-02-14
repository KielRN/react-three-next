'use client'

import { useState } from 'react'
import Head from 'next/head'

export default function ElliottResumePage() {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadPDF = async () => {
    setIsDownloading(true)

    // Use the browser's print function to generate PDF
    window.print()

    setTimeout(() => {
      setIsDownloading(false)
    }, 1000)
  }

  return (
    <>
      <Head>
        <title>Eliud "Elliott" Lamboy - Resume | RN, BSN, MBA</title>
        <meta name="description" content="Professional resume of Eliud 'Elliott' Lamboy - Registered Nurse, AI Engineer, and Military Veteran" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Header with Download Button */}
        <div className="bg-[#0e2042] text-white py-6 print:hidden">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Eliud "Elliott" Lamboy</h1>
              <p className="text-gray-300 text-lg">RN, BSN, MBA | AI Engineer | Veteran</p>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-[#ffcc00] text-[#0e2042] px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <span className="text-xl">📥</span>
              {isDownloading ? 'Preparing...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Main Resume Content */}
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none">

            {/* Hero Section with Profile */}
            <div className="bg-gradient-to-r from-[#0e2042] via-[#1a3660] to-[#0e2042] text-white p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <img
                    src="/img/elliott-profile.jpg"
                    alt="Eliud Elliott Lamboy"
                    className="w-40 h-40 rounded-full border-4 border-[#ffcc00] shadow-xl object-cover"
                  />
                </div>

                {/* Contact Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl font-bold mb-2">ELIUD "ELLIOTT" LAMBOY</h1>
                  <p className="text-2xl text-[#ffcc00] mb-4">RN, BSN, MBA</p>
                  <div className="flex flex-col md:flex-row gap-4 text-lg">
                    <a href="mailto:elliott@texasaiconsulting.com" className="flex items-center gap-2 hover:text-[#ffcc00] transition-colors">
                      <span className="text-xl">📧</span>
                      elliott@texasaiconsulting.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Military Service Banner */}
            <div className="bg-gradient-to-r from-red-800 via-blue-900 to-red-800 text-white py-6 px-8">
              <div className="flex items-center justify-center gap-6 text-center">
                <div className="flex-shrink-0">
                  <img src="/img/usaf-logo.png" alt="US Air Force" className="w-16 h-16 object-contain" />
                </div>
                <div>
                  <p className="text-xl font-bold text-yellow-400">RETIRED U.S. AIR FORCE RESERVIST</p>
                  <p className="text-lg">21 Years of Military Service | 3 Combat Deployments</p>
                  <p className="text-sm text-gray-300 mt-1">1992 - November 2013</p>
                </div>
                <span className="text-4xl">🎖️</span>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-[#0e2042] mb-4 flex items-center gap-2">
                <span className="text-3xl">🏆</span>
                Professional Summary
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  <span className="font-bold text-[#0e2042]">Retired Air Force Reservist</span> with 21 years of military service including 3 combat deployments (1 to Iraq, 2 to Afghanistan).
                  <span className="font-bold text-[#0e2042]"> Throughout my military career, I simultaneously maintained a full-time civilian nursing career</span>—essentially serving two full-time roles in service of my country.
                  This dual commitment spanned from 1992 to 2013, combining bedside clinical expertise with military medical leadership under the most demanding conditions.
                </p>
                <p>
                  <span className="font-bold text-[#0e2042]">Awarded the Air Force Air Medal</span> for flying over 20 combat aeromedical evacuation missions as a Flight Nurse with the 459th Aeromedical Evacuation Squadron.
                  Delivered critical care to wounded service members in austere combat environments while simultaneously working as a civilian Registered Nurse across multiple healthcare systems.
                </p>
                <p>
                  Now combining 20+ years of clinical healthcare expertise with advanced AI and software development capabilities to drive innovation in healthcare technology.
                  Passionate about integrating cutting-edge AI solutions with clinical workflows to improve patient outcomes and empower healthcare teams through intelligent automation and data-driven decision support.
                </p>
              </div>
            </div>

            {/* Military Honors & Awards */}
            <div className="p-8 bg-gradient-to-r from-blue-50 to-red-50 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-[#0e2042] mb-6 flex items-center gap-2">
                <span className="text-3xl">🎖️</span>
                Military Decorations, Medals & Badges
              </h2>

              {/* Ribbons Display */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <img
                    src="/img/ribbons-v2.png"
                    alt="Military Service Ribbons"
                    className="max-w-full h-auto"
                    style={{ maxHeight: '120px' }}
                  />
                </div>
              </div>

              {/* Awards List - DD214 Style */}
              <div className="bg-white px-4 py-3 rounded border border-gray-300">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-semibold">13. DECORATIONS, MEDALS, BADGES, CITATIONS AND CAMPAIGN RIBBONS AWARDED OR AUTHORIZED</span> (All periods of service): Air Medal, AF Outstanding Unit Award with 5 oak leaf clusters, Air Reserve Forces Meritorious Service Medal with 3 oak leaf clusters, National Defense Service Medal with 1 service star, Iraq Campaign Medal with 1 service star, Global War on Terrorism Service Medal, AF Overseas Short Tour Ribbon, Air Force Expeditionary Service Ribbon (with Gold Border) with 2 oak leaf clusters, Air Force Longevity Service Award Ribbon with 1 oak leaf cluster, Small Arms Expert Marksmanship Ribbon with 1 service star, Air Force Training Ribbon.
                </p>
              </div>
            </div>

            {/* Professional Experience */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-[#0e2042] mb-6">Professional Experience</h2>

              {/* Texas AI Consulting, LLC - Current */}
              <div className="mb-8 pb-8 border-b border-gray-300 bg-gradient-to-r from-yellow-50 to-blue-50 -mx-8 px-8 py-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-[#0e2042] flex items-center gap-2">
                      <span className="text-2xl">🚀</span>
                      Chief Executive Officer (CEO)
                    </h3>
                    <p className="text-xl text-[#0e2042] font-bold">Texas AI Consulting, LLC</p>
                    <p className="text-sm text-gray-700 mt-1">State of Texas | Sole Member | VetHUB Certified</p>
                  </div>
                  <span className="bg-[#ffcc00] text-[#0e2042] px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap">
                    January 2026 – Present
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Founded and established Texas AI Consulting, LLC on January 28, 2026 as a veteran-owned business</li>
                  <li>Leading AI transformation initiatives for healthcare organizations across Texas</li>
                  <li>Developing custom AI solutions that bridge clinical expertise with cutting-edge technology</li>
                  <li>Qualified for VetHUB certification, positioning the company for veteran-focused contracting opportunities</li>
                  <li>Building strategic partnerships with healthcare systems to implement AI-driven clinical decision support tools</li>
                  <li>Providing consulting services in AI strategy, machine learning implementation, and healthcare data analytics</li>
                </ul>
              </div>

              {/* Methodist Healthcare */}
              <div className="mb-8 pb-8 border-b border-gray-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#0e2042]">Senior Business Analyst</h3>
                    <p className="text-lg text-gray-700">Methodist Healthcare, San Antonio Division</p>
                    <p className="text-sm text-gray-600">Application Development and Business Intelligence Team</p>
                  </div>
                  <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap">
                    August 2024 – February 2026
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Spearheaded the implementation of a new SharePoint system, streamlining team collaboration and document management</li>
                  <li>Championed the adoption of HCA Cloud Development practices, modernizing application workflows and enabling scalable solutions</li>
                  <li>Developed backend ETL pipelines for the Pulmonary Embolism Rapid Response (PERT) Team, enabling AI-driven analysis and real-time notifications</li>
                  <li>Created data streams for SSRS reports and Power BI dashboards delivering actionable insights directly to clinicians</li>
                  <li>Built full-stack applications using .NET and Node.js with deployment on Google Cloud Platform via GitHub CI/CD and Terraform</li>
                  <li>Implemented Azure Microsoft Entra ID for role-based authorization and secure access management</li>
                </ul>
              </div>

              {/* Methodist Landmark */}
              <div className="mb-8 pb-8 border-b border-gray-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#0e2042]">Staff Nurse</h3>
                    <p className="text-lg text-gray-700">Methodist Landmark, Emergency Department</p>
                  </div>
                  <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap">
                    June 2023 – August 2024
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Provided exceptional emergency care to a diverse patient population</li>
                  <li>Collaborated with multidisciplinary teams to ensure optimal patient outcomes</li>
                </ul>
              </div>

              {/* Travel Nurse */}
              <div className="mb-8 pb-8 border-b border-gray-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#0e2042]">Travel Nurse</h3>
                    <p className="text-lg text-gray-700">Agency Nurse</p>
                  </div>
                  <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap">
                    September 2018 – May 2023
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Delivered patient-centered care across various hospital systems including Meridian Health, Essentia Health, Hawaii Pacific Health, HCA, Methodist System, and Tenet Healthcare</li>
                  <li>Specialized in Cardiac Telemetry, General Progressive Care, Neuro Medical/Surgical, General Medical Surgical, and ED Holding</li>
                  <li>Gained extensive experience with Epic, Cerner, Meditech, and Meditech Expanse EHR systems</li>
                </ul>
              </div>

              {/* VA Audie Murphy */}
              <div className="mb-8 pb-8 border-b border-gray-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#0e2042]">Staff Nurse</h3>
                    <p className="text-lg text-gray-700">Veterans Affairs, Audie L. Murphy, San Antonio, TX</p>
                  </div>
                  <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap">
                    October 2009 – December 2017
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Delivered comprehensive patient education on various health topics</li>
                  <li>Consulted Polytrauma administration on software tools, documentation, and VA policies</li>
                </ul>
              </div>

              {/* USAF Reserve - Flight Nurse */}
              <div className="mb-8 pb-8 border-b border-gray-300 bg-blue-50 -mx-8 px-8 py-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                      <span className="text-2xl">🎖️</span>
                      Flight Nurse
                    </h3>
                    <p className="text-lg text-blue-800 font-semibold">United States Air Force Reserve</p>
                    <p className="text-sm text-blue-700">459 Aeromedical Evacuation Squadron (AFRC) • Andrews AFB</p>
                    <p className="text-xs text-blue-600 italic mt-1">⚠️ Military service performed concurrently with civilian nursing positions</p>
                  </div>
                  <span className="bg-blue-900 text-white px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap">
                    July 2009 – November 2013
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-2 text-blue-900 ml-4">
                  <li className="font-semibold">Led medical teams on over 20 combat aeromedical evacuation missions in Iraq</li>
                  <li>Provided critical care and advanced life support to stabilize critically wounded patients in austere environments</li>
                  <li>Managed life-or-death medical decisions inside cargo aircraft at altitude with limited equipment</li>
                  <li className="font-semibold">Awarded the Air Force Air Medal for meritorious achievement during aerial combat missions</li>
                </ul>
              </div>

              {/* VA Baltimore */}
              <div className="mb-8 pb-8 border-b border-gray-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#0e2042]">Staff Nurse</h3>
                    <p className="text-lg text-gray-700">Veterans Affairs Baltimore Medical Center, Baltimore, MD</p>
                  </div>
                  <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap">
                    January 2004 – September 2009
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Developed and implemented innovative clinical documentation templates and scheduling systems</li>
                  <li>Improved performance measures through the development of an emergency triage model</li>
                </ul>
              </div>

              {/* VA Care Coordinator */}
              <div className="mb-8 pb-8 border-b border-gray-300">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#0e2042]">Care Coordinator</h3>
                    <p className="text-lg text-gray-700">Veterans Affairs Medical Healthcare System, Baltimore, MD</p>
                  </div>
                  <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap">
                    November 2006 – June 2007
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Coordinated outpatient care and supervised the installation and use of telehealth equipment</li>
                </ul>
              </div>

              {/* Maryland Air National Guard */}
              <div className="mb-8 pb-8 border-b border-gray-300 bg-blue-50 -mx-8 px-8 py-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900">Nurse Team Leader</h3>
                    <p className="text-lg text-blue-800 font-semibold">Maryland Air National Guard, Baltimore, MD</p>
                    <p className="text-xs text-blue-600 italic mt-1">⚠️ Military service performed concurrently with civilian nursing positions</p>
                  </div>
                  <span className="bg-blue-900 text-white px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap">
                    September 2003 – February 2006
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-2 text-blue-900 ml-4">
                  <li>Managed nursing practice and enforced infection control policies in a clinic setting</li>
                </ul>
              </div>

              {/* U.S. Army Afghanistan */}
              <div className="mb-8 pb-8 bg-red-50 -mx-8 px-8 py-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-red-900 flex items-center gap-2">
                      <span className="text-2xl">🛡️</span>
                      Registered Nurse
                    </h3>
                    <p className="text-lg text-red-800 font-semibold">U.S. Army Task Force 44th Med</p>
                    <p className="text-sm text-red-700">Bagram Air Base, Afghanistan</p>
                    <p className="text-xs text-red-600 italic mt-1">⚠️ Combat deployment during concurrent military/civilian career</p>
                  </div>
                  <span className="bg-red-900 text-white px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap">
                    February 2003 – May 2003
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-2 text-red-900 ml-4">
                  <li className="font-semibold">Delivered critical nursing care in a combat environment during Operation Enduring Freedom</li>
                </ul>
              </div>
            </div>

            {/* Education */}
            <div className="p-8 border-b border-gray-200 bg-gray-50">
              <h2 className="text-3xl font-bold text-[#0e2042] mb-6">Education</h2>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-[#0e2042]">Master of Business Administration (MBA)</h3>
                      <p className="text-lg text-gray-700">University of Phoenix, San Antonio, TX</p>
                    </div>
                    <span className="bg-[#ffcc00] text-[#0e2042] px-4 py-2 rounded-full font-bold text-sm">
                      2014
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">
                    <span className="font-semibold">Honors:</span> Delta Mu Delta Honor Business Society
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-[#0e2042]">Bachelor of Science in Nursing (BSN)</h3>
                      <p className="text-lg text-gray-700">University of Maryland, Baltimore, MD</p>
                    </div>
                    <span className="bg-[#ffcc00] text-[#0e2042] px-4 py-2 rounded-full font-bold text-sm">
                      2001
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">Nursing/Registered Nurse</p>
                </div>
              </div>
            </div>

            {/* Professional Certifications */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-[#0e2042] mb-6">Professional Certifications</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg text-white">
                  <div className="mb-3 flex items-center justify-center w-12 h-12 bg-white rounded">
                    <img src="/img/ibm-logo.png" alt="IBM" className="w-10 h-10 object-contain" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">IBM AI Engineering Professional Certificate</h3>
                  <p className="text-sm text-blue-100 mb-4">Completed January 2024</p>
                  <ul className="text-sm space-y-1 text-blue-100 mb-4">
                    <li>• Machine Learning with Python</li>
                    <li>• Deep Learning & Neural Networks with Keras</li>
                    <li>• Computer Vision & Image Processing</li>
                    <li>• Neural Networks with PyTorch</li>
                    <li>• Deep Learning with Keras & TensorFlow</li>
                    <li>• AI Capstone Project</li>
                  </ul>
                  <a
                    href="https://coursera.org/share/a05d7f83cf949f3cdca96306708f26a4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 text-sm hover:text-yellow-200 underline inline-flex items-center gap-1"
                  >
                    Verify Certificate →
                  </a>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg shadow-lg text-white">
                  <div className="mb-3 flex items-center justify-center w-12 h-12 bg-white rounded">
                    <img src="/img/ibm-logo.png" alt="IBM" className="w-10 h-10 object-contain" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">IBM Full Stack Software Developer Professional Certificate</h3>
                  <p className="text-sm text-purple-100 mb-4">Completed September 2023</p>
                  <ul className="text-sm space-y-1 text-purple-100 mb-4">
                    <li>• Cloud Computing & Web Development</li>
                    <li>• React, Node.js & Express</li>
                    <li>• Python for Data Science & AI</li>
                    <li>• Django, SQL & Databases</li>
                    <li>• Docker, Kubernetes & OpenShift</li>
                    <li>• Microservices & Serverless</li>
                  </ul>
                  <a
                    href="https://coursera.org/share/a40cef834fbef505ec61774b9e57d777"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-300 text-sm hover:text-yellow-200 underline inline-flex items-center gap-1"
                  >
                    Verify Certificate →
                  </a>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Clinical Certifications</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Advanced Cardiac Life Support (ACLS)</strong> — American Heart Association (Previously Certified • September 2022)</li>
                  <li>• <strong>Pediatric Advanced Life Support (PALS)</strong> — American Heart Association (Previously Certified • August 2023)</li>
                </ul>
              </div>
            </div>

            {/* Skills & Technologies */}
            <div className="p-8 bg-gray-50">
              <h2 className="text-3xl font-bold text-[#0e2042] mb-6">Skills & Technologies</h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-[#0e2042] mb-3">AI & Machine Learning</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Python & TensorFlow</li>
                    <li>• PyTorch & Keras</li>
                    <li>• Computer Vision</li>
                    <li>• Neural Networks</li>
                    <li>• AI-driven ETL Pipelines</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#0e2042] mb-3">Software Development</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• .NET & Node.js</li>
                    <li>• React & Full-Stack Dev</li>
                    <li>• GitHub CI/CD</li>
                    <li>• Google Cloud Platform</li>
                    <li>• Azure & Terraform</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#0e2042] mb-3">Healthcare Systems</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Epic, Cerner, Meditech</li>
                    <li>• SSRS & Power BI</li>
                    <li>• Clinical Workflows</li>
                    <li>• EHR Integration</li>
                    <li>• Healthcare Data Analytics</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Licenses */}
            <div className="p-8 border-t border-gray-200">
              <h2 className="text-3xl font-bold text-[#0e2042] mb-4">Professional Licenses</h2>
              <div className="bg-white p-4 rounded-lg border-2 border-[#0e2042] inline-block">
                <p className="text-lg font-semibold text-gray-700">✓ Registered Nurse (RN) - Active License</p>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="text-center py-8 text-gray-600 print:hidden">
            <p className="text-sm">© {new Date().getFullYear()} Eliud "Elliott" Lamboy. All rights reserved.</p>
            <p className="text-xs mt-2">Veteran-Owned | Texas VetHUB Certified | Texas AI Consulting</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }

          html, body {
            height: auto;
            overflow: visible;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            font-size: 11pt;
          }

          .print\\:hidden {
            display: none !important;
          }

          /* Compact all spacing */
          .p-8 {
            padding: 0.5rem !important;
          }

          .p-6 {
            padding: 0.4rem !important;
          }

          .py-6 {
            padding-top: 0.4rem !important;
            padding-bottom: 0.4rem !important;
          }

          .mb-8, .mb-6, .mb-4, .mb-3, .mb-2 {
            margin-bottom: 0.3rem !important;
          }

          .space-y-2 > * + * {
            margin-top: 0.2rem !important;
          }

          .space-y-3 > * + * {
            margin-top: 0.25rem !important;
          }

          .gap-6, .gap-4 {
            gap: 0.3rem !important;
          }

          /* Remove decorative elements */
          .shadow-xl, .shadow-lg, .shadow-md, .shadow-2xl {
            box-shadow: none !important;
          }

          .rounded-2xl, .rounded-xl, .rounded-lg {
            border-radius: 0 !important;
          }

          .border {
            border: 1px solid #ddd !important;
          }

          /* Compact headings */
          h1 {
            font-size: 1.5rem !important;
            margin-bottom: 0.2rem !important;
          }

          h2 {
            font-size: 1.2rem !important;
            margin-bottom: 0.3rem !important;
          }

          h3 {
            font-size: 1rem !important;
            margin-bottom: 0.2rem !important;
          }

          /* Compact text */
          .text-4xl {
            font-size: 1.5rem !important;
          }

          .text-3xl {
            font-size: 1.2rem !important;
          }

          .text-2xl {
            font-size: 1.1rem !important;
          }

          .text-xl {
            font-size: 0.95rem !important;
          }

          .text-lg {
            font-size: 0.9rem !important;
          }

          /* Compact certification cards */
          .grid.md\\:grid-cols-2 {
            grid-template-columns: 1fr 1fr !important;
            gap: 0.3rem !important;
          }

          .grid.md\\:grid-cols-3 {
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 0.3rem !important;
          }

          /* Remove background colors to save ink */
          .bg-gradient-to-r,
          .bg-gradient-to-br,
          .bg-blue-50,
          .bg-red-50,
          .bg-gray-50,
          .from-yellow-50 {
            background: white !important;
          }

          /* Keep only essential colors */
          .bg-\\[\\#0e2042\\],
          .from-red-800,
          .via-blue-900,
          .to-red-800 {
            background: #0e2042 !important;
          }

          .from-blue-600,
          .to-blue-800,
          .from-purple-600,
          .to-purple-800 {
            background: white !important;
            border: 1px solid #333 !important;
            color: #000 !important;
          }

          .from-blue-600 *,
          .to-blue-800 *,
          .from-purple-600 *,
          .to-purple-800 * {
            color: #000 !important;
          }

          /* Compact lists */
          ul, ol {
            margin: 0.2rem 0 !important;
            padding-left: 1.2rem !important;
          }

          li {
            margin-bottom: 0.15rem !important;
            line-height: 1.3 !important;
          }

          /* Hide ribbons image in print to save space */
          img[alt="Military Service Ribbons"] {
            max-height: 60px !important;
          }

          /* Compact profile image */
          .w-40.h-40 {
            width: 80px !important;
            height: 80px !important;
          }

          /* Prevent page breaks */
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
            page-break-inside: avoid;
          }

          .pb-8 {
            padding-bottom: 0.3rem !important;
            page-break-inside: avoid;
          }

          /* Ensure content flows properly */
          .container {
            max-width: 100% !important;
            padding: 0 !important;
          }

          /* Remove extra spacing */
          .-mx-8, .-mx-4 {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }

          .px-8, .px-4 {
            padding-left: 0.3rem !important;
            padding-right: 0.3rem !important;
          }
        }
      `}</style>
    </>
  )
}
