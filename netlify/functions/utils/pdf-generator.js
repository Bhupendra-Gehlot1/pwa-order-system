/**
 * PDF Generator Utility
 * Creates elegant invoice PDFs using pdf-lib with brand logo
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

// Brand colors - Deep Navy Blue & Gold
const NAVY = rgb(0.106, 0.165, 0.357);    // #1B2A5B
const GOLD = rgb(0.773, 0.647, 0.353);    // #C5A55A
const DARK_TEXT = rgb(0.13, 0.13, 0.13);  // #212121
const MID_TEXT = rgb(0.33, 0.33, 0.33);   // #545454
// const LIGHT_TEXT = rgb(0.50, 0.50, 0.50); // #808080 - reserved for future use
const WHITE = rgb(1, 1, 1);
const CREAM = rgb(0.992, 0.984, 0.969);   // #FDF8F7
const BORDER = rgb(0.88, 0.86, 0.82);     // #E0DCD1

/**
 * Draw a decorative gold line with small diamond accents
 */
const drawDecorativeDivider = (page, x, y, lineWidth) => {
  const midX = x + lineWidth / 2;
  // Left line
  page.drawLine({
    start: { x: x, y },
    end: { x: midX - 12, y },
    thickness: 0.75,
    color: GOLD
  });
  // Center diamond
  const d = 3;
  page.drawLine({ start: { x: midX - d, y }, end: { x: midX, y: y + d }, thickness: 0.75, color: GOLD });
  page.drawLine({ start: { x: midX, y: y + d }, end: { x: midX + d, y }, thickness: 0.75, color: GOLD });
  page.drawLine({ start: { x: midX + d, y }, end: { x: midX, y: y - d }, thickness: 0.75, color: GOLD });
  page.drawLine({ start: { x: midX, y: y - d }, end: { x: midX - d, y }, thickness: 0.75, color: GOLD });
  // Right line
  page.drawLine({
    start: { x: midX + 12, y },
    end: { x: x + lineWidth, y },
    thickness: 0.75,
    color: GOLD
  });
};

/**
 * Try to load the logo from various possible paths
 */
const loadLogo = async () => {
  const cwd = process.cwd();
  const possiblePaths = [
    // Netlify function context (production)
    '/var/task/public/icons/logo.png',
    '/var/task/netlify/functions/public/icons/logo.png',
    // Relative paths (development/local) - try multiple relative locations
    path.resolve(cwd, 'public/icons/logo.png'),
    path.resolve(cwd, '../public/icons/logo.png'),
    path.resolve(cwd, '../../public/icons/logo.png'),
    path.resolve(cwd, '../../../public/icons/logo.png'),
    // Try from netlify/functions/utils directory
    path.resolve(cwd, 'netlify/functions/utils/../../../public/icons/logo.png'),
    path.resolve(cwd, 'netlify/functions/utils/../../../../public/icons/logo.png'),
    // Fallback relative paths
    path.join(cwd, 'public', 'icons', 'logo.png'),
    path.join(cwd, '..', 'public', 'icons', 'logo.png'),
    path.join(cwd, '..', '..', 'public', 'icons', 'logo.png')
  ];

  for (const logoPath of possiblePaths) {
    try {
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        return logoBuffer;
      }
    } catch (error) {
      // Try next path - silently continue
      continue;
    }
  }

  // Logo not found - return null gracefully
  console.log('Logo not found in any of the attempted paths');
  return null;
};

/**
 * Generate PDF invoice
 * @param {Object} orderData - Order data including user info and items
 * @returns {Promise<Uint8Array>} - PDF as byte array
 */
