import { Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class NotificationsService {
  sendEmail(to: string, subject: string, message: string): void {
    if (!to || !subject || !message) {
      throw new BadRequestException('Invalid email notification data');
    }

    console.log(`Email sent to ${to}: [${subject}] ${message}`);
  }

  sendSMS(to: string, message: string): void {
    if (!to || !message) {
      throw new BadRequestException('Invalid SMS notification data');
    }

    console.log(`SMS sent to ${to}: ${message}`);
  }
}
