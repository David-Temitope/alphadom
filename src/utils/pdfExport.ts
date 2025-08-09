import jsPDF from 'jspdf';

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_address: any;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    category: string;
  };
}

export const exportOrdersToPDF = async (orders: Order[], orderItems: Record<string, OrderItem[]>) => {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.height;
  let yPosition = 20;

  // Title
  pdf.setFontSize(20);
  pdf.text('Orders Export Report', 20, yPosition);
  yPosition += 20;

  // Date
  pdf.setFontSize(12);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
  yPosition += 20;

  // Summary
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const completedOrders = orders.filter(order => order.status === 'shipped').length;
  
  pdf.text(`Total Orders: ${orders.length}`, 20, yPosition);
  yPosition += 10;
  pdf.text(`Completed Orders: ${completedOrders}`, 20, yPosition);
  yPosition += 10;
  pdf.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 20, yPosition);
  yPosition += 20;

  // Orders details
  pdf.setFontSize(16);
  pdf.text('Order Details:', 20, yPosition);
  yPosition += 15;

  pdf.setFontSize(10);

  orders.forEach((order, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }

    // Order header
    pdf.setFontSize(12);
    pdf.text(`Order #${order.id.slice(0, 8)}`, 20, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, yPosition);
    pdf.text(`Status: ${order.status}`, 120, yPosition);
    yPosition += 8;

    pdf.text(`Payment: ${order.payment_method} (${order.payment_status})`, 20, yPosition);
    yPosition += 8;

    // Shipping address
    if (order.shipping_address) {
      const address = order.shipping_address;
      pdf.text(`Ship to: ${address.street}, ${address.city}, ${address.state} ${address.zipCode}`, 20, yPosition);
      yPosition += 8;
    }

    // Order items
    const items = orderItems[order.id] || [];
    if (items.length > 0) {
      pdf.text('Items:', 20, yPosition);
      yPosition += 6;

      items.forEach(item => {
        const productName = item.product?.name || 'Unknown Product';
        const itemTotal = item.quantity * item.price;
        pdf.text(`  • ${productName} (${item.quantity}x) - $${itemTotal.toFixed(2)}`, 25, yPosition);
        yPosition += 6;
      });
    }

    // Order totals
    pdf.text(`Subtotal: $${Number(order.subtotal || 0).toFixed(2)}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Shipping: $${Number(order.shipping_cost || 0).toFixed(2)}`, 20, yPosition);
    yPosition += 6;
    pdf.text(`Tax: $${Number(order.tax_amount || 0).toFixed(2)}`, 20, yPosition);
    yPosition += 6;
    pdf.setFontSize(11);
    pdf.text(`Total: $${Number(order.total_amount).toFixed(2)}`, 20, yPosition);
    yPosition += 15;

    // Add separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, yPosition - 5, 190, yPosition - 5);
    yPosition += 5;

    pdf.setFontSize(10);
  });

  // Save the PDF
  const fileName = `orders-export-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};