import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ReturnPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Return Policy</CardTitle>
          <p className="text-muted-foreground">Last updated: December 2024</p>
        </CardHeader>
        <CardContent className="space-y-6 text-sm md:text-base">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Overview</h2>
            <p>
              Alphadom allows customers to return products under specific conditions. This policy explains the return requirements and process.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Return Eligibility</h2>
            <p>Products may only be returned if <strong>all</strong> of the following conditions are met:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Package is unused:</strong> The item must not have been used, worn, or consumed in any way.</li>
              <li><strong>Still in original packaging:</strong> The product must be in its original packaging with all tags, labels, and seals intact.</li>
              <li><strong>Within 7 days:</strong> The return must be initiated within 7 days of receiving the product.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Vendor Inspection</h2>
            <p>
              <strong>Important:</strong> The vendor is responsible for inspecting the returned product, not Alphadom. The vendor will verify that the product meets the return conditions before a refund or exchange is processed.
            </p>
            <p>
              If the vendor determines that the product does not meet return requirements (e.g., has been used or is damaged), the return request may be denied.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. How to Initiate a Return</h2>
            <p>To start a return:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact our support team at <a href="mailto:alphadominity@gmail.com" className="text-primary hover:underline">alphadominity@gmail.com</a> with your order details</li>
              <li>Explain the reason for the return</li>
              <li>Wait for return authorization from our team</li>
              <li>Package the item securely in its original packaging</li>
              <li>Ship the item back to the vendor for inspection</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Return Shipping</h2>
            <p>
              Return shipping costs are the responsibility of the customer unless the return is due to a vendor error (wrong item, defective product received). In such cases, the vendor will cover return shipping costs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Items That Cannot Be Returned</h2>
            <p>The following items are non-returnable:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Items that have been opened, used, or damaged by the customer</li>
              <li>Items without original packaging</li>
              <li>Food and perishable goods</li>
              <li>Intimate apparel and swimwear</li>
              <li>Beauty products that have been opened</li>
              <li>Earrings and body jewelry (for hygiene reasons)</li>
              <li>Gift cards and vouchers</li>
              <li>Downloadable or digital products</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Processing Time</h2>
            <p>
              Once the vendor receives and inspects your returned item, you will be notified of the outcome within 3-5 business days via email or through your account dashboard.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Contact Us</h2>
            <p>
              For return-related questions, please contact us at:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: <a href="mailto:alphadominity@gmail.com" className="text-primary hover:underline">alphadominity@gmail.com</a></li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnPolicy;
