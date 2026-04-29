const nodemailer = require('nodemailer');

const FROM = process.env.EMAIL_FROM || 'Coco Fashion Brands <cocofashionbrands@gmail.com>';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // 587 uses STARTTLS; set true only for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function formatUGX(amount) {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
  }).format(amount);
}

function parseAddress(shippingAddress) {
  return typeof shippingAddress === 'string'
    ? JSON.parse(shippingAddress)
    : shippingAddress;
}

function itemsTableHtml(items) {
  const rows = items.map(item => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-family:Arial,sans-serif;font-size:14px;color:#1f2937">
        <strong>${escapeHtml(item.name)}</strong>
        ${item.brand ? `<br><span style="color:#6b7280;font-size:13px">${escapeHtml(item.brand)}</span>` : ''}
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-family:Arial,sans-serif;font-size:14px;color:#374151;text-align:center">${item.quantity}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-family:Arial,sans-serif;font-size:14px;color:#374151;text-align:right">${formatUGX(item.unit_price)}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;font-family:Arial,sans-serif;font-size:14px;color:#1f2937;text-align:right;font-weight:600">${formatUGX(item.unit_price * item.quantity)}</td>
    </tr>
  `).join('');

  return `
    <table style="width:100%;border-collapse:collapse;margin:20px 0">
      <thead>
        <tr style="background:#f9fafb">
          <th style="padding:12px 16px;text-align:left;font-family:Arial,sans-serif;font-size:12px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px">Product</th>
          <th style="padding:12px 16px;text-align:center;font-family:Arial,sans-serif;font-size:12px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px">Qty</th>
          <th style="padding:12px 16px;text-align:right;font-family:Arial,sans-serif;font-size:12px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px">Price</th>
          <th style="padding:12px 16px;text-align:right;font-family:Arial,sans-serif;font-size:12px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function totalsHtml(order) {
  const shippingMethod = typeof order.shipping_method === 'string'
    ? JSON.parse(order.shipping_method || '{}')
    : (order.shipping_method || {});

  return `
    <table style="width:100%;max-width:320px;margin-left:auto;border-collapse:collapse;margin-top:16px">
      <tr>
        <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:14px;color:#6b7280">Subtotal</td>
        <td style="padding:4px 0;text-align:right;font-family:Arial,sans-serif;font-size:14px;color:#1f2937">${formatUGX(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:14px;color:#6b7280">Shipping (${escapeHtml(shippingMethod.name || 'Standard')})</td>
        <td style="padding:4px 0;text-align:right;font-family:Arial,sans-serif;font-size:14px;color:#1f2937">${formatUGX(shippingMethod.price || 0)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-family:Arial,sans-serif;font-size:14px;color:#6b7280">Tax (8%)</td>
        <td style="padding:4px 0;text-align:right;font-family:Arial,sans-serif;font-size:14px;color:#1f2937">${formatUGX(order.tax)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-top:2px solid #1f2937;font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:#1f2937">Total</td>
        <td style="padding:8px 0;border-top:2px solid #1f2937;text-align:right;font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:#1f2937">${formatUGX(order.total)}</td>
      </tr>
    </table>
  `;
}

function addressHtml(address) {
  const lines = [
    `${address.first_name} ${address.last_name}`,
    address.address,
    address.address_2,
    `${address.city}${address.district ? ', ' + address.district : ''}`,
    address.country,
    address.phone,
  ].filter(Boolean);

  return lines.map(l => escapeHtml(l)).join('<br>');
}

function statusMessage(status) {
  switch (status) {
    case 'confirmed': return 'Your order has been confirmed and is being processed.';
    case 'shipped': return 'Great news — your order is on its way!';
    case 'delivered': return 'Your order has been delivered. We hope you love it!';
    case 'cancelled': return 'Your order has been cancelled. If this was unexpected, please contact us.';
    default: return `Your order status has been updated to: ${status}.`;
  }
}

function baseEmail(content) {
  return `
    <div style="max-width:600px;margin:0 auto;padding:0">
      <div style="background:#000;padding:24px 32px;text-align:center">
        <span style="color:#fff;font-family:Georgia,serif;font-size:22px;font-weight:700;letter-spacing:1px">COCO'S FASHION BRANDS</span>
      </div>
      <div style="background:#fff;padding:32px">
        ${content}
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border-top:1px solid #e5e7eb">
        <p style="font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;margin:0 0 8px">
          Questions about your order? Reply to this email or visit our <a href="https://cocofashionbrands.com/contact" style="color:#374151">contact page</a>.
        </p>
        <p style="font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;margin:0">
          &copy; ${new Date().getFullYear()} Coco's Fashion Brands. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendEmail(options) {
  const info = await transporter.sendMail({
    from: FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  return info;
}

async function sendOrderConfirmation(order, items) {
  try {
    const address = parseAddress(order.shipping_address);

    const html = baseEmail(`
      <h2 style="font-family:Georgia,serif;font-size:20px;color:#1f2937;margin:0 0 8px">Thank you for your order!</h2>
      <p style="font-family:Arial,sans-serif;font-size:14px;color:#6b7280;margin:0 0 24px">
        Your order <strong style="color:#1f2937">#${order.id}</strong> has been confirmed.<br>
        Payment method: Cash on Delivery
      </p>

      <div style="background:#f9fafb;border-radius:6px;padding:20px;margin-bottom:24px">
        <p style="font-family:Arial,sans-serif;font-size:13px;color:#6b7280;margin:0 0 4px;text-transform:uppercase;letter-spacing:0.5px">Delivering to</p>
        <p style="font-family:Arial,sans-serif;font-size:14px;color:#1f2937;margin:0;line-height:1.6">
          ${addressHtml(address)}
        </p>
      </div>

      ${itemsTableHtml(items)}
      ${totalsHtml(order)}

      <p style="font-family:Arial,sans-serif;font-size:13px;color:#9ca3af;margin:24px 0 0">
        You'll receive another email when your order ships.
      </p>
    `);

    const recipientName = parseAddress(order.shipping_address).first_name || '';

    await sendEmail({
      from: FROM,
      to: [order.email],
      subject: `Order #${order.id} Confirmed${recipientName ? ' - Thank You, ' + recipientName : ''}!`,
      html,
    });

    console.log(`[email] Order confirmation sent for #${order.id} to ${order.email}`);
  } catch (error) {
    console.error(`[email] Failed to send confirmation for order #${order.id}:`, error.message);
  }
}

