import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationsService {
  async sendEmail(to: string, subject: string, message: string): Promise<void> {
    console.log(`Email sent to ${to}: [${subject}] ${message}`);
  }

  async sendSMS(to: string, message: string): Promise<void> {
    console.log(`SMS sent to ${to}: ${message}`);
  }
}
