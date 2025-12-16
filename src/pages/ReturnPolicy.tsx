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
              Alphadom allows customers to return products under certain conditions. This policy explains how returns work and what to expect throughout the process.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Return Eligibility</h2>
            <p>Products may be returned if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The item is unused and in its original packaging</li>
              <li>The return is initiated within 7 days of delivery</li>
              <li>The product is not damaged by the customer</li>
              <li>All tags and labels are still attached (for clothing items)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. How to Initiate a Return</h2>
            <p>To start a return:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact our support team with your order details</li>
              <li>Explain the reason for the return</li>
              <li>Wait for return authorization from our team</li>
              <li>Package the item securely for return shipping</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Return Shipping</h2>
            <p>
              Return shipping costs are typically the responsibility of the customer unless the return is due to a vendor error (wrong item, defective product, etc.). In such cases, the vendor will cover return shipping costs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Items That Cannot Be Returned</h2>
            <p>The following items are non-returnable:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Food and perishable goods</li>
              <li>Intimate apparel and swimwear</li>
              <li>Beauty products that have been opened</li>
              <li>Earrings and body jewelry (for hygiene reasons)</li>
              <li>Gift cards and vouchers</li>
              <li>Downloadable products</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Inspection and Processing</h2>
            <p>
              Once we receive your returned item, we will inspect it within 3-5 business days. You will be notified of the outcome via email or through your account dashboard.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Exchange Option</h2>
            <p>
              If you would like to exchange an item for a different size, color, or product, please indicate this when initiating your return. Exchanges are subject to product availability.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Contact Us</h2>
            <p>
              For return-related questions, please visit our Contact page or reach out through our Discord channel.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnPolicy;
