import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import * as path from 'path';
import { User, Order, Product } from '@prisma/client';
import { WelcomeEmailData, OrderEmailData } from '../types/email.types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private readonly templatesDir: string;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    this.templatesDir = path.join(process.cwd(), 'src/shared/email-templates');
  }

  // Render EJS template with data
  private async renderTemplate(
    template: string,
    data: Record<string, unknown>,
  ): Promise<string> {
    return await ejs.renderFile(
      path.join(this.templatesDir, `${template}.ejs`),
      data,
    );
  }

  // Send email function
  private async sendEmail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email to ${to}: ${errorMessage}`);
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  // Reset password email with token
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const html = await this.renderTemplate('password-reset', { resetToken });
    await this.sendEmail(to, 'Reset Your Password', html);
  }

  // Welcome email
  async sendWelcomeEmail(userData: WelcomeEmailData): Promise<void> {
    const html = await this.renderTemplate('welcome', {
      firstName: userData.firstName,
    });
    await this.sendEmail(userData.email, 'Welcome to Grand Customs! 🚗', html);
  }

  // Order confirmation email
  async sendOrderConfirmationEmail(emailData: OrderEmailData): Promise<void> {
    const html = await this.renderTemplate('order-confirmation', {
      order: emailData.order,
      user: emailData.user,
    });
    await this.sendEmail(
      emailData.user.email,
      'Order Confirmed - Grand Customs',
      html,
    );
  }

  // Order shipped email
  async sendOrderShippedEmail(order: Order & { user: User }): Promise<void> {
    const html = await this.renderTemplate('order-shipped', {
      order,
      user: order.user,
    });
    await this.sendEmail(
      order.user.email,
      'Order Shipped - Grand Customs',
      html,
    );
  }

  // Order cancelled email
  async sendOrderCancelledEmail(order: Order & { user: User }): Promise<void> {
    const html = await this.renderTemplate('order-cancelled', {
      order,
      user: order.user,
    });
    await this.sendEmail(
      order.user.email,
      'Order Cancelled - Grand Customs',
      html,
    );
  }

  // Admin low stock email
  async sendLowStockAlert(product: Product): Promise<void> {
    const html = await this.renderTemplate('low-stock-alert', {
      product,
    });
    await this.sendEmail(
      process.env.ADMIN_EMAIL!,
      `Low Stock Alert - ${product.name}`,
      html,
    );
  }

  // Admin order received email
  async sendOrderReceivedAdminEmail(
    order: Order & { user: User },
  ): Promise<void> {
    const html = await this.renderTemplate('admin-order-received', {
      order,
      user: order.user,
    });
    await this.sendEmail(
      process.env.ADMIN_EMAIL!,
      `New Order #${order.id} Received`,
      html,
    );
  }

  // Admin order cancelled emails
  async sendOrderCancelledAdminEmail(
    order: Order & {
      user: User;
      orderItems: {
        product: {
          name: string;
        };
        quantity: number;
      }[];
    },
  ): Promise<void> {
    const html = await this.renderTemplate('admin-order-cancelled', {
      order,
      user: order.user,
    });

    await this.sendEmail(
      process.env.ADMIN_EMAIL!,
      `Order #${order.id} Cancelled - Refund Required`,
      html,
    );
  }

  // Admin order delivered email
  async sendOrderDeliveredAdminEmail(
    order: Order & {
      user: User;
      orderItems: {
        product: {
          name: string;
        };
        quantity: number;
      }[];
    },
  ): Promise<void> {
    const html = await this.renderTemplate('admin-order-delivered', {
      order,
      user: order.user,
    });

    await this.sendEmail(
      process.env.ADMIN_EMAIL!,
      `Order #${order.id} Delivered Successfully`,
      html,
    );
  }
}
