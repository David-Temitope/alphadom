import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RefundPolicy = () => {
  return (
    <>

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
              At Alphadom, we are committed to ensuring customer satisfaction. This refund policy outlines the specific conditions under which refunds will be issued for products purchased through our platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Eligibility for Refunds</h2>
            <p>We will only issue refunds under the following conditions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Product not delivered within 7 days:</strong> If the product ordered is not delivered within 7 days of the order being placed, you are eligible for a full refund.</li>
              <li><strong>Product returned in good condition:</strong> The product must be returned to the vendor in its original, undamaged condition for a refund to be processed.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Refund Request Timeline</h2>
            <p>
              Refund requests must be submitted within 7 days of the expected delivery date if the product has not arrived. Requests made after this period may not be eligible for consideration.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. How to Request a Refund</h2>
            <p>To request a refund:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact our support team via email at <a href="mailto:alphadominity@gmail.com" className="text-primary hover:underline">alphadominity@gmail.com</a></li>
              <li>Provide your order ID and proof that the product was not delivered within 7 days</li>
              <li>If applicable, provide evidence that the product has been returned to the vendor</li>
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
            <h2 className="text-lg font-semibold">6. Non-Refundable Situations</h2>
            <p>Refunds will <strong>not</strong> be issued for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Products delivered within 7 days of order placement</li>
              <li>Products returned in damaged or used condition</li>
              <li>Products where the customer provided an incorrect delivery address</li>
              <li>Change of mind after the product has been delivered</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Contact Us</h2>
            <p>
              For refund-related inquiries, please contact us at:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: <a href="mailto:alphadominity@gmail.com" className="text-primary hover:underline">alphadominity@gmail.com</a></li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default RefundPolicy;