async function sendOrderStatusUpdate(order) {
  try {
    const address = parseAddress(order.shipping_address);
    const recipientName = address.first_name || '';

    const html = baseEmail(`
      <h2 style="font-family:Georgia,serif;font-size:20px;color:#1f2937;margin:0 0 8px">Order Update</h2>
      <p style="font-family:Arial,sans-serif;font-size:14px;color:#6b7280;margin:0 0 24px">
        Your order <strong style="color:#1f2937">#${order.id}</strong> status has been updated.
      </p>

      <div style="background:#f9fafb;border-radius:6px;padding:24px;text-align:center;margin-bottom:24px">
        <p style="font-family:Georgia,serif;font-size:18px;color:#1f2937;margin:0 0 8px;text-transform:capitalize">${escapeHtml(order.status)}</p>
        <p style="font-family:Arial,sans-serif;font-size:14px;color:#6b7280;margin:0">${statusMessage(order.status)}</p>
      </div>

      <p style="font-family:Arial,sans-serif;font-size:13px;color:#9ca3af;margin:0">
        If you have any questions, please contact our support team.
      </p>
    `);

    await sendEmail({
      from: FROM,
      to: [order.email],
      subject: `Your Order #${order.id} is ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
      html,
    });

    console.log(`[email] Status update sent for order #${order.id} (${order.status}) to ${order.email}`);
  } catch (error) {
    console.error(`[email] Failed to send status update for order #${order.id}:`, error.message);
  }
}

module.exports = { sendOrderConfirmation, sendOrderStatusUpdate };
