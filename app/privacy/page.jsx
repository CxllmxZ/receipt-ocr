'use client'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">

        <div className="flex justify-between items-center mb-12">
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-300">← Back</button>
          <span className="text-xs text-gray-600">Last updated April 22, 2026</span>
        </div>

        <h1 className="text-2xl font-medium mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-sm text-gray-400 leading-relaxed">

          <p>This Privacy Notice for SlipScan ("we," "us," or "our"), describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services"), including when you visit our website at https://slipscan.vercel.app, use SlipScan, or engage with us in other related ways.</p>
          <p>Questions or concerns? Please contact us at n.pattanasarn@gmail.com.</p>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">1. WHAT INFORMATION DO WE COLLECT?</h2>
            <p>We collect personal information that you voluntarily provide to us when you register on the Services. The personal information we collect may include: email addresses and passwords.</p>
            <p><span className="text-white">Sensitive Information.</span> We do not process sensitive information.</p>
            <p><span className="text-white">Payment Data.</span> All payment data is handled and stored by Stripe. See their privacy notice at https://stripe.com/privacy.</p>
            <p><span className="text-white">Social Media Login Data.</span> If you register using Google, we will collect certain profile information from Google including your name and email address.</p>
            <p><span className="text-white">Google API.</span> Our use of information received from Google APIs will adhere to Google API Services User Data Policy, including the Limited Use requirements.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
            <p>We process your personal information for the following reasons:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To facilitate account creation and authentication and otherwise manage user accounts.</li>
              <li>To deliver and facilitate delivery of services to the user.</li>
              <li>To respond to user inquiries/offer support to users.</li>
              <li>To send administrative information to you.</li>
              <li>To fulfill and manage your orders.</li>
              <li>To protect our Services.</li>
              <li>To evaluate and improve our Services, products, marketing, and your experience.</li>
            </ul>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
            <p>We may share or transfer your information in connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
            <p>We may use cookies and similar tracking technologies to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services and your account, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">5. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</h2>
            <p>Yes. We provide AI Products through third-party service providers including Groq and Google Cloud AI. Your input, output, and personal information will be shared with and processed by these AI Service Providers to enable your use of our AI Products.</p>
            <p>Our AI Products are designed for: Image analysis, Natural language processing, and Machine learning models.</p>
            <p>To opt out, you can contact us using the contact information provided or log in to your account settings and update your user account.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">6. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
            <p>Our Services offer you the ability to register and log in using your Google account. Where you choose to do this, we will receive certain profile information about you from Google, including your name and email address. We will use the information we receive only for the purposes that are described in this Privacy Notice.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">7. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
            <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice. No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">8. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
            <p>We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">9. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
            <p>You may review, change, or terminate your account at any time by contacting us. Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases.</p>
            <p>If you have questions or comments about your privacy rights, you may email us at n.pattanasarn@gmail.com.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">10. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
            <p>We do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">11. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
            <p>We may update this Privacy Notice from time to time. The updated version will be indicated by an updated "Revised" date at the top of this Privacy Notice. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
            <p>If you have questions or comments about this notice, you may email us at n.pattanasarn@gmail.com or contact us by post at:</p>
            <p className="whitespace-pre-line">SlipScan{'\n'}ตลาดพลู, กรุงเทพมหานคร 10600{'\n'}Thailand</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
            <p>Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, correct inaccuracies, or delete your personal information. To request to review, update, or delete your personal information, please visit: https://slipscan.vercel.app/support.</p>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-600">
            Questions?{' '}
            <button onClick={() => router.push('/support')} className="text-gray-400 hover:text-white underline">
              Contact us
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}