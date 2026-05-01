'use client'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">

        <div className="flex justify-between items-center mb-12">
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-300">← Back</button>
          <span className="text-xs text-gray-600">Last updated April 22, 2026</span>
        </div>

        <h1 className="text-2xl font-medium mb-8">Terms of Use</h1>

        <div className="space-y-8 text-sm text-gray-400 leading-relaxed">

          <div className="space-y-4">
            <h2 className="text-white font-medium">AGREEMENT TO OUR LEGAL TERMS</h2>
            <p>We are SlipScan ("Company," "we," "us," "our"). We operate https://slipscan.vercel.app, as well as any other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").</p>
            <p>You can contact us by email at n.pattanasarn@gmail.com or by mail to SlipScan, ตลาดพลู, กรุงเทพมหานคร 10600, Thailand.</p>
            <p>These Legal Terms constitute a legally binding agreement made between you and SlipScan, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</p>
            <p>We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of these Legal Terms.</p>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <h2 className="text-white font-medium mb-4">TABLE OF CONTENTS</h2>
            <ol className="list-decimal pl-5 space-y-1">
              {[
                'OUR SERVICES','INTELLECTUAL PROPERTY RIGHTS','USER REPRESENTATIONS',
                'PROHIBITED ACTIVITIES','USER GENERATED CONTRIBUTIONS','CONTRIBUTION LICENSE',
                'SERVICES MANAGEMENT','TERM AND TERMINATION','MODIFICATIONS AND INTERRUPTIONS',
                'GOVERNING LAW','DISPUTE RESOLUTION','CORRECTIONS','DISCLAIMER',
                'LIMITATIONS OF LIABILITY','INDEMNIFICATION','USER DATA',
                'ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES','MISCELLANEOUS','CONTACT US'
              ].map((item, i) => <li key={i}>{item}</li>)}
            </ol>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">1. OUR SERVICES</h2>
            <p>The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation. Those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">2. INTELLECTUAL PROPERTY RIGHTS</h2>
            <p>We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").</p>
            <p>Subject to your compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, revocable license to access the Services solely for your personal, non-commercial use or internal business purpose.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">3. USER REPRESENTATIONS</h2>
            <p>By using the Services, you represent and warrant that: (1) you have the legal capacity and you agree to comply with these Legal Terms; (2) you are not a minor in the jurisdiction in which you reside; (3) you will not access the Services through automated or non-human means; (4) you will not use the Services for any illegal or unauthorized purpose; and (5) your use of the Services will not violate any applicable law or regulation.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">4. PROHIBITED ACTIVITIES</h2>
            <p>You may not access or use the Services for any purpose other than that for which we make the Services available. As a user of the Services, you agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Systematically retrieve data or other content from the Services to create or compile a collection, compilation, database, or directory without written permission from us.</li>
              <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
              <li>Circumvent, disable, or otherwise interfere with security-related features of the Services.</li>
              <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
              <li>Upload or transmit viruses, Trojan horses, or other harmful material.</li>
              <li>Engage in any automated use of the system, such as using scripts to send comments or messages.</li>
              <li>Attempt to impersonate another user or person.</li>
              <li>Use the Services as part of any effort to compete with us.</li>
            </ul>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">5. USER GENERATED CONTRIBUTIONS</h2>
            <p>The Services does not offer users to submit or post content publicly. Any content you submit through the Services is used solely for the purpose of providing the Services to you.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">6. CONTRIBUTION LICENSE</h2>
            <p>You and Services agree that we may access, store, process, and use any information and personal data that you provide and your choices (including settings). By submitting suggestions or other feedback regarding the Services, you agree that we can use and share such feedback for any purpose without compensation to you.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">7. SERVICES MANAGEMENT</h2>
            <p>We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who violates the law or these Legal Terms; (3) refuse, restrict access to, limit the availability of, or disable any of your Contributions; and (4) otherwise manage the Services in a manner designed to protect our rights and property.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">8. TERM AND TERMINATION</h2>
            <p>These Legal Terms shall remain in full force and effect while you use the Services. WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES TO ANY PERSON FOR ANY REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">9. MODIFICATIONS AND INTERRUPTIONS</h2>
            <p>We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. We cannot guarantee the Services will be available at all times. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">10. GOVERNING LAW</h2>
            <p>These Legal Terms shall be governed by and defined following the laws of Thailand. SlipScan and yourself irrevocably consent that the courts of Thailand shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">11. DISPUTE RESOLUTION</h2>
            <p>To expedite resolution and control the cost of any dispute, the Parties agree to first attempt to negotiate any Dispute informally for at least 30 days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.</p>
            <p>Any dispute arising out of or in connection with these Legal Terms shall be referred to and finally resolved by arbitration. The seat of arbitration shall be Bangkok, Thailand. The language of the proceedings shall be English. The governing law of these Legal Terms shall be substantive law of Thailand.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">12. CORRECTIONS</h2>
            <p>There may be information on the Services that contains typographical errors, inaccuracies, or omissions. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">13. DISCLAIMER</h2>
            <p className="uppercase text-xs">THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">14. LIMITATIONS OF LIABILITY</h2>
            <p className="uppercase text-xs">IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">15. INDEMNIFICATION</h2>
            <p>You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of: (1) use of the Services; (2) breach of these Legal Terms; (3) any breach of your representations and warranties set forth in these Legal Terms; or (4) your violation of the rights of a third party.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">16. USER DATA</h2>
            <p>We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">17. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h2>
            <p>Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically satisfy any legal requirement that such communication be in writing.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">18. MISCELLANEOUS</h2>
            <p>These Legal Terms and any policies or operating rules posted by us on the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law.</p>
          </div>

          <div className="border-t border-gray-800 pt-8 space-y-4">
            <h2 className="text-white font-medium">19. CONTACT US</h2>
            <p>In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:</p>
            <p className="whitespace-pre-line">SlipScan{'\n'}n.pattanasarn@gmail.com{'\n'}ตลาดพลู, กรุงเทพมหานคร 10600{'\n'}Thailand</p>
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