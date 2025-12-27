'use client';

import { useState } from 'react';

export default function ContactForm({ postTitle }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    subject: `Question about: ${postTitle}`
                }),
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-900/80 p-6 rounded-lg border border-[#2c75ff]/40"
            style={{
                boxShadow: '0 0 10px rgba(44, 117, 255, 0.2)'
            }}>
            <h3 className="text-xl font-bold text-[#2c75ff] font-hesdeadjim mb-6"
                style={{ textShadow: '0 0 8px rgba(44, 117, 255, 0.7)' }}>
                Send Us a Message
            </h3>

            {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-md text-green-300">
                    Thanks for your message! We'll get back to you soon.
                </div>
            )}

            {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-md text-red-300">
                    Sorry, there was an error sending your message. Please try again.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold mb-2 text-[#2c75ff] font-hesdeadjim tracking-wider"
                            style={{ textShadow: '0 0 5px rgba(44, 117, 255, 0.5)' }}>
                            NAME
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="bg-gray-800 border-2 border-gray-700 focus:border-[#2c75ff] text-white rounded-md w-full py-3 px-4 transition-all duration-300 focus:outline-none focus:shadow-[0_0_8px_rgba(44,117,255,0.5)] hover:border-gray-600"
                            placeholder="Your name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2 text-[#2c75ff] font-hesdeadjim tracking-wider"
                            style={{ textShadow: '0 0 5px rgba(44, 117, 255, 0.5)' }}>
                            EMAIL
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="bg-gray-800 border-2 border-gray-700 focus:border-[#2c75ff] text-white rounded-md w-full py-3 px-4 transition-all duration-300 focus:outline-none focus:shadow-[0_0_8px_rgba(44,117,255,0.5)] hover:border-gray-600"
                            placeholder="your.email@example.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2 text-[#2c75ff] font-hesdeadjim tracking-wider"
                        style={{ textShadow: '0 0 5px rgba(44, 117, 255, 0.5)' }}>
                        MESSAGE
                    </label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-2 border-gray-700 focus:border-[#2c75ff] text-white rounded-md w-full py-3 px-4 transition-all duration-300 focus:outline-none focus:shadow-[0_0_8px_rgba(44,117,255,0.5)] hover:border-gray-600 min-h-[120px]"
                        rows="5"
                        placeholder="Your message..."
                        required
                    ></textarea>
                </div>

                <div className="text-center">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#2c75ff] hover:bg-[#3d86ff] disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 font-hesdeadjim uppercase tracking-wider disabled:cursor-not-allowed disabled:transform-none"
                        style={{
                            clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)',
                            textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
                            boxShadow: '0 0 15px rgba(44, 117, 255, 0.4)'
                        }}
                    >
                        {isSubmitting ? 'BEAMING...' : 'ENERGIZE'}
                    </button>
                </div>
            </form>
        </div>
    );
}