export const generateInvoicePDF = async (orderData) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const margin = 50;
    const contentWidth = width - margin * 2;

    // ===== WHITE BACKGROUND =====
    page.drawRectangle({ x: 0, y: 0, width, height, color: WHITE });

    // ===== TOP GOLD ACCENT BAR =====
    page.drawRectangle({ x: 0, y: height - 6, width, height: 6, color: GOLD });

    // ===== NAVY SIDE ACCENT =====
    page.drawRectangle({ x: 0, y: 0, width: 4, height: height - 6, color: NAVY });

    // ===== OUTER BORDER FRAME =====
    // Top
    page.drawLine({ start: { x: 20, y: height - 20 }, end: { x: width - 20, y: height - 20 }, thickness: 0.5, color: BORDER });
    // Bottom
    page.drawLine({ start: { x: 20, y: 20 }, end: { x: width - 20, y: 20 }, thickness: 0.5, color: BORDER });
    // Left
    page.drawLine({ start: { x: 20, y: 20 }, end: { x: 20, y: height - 20 }, thickness: 0.5, color: BORDER });
    // Right
    page.drawLine({ start: { x: width - 20, y: 20 }, end: { x: width - 20, y: height - 20 }, thickness: 0.5, color: BORDER });

    let yPosition = height - 50;

    // ===== LOGO SECTION =====
    let logoEndX = margin;
    try {
      const logoBytes = await loadLogo();
      if (logoBytes) {
        try {
          const logoImage = await pdfDoc.embedPng(logoBytes);
          const logoScale = 70 / logoImage.height;
          const logoWidth = logoImage.width * logoScale;
          const logoHeight = 70;
          page.drawImage(logoImage, {
            x: margin,
            y: yPosition - logoHeight + 15,
            width: logoWidth,
            height: logoHeight
          });
          logoEndX = margin + logoWidth + 15;
        } catch (embedError) {
          // Logo embed failed (might not be PNG), continue without it
          console.log('Logo embed failed, continuing without logo');
        }
      }
    } catch (loadError) {
      // Logo loading failed, continue without it
      console.log('Logo loading failed, continuing without logo');
    }

    // ===== BRAND NAME - next to logo =====
    page.drawText('SS CLOTHES, SUMERPUR', {
      x: logoEndX,
      y: yPosition,
      size: 20,
      font: boldFont,
      color: NAVY
    });


    // ===== INVOICE BADGE - right side =====
    const badgeWidth = 110;
    const badgeHeight = 32;
    const badgeX = width - margin - badgeWidth;
    const badgeY = yPosition - 8;
    page.drawRectangle({
      x: badgeX, y: badgeY, width: badgeWidth, height: badgeHeight, color: NAVY
    });
    const invoiceText = 'INVOICE';
    const invoiceTextWidth = boldFont.widthOfTextAtSize(invoiceText, 14);
    page.drawText(invoiceText, {
      x: badgeX + (badgeWidth - invoiceTextWidth) / 2,
      y: badgeY + 10,
      size: 14,
      font: boldFont,
      color: GOLD
    });

    yPosition -= 60;

    // ===== DECORATIVE DIVIDER =====
    drawDecorativeDivider(page, margin, yPosition, contentWidth);

    yPosition -= 30;

    // ===== ORDER META - two columns =====
    // Left: Order ID
    page.drawText('ORDER ID', {
      x: margin,
      y: yPosition,
      size: 8,
      font: boldFont,
      color: GOLD
    });
    page.drawText(orderData.orderId, {
      x: margin,
      y: yPosition - 15,
      size: 11,
      font: regularFont,
      color: DARK_TEXT
    });

    // Right: Date
    page.drawText('DATE', {
      x: width - margin - 150,
      y: yPosition,
      size: 8,
      font: boldFont,
      color: GOLD
    });
    page.drawText(new Date(orderData.orderDate).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    }), {
      x: width - margin - 150,
      y: yPosition - 15,
      size: 11,
      font: regularFont,
      color: DARK_TEXT
    });

    yPosition -= 50;

    // ===== BILL TO SECTION =====
    // Cream background box
    page.drawRectangle({
      x: margin, y: yPosition - 58, width: contentWidth, height: 72,
      color: CREAM
    });
    // Left gold accent on the box
    page.drawRectangle({
      x: margin, y: yPosition - 58, width: 3, height: 72, color: GOLD
    });

    page.drawText('BILL TO', {
      x: margin + 15,
      y: yPosition,
      size: 8,
      font: boldFont,
      color: GOLD
    });

    page.drawText(orderData.userName, {
      x: margin + 15,
      y: yPosition - 18,
      size: 12,
      font: boldFont,
      color: NAVY
    });

    page.drawText(orderData.userEmail, {
      x: margin + 15,
      y: yPosition - 34,
      size: 10,
      font: regularFont,
      color: MID_TEXT
    });

    page.drawText(orderData.userMobile, {
      x: margin + 15,
      y: yPosition - 48,
      size: 10,
      font: regularFont,
      color: MID_TEXT
    });

    yPosition -= 85;

    // ===== ORDER ITEMS LABEL =====
    page.drawText('ORDER ITEMS', {
      x: margin,
      y: yPosition,
      size: 8,
      font: boldFont,
      color: GOLD
    });

    yPosition -= 40;

    // ===== TABLE HEADER =====
    const headerHeight = 30;
    page.drawRectangle({
      x: margin, y: yPosition - 8, width: contentWidth, height: headerHeight, color: NAVY
    });

    const colItem = margin + 12;
    const colPrice = 320;
    const colQty = 400;
    const colSubtotal = 470;

    page.drawText('ITEM', { x: colItem, y: yPosition + 2, size: 9, font: boldFont, color: GOLD });
    page.drawText('PRICE', { x: colPrice, y: yPosition + 2, size: 9, font: boldFont, color: GOLD });
    page.drawText('QTY', { x: colQty, y: yPosition + 2, size: 9, font: boldFont, color: GOLD });
    page.drawText('SUBTOTAL', { x: colSubtotal, y: yPosition + 2, size: 9, font: boldFont, color: GOLD });

    yPosition -= 30;

    // ===== TABLE ROWS =====
    orderData.items.forEach((item, index) => {
      // Alternating row background
      if (index % 2 === 0) {
        page.drawRectangle({
          x: margin, y: yPosition - 6, width: contentWidth, height: 26, color: CREAM
        });
      }

      const itemName = item.itemName.length > 32
        ? item.itemName.substring(0, 29) + '...'
        : item.itemName;

      page.drawText(itemName, { x: colItem, y: yPosition + 2, size: 10, font: regularFont, color: DARK_TEXT });
      page.drawText(`Rs.${item.price.toFixed(2)}`, { x: colPrice, y: yPosition + 2, size: 10, font: regularFont, color: MID_TEXT });
      page.drawText(item.quantity.toString(), { x: colQty, y: yPosition + 2, size: 10, font: regularFont, color: MID_TEXT });

      const subtotal = (item.price * item.quantity).toFixed(2);
      page.drawText(`Rs.${subtotal}`, { x: colSubtotal, y: yPosition + 2, size: 10, font: boldFont, color: DARK_TEXT });

      yPosition -= 26;
    });

    yPosition -= 8;

    // Thin gold line above total
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 0.75,
      color: GOLD
    });

    yPosition -= 25;

    // ===== TOTAL BOX =====
    const totalBoxWidth = 190;
    const totalBoxHeight = 42;
    const totalBoxX = width - margin - totalBoxWidth;
    page.drawRectangle({
      x: totalBoxX, y: yPosition - 8, width: totalBoxWidth, height: totalBoxHeight, color: NAVY
    });

    page.drawText('TOTAL', {
      x: totalBoxX + 15,
      y: yPosition + 5,
      size: 12,
      font: boldFont,
      color: GOLD
    });

    const totalAmountStr = `Rs.${orderData.totalAmount.toFixed(2)}`;
    const totalAmountWidth = boldFont.widthOfTextAtSize(totalAmountStr, 16);
    page.drawText(totalAmountStr, {
      x: totalBoxX + totalBoxWidth - totalAmountWidth - 15,
      y: yPosition + 3,
      size: 16,
      font: boldFont,
      color: WHITE
    });

    yPosition -= 60;

    // ===== DECORATIVE DIVIDER =====
    drawDecorativeDivider(page, margin, yPosition, contentWidth);

    yPosition -= 30;

    // ===== THANK YOU =====
    page.drawText('Thank you for choosing SS Clothes Sumerpur.', {
      x: margin,
      y: yPosition,
      size: 11,
      font: regularFont,
      color: NAVY
    });

    yPosition -= 18;

    page.drawText('We appreciate your business and look forward to serving you again.', {
      x: margin,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: MID_TEXT
    });

    // ===== FOOTER BAR =====
    const footerHeight = 65;
    page.drawRectangle({
      x: 0, y: 0, width, height: footerHeight, color: NAVY
    });
    // Gold line on top of footer
    page.drawLine({
      start: { x: 0, y: footerHeight },
      end: { x: width, y: footerHeight },
      thickness: 2,
      color: GOLD
    });

    // Footer content
    page.drawText('SS CLOTHES, SUMERPUR', {
      x: margin,
      y: 42,
      size: 9,
      font: boldFont,
      color: GOLD
    });

    page.drawText('06, Ground Floor, Pushprishi Arcade, Arya Samaj Road, Sumerpur – 306902', {
      x: margin,
      y: 28,
      size: 8,
      font: regularFont,
      color: rgb(0.7, 0.7, 0.7)
    });

    page.drawText('@ss__clothessumerpur', {
      x: margin,
      y: 14,
      size: 8,
      font: regularFont,
      color: rgb(0.7, 0.7, 0.7)
    });

    // Page number - right
    const pageText = 'Page 1 of 1';
    const pageTextWidth = regularFont.widthOfTextAtSize(pageText, 8);
    page.drawText(pageText, {
      x: width - margin - pageTextWidth,
      y: 14,
      size: 8,
      font: regularFont,
      color: rgb(0.7, 0.7, 0.7)
    });

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF invoice');
  }
};

/**
 * Generate PDF filename
 * @param {string} orderId - Order ID
 * @returns {string} - Filename for the PDF
 */
export const generatePDFFilename = (orderId) => {
  const date = new Date().toISOString().split('T')[0];
  return `invoice-${orderId}-${date}.pdf`;
};

/**
 * Convert PDF bytes to base64 (for email attachments)
 * @param {Uint8Array} pdfBytes - PDF as byte array
 * @returns {string} - Base64 encoded PDF
 */
export const pdfToBase64 = (pdfBytes) => {
  return Buffer.from(pdfBytes).toString('base64');
};
