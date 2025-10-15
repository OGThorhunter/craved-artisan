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
    version: '1.0',
    title: 'Privacy & Data Use Policy',
    content: `# Craved Artisan Privacy & Data Use Policy

**Effective Date:** ${new Date().toLocaleDateString()}

## 1. Information We Collect

We collect information necessary to operate and improve your experience:
- Account information (name, email, password)
- Profile information (business details, preferences)
- Transaction data (orders, payments, history)
- Usage data (how you interact with our platform)
- Location data (ZIP code for marketplace discovery)
- Communication data (messages, support tickets)

## 2. How We Use Your Information

Your information is used to:
- Provide and maintain our services
- Process transactions and payments
- Communicate with you about your account and orders
- Improve our platform and user experience
- Provide customer support
- Prevent fraud and enhance security
- Comply with legal obligations

## 3. Data Sharing

We do **not sell your personal data** to third parties.

We may share information with:
- Service providers who help operate our platform (e.g., payment processors, hosting providers)
- Other users as necessary for transactions (e.g., vendors see customer shipping addresses)
- Law enforcement when required by law
- Business partners with your explicit consent

## 4. Data Usage Rights

By continuing to use Craved Artisan, you grant us a **perpetual, non-exclusive license** to use anonymized or aggregated user data for internal business purposes including—but not limited to—platform optimization, analytics, AI-assisted features, and product improvement initiatives.

Individual personal data is never sold or shared for marketing purposes without your explicit consent.

## 5. Your Data Rights

You have the right to:
- Access your personal data
- Correct inaccurate information
- Request data deletion (subject to legal retention requirements)
- Export your data
- Opt-out of marketing communications
- Withdraw consent for optional data processing

## 6. Data Security

We implement industry-standard security measures to protect your data:
- Encryption in transit and at rest
- Regular security audits
- Access controls and authentication
- Secure payment processing through Stripe

## 7. Cookies and Tracking

We use cookies and similar technologies to:
- Maintain your session
- Remember your preferences
- Analyze platform usage
- Provide personalized experiences

You can control cookie settings through your browser.

## 8. Data Retention

We retain your data for as long as necessary to:
- Provide our services
- Comply with legal obligations
- Resolve disputes
- Enforce our agreements

## 9. Children's Privacy

Craved Artisan is not intended for users under 18. We do not knowingly collect information from children.

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of significant changes through the platform or via email.

## 11. Contact Us

For privacy-related questions or to exercise your data rights, contact us at privacy@cravedartisan.com

By using Craved Artisan, you acknowledge that you have read and understood this Privacy & Data Use Policy.`
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
    title: 'Vendor Services Agreement',
    content: `# Vendor Services Agreement

**Effective Date:** ${new Date().toLocaleDateString()}

## 1. Vendor Relationship

By operating as a vendor on Craved Artisan, you acknowledge and agree that:

- You are an **independent business operator**, not an employee or agent of Craved Artisan
- You are solely responsible for your business operations
- Craved Artisan provides a marketplace platform and tools, but does not operate your business
- You maintain full control over your products, pricing, and business decisions

## 2. Marketplace Framework

**Craved Artisan is not:**
- A retailer, distributor, or reseller of your products
- A guarantor of your products or services
- Responsible for your business practices
- A party to transactions between you and customers

**Craved Artisan provides:**
- A platform to list and sell products
- Payment processing infrastructure
- Tools for order management and fulfillment
- Marketing and discovery features
- Customer communication tools

## 3. Payment Processing

### Stripe Connect
- All payments are processed through **Stripe Connect**
- You must complete Stripe onboarding to receive payments
- Craved Artisan receives a 2% platform fee on each transaction
- The remaining 98% is transferred directly to your Stripe account
- Payment terms are subject to Stripe's policies

### Platform Fee
- Platform fee: 2% of each transaction
- Fee is automatically deducted during payment processing
- Covers platform operation, payment processing, and support
- May be adjusted with 30 days notice to vendors

## 4. Product Responsibility

You are solely responsible for:

### Product Quality & Safety
- Ensuring products meet quality standards
- Compliance with food safety regulations (if applicable)
- Proper labeling and ingredient disclosure
- Allergen warnings and nutrition information
- Product freshness and expiration dates

### Legal Compliance
- Obtaining required business licenses and permits
- Health department approvals (for food vendors)
- Tax collection and remittance
- Labor law compliance
- Zoning and operating regulations
- Insurance coverage

### Product Listings
- Accuracy of product descriptions
- Quality of product images
- Honest representation of ingredients and materials
- Accurate pricing information
- Availability and inventory management

## 5. Order Fulfillment

You agree to:
- Fulfill orders in a timely manner
- Meet promised delivery or pickup times
- Communicate clearly about order status
- Handle special requests professionally
- Package products safely and appropriately
- Resolve customer issues promptly

## 6. Customer Service

You are responsible for:
- Responding to customer inquiries
- Handling complaints and disputes
- Processing refunds when appropriate
- Maintaining professional communication
- Building positive customer relationships

## 7. Vacation Mode & Availability

- You may use "Vacation Mode" to temporarily pause operations
- Must provide advance notice for extended closures
- Should update availability status regularly
- Orders must be fulfilled before entering vacation mode

## 8. Prohibited Activities

Vendors may not:
- Sell prohibited or illegal items
- Misrepresent products or ingredients
- Engage in deceptive practices
- Manipulate reviews or ratings
- Coordinate with other vendors to fix prices
- Use the platform for unauthorized marketing
- Collect customer data for external use

## 9. Intellectual Property

You retain ownership of:
- Your brand name and trademarks
- Product recipes and formulations (trade secrets)
- Original photos and content

You grant Craved Artisan:
- Right to display your content on the platform
- Right to use your name and images for marketing
- Right to feature your products in promotional materials

## 10. Indemnification

You agree to indemnify Craved Artisan from:
- Customer disputes or claims related to your products
- Regulatory actions or violations
- Product liability claims
- Intellectual property infringement
- Food safety incidents
- Personal injury or property damage
- Breach of this agreement

## 11. Insurance Requirements

Recommended insurance coverage:
- General liability insurance
- Product liability insurance
- Business property insurance
- Commercial auto (if delivering)

Craved Artisan may require proof of insurance for certain activities.

## 12. Data & Analytics

Craved Artisan may:
- Collect data on sales, trends, and customer behavior
- Use aggregated data for platform improvements
- Provide you with analytics and insights
- Share anonymized data with partners

Your individual business data remains confidential.

## 13. Termination

Either party may terminate this agreement:
- With 30 days written notice
- Immediately for material breach
- Immediately for illegal activities

Upon termination:
- Complete pending orders
- Resolve outstanding customer issues
- Export your data within 30 days
- Final payments processed per normal schedule

## 14. Account Suspension

Craved Artisan may suspend your account for:
- Violation of platform policies
- Customer complaints or safety concerns
- Non-compliance with legal requirements
- Suspicious or fraudulent activity
- Non-payment of fees

## 15. Fee Structure

**Current fees:**
- Platform fee: 2% per transaction
- No monthly or listing fees
- No setup fees
- Payment processing handled by Stripe (subject to Stripe fees)

**Fee changes:**
- 30 days advance notice for fee increases
- Continued use after notice constitutes acceptance

## 16. Support & Resources

Craved Artisan provides:
- Customer support for platform issues
- Educational resources and guides
- Community forums and networking
- Tools for business growth

## 17. Modifications

Craved Artisan may modify this agreement with:
- 30 days notice for material changes
- Email notification to all vendors
- Continued operation constitutes acceptance

## 18. Governing Law

This agreement is governed by the laws of Georgia, USA.

## Acknowledgment

**I acknowledge that as a Vendor on Craved Artisan:**

✓ I operate as an independent business and am solely responsible for compliance with all applicable laws, taxes, and product quality standards

✓ Craved Artisan provides the marketplace framework but is **not a retailer, distributor, or guarantor** of vendor products

✓ I am responsible for product safety, quality, labeling, and legal compliance

✓ I will maintain appropriate insurance and business licenses

✓ I will fulfill orders professionally and handle customer issues responsibly

✓ I accept the 2% platform fee and payment processing through Stripe Connect

**Contact:** vendor-support@cravedartisan.com`
  },
  {
    type: 'COORDINATOR_AGREEMENT',
    version: '1.0',
    title: 'Event Coordinator Agreement',
    content: `# Event Coordinator Agreement

**Effective Date:** ${new Date().toLocaleDateString()}

## 1. Coordinator Relationship

By operating as an Event Coordinator on Craved Artisan, you acknowledge and agree that:

- You are an **independent event organizer**, not an employee or agent of Craved Artisan
- You are solely responsible for all aspects of event planning and execution
- Craved Artisan provides event management tools and platform access
- You maintain full control over your events, vendor selection, and operations

## 2. Platform Role

**Craved Artisan is not:**
- An event planner or producer
- Responsible for event logistics or outcomes
- A party to agreements between you and vendors
- Liable for event cancellations, accidents, or disputes
- An insurance provider or guarantor

**Craved Artisan provides:**
- Event listing and promotion platform
- Vendor stall/booth management tools
- Payment processing for stall rentals
- Customer ticket/registration management
- Communication and coordination tools
- Analytics and reporting features

## 3. Event Coordinator Responsibilities

### Legal & Regulatory Compliance

You are solely responsible for:
- Obtaining all required permits and licenses
- Venue insurance and liability coverage
- Health department approvals (if food is involved)
- Fire marshal and safety inspections
- Alcohol permits (if applicable)
- Music licensing (ASCAP, BMI, etc.)
- ADA compliance and accessibility
- Parking and traffic management
- Security arrangements

### Event Management

You must:
- Select and approve participating vendors
- Set clear rules and expectations
- Manage event logistics and setup
- Ensure vendor compliance with event rules
- Handle event-day operations
- Coordinate with venue management
- Manage crowd control and safety
- Respond to emergencies appropriately

### Vendor Relations

You are responsible for:
- Communicating event details to vendors
- Enforcing booth/stall agreements
- Resolving vendor disputes
- Ensuring vendors have proper permits
- Managing vendor check-in and setup
- Collecting any additional vendor fees
- Providing promised vendor amenities

## 4. Payment Processing

### Stripe Connect
- All stall/booth payments processed through **Stripe Connect**
- Must complete Stripe onboarding to receive payments
- Craved Artisan receives 2% platform fee on stall rentals
- Remaining 98% transferred to your Stripe account
- Refund policies determined by you (within reason)

### Platform Fee
- 2% fee on all stall/booth/ticket transactions
- Automatically deducted during processing
- Covers platform operation and support
- May be adjusted with 30 days notice

## 5. Safety & Liability

### Event Safety

You must:
- Conduct site safety assessments
- Implement emergency procedures
- Provide adequate security
- Ensure fire safety compliance
- Have first aid available
- Plan for weather contingencies
- Manage capacity limits
- Ensure proper lighting and signage

### Liability Insurance

**Required insurance coverage:**
- General liability insurance (minimum $1M recommended)
- Event liability insurance
- Vendor liability requirements
- Workers' compensation (if applicable)
- Cancellation insurance (recommended)

You must provide proof of insurance upon request.

## 6. Event Listings

### Accurate Information

Event listings must include:
- Accurate date, time, and location
- Clear description of event type and activities
- Honest representation of expected attendance
- Transparent pricing for stalls/booths
- Amenities and services provided
- Cancellation and refund policies
- Rules and requirements for vendors

### Prohibited Events

You may not organize events that:
- Violate local laws or regulations
- Promote illegal activities
- Discriminate against protected classes
- Create unsafe conditions
- Misrepresent the nature of the event

## 7. Vendor Management

### Vendor Selection

You have the right to:
- Approve or deny vendor applications
- Set vendor requirements and criteria
- Determine stall/booth assignments
- Enforce event rules and standards
- Remove vendors for violations

### Vendor Disputes

You are responsible for:
- Resolving conflicts between vendors
- Handling vendor complaints
- Enforcing stall/booth agreements
- Managing vendor no-shows
- Processing vendor refunds per your policy

## 8. Customer/Attendee Management

You must:
- Provide accurate event information
- Handle attendee inquiries
- Manage ticket sales (if applicable)
- Process refunds per your policy
- Ensure customer safety
- Respond to complaints professionally
- Maintain event schedule

## 9. Event Cancellations

### Your Responsibility

If you cancel an event:
- Provide maximum advance notice
- Refund vendors per your cancellation policy
- Refund customers/attendees appropriately
- Communicate clearly about cancellation reasons
- Reschedule or offer alternatives if possible

### Force Majeure

For cancellations due to:
- Severe weather
- Natural disasters
- Government restrictions
- Emergencies

You must still handle refunds and communications professionally, though liability may be limited per your terms.

## 10. Marketing & Promotion

You may:
- Promote events through Craved Artisan
- Use platform marketing tools
- Create custom promotional materials
- Use social media integration
- Collect email lists (with consent)

Craved Artisan may:
- Feature your events in platform marketing
- Use event photos and information
- Include events in email newsletters
- Promote events on social media

## 11. Data & Privacy

You must:
- Comply with privacy laws (GDPR, CCPA, etc.)
- Protect vendor and attendee data
- Use data only for event purposes
- Obtain consent for marketing communications
- Provide privacy policies for data collection

Craved Artisan provides:
- Secure data storage
- Privacy-compliant tools
- Data export capabilities
- Analytics and reporting

## 12. Financial Obligations

### Platform Fees
- 2% on all stall/booth transactions
- No setup or monthly fees
- Payment processing fees (via Stripe)

### Tax Responsibilities
You are responsible for:
- Collecting applicable taxes
- Filing tax returns
- Reporting event income
- Issuing receipts to vendors
- Compliance with local tax laws

## 13. Indemnification

You agree to indemnify Craved Artisan from:
- Event-related accidents or injuries
- Property damage at events
- Vendor or customer disputes
- Regulatory violations
- Permit or licensing issues
- Security incidents
- Weather-related issues
- Breach of this agreement
- Third-party claims related to your events

## 14. Insurance & Hold Harmless

You agree that:
- Craved Artisan is not liable for event outcomes
- You hold Craved Artisan harmless from event-related claims
- You maintain adequate insurance coverage
- You will add Craved Artisan as additional insured (if requested)

## 15. Platform Tools & Features

Craved Artisan provides:
- Event creation and management tools
- Stall/booth inventory system
- Vendor application management
- Layout and mapping tools (optional)
- Check-in and attendance tracking
- Payment processing integration
- Analytics and reporting
- Communication tools

## 16. Termination

Either party may terminate with:
- 30 days written notice
- Immediate termination for material breach
- Immediate termination for safety violations

Upon termination:
- Complete all scheduled events or provide refunds
- Export your data within 30 days
- Resolve outstanding issues
- Final payments processed per schedule

## 17. Account Suspension

Craved Artisan may suspend your account for:
- Safety violations or incidents
- Repeated vendor/customer complaints
- Non-compliance with legal requirements
- Fraudulent activity
- Violation of platform policies

## 18. Modifications

Craved Artisan may modify this agreement with 30 days notice. Continued use after notice constitutes acceptance.

## 19. Dispute Resolution

Disputes shall be resolved through:
1. Good faith negotiation
2. Mediation (if negotiation fails)
3. Binding arbitration in Georgia, USA

## 20. Governing Law

This agreement is governed by the laws of the State of Georgia, USA.

## Acknowledgment

**As an Event Coordinator, I confirm that:**

✓ I am responsible for all legal and logistical obligations associated with my events

✓ Craved Artisan acts solely as a digital facilitator and bears **no liability** for the management or outcome of hosted events

✓ I will obtain all required permits, licenses, and insurance coverage

✓ I will ensure participant safety and venue compliance

✓ I will handle vendor and customer issues professionally

✓ I accept the 2% platform fee and Stripe Connect payment processing

✓ I will communicate honestly and transparently about event details

✓ I understand my obligations for event cancellations and refunds

**Contact:** coordinator-support@cravedartisan.com`
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

