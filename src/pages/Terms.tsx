import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms and Conditions</CardTitle>
            <p className="text-center text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. About Alphadom Platform</h2>
              <p>
                Alphadom is a marketplace platform that creates a bridge between vendors and customers. We help vendors sell their products 
                online through our platform. By using this platform, you accept and agree to be bound by these terms and conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Platform Role and Responsibilities</h2>
              <div className="space-y-3">
                <p>
                  <strong>We are a connecting platform only:</strong> Alphadom does not own any products listed on the platform unless 
                  explicitly stated with our platform name on the product page. We serve as an intermediary connecting independent vendors 
                  with customers.
                </p>
                <p>
                  <strong>Product ownership:</strong> All products are owned and managed by independent vendors. Vendors are responsible 
                  for product quality, descriptions, and availability.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Platform Usage</h2>
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
                  <li>You must provide delivery evidence on our Discord server before receiving payment</li>
                  <li>You are responsible for arranging delivery through your own dispatch services</li>
                </ul>

                <h3 className="text-lg font-medium">For Dispatchers:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <p>We don't handle dispatch for now</p>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Payment Process and Security</h2>
              <div className="space-y-3">
                <p>
                  <strong>Payment flow:</strong> All payments for orders must be made via bank transfer to the Alphadom platform bank account. 
                  This is a security measure to protect both customers and vendors from fraud and scams.
                </p>
                <p>
                  <strong>Vendor payment:</strong> Once a vendor provides proof of product delivery to the customer on our Discord server, 
                  we will process the payment transfer to the vendor's account. This ensures customers receive their orders before vendors 
                  receive payment.
                </p>
                <p>
                  <strong>Delivery verification:</strong> Vendors must submit delivery evidence (photos, delivery confirmation, etc.) on our 
                  official Discord server. Payment will only be released after verification.
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Vendors are responsible for applicable taxes on their sales</li>
                  <li>Platform commission rates are clearly stated during vendor registration</li>
                  <li>Refunds and returns are subject to verification and vendor policies</li>
                  <li>Payment processing may take 2-5 business days after delivery confirmation</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Delivery and Order Fulfillment</h2>
              <div className="space-y-3">
                <p>
                  <strong>Vendor responsibility:</strong> For now, Alphadom is not responsible for order delivery. Vendors must arrange 
                  and send their own dispatch services to fulfill customer orders.
                </p>
                <p>
                  <strong>Delivery tracking:</strong> Vendors should provide customers with tracking information and estimated delivery times.
                </p>
                <p>
                  <strong>Delivery issues:</strong> Any delivery problems or disputes should be resolved directly between vendors and customers, 
                  with platform support available for mediation.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Account Suspension and Termination</h2>
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
              <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
              <p>
                All content, trademarks, and intellectual property on this platform remain the property of their respective owners.
                Users are prohibited from using copyrighted material without proper authorization.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p>
                Alphadom acts as a connecting platform between buyers and sellers. We facilitate transactions but are not directly responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Quality or condition of products sold by independent vendors</li>
                <li>Disputes between customers and vendors (though we provide mediation support)</li>
                <li>Loss or damage during delivery arranged by vendors</li>
                <li>Vendor compliance with delivery commitments</li>
              </ul>
              <p className="mt-3">
                However, we implement payment security measures to protect all parties from fraud and ensure vendors provide delivery proof 
                before receiving payment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or platform notifications.
                Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
              <p>
                For questions about these Terms and Conditions, please contact us through the platform's support system or customer service channels.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;