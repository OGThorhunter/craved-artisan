import { Shield, Eye, Lock, UserCheck, Database, Cookie, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F7F2EC] py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-[#7F232E]/10 p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-[#7F232E]" />
            <h1 className="text-3xl md:text-4xl font-bold text-[#2b2b2b]">Privacy Policy</h1>
          </div>
          <p className="text-[#555]">
            Last updated: October 15, 2025
          </p>
          <p className="mt-2 text-[#555]">
            At Craved Artisan, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-[#F7F2EC] rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-lg mb-3">Table of Contents</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#information-we-collect" className="text-[#7F232E] hover:underline">1. Information We Collect</a></li>
            <li><a href="#how-we-use" className="text-[#7F232E] hover:underline">2. How We Use Your Information</a></li>
            <li><a href="#data-sharing" className="text-[#7F232E] hover:underline">3. Data Sharing and Disclosure</a></li>
            <li><a href="#data-security" className="text-[#7F232E] hover:underline">4. Data Security</a></li>
            <li><a href="#your-rights" className="text-[#7F232E] hover:underline">5. Your Rights</a></li>
            <li><a href="#cookies" className="text-[#7F232E] hover:underline">6. Cookies and Tracking</a></li>
            <li><a href="#contact" className="text-[#7F232E] hover:underline">7. Contact Us</a></li>
          </ul>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section id="information-we-collect">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">1. Information We Collect</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, phone number, shipping address, and billing information when you create an account or make a purchase.</li>
                <li><strong>Business Information:</strong> For vendors, we collect business name, tax ID, banking details, and product information.</li>
                <li><strong>Transaction Data:</strong> Order history, payment information, and delivery preferences.</li>
                <li><strong>Communications:</strong> Messages you send through our platform, support requests, and feedback.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our website, including pages visited, products viewed, and search queries.</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section id="how-we-use">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">2. How We Use Your Information</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill your orders and deliveries</li>
                <li>Communicate with you about your orders, account, and customer service</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Improve our platform and develop new features</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
                <li>Connect customers with local artisan vendors</li>
                <li>Process payments and manage vendor payouts</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section id="data-sharing">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">3. Data Sharing and Disclosure</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Vendors:</strong> When you place an order, we share necessary information (name, delivery address, order details) with the vendor fulfilling your order.</li>
                <li><strong>Service Providers:</strong> Third-party companies that help us operate our platform, process payments, send emails, and provide customer support.</li>
                <li><strong>Analytics Partners:</strong> To help us understand how our platform is used and improve user experience.</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
              </ul>
              <p className="mt-4"><strong>We do not sell your personal information to third parties.</strong></p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="data-security">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">4. Data Security</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>We implement appropriate technical and organizational measures to protect your personal information, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure payment processing through PCI-compliant providers</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication requirements</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="mt-4">However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.</p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="your-rights">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">5. Your Rights</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                <li><strong>Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for processing where we rely on consent</li>
              </ul>
              <p className="mt-4">To exercise these rights, please contact us at <a href="mailto:privacy@cravedartisan.com" className="text-[#7F232E] hover:underline">privacy@cravedartisan.com</a></p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="cookies">
            <div className="flex items-center gap-2 mb-3">
              <Cookie className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">6. Cookies and Tracking</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>We use cookies and similar tracking technologies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Keep you logged in</li>
                <li>Analyze site traffic and usage patterns</li>
                <li>Provide personalized content and recommendations</li>
              </ul>
              <p className="mt-4">You can control cookies through your browser settings, but disabling cookies may limit some functionality of our platform.</p>
            </div>
          </section>

          {/* Section 7 */}
          <section id="contact">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">7. Contact Us</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
              <div className="bg-[#F7F2EC] rounded-xl p-6 mt-4">
                <p><strong>Craved Artisan</strong></p>
                <p>A Rose Creek Family Farms Company</p>
                <p>Locust Grove, GA 30248</p>
                <p className="mt-2">Email: <a href="mailto:privacy@cravedartisan.com" className="text-[#7F232E] hover:underline">privacy@cravedartisan.com</a></p>
                <p>Support: <a href="mailto:support@cravedartisan.com" className="text-[#7F232E] hover:underline">support@cravedartisan.com</a></p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[#7F232E]/10">
          <p className="text-sm text-[#555] text-center">
            This privacy policy is subject to change. We will notify you of significant changes through email or a notice on our website.
          </p>
        </div>
      </div>
    </div>
  );
}

