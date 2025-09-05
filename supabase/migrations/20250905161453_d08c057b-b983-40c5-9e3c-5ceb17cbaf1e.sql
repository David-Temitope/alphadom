-- Add comprehensive notification triggers for users, vendors, and dispatchers

-- Function to create notifications for order approval
CREATE OR REPLACE FUNCTION public.notify_order_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify customer when order is approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO user_notifications (user_id, title, message, type, related_id)
    VALUES (
      NEW.user_id,
      'Order Approved',
      CONCAT('Your order #', SUBSTRING(NEW.id::text, 1, 8), ' has been approved and is being processed.'),
      'order',
      NEW.id
    );
  END IF;
  
  -- Notify customer when order is shipped
  IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
    INSERT INTO user_notifications (user_id, title, message, type, related_id)
    VALUES (
      NEW.user_id,
      'Order Shipped',
      CONCAT('Your order #', SUBSTRING(NEW.id::text, 1, 8), ' has been shipped and is on the way!'),
      'order',
      NEW.id
    );
  END IF;
  
  -- Notify customer when order is delivered
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    INSERT INTO user_notifications (user_id, title, message, type, related_id)
    VALUES (
      NEW.user_id,
      'Order Delivered',
      CONCAT('Your order #', SUBSTRING(NEW.id::text, 1, 8), ' has been delivered successfully!'),
      'order',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to notify vendors about new orders
CREATE OR REPLACE FUNCTION public.notify_vendor_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify vendor about new order
  IF NEW.vendor_id IS NOT NULL THEN
    INSERT INTO user_notifications (user_id, title, message, type, related_id)
    SELECT 
      av.user_id,
      'New Order Received',
      CONCAT('You have received a new order #', SUBSTRING(NEW.id::text, 1, 8), ' worth $', NEW.total_amount),
      'order',
      NEW.id
    FROM approved_vendors av
    WHERE av.id = NEW.vendor_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to notify on stock alerts
CREATE OR REPLACE FUNCTION public.notify_stock_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify vendor about stock issues
  INSERT INTO user_notifications (user_id, title, message, type, related_id)
  SELECT 
    p.vendor_user_id,
    CASE 
      WHEN NEW.alert_type = 'out_of_stock' THEN 'Product Out of Stock'
      WHEN NEW.alert_type = 'low_stock' THEN 'Low Stock Alert'
      ELSE 'Stock Alert'
    END,
    CASE 
      WHEN NEW.alert_type = 'out_of_stock' THEN CONCAT('Your product "', p.name, '" is now out of stock!')
      WHEN NEW.alert_type = 'low_stock' THEN CONCAT('Your product "', p.name, '" is running low on stock.')
      ELSE CONCAT('Stock alert for product "', p.name, '"')
    END,
    'stock',
    NEW.product_id
  FROM products p
  WHERE p.id = NEW.product_id AND p.vendor_user_id IS NOT NULL;
  
  RETURN NEW;
END;
$$;

-- Function to notify about application approvals
CREATE OR REPLACE FUNCTION public.notify_application_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify about shop application status changes
  IF TG_TABLE_NAME = 'shop_applications' THEN
    IF NEW.status != OLD.status THEN
      INSERT INTO user_notifications (user_id, title, message, type, related_id)
      VALUES (
        NEW.user_id,
        CASE 
          WHEN NEW.status = 'approved' THEN 'Shop Application Approved'
          WHEN NEW.status = 'rejected' THEN 'Shop Application Rejected'
          WHEN NEW.status = 'payment' THEN 'Payment Required for Shop'
          ELSE 'Shop Application Update'
        END,
        CASE 
          WHEN NEW.status = 'approved' THEN 'Congratulations! Your shop application has been approved. Please complete payment to activate your shop.'
          WHEN NEW.status = 'rejected' THEN 'Your shop application has been rejected. Please review and reapply if needed.'
          WHEN NEW.status = 'payment' THEN 'Your shop is ready! Please complete the payment to start selling.'
          ELSE CONCAT('Your shop application status has been updated to: ', NEW.status)
        END,
        'application',
        NEW.id
      );
    END IF;
  END IF;
  
  -- Notify about dispatch application status changes
  IF TG_TABLE_NAME = 'dispatch_applications' THEN
    IF NEW.status != OLD.status THEN
      INSERT INTO user_notifications (user_id, title, message, type, related_id)
      VALUES (
        NEW.user_id,
        CASE 
          WHEN NEW.status = 'approved' THEN 'Dispatch Application Approved'
          WHEN NEW.status = 'rejected' THEN 'Dispatch Application Rejected'
          WHEN NEW.status = 'payment' THEN 'Payment Required for Dispatch'
          ELSE 'Dispatch Application Update'
        END,
        CASE 
          WHEN NEW.status = 'approved' THEN 'Congratulations! Your dispatch application has been approved. Please complete payment to start delivering.'
          WHEN NEW.status = 'rejected' THEN 'Your dispatch application has been rejected. Please review and reapply if needed.'
          WHEN NEW.status = 'payment' THEN 'Your dispatch account is ready! Please complete the payment to start working.'
          ELSE CONCAT('Your dispatch application status has been updated to: ', NEW.status)
        END,
        'application',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to notify dispatchers about delivery requests
CREATE OR REPLACE FUNCTION public.notify_dispatcher_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify dispatcher when assigned to a delivery
  IF NEW.dispatcher_id IS NOT NULL AND (OLD.dispatcher_id IS NULL OR OLD.dispatcher_id != NEW.dispatcher_id) THEN
    INSERT INTO user_notifications (user_id, title, message, type, related_id)
    SELECT 
      ad.user_id,
      'New Delivery Request',
      CONCAT('You have been requested for a delivery. Fee: $', NEW.shipping_fee, '. Check your dashboard for details.'),
      'delivery',
      NEW.id
    FROM approved_dispatchers ad
    WHERE ad.id = NEW.dispatcher_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_notify_order_approval ON orders;
DROP TRIGGER IF EXISTS trigger_notify_vendor_new_order ON orders;
DROP TRIGGER IF EXISTS trigger_notify_stock_alert ON admin_stock_alerts;
DROP TRIGGER IF EXISTS trigger_notify_shop_application_approval ON shop_applications;
DROP TRIGGER IF EXISTS trigger_notify_dispatch_application_approval ON dispatch_applications;
DROP TRIGGER IF EXISTS trigger_notify_dispatcher_request ON delivery_requests;

-- Create triggers for comprehensive notifications
CREATE TRIGGER trigger_notify_order_approval
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_approval();

CREATE TRIGGER trigger_notify_vendor_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_vendor_new_order();

CREATE TRIGGER trigger_notify_stock_alert
  AFTER INSERT ON admin_stock_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_stock_alert();

CREATE TRIGGER trigger_notify_shop_application_approval
  AFTER UPDATE ON shop_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_application_approval();

CREATE TRIGGER trigger_notify_dispatch_application_approval
  AFTER UPDATE ON dispatch_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_application_approval();

CREATE TRIGGER trigger_notify_dispatcher_request
  AFTER UPDATE ON delivery_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_dispatcher_request();