import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const legalDocuments = [
  {
    type: 'TOS',
    version: '2.0',
    title: 'Craved Artisan — Terms of Service (TOS)',
    content: `# 📜 Craved Artisan — Terms of Service (TOS)
**Effective Date:** October 2025  
**Last Updated:** October 2025  

Welcome to **Craved Artisan**, a community-driven marketplace connecting independent creators, food artisans, farmers, and event coordinators with customers seeking authentic, handcrafted goods and experiences.  
These Terms of Service ("**Terms**") govern your access to and use of the Craved Artisan platform, including all related websites, mobile applications, tools, and services (collectively, the "**Platform**").

By creating an account, accessing, or using the Platform in any way, you agree to be bound by these Terms. If you do not agree, you may not use the Platform.

---

## 1. 💡 Who We Are
Craved Artisan ("**we**," "**us**," or "**our**") operates as a digital marketplace platform facilitating transactions and connections between:
- **Vendors** (independent sellers or creators)
- **Customers** (buyers or patrons)
- **Event Coordinators** (organizers of artisan markets and events)

Craved Artisan is **not a vendor, employer, agent, or guarantor** of any user or product. All users act independently.

---

## 2. 🧾 Account Eligibility & Roles
### 2.1 Eligibility
You must:
- Be at least 18 years old (or age of majority in your jurisdiction).  
- Provide accurate and current information during registration.  
- Be legally capable of entering into binding contracts.

### 2.2 Account Types
| Role | Description | Special Terms |
|------|--------------|---------------|
| **Customer** | Purchases products or services from vendors through the Platform. | Must comply with buyer conduct and payment policies. |
| **Vendor** | Lists, sells, and fulfills artisan products. | Must comply with Vendor Agreement and all applicable commerce laws. |
| **Event Coordinator** | Hosts or manages events through the Platform. | Must comply with Event Coordinator Agreement and local regulations. |

### 2.3 Account Security
You are responsible for maintaining the confidentiality of your credentials. Any activity under your account is your responsibility.  
If you suspect unauthorized access, notify us immediately at **support@cravedartisan.com**.

---

## 3. 🧠 AI-Powered Services
Craved Artisan uses **AI-driven systems** to enhance user experience (e.g., product recommendations, analytics, automated insights).

By using the Platform, you acknowledge:
- AI tools are **assistive** and may occasionally produce inaccurate outputs.  
- You remain solely responsible for any business or purchasing decisions.  
- Craved Artisan disclaims liability for outcomes influenced by AI-generated content.

---

## 4. 💳 Payments & Financial Transactions
### 4.1 Stripe Connect
All payments are securely processed through **Stripe Connect**.  
- Craved Artisan does **not store, process, or access** any credit card or banking data.  
- Vendors and coordinators must complete Stripe onboarding to receive payouts.  
- Customers must use Stripe for checkout.

### 4.2 Fees & Commissions
We may collect a **platform fee** or commission from vendor or coordinator sales. These fees will be transparently disclosed during signup or in your account dashboard.

### 4.3 Refunds
Refunds are handled **directly between vendor and customer**, per each vendor's refund policy.  
Craved Artisan is **not responsible** for product disputes, returns, or chargebacks.

---

## 5. 📦 Vendor Responsibilities
Vendors represent and warrant that:
- Products comply with all applicable health, safety, and labeling laws.  
- Product listings are accurate and truthful.  
- You will fulfill all orders promptly and professionally.  
- You hold any required permits, licenses, or food safety certifications.

**Prohibited:**
- Misleading or false advertising  
- Selling unlicensed or unsafe products  
- Using another vendor's intellectual property without permission  

Craved Artisan may suspend or terminate accounts that violate these obligations.

---

## 6. 🎪 Event Coordinator Responsibilities
Event Coordinators agree that:
- They act as **independent organizers**, not agents of Craved Artisan.  
- They are solely responsible for all permits, insurance, and compliance.  
- Craved Artisan is **not liable** for event cancellations, accidents, or disputes.

---

## 7. 🔒 Privacy & Data Usage
By using Craved Artisan, you agree to our [Privacy & Data Use Policy](#) (available separately).

Key points:
- We collect only necessary information to operate the Platform.  
- We **never sell personal data** to third parties.  
- We may use aggregated and anonymized data for analytics, research, and AI model training.  
- You may request deletion or export of your personal data at any time.  

**Plain language version:**  
> By using Craved Artisan, you grant us permission to use anonymized or aggregated information to improve features, security, and insights across the platform.

---

## 8. 🧱 Intellectual Property
- Craved Artisan retains all rights to the Platform, branding, and content we create.  
- You retain ownership of your original content but grant Craved Artisan a **non-exclusive, royalty-free, worldwide license** to display, promote, and distribute your listings and materials within the Platform.

---

## 9. ⚖️ Liability & Disclaimers
### 9.1 Platform Provided "As Is"
Craved Artisan is provided on an **"as is"** and **"as available"** basis.  
We make no warranties—express or implied—about uptime, accuracy, or reliability.

### 9.2 Limitation of Liability
To the maximum extent permitted by law, Craved Artisan and its affiliates, officers, or employees shall **not be liable** for:
- Lost profits, data, goodwill, or revenue  
- Business interruption  
- Indirect, consequential, or punitive damages  

In any event, our total liability shall **not exceed the amount you paid to Craved Artisan in the last 12 months**.

### 9.3 Data Loss Disclaimer
We are not responsible for any **data loss, service interruption, or account errors**.  
Users should maintain backup copies of their important information.

---

## 10. 🚫 Prohibited Conduct
You agree **not** to:
- Engage in illegal activity through the Platform  
- Upload malware, spam, or harmful code  
- Impersonate another person or entity  
- Circumvent platform fees or use the system to arrange off-platform sales  
- Attempt to reverse engineer, scrape, or misuse any part of the Platform  

Violations may result in immediate account termination and legal action.

---

## 11. 🏛️ Indemnification
You agree to **indemnify and hold harmless** Craved Artisan, its affiliates, employees, and partners from any claims, damages, or liabilities arising from:
- Your use of the Platform  
- Your breach of these Terms  
- Your violation of any law or third-party right  

---

## 12. 🗂️ Termination
Craved Artisan may suspend or terminate your account at any time if:
- You violate these Terms  
- You engage in fraudulent or harmful conduct  
- You misuse the Platform or harm other users  

Users may terminate their accounts at any time via their account settings.

Upon termination, you lose access to the Platform, but certain obligations (payments, IP rights, indemnities) will survive.

---

## 13. ⚙️ Modifications to Service or Terms
We may update these Terms periodically to reflect legal or business changes.  
If material changes occur, users will be notified via email or dashboard notice.

Continued use of the Platform after updates constitutes acceptance of the revised Terms.

---

## 14. 📍 Governing Law & Dispute Resolution
- **Governing Law:** These Terms are governed by the laws of the **State of Georgia, USA**.  
- **Dispute Resolution:** Any dispute will be resolved through **binding arbitration** in Henry County, Georgia, unless otherwise required by law.  
- Each party waives the right to participate in class actions or jury trials.

---

## 15. 📬 Contact
For questions about these Terms, please contact:  
**Craved Artisan Legal Team**  
📧 support@cravedartisan.com  
📍 Locust Grove, Georgia, USA  

---

## 16. 🧾 Entire Agreement
These Terms, along with our Privacy Policy, Vendor Agreement, and any supplemental role-specific policies, constitute the **entire agreement** between you and Craved Artisan and supersede all prior communications or understandings.

---

### ✅ Summary
By clicking **"I Agree"**, you confirm that:
- You have read and understood these Terms.  
- You are legally permitted to use the Platform.  
- You accept all disclaimers, limitations, and responsibilities outlined above.  

**Welcome to Craved Artisan — where local makers and creative minds thrive.**

---

**File:** \`/docs/terms-of-service.md\`  
**Maintainer:** Craved Artisan Legal & Compliance  
**Version:** 2.0.0  
**Last Updated:** October 2025`
  },
  {
    type: 'PRIVACY',
    version: '2.0',
    title: 'Privacy & Data Use Policy',
    content: `# Craved Artisan Privacy & Data Use Policy

**Effective Date:** ${new Date().toLocaleDateString()}
**Version:** 2.0

## 1. Information We Collect

We collect information necessary to operate and improve your experience:
- Account information (name, email, password)
- Profile information (business details, preferences)
- Transaction data (orders, payments, history)
- Usage data (how you interact with our platform)
- Location data (ZIP code for marketplace discovery)
- Communication data (messages, support tickets)
- Device information (browser type, IP address, operating system)
- Behavioral data (clicks, page views, search queries)

## 2. How We Use Your Information

Your information is used to:
- Provide and maintain our services
- Process transactions and payments
- Communicate with you about your account and orders
- Improve our platform and user experience
- Provide customer support
- Prevent fraud and enhance security
- Comply with legal obligations
- **AI model training and improvement** - Your usage patterns help us develop better AI-powered features
- **Product development and feature enhancement** - We analyze how you use our platform to build better tools
- **Business analytics and market research** - We study trends to improve our marketplace
- **Platform optimization** - We use your data to make our platform faster and more reliable
- **Predictive modeling** - We develop models to anticipate user needs and provide better recommendations
- **Quality assurance and testing** - We use data to ensure our platform works correctly
- **Personalized experiences** - We tailor content and recommendations based on your activity

## 3. Data Sharing

We do **not sell your personal identifiable data** to third parties.

We may share information with:
- Service providers who help operate our platform (e.g., payment processors, hosting providers)
- Other users as necessary for transactions (e.g., vendors see customer shipping addresses)
- Law enforcement when required by law
- Business partners with your explicit consent
- **Analytics partners** - To better understand platform usage and improve services
- **Research institutions** - Anonymized and aggregated data for academic research
- **AI/ML service providers** - To enhance our artificial intelligence capabilities
- **Business intelligence tools** - For platform performance monitoring and optimization

## 4. Data Usage Rights

By continuing to use Craved Artisan, you grant us comprehensive rights to use your data as follows:

### 4.1 De-Identified and Aggregated Data
You grant Craved Artisan a **perpetual, irrevocable, worldwide, royalty-free, non-exclusive license** to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display de-identified and aggregated user data for any lawful business purpose, including but not limited to:
- Platform optimization and performance improvement
- Analytics and business intelligence
- AI and machine learning model training and development
- Product development and feature enhancement
- Market research and competitive analysis
- Creating benchmarks, reports, and insights
- Developing new products and services

### 4.2 Individual Data Usage
For data that can be associated with your account:
- We may use your data internally for all purposes described in Section 2
- We will not sell or rent your personally identifiable information to third parties for their marketing purposes without your explicit consent
- We may use your data to create anonymized datasets that cannot reasonably identify you
- Once anonymized, such data is no longer considered personal data and may be used without restriction

### 4.3 AI and Machine Learning
You acknowledge and agree that:
- Your usage data, content, and interactions may be used to train, test, and improve AI models
- These AI models may be used across our platform and potentially in future products
- AI-derived insights and models are our proprietary assets
- Your contributions to AI training are provided voluntarily through platform usage

### 4.4 Derivative Works
We have the right to create derivative works, compilations, and analyses from your aggregated and de-identified data without additional compensation or attribution.

## 5. Your Data Rights

Despite our broad data usage rights, you retain the following important rights:

### 5.1 Access and Portability
- Access your personal data at any time
- Export your data in a machine-readable format
- Request a copy of data we hold about you

### 5.2 Correction and Deletion
- Correct inaccurate information in your profile
- Request data deletion (subject to legal retention requirements)
- Close your account and remove your personal data

### 5.3 Control and Consent
- Opt-out of marketing communications
- Withdraw consent for optional data processing
- Control cookie preferences
- Request restrictions on certain data processing

### 5.4 Legal Compliance
- Your rights under GDPR (if in the EU/EEA)
- Your rights under CCPA (if in California)
- Your rights under other applicable privacy laws

### 5.5 Limitations
Please note that:
- Some data may be retained for legal, accounting, or security purposes
- De-identified and aggregated data cannot be deleted once created
- Deletion requests may not apply to data already incorporated into AI models
- We may retain backup copies for disaster recovery purposes

## 6. Data Security

We implement industry-standard security measures to protect your data:
- Encryption in transit and at rest (TLS/SSL, AES-256)
- Regular security audits and penetration testing
- Access controls and multi-factor authentication
- Secure payment processing through Stripe (PCI-DSS compliant)
- Employee training on data protection
- Incident response and breach notification procedures

However, no system is completely secure. You acknowledge that you use our platform at your own risk.

## 7. Cookies and Tracking

We use cookies and similar technologies to:
- Maintain your session and keep you logged in
- Remember your preferences and settings
- Analyze platform usage and traffic patterns
- Provide personalized experiences and recommendations
- Track conversion and marketing effectiveness
- A/B test new features
- Prevent fraud and abuse

You can control cookie settings through your browser, but some features may not work properly if cookies are disabled.

## 8. Data Retention

We retain your data for as long as necessary to:
- Provide our services while your account is active
- Comply with legal obligations (typically 7 years for financial records)
- Resolve disputes and enforce agreements
- Maintain security and prevent fraud
- Support AI/ML models and analytics

After account deletion, we may retain:
- Anonymized and aggregated data indefinitely
- Transaction records as required by law
- Data necessary for legal claims or compliance
- Backup copies for up to 90 days

## 9. Children's Privacy

Craved Artisan is not intended for users under 18. We do not knowingly collect information from children. If we become aware of data collected from children, we will delete it promptly.

## 10. International Data Transfers

Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in compliance with applicable laws.

## 11. Changes to This Policy

We may update this Privacy Policy from time to time. Material changes will be communicated through:
- Email notification to your registered address
- Prominent notice on our platform
- In-app notifications

Continued use after changes constitutes acceptance of the updated policy.

## 12. Contact Us

For privacy-related questions or to exercise your data rights:
- **Email:** privacy@cravedartisan.com
- **Mail:** Craved Artisan Privacy Team, Locust Grove, Georgia, USA
- **Data Protection Officer:** legal@cravedartisan.com

Response time: We aim to respond to privacy requests within 30 days.

## 13. Acknowledgment

By using Craved Artisan, you acknowledge that:
- You have read and understood this Privacy & Data Use Policy
- You agree to the data collection, usage, and sharing practices described herein
- You grant us the licenses and rights described in Section 4
- You understand that de-identified and aggregated data may be used without restriction
- You accept that your usage contributes to platform improvement and AI development

**This policy gives Craved Artisan broad rights to use collected data for business purposes while maintaining your fundamental privacy rights under applicable law.**`
  },
  {
    type: 'AI_DISCLAIMER',
    version: '1.0',
    title: 'AI Disclaimer',
    content: `# Craved Artisan AI Disclaimer

**Effective Date:** ${new Date().toLocaleDateString()}

## AI-Powered Features

Portions of the Craved Artisan platform are powered by AI-driven systems that provide insights, recommendations, content generation, and operational support features.

## Purpose of AI Features

AI features are designed to:
- Assist with inventory management and pricing recommendations
- Generate product descriptions and marketing content
- Analyze sales trends and patterns
- Provide business insights and suggestions
- Automate routine tasks and workflows
- Enhance search and discovery
- Improve user experience

## Important Limitations

### Not Professional Advice

AI-generated insights, recommendations, and content are for **informational and operational support only** and should **not be considered professional, financial, legal, or business advice.**

### User Responsibility

Users are solely responsible for:
- Verifying AI-generated information before using it
- Making final business decisions
- Ensuring compliance with applicable laws and regulations
- Product quality, safety, and accuracy
- Pricing decisions
- Customer communications

### No Guarantees

AI features are provided "as is" without warranties of:
- Accuracy or completeness
- Fitness for a particular purpose
- Results or outcomes
- Freedom from errors or interruptions

## Liability Limitation

**Craved Artisan and its partners are not liable for:**
- Outcomes derived from AI-based decisions or outputs
- Business losses resulting from AI recommendations
- Errors or inaccuracies in AI-generated content
- Interruptions or unavailability of AI features
- Third-party AI services or integrations

## Data Usage for AI

By using AI features, you understand that:
- Your usage data may be used to improve AI models
- Data is anonymized and aggregated when used for training
- You can opt-out of AI features at any time
- AI models may be updated or changed without notice

## Human Oversight

We recommend:
- Reviewing all AI-generated content before use
- Consulting with qualified professionals for important decisions
- Maintaining human oversight of critical business operations
- Not solely relying on AI for customer-facing communications

## Third-Party AI Services

Some AI features may utilize third-party services. These services have their own terms and privacy policies which you should review.

## Changes to AI Features

Craved Artisan may:
- Add, modify, or remove AI features at any time
- Update AI models and algorithms
- Change the scope or availability of AI features
- Temporarily disable AI features for maintenance

## Contact

For questions about AI features, contact us at ai-support@cravedartisan.com

**By using Craved Artisan's AI features, you acknowledge and accept the terms of this disclaimer.**`
  },
  {
    type: 'DATA_LIABILITY',
    version: '1.0',
    title: 'Data Loss & Liability Waiver',
    content: `# Data Loss & Liability Waiver

**Effective Date:** ${new Date().toLocaleDateString()}

## Service Availability

While Craved Artisan strives to provide reliable service and data integrity, we cannot guarantee uninterrupted access or perfect data retention.

## No Warranty

The Craved Artisan platform and all associated services are provided **"AS IS" and "AS AVAILABLE"** without warranties of any kind, either express or implied, including but not limited to:
- Warranties of merchantability
- Fitness for a particular purpose
- Non-infringement
- Uninterrupted or error-free service
- Data accuracy or completeness
- Freedom from viruses or harmful components

## Data Loss

**Craved Artisan is not responsible for:**
- Loss of data due to system failures, maintenance, or technical issues
- Data corruption or loss during updates or migrations
- Loss resulting from user error or account compromise
- Data loss from third-party service failures
- Incomplete or failed data backups
- Data loss due to account termination or suspension

## Service Interruptions

Users acknowledge that service interruptions may occur due to:
- Scheduled maintenance
- Emergency repairs
- Technical failures
- Third-party service outages
- Force majeure events
- Security incidents

## User Responsibility

It is **your responsibility** to:
- Maintain backup copies of important information
- Export and save critical business data regularly
- Keep records of transactions and communications
- Ensure compliance with record-keeping requirements
- Verify data accuracy and completeness
- Have contingency plans for service interruptions

## Limitation of Liability

**To the maximum extent permitted by law, Craved Artisan shall not be liable for:**

### Direct Damages
- Business losses or lost profits
- Lost sales or opportunities
- Loss of data or information
- Loss of goodwill or reputation
- Costs of procuring substitute services

### Indirect Damages
- Consequential damages
- Incidental damages
- Special damages
- Punitive damages
- Exemplary damages

**Even if Craved Artisan has been advised of the possibility of such damages.**

## Maximum Liability

In jurisdictions that do not allow the exclusion of certain warranties or liability, Craved Artisan's total liability shall not exceed:
- The amount paid by you to Craved Artisan in the 12 months preceding the claim, or
- $100 USD

Whichever is greater.

## Third-Party Services

Craved Artisan uses third-party services (such as payment processors, hosting providers, and analytics tools). We are not responsible for:
- Third-party service failures or data breaches
- Changes to third-party terms or availability
- Third-party data handling practices
- Integration issues with third-party services

## Business Operations

Users are responsible for:
- Compliance with applicable laws governing their business
- Tax obligations and reporting
- Product safety and quality standards
- Business licenses and permits
- Insurance coverage
- Customer service and dispute resolution

## Data Backup Recommendations

We strongly recommend:
- Regular exports of your product catalog
- Maintaining offline copies of customer lists
- Keeping records of important transactions
- Backing up media assets and content
- Documenting business processes
- Having alternative communication channels

## Indemnification

You agree to indemnify and hold harmless Craved Artisan, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
- Your use of the platform
- Your violation of these terms
- Your violation of any law or regulation
- Your violation of third-party rights
- Content you submit to the platform

## Dispute Resolution

Any disputes arising from data loss or service interruptions shall be resolved through:
1. Good faith negotiation
2. Mediation (if negotiation fails)
3. Binding arbitration in Georgia, USA

## Acknowledgment

**By using Craved Artisan, you acknowledge that:**
- You have read and understood this waiver
- You accept the risks associated with online platforms
- You will maintain appropriate backups of your data
- You will not hold Craved Artisan liable for data loss or service interruptions
- You are responsible for your business continuity planning

## Contact

For questions about this waiver, contact legal@cravedartisan.com

**Your continued use of Craved Artisan constitutes acceptance of these terms.**`
  },
  {
    type: 'VENDOR_AGREEMENT',
    version: '1.0',
    title: 'Vendor Service Agreement',
    content: `# 🧾 Craved Artisan — Vendor Service Agreement
**Effective Date:** October 2025  
**Last Updated:** October 2025  

This **Vendor Service Agreement** ("**Agreement**") governs your participation as a vendor ("**Vendor**," "**you**," or "**your**") on the **Craved Artisan** marketplace platform, owned and operated by Craved Artisan, LLC ("**Craved Artisan**," "**we**," "**us**," or "**our**").  

By creating a vendor account, listing products, or engaging in any commercial activity on the Craved Artisan Platform, you agree to this Agreement, along with our Terms of Service and Privacy Policy.

---

## 1. 🎯 Purpose of Agreement
Craved Artisan operates as a **digital marketplace** that connects independent creators, bakers, farmers, artisans, and small producers with customers seeking locally made, handcrafted, or homegrown goods.  

This Agreement establishes the terms under which Vendors may sell goods or services through the Platform while ensuring Craved Artisan remains legally protected from liabilities arising from Vendor operations.

---

## 2. ⚖️ Independent Vendor Status
- You are an **independent contractor**, not an employee, agent, or representative of Craved Artisan.  
- You are solely responsible for your business operations, taxes, permits, insurance, and compliance with all applicable federal, state, and local laws.  
- Craved Artisan does not guarantee sales, exposure, or business success.

**Plain language version:**  
> You run your own business — we provide the digital tools and visibility, but we're not your employer or financial partner.

---

## 3. 💳 Payments & Stripe Connect
- All transactions and payouts are managed securely through **Stripe Connect**.  
- Craved Artisan **does not store or process** customer payment information.  
- You must complete Stripe onboarding to sell or receive payments.  
- Craved Artisan may collect a **service or transaction fee** from each sale to cover platform maintenance and services.  
- Payouts are processed by Stripe directly to your linked account, subject to Stripe's terms.  

**You agree that Craved Artisan is not responsible for:**  
- Delays in payment caused by Stripe  
- Payment holds, account verification, or chargeback disputes  
- Taxes owed on your earnings  

---

## 4. 🧁 Vendor Responsibilities
As a Vendor, you agree to:

1. **Maintain Product Integrity**  
   - Sell only items you have produced, created, or lawfully obtained.  
   - Ensure all products are safe, properly labeled, and compliant with relevant laws (e.g., cottage food laws, FDA labeling requirements).  
   - Provide accurate descriptions, images, and pricing.

2. **Fulfill Orders Promptly**  
   - Complete and deliver all orders in a timely and professional manner.  
   - Communicate transparently with customers about availability, delays, or substitutions.

3. **Comply with Local Regulations**  
   - Obtain and maintain all required licenses or permits (e.g., cottage food permits, business licenses).  
   - Comply with all applicable health, safety, and food handling regulations.

4. **Customer Service**  
   - Treat all customers respectfully.  
   - Respond promptly to inquiries, complaints, and refund requests.

5. **Taxes & Reporting**  
   - Accurately report your earnings to tax authorities.  
   - Craved Artisan may provide sales summaries for convenience but is **not a tax advisor**.

---

## 5. 🚫 Prohibited Activities
Vendors may **not**:

- List illegal, dangerous, counterfeit, or infringing products.  
- Misrepresent product origin, ingredients, or certifications.  
- Engage in deceptive, abusive, or off-platform sales intended to bypass Craved fees.  
- Use Craved Artisan data for unsolicited marketing or to contact users outside of the platform.  
- Post defamatory, obscene, or harassing content.  
- Sell or resell products that violate another user's intellectual property.  

Violation of these policies may result in **immediate suspension or termination** of your vendor account.

---

## 6. 🧾 Pricing, Refunds & Returns
- Vendors set their own prices, shipping fees, and refund policies.  
- All refund or exchange requests are handled **directly between vendor and customer**.  
- Craved Artisan may, at its discretion, mediate disputes but is **not obligated** to do so.  
- If repeated disputes or complaints arise, Craved Artisan may suspend your listings or account.

---

## 7. 🧠 AI Features & Automation Disclaimer
Craved Artisan provides AI-assisted tools to help vendors with product listings, analytics, and labeling.  

You acknowledge that:
- AI-generated content is **for convenience only** and may contain inaccuracies.  
- Vendors are fully responsible for verifying the accuracy, legality, and compliance of all listings, labels, and communications.  
- Craved Artisan is **not liable** for damages, losses, or claims arising from AI outputs.

---

## 8. 🏷️ Labeling & Food Safety
For food vendors, you must:
- Clearly display all required ingredient and allergen information.  
- Follow any applicable food safety and packaging laws.  
- Use Craved Artisan's label generator responsibly and verify accuracy before printing.  
- Understand that Craved Artisan's labeling tool is an **aid**, not a compliance guarantee.

**You agree that Craved Artisan is not responsible** for any illness, injury, or harm caused by your products.

---

## 9. 📦 Product Delivery, Pickup, & Drop Points
- Vendors may use drop-off or pickup locations ("Marketplace Partners") for distribution.  
- Vendors are responsible for ensuring the accuracy, safety, and readiness of all orders before drop-off.  
- Craved Artisan is **not responsible** for loss, spoilage, or damage to goods at third-party locations.  
- Vendors must adhere to designated pickup times and notify customers promptly of any changes.

---

## 10. 💥 Limitation of Liability
To the fullest extent permitted by law:
- Craved Artisan shall **not be liable** for any indirect, incidental, or consequential damages, lost profits, or loss of data.  
- Craved Artisan's total liability in any 12-month period shall not exceed the **total fees paid to Craved Artisan** during that same period.  

You agree to **indemnify and hold harmless** Craved Artisan, its affiliates, and employees from any claims, losses, or damages resulting from:
- Your listings, sales, or products  
- Your breach of this Agreement or the TOS  
- Customer or third-party disputes  

---

## 11. 🔒 Data, Privacy, and Analytics
- Craved Artisan may collect and use anonymized sales and traffic data to improve marketplace performance.  
- Vendors grant Craved Artisan a **limited, non-exclusive license** to use logos, product images, and descriptions for marketing and promotional purposes.  
- Personal data is handled according to the Craved Artisan Privacy Policy.

---

## 12. 📣 Marketing & Promotions
- Craved Artisan may feature your products in newsletters, advertisements, or promotional campaigns.  
- Participation in paid or premium promotions is optional.  
- Vendors may not represent themselves as official Craved Artisan employees or partners without written approval.

---

## 13. ⚙️ Termination & Suspension
Craved Artisan reserves the right to:
- Suspend or terminate a Vendor account for violations of this Agreement or the TOS.  
- Remove listings that violate marketplace standards.  
- Withhold pending payouts if fraud, chargebacks, or policy violations are detected.  

Vendors may terminate their account at any time via the platform's Settings panel.  
Upon termination:
- Outstanding orders must still be fulfilled.  
- Craved Artisan retains the right to archive your transaction records for legal and accounting purposes.

---

## 14. 🏛️ Governing Law
This Agreement is governed by the laws of the **State of Georgia, USA**.  
Any disputes shall be resolved through **binding arbitration** in Henry County, Georgia, unless otherwise required by law.

---

## 15. 🧱 Entire Agreement
This Agreement, together with the Craved Artisan **Terms of Service** and **Privacy Policy**, constitutes the entire understanding between the parties and supersedes all prior communications.

---

## 16. ✅ Acknowledgement
By checking "I Agree" during the signup process, you confirm that:
- You have read and understood this Vendor Service Agreement.  
- You accept full responsibility for your listings, sales, and business conduct.  
- You release Craved Artisan from all liability arising from your business operations.  

**Welcome to the Craved Artisan community — where independent makers thrive with integrity.**

---

**Version:** 1.0.0  
**Last Updated:** October 2025`
  },
  {
    type: 'COORDINATOR_AGREEMENT',
    version: '1.0',
    title: 'Event Coordinator Agreement',
    content: `# 🎪 Craved Artisan — Event Coordinator Agreement
**Effective Date:** October 2025  
**Last Updated:** October 2025  

This **Event Coordinator Agreement** ("**Agreement**") governs the use of Craved Artisan's event management features by any individual or organization ("**Coordinator**," "**you**," or "**your**") who creates, manages, or facilitates an event through the Craved Artisan Platform ("**Platform**"), owned and operated by **Craved Artisan, LLC** ("**Craved Artisan**," "**we**," or "**our**").  

By creating an event or activating an Event Coordinator account, you agree to this Agreement, as well as the [Terms of Service](./terms-of-service.md), [Privacy Policy](./privacy-policy.md), and all applicable Craved Artisan policies.

---

## 1. 🎯 Purpose of Agreement
Craved Artisan provides tools that allow event organizers, farmers' markets, community hosts, and coordinators to:
- Create and manage events
- Sell or allocate vendor stalls, tickets, or booth spaces
- Display event information to vendors and customers
- Process payments through Stripe Connect  

Craved Artisan acts **solely as a digital facilitator**, providing technology and communication tools.  
You, as the Coordinator, are **fully responsible** for all event operations, compliance, and outcomes.

---

## 2. ⚖️ Independent Coordinator Status
- You operate as an **independent entity**, not as an employee, agent, or partner of Craved Artisan.  
- You are responsible for all local permits, insurance, safety measures, and regulatory compliance required for your events.  
- Craved Artisan does not represent, endorse, or guarantee your events, attendees, or vendors.

**Plain version:**  
> You run the event — Craved Artisan provides the stage, not the show.

---

## 3. 💳 Payments, Fees, and Stripe Connect
- All payments for event registrations, vendor stalls, or ticket sales are processed securely through **Stripe Connect**.  
- Craved Artisan **does not handle or store** payment data.  
- Coordinators must complete Stripe onboarding to receive payouts.  
- Craved Artisan may deduct a **platform fee** from each transaction to cover hosting, marketing, and service costs.  
- Coordinators are responsible for all applicable **sales tax, permits, and insurance** tied to their event income.

**Craved Artisan is not responsible for:**
- Delayed Stripe payouts  
- Canceled transactions  
- Chargebacks, refunds, or disputes between Coordinators, vendors, or customers  

---

## 4. 🧾 Coordinator Responsibilities
By hosting or listing events on Craved Artisan, you agree to:

1. **Event Accuracy**
   - Provide complete, accurate, and up-to-date details for each event (date, time, location, description, pricing, and policies).
   - Promptly update or cancel events when necessary.

2. **Vendor & Attendee Management**
   - Ensure that vendors and attendees have clear instructions for arrival, setup, and participation.
   - Handle all communication, approval, and placement of vendors.

3. **Legal & Regulatory Compliance**
   - Obtain all necessary local permits or licenses.
   - Follow applicable city, county, or state ordinances regarding vendor markets, food handling, and crowd safety.
   - Maintain proper insurance for public events.

4. **Safety & Liability**
   - Provide a safe and secure environment for attendees and vendors.
   - Craved Artisan is **not liable** for injury, theft, loss, or accidents occurring at your event.

5. **Refunds & Cancellations**
   - Clearly state refund and cancellation policies in your event listing.
   - Manage all refund requests and communications directly with customers or vendors.

6. **Taxes & Reporting**
   - Maintain your own business and tax records.
   - Craved Artisan may provide transaction summaries but does not offer tax advice.

---

## 5. 🧠 AI & Analytics Disclaimer
Craved Artisan may provide AI-assisted tools for event pricing, planning, or promotion.  
These are **for convenience only** and may not reflect real-world conditions, attendance, or profitability.  
You are solely responsible for verifying and using the insights generated by Craved's AI or analytics tools.

---

## 6. 🚫 Prohibited Activities
Coordinators may **not**:
- Create fraudulent, unsafe, or misleading events.  
- Resell or redistribute vendor spots without permission.  
- Host events that promote illegal activity, discrimination, or violence.  
- Use Craved Artisan to bypass fees or conduct off-platform transactions.  
- Misrepresent themselves as employees, partners, or representatives of Craved Artisan.

Violations may result in **account suspension, removal of events**, or permanent termination.

---

## 7. 🧾 Liability & Indemnification
### 7.1 Coordinator Liability
You agree that:
- Craved Artisan is not liable for injuries, accidents, losses, or damages at your event.  
- You are fully responsible for the conduct of all vendors, staff, and attendees under your event's management.  
- You must hold all necessary **liability insurance** covering bodily injury, property damage, or claims arising from your event.

### 7.2 Indemnification
You agree to **indemnify and hold harmless** Craved Artisan, its affiliates, officers, and employees from any claims, damages, or liabilities arising from:
- Your event operations or omissions  
- Vendor, attendee, or customer disputes  
- Breach of this Agreement or applicable law  

---

## 8. 📢 Marketing & Promotion
- Craved Artisan may feature your event on its website, newsletters, or social media for promotional purposes.  
- You grant Craved Artisan a **non-exclusive license** to use your event name, imagery, and descriptions for marketing related to the Platform.  
- You may opt out of promotional use by contacting **support@cravedartisan.com**.

---

## 9. 🔒 Data & Privacy
- Craved Artisan collects only data necessary for event visibility, analytics, and transactions.  
- We do not sell personal data to third parties.  
- Coordinators must handle all attendee or vendor information responsibly and in accordance with privacy laws.  
- Misuse of user data may result in account termination and legal action.

---

## 10. 🧱 Platform Tools & Availability
Craved Artisan provides:
- Event management dashboards  
- Vendor slot management  
- Integrated messaging  
- Analytics and performance reports  

You understand that:
- Platform uptime is not guaranteed.  
- Craved Artisan is not liable for loss of data, technical errors, or outages.  
- You should maintain your own backups of event information.

---

## 11. ⚙️ Termination & Suspension
Craved Artisan may suspend or terminate your account or events without notice if:
- You violate this Agreement or the Terms of Service  
- You engage in fraudulent or unsafe practices  
- Your events generate repeated complaints or disputes  

You may cancel your account at any time, but all pending vendor and attendee obligations must still be honored.  
Craved Artisan retains the right to archive or retain your data for recordkeeping and compliance.

---

## 12. 🏛️ Governing Law
This Agreement shall be governed by and construed in accordance with the **laws of the State of Georgia, USA**, without regard to its conflict of law rules.  
All disputes shall be resolved through **binding arbitration in Henry County, Georgia**, unless otherwise required by applicable law.

*(If Craved Artisan expands nationally, this clause may be updated to use a neutral or remote arbitration framework.)*

---

## 13. 📜 Entire Agreement
This document, together with the **Craved Artisan Terms of Service** and **Privacy Policy**, constitutes the entire agreement between the parties and supersedes any prior agreements or representations.

---

## 14. ✅ Acknowledgement
By checking "I Agree" or creating an event through Craved Artisan, you confirm that:
- You have read and understood this Event Coordinator Agreement.  
- You accept full responsibility for your events, attendees, and vendors.  
- You release Craved Artisan from all liability arising from your event operations.  

**Welcome to Craved Artisan — where community markets and creative gatherings come to life.**

---

**File:** \`/docs/event-coordinator-agreement.md\`  
**Maintainer:** Craved Artisan Legal & Compliance  
**Version:** 1.0.0  
**Last Updated:** October 2025`
  }
];

async function seedLegalDocuments() {
  console.log('🌱 Seeding legal documents...');

  for (const doc of legalDocuments) {
    const existing = await prisma.legalDocument.findFirst({
      where: {
        type: doc.type,
        version: doc.version
      }
    });

    if (existing) {
      console.log(`  ℹ️  ${doc.title} v${doc.version} already exists, skipping...`);
      continue;
    }

    await prisma.legalDocument.create({
      data: doc
    });

    console.log(`  ✅ Created: ${doc.title} v${doc.version}`);
  }

  console.log('✨ Legal documents seeded successfully!');
}

seedLegalDocuments()
  .catch((error) => {
    console.error('❌ Error seeding legal documents:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

