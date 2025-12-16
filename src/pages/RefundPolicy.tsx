import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RefundPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Refund Policy</CardTitle>
          <p className="text-muted-foreground">Last updated: December 2024</p>
        </CardHeader>
        <CardContent className="space-y-6 text-sm md:text-base">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Overview</h2>
            <p>
              At Alphadom, we want you to be completely satisfied with your purchase. This refund policy outlines the conditions under which refunds may be issued for products purchased through our platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Eligibility for Refunds</h2>
            <p>You may be eligible for a refund if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The product received is significantly different from the description</li>
              <li>The product is damaged or defective upon arrival</li>
              <li>The wrong product was delivered</li>
              <li>The product was not delivered within the promised timeframe</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Refund Request Timeline</h2>
            <p>
              Refund requests must be submitted within 7 days of receiving your order. Requests made after this period may not be eligible for consideration.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. How to Request a Refund</h2>
            <p>To request a refund:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact our support team via the Contact page</li>
              <li>Provide your order ID and reason for the refund request</li>
              <li>Include photos or evidence if the product is damaged or defective</li>
              <li>Wait for our team to review your request (usually within 2-3 business days)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Refund Processing</h2>
            <p>
              Once approved, refunds will be processed within 5-10 business days. The refund will be credited to the original payment method used for the purchase.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Non-Refundable Items</h2>
            <p>The following items are generally not eligible for refunds:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Perishable goods (food items)</li>
              <li>Personal care items that have been opened</li>
              <li>Customized or personalized products</li>
              <li>Products damaged due to misuse by the customer</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Vendor Responsibility</h2>
            <p>
              Vendors on Alphadom are required to honor this refund policy. Disputes between customers and vendors will be mediated by our platform team to ensure fair resolution.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Contact Us</h2>
            <p>
              For refund-related inquiries, please contact us through our Contact page or reach out via our social media channels.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundPolicy;
