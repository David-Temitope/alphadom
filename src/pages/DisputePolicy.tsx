import Head from 'next/head'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DisputePolicy = () => {
  return (
    <>
    <Head>
        <title>Dispute Policy</title>
        <meta name="robots" content="noindex, follow" />
    </Head>
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl">Dispute Resolution Policy</CardTitle>
          <p className="text-muted-foreground">Last updated: December 2024</p>
        </CardHeader>
        <CardContent className="space-y-6 text-sm md:text-base">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Overview</h2>
            <p>
              Alphadom is committed to providing a fair and transparent process for resolving disputes between customers and vendors. This policy outlines how disputes are handled on our platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Types of Disputes</h2>
            <p>Common disputes include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Product not as described</li>
              <li>Product not delivered</li>
              <li>Damaged or defective products</li>
              <li>Wrong item received</li>
              <li>Quality concerns</li>
              <li>Vendor communication issues</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Step 1: Direct Communication</h2>
            <p>
              We encourage customers to first attempt to resolve issues directly with the vendor. Many issues can be quickly resolved through direct communication. Vendors are required to respond to customer inquiries within 48 hours.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Step 2: File a Dispute</h2>
            <p>
              If direct communication does not resolve the issue, you may file a formal dispute through our platform:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Navigate to your <strong>Orders page</strong> and copy the Order ID for the affected order</li>
              <li>Go to the <a href="/contact" className="text-primary hover:underline font-medium">Contact page</a> and submit your complaint with the Order ID</li>
              <li>For faster response or if you need to share images, <a href="https://discord.gg/9nKy89ww" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">join our Discord server</a></li>
              <li>Provide detailed information and any available evidence</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Step 3: Platform Review</h2>
            <p>
              Once a dispute is filed, our team will:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Review all evidence provided by both parties</li>
              <li>Contact the vendor for their response</li>
              <li>Investigate the issue thoroughly</li>
              <li>Make a fair decision based on our policies</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Resolution Timeline</h2>
            <p>
              We aim to resolve disputes within 5-10 business days. Complex cases may take longer. You will be notified of the outcome via email and through your account dashboard.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Possible Outcomes</h2>
            <p>Depending on the investigation findings, resolutions may include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Full refund to the customer</li>
              <li>Partial refund</li>
              <li>Product replacement</li>
              <li>Vendor warning or suspension</li>
              <li>Case dismissed (if claim is unfounded)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Vendor Consequences</h2>
            <p>
              Vendors who frequently receive valid disputes may face consequences including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account suspension</li>
              <li>Reduced visibility on the platform</li>
              <li>Permanent shop closure for severe violations</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">9. False Claims</h2>
            <p>
              Filing false or fraudulent dispute claims is a violation of our Terms of Service. Customers found to be filing false claims may face account suspension.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">10. Contact Us</h2>
            <p>
              For dispute-related assistance, please contact us through:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: <a href="mailto:alphadomplatform@gmail.com" className="text-primary hover:underline">alphadomplatform@gmail.com</a></li>
              <li>Discord: <a href="https://discord.gg/rvbSEwUY" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Join our Discord Server</a></li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Please have your order ID ready for faster service.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default DisputePolicy;
