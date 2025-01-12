import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

interface EmailSettings {
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_password: string
  smtp_secure: boolean
  from_email: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { settings } = await req.json() as { settings: EmailSettings }

    // Validate required fields
    if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_password || !settings.from_email) {
      throw new Error('Missing required email settings')
    }

    // Create SMTP client
    const client = new SmtpClient()

    // Connect to SMTP server
    await client.connectTLS({
      hostname: settings.smtp_host,
      port: settings.smtp_port,
      username: settings.smtp_user,
      password: settings.smtp_password,
    })

    // Send test email
    await client.send({
      from: settings.from_email,
      to: settings.from_email,
      subject: "Test Email from Subscription Tracker",
      content: "This is a test email to verify your SMTP settings.",
    })

    // Close connection
    await client.close()

    return new Response(
      JSON.stringify({ success: true, message: 'Test email sent successfully' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to send test email',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})