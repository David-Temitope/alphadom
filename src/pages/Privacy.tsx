import Head from "next/head";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  return (
    <>
    <Head>
        <meta name="robots" content="noindex, follow" />
        <title>Privacy Policy</title>
    </Head>

    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
            <p className="text-center text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              
              <h3 className="text-lg font-medium mb-2">Personal Information</h3>
              <p className="mb-3">We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Shipping and billing addresses</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Business information for vendor and dispatcher accounts</li>
                <li>Profile information and preferences</li>
              </ul>

              <h3 className="text-lg font-medium mb-2">Usage Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Information about your interactions with our platform</li>
                <li>Device information and IP addresses</li>
                <li>Browser type and operating system</li>
                <li>Pages visited and time spent on the platform</li>
                <li>Search queries and product views</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send transaction confirmations</li>
                <li>Send you technical notices and support messages</li>
                <li>Communicate with you about products, services, and promotions</li>
                <li>Personalize your experience on our platform</li>
                <li>Monitor and analyze trends and usage patterns</li>
                <li>Detect and prevent fraudulent activities</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
              
              <h3 className="text-lg font-medium mb-2">We may share information in the following circumstances:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>With Vendors and Dispatchers:</strong> To facilitate transactions and deliveries</li>
                <li><strong>With Service Providers:</strong> Third-party companies that help us operate our platform</li>
                <li><strong>For Legal Reasons:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or sales of assets</li>
                <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
              </ul>

              <h3 className="text-lg font-medium mb-2">We do NOT:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sell your personal information to third parties</li>
                <li>Share your payment information with vendors or dispatchers</li>
                <li>Use your information for purposes other than those stated in this policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="mb-3">We implement appropriate security measures to protect your information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure payment processing through certified providers</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal information on a need-to-know basis</li>
                <li>Multi-factor authentication for administrative accounts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Your Privacy Rights</h2>
              
              <h3 className="text-lg font-medium mb-2">You have the right to:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correct:</strong> Update or correct inaccurate personal information</li>
                <li><strong>Delete:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restrict:</strong> Limit how we process your information</li>
              </ul>

              <p className="mt-3">
                To exercise these rights, please contact us through our support system or customer service channels.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking Technologies</h2>
              <p className="mb-3">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Provide personalized content and recommendations</li>
                <li>Analyze platform usage and performance</li>
                <li>Improve security and prevent fraud</li>
              </ul>
              <p className="mt-3">
                You can control cookies through your browser settings, but some features may not work properly if cookies are disabled.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
              <p>
                Our platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place
                to protect your personal information in accordance with applicable data protection laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
              <p className="mb-3">We retain your information for as long as necessary to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Improve our services and platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our platform
                and updating the "Last updated" date. Your continued use of the platform after the changes take effect constitutes acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our privacy practices, please contact us through:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Our platform's support system</li>
                <li>Customer service channels</li>
                <li>The contact information provided in our Terms of Service</li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>

    </>
  );
};

export default Privacy;