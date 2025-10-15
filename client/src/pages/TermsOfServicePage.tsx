import { FileText, Scale, ShoppingBag, Users, AlertCircle, CheckCircle, Ban } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F7F2EC] py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-[#7F232E]/10 p-8 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-[#7F232E]" />
            <h1 className="text-3xl md:text-4xl font-bold text-[#2b2b2b]">Terms of Service</h1>
          </div>
          <p className="text-[#555]">
            Last updated: October 15, 2025
          </p>
          <p className="mt-2 text-[#555]">
            Welcome to Craved Artisan. By accessing or using our platform, you agree to be bound by these Terms of Service.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-[#7F232E]/5 border-l-4 border-[#7F232E] rounded-r-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#7F232E] mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-[#2b2b2b] mb-1">Important Notice</p>
              <p className="text-sm text-[#555]">
                Please read these terms carefully before using Craved Artisan. By creating an account or making a purchase, you acknowledge that you have read, understood, and agree to be bound by these terms.
              </p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-[#F7F2EC] rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-lg mb-3">Table of Contents</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#acceptance" className="text-[#7F232E] hover:underline">1. Acceptance of Terms</a></li>
            <li><a href="#accounts" className="text-[#7F232E] hover:underline">2. User Accounts</a></li>
            <li><a href="#marketplace" className="text-[#7F232E] hover:underline">3. Marketplace Rules</a></li>
            <li><a href="#vendor-terms" className="text-[#7F232E] hover:underline">4. Vendor Terms</a></li>
            <li><a href="#orders-payments" className="text-[#7F232E] hover:underline">5. Orders and Payments</a></li>
            <li><a href="#refunds" className="text-[#7F232E] hover:underline">6. Refunds and Returns</a></li>
            <li><a href="#intellectual-property" className="text-[#7F232E] hover:underline">7. Intellectual Property</a></li>
            <li><a href="#prohibited" className="text-[#7F232E] hover:underline">8. Prohibited Conduct</a></li>
            <li><a href="#liability" className="text-[#7F232E] hover:underline">9. Limitation of Liability</a></li>
            <li><a href="#termination" className="text-[#7F232E] hover:underline">10. Termination</a></li>
          </ul>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <section id="acceptance">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">1. Acceptance of Terms</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>
                These Terms of Service ("Terms") govern your access to and use of Craved Artisan's website, mobile application, and services (collectively, the "Platform"). The Platform is operated by Rose Creek Family Farms ("we," "us," or "our").
              </p>
              <p>
                By using the Platform, you agree to these Terms and our Privacy Policy. If you do not agree, you may not use the Platform.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="accounts">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">2. User Accounts</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>To access certain features, you must create an account. You agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
              <p className="mt-4">You must be at least 18 years old to create an account and use the Platform.</p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="marketplace">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">3. Marketplace Rules</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>Craved Artisan is a marketplace that connects customers with local artisan vendors. Key points:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Products are sold by independent vendors, not by Craved Artisan</li>
                <li>Vendors are responsible for product quality, accuracy of descriptions, and fulfillment</li>
                <li>We facilitate transactions but are not a party to the sale</li>
                <li>Product availability is subject to vendor inventory</li>
                <li>Delivery windows and fulfillment are managed by vendors</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section id="vendor-terms">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">4. Vendor Terms</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>If you are a vendor on the Platform, you additionally agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Product Compliance:</strong> Ensure all products comply with applicable laws, including food safety regulations</li>
                <li><strong>Accurate Listings:</strong> Provide truthful and accurate product descriptions, ingredients, and pricing</li>
                <li><strong>Fulfillment:</strong> Honor sales windows and deliver orders on time as promised</li>
                <li><strong>Payment Terms:</strong> Accept platform fees and payment processing terms</li>
                <li><strong>Customer Service:</strong> Respond to customer inquiries and resolve issues promptly</li>
                <li><strong>Insurance:</strong> Maintain appropriate business insurance and licenses</li>
                <li><strong>Taxes:</strong> Be responsible for collecting and remitting all applicable taxes</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section id="orders-payments">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">5. Orders and Payments</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p><strong>For Customers:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All prices are in USD and subject to change</li>
                <li>Payment is processed at the time of order placement</li>
                <li>You authorize us to charge your payment method</li>
                <li>Orders are subject to vendor acceptance</li>
                <li>You will receive order confirmations and updates via email</li>
              </ul>
              <p className="mt-4"><strong>For Vendors:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Platform fees are deducted from each transaction</li>
                <li>Payouts are processed according to the payout schedule</li>
                <li>You are responsible for payment processing fees</li>
                <li>Disputed charges may result in payout holds</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section id="refunds">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">6. Refunds and Returns</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>
                Refund and return policies are set by individual vendors. Generally:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Food items are typically non-returnable due to health and safety</li>
                <li>Damaged or incorrect items may be eligible for refund or replacement</li>
                <li>Contact the vendor or our support team within 48 hours of delivery</li>
                <li>Refunds are processed to the original payment method</li>
                <li>We reserve the right to mediate disputes between customers and vendors</li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section id="intellectual-property">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">7. Intellectual Property</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>
                The Platform and its content (including text, graphics, logos, and software) are owned by Rose Creek Family Farms and protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                Vendors retain ownership of their product images and descriptions but grant us a license to display them on the Platform.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="prohibited">
            <div className="flex items-center gap-2 mb-3">
              <Ban className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">8. Prohibited Conduct</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>You may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Platform for any illegal purpose</li>
                <li>Impersonate any person or entity</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Upload viruses or malicious code</li>
                <li>Scrape or collect data without permission</li>
                <li>Circumvent security features</li>
                <li>Sell counterfeit or stolen goods</li>
                <li>Manipulate reviews or ratings</li>
              </ul>
            </div>
          </section>

          {/* Section 9 */}
          <section id="liability">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">9. Limitation of Liability</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CRAVED ARTISAN AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
              </p>
              <p>
                We do not guarantee the quality, safety, or legality of products sold by vendors. Vendors are independent contractors, not our employees or agents.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section id="termination">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-[#7F232E]" />
              <h2 className="text-2xl font-bold text-[#2b2b2b]">10. Termination</h2>
            </div>
            <div className="space-y-4 text-[#555]">
              <p>
                We may suspend or terminate your account at any time for violation of these Terms or for any other reason at our discretion.
              </p>
              <p>
                You may close your account at any time by contacting support. Upon termination, your right to use the Platform ceases immediately.
              </p>
            </div>
          </section>
        </div>

        {/* Contact Section */}
        <div className="mt-12 pt-8 border-t border-[#7F232E]/10">
          <h2 className="text-xl font-bold text-[#2b2b2b] mb-4">Questions About These Terms?</h2>
          <div className="bg-[#F7F2EC] rounded-xl p-6">
            <p className="text-[#555]"><strong>Contact Us:</strong></p>
            <p className="text-[#555] mt-2">
              Craved Artisan<br />
              A Rose Creek Family Farms Company<br />
              Locust Grove, GA 30248
            </p>
            <p className="text-[#555] mt-2">
              Email: <a href="mailto:legal@cravedartisan.com" className="text-[#7F232E] hover:underline">legal@cravedartisan.com</a><br />
              Support: <a href="mailto:support@cravedartisan.com" className="text-[#7F232E] hover:underline">support@cravedartisan.com</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-[#7F232E]/10">
          <p className="text-sm text-[#555] text-center">
            These terms are subject to change. Continued use of the Platform after changes constitutes acceptance of the new terms.
          </p>
        </div>
      </div>
    </div>
  );
}

