import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
  return (
    <>

    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms and Conditions</CardTitle>
            <p className="text-center text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using this marketplace platform, you accept and agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Platform Usage</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium">For All Users:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must be at least 18 years old to use this platform</li>
                  <li>You are responsible for maintaining the confidentiality of your account</li>
                  <li>You agree to provide accurate and complete information</li>
                  <li>You will not use the platform for any illegal or unauthorized purposes</li>
                </ul>
                
                <h3 className="text-lg font-medium">For Vendors:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All products must be legal and comply with local regulations</li>
                  <li>Product descriptions must be accurate and truthful</li>
                  <li>You are responsible for order fulfillment and customer service</li>
                  <li>A commission fee will be charged on each successful sale</li>
                </ul>

                <h3 className="text-lg font-medium">For Dispatchers:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <p>We don't handle dispatch for now</p>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Prohibited Content and Activities</h2>
              <p className="mb-3">The following activities and content are strictly prohibited:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Immoral, explicit, or adult content</li>
                <li>Illegal drugs, weapons, or controlled substances</li>
                <li>Counterfeit or pirated products</li>
                <li>Spam, harassment, or abusive behavior</li>
                <li>False advertising or misleading product information</li>
                <li>Activities that violate local laws and regulations</li>
                <li>Discrimination based on race, gender, religion, or nationality</li>
                <li><strong>False accusations are strictly prohibited</strong> - Filing false claims against vendors, customers, or the platform may result in immediate account termination and potential legal action</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Payment and Fees</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All transactions are processed through our secure payment system</li>
                <li>Vendors are responsible for applicable taxes on their sales</li>
                <li>Platform commission rates are clearly stated during registration</li>
                <li>Refunds and returns are subject to individual vendor policies. We connect buyers and sellers through our secure online platform. Products are listed and fulfilled directly by independent vendors.</li>
                <li>Payment processing fees may apply to transactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Account Suspension and Termination</h2>
              <p className="mb-3">We reserve the right to suspend or terminate accounts for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violation of these terms and conditions</li>
                <li>Fraudulent or suspicious activities</li>
                <li>Multiple customer complaints</li>
                <li>Failure to comply with platform policies</li>
                <li>Non-payment of fees or commissions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <p>
                All content, trademarks, and intellectual property on this platform remain the property of their respective owners.
                Users are prohibited from using copyrighted material without proper authorization.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p>
                The platform acts as an intermediary between buyers, sellers, and dispatchers. While we are not directly responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Quality or condition of products sold</li>
                <li>Disputes between customers and vendors</li>
                <li>Loss or damage during delivery</li>
              </ul>
              <p className="mt-4">
                <strong>Your safety matters to us.</strong> We have comprehensive policies in place to protect our users:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Our <a href="/dispute-policy" className="text-primary hover:underline">Dispute Resolution Policy</a> ensures fair handling of all complaints</li>
                <li>Our <a href="/refund-policy" className="text-primary hover:underline">Refund Policy</a> protects buyers from fraudulent transactions</li>
                <li>All vendors are verified before they can sell on our platform</li>
                <li>We actively monitor and take action against bad actors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or platform notifications.
                Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p>
                For questions about these Terms and Conditions, please contact us through the platform's support system or customer service channels.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default Terms;