import { EmailAdapter } from "../Channels/email.adapter"
import { TemplateService } from "../Templates/templates"

type EmailEventType = "otp_email" | "login_notification" | "welcome_email"

export class Orchestrator {
  static async handleEmailEvent(eventType: EmailEventType, payload: any): Promise<void> {
    switch (eventType) {
      case "otp_email":
        await this.handleOtpEmail(payload)
        break
      case "welcome_email":
        await this.handleOtpEmail(payload)
        break
      default:
        break
    }
  }

  private static async handleOtpEmail(payload: string[]) {
    const [email, otp] = payload
    const subject = 'Your OTP Code'
    const html = await TemplateService.renderEmail("send_otp", { otp }) 
    await EmailAdapter.send(email, subject, html.html)
  }
}

