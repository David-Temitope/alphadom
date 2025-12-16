import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DeliveryPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Delivery Policy</CardTitle>
          <p className="text-muted-foreground">Last updated: December 2024</p>
        </CardHeader>
        <CardContent className="space-y-6 text-sm md:text-base">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Overview</h2>
            <p>
              This policy outlines how Alphadom handles product deliveries. We work with vendors and dispatch riders to ensure your orders reach you safely and on time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Delivery Methods</h2>
            <p>Alphadom offers the following delivery options:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Vendor Self-Delivery:</strong> Vendors may choose to deliver orders themselves</li>
              <li><strong>Dispatch Rider Delivery:</strong> Vendors can assign dispatch riders registered under their shop</li>
              <li><strong>Platform Dispatch (Coming Soon):</strong> Alphadom's internal dispatch team</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Delivery Timeframes</h2>
            <p>
              Delivery times vary based on vendor location and your shipping address. Estimated delivery times are displayed at checkout and typically range from 1-7 business days within Nigeria.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Shipping Fees</h2>
            <p>
              Shipping fees are set by individual vendors and displayed on product pages. Fees may be calculated as a one-time flat rate or per product ordered, depending on the vendor's settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Order Tracking</h2>
            <p>
              Once your order is shipped, you can track its status through your Orders page. Status updates include: Pending, Processing, Shipped, and Delivered.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Delivery Confirmation</h2>
            <p>
              Upon delivery, you may be asked to confirm receipt of your order. Please inspect the package before confirming delivery to ensure all items are present and undamaged.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Failed Delivery Attempts</h2>
            <p>
              If delivery cannot be completed (e.g., incorrect address, recipient unavailable), the dispatch rider will attempt to contact you. After multiple failed attempts, the order may be returned to the vendor.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Delivery Issues</h2>
            <p>
              If you experience any issues with delivery (delays, damaged packages, missing items), please contact us immediately through our Contact page or Discord channel. Include your order ID for faster resolution.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">9. Vendor Responsibility</h2>
            <p>
              Vendors are responsible for packaging items securely and coordinating with dispatch riders. Alphadom monitors vendor performance to ensure delivery standards are maintained.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">10. Contact Us</h2>
            <p>
              For delivery inquiries, please contact us through:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: <a href="mailto:alphadomplatform@gmail.com" className="text-primary hover:underline">alphadomplatform@gmail.com</a></li>
              <li>Discord: <a href="https://discord.gg/rvbSEwUY" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Join our Discord Server</a></li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryPolicy;
