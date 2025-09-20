import { EmailAdapter } from "../Channels/email.adapter"
import { TemplateService } from "../Templates/template.service"

type EmailEventType = "otp_email" | "login_notification" | "welcome_email"

export class Orchestrator {
  static async handleEmailEvent(eventType: EmailEventType, payload: any): Promise<void> {
    switch (eventType) {
      case "otp_email":
        await this.handleOtpEmail(payload)
        break
      case "login_notification":
        await this.sendByTemplate("login_notification", payload)
        break
      case "welcome_email":
        await this.sendByTemplate("welcome_email", payload)
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

  private static async sendByTemplate(templateName: string, variables: Record<string, string>) {
    const { subject, html } = await TemplateService.renderEmail(templateName, variables as any)
    const to = variables.email
    await EmailAdapter.send(to, subject, html)
  }
}

