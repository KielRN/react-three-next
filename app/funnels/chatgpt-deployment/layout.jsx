import './chatgpt-deployment.css'
import OpenAIPixel from './components/OpenAIPixel'

export const metadata = {
  title: 'ChatGPT Deployment for Texas Teams',
  description:
    'Workflow-first ChatGPT rollouts for Texas businesses. Find the work where ChatGPT saves time, then roll it out with your team so it sticks. Veteran-owned, San Antonio.',
  openGraph: {
    title: 'ChatGPT Deployment for Texas Teams | Texas AI Consulting',
    description: 'Workflow first, then the tool. ChatGPT rollouts that give owners time back and keep quality consistent.',
    url: 'https://texasaiconsulting.com/funnels/chatgpt-deployment',
    images: [{ url: '/blog-images/workflow-first-ai-playbook.jpg' }],
  },
}

// The OpenAI Ads pixel loads only inside this funnel, not site-wide.
export default function ChatGPTDeploymentLayout({ children }) {
  return (
    <div className='cgd'>
      <OpenAIPixel />
      {children}
    </div>
  )
}
