const nodemailer = require("nodemailer");

class EmailManager {

    constructor() {
       
    }

    async logXML() {

         // Get Mailer To Go SMTP connection details
        let mailertogo_host     = process.env.MAILERTOGO_SMTP_HOST;
        let mailertogo_port     = process.env.MAILERTOGO_SMTP_PORT || 587;
        let mailertogo_user     = process.env.MAILERTOGO_SMTP_USER;
        let mailertogo_password = process.env.MAILERTOGO_SMTP_PASSWORD;
        let mailertogo_domain   = process.env.MAILERTOGO_DOMAIN || "mydomain.com";

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: mailertogo_host,
            port: mailertogo_port,
            requireTLS: true, // Must use STARTTLS
            auth: {
            user: mailertogo_user,
            pass: mailertogo_password,
            },
        });

        // Sender domain must match mailertogo_domain or otherwise email will not be sent
        let from = `"Croissant Notifications" <noreply@${mailertogo_domain}>`;

        // Change to recipient email. Make sure to use a real email address in your tests to avoid hard bounces and protect your reputation as a sender.
        let to = `"DQ Griffin" <dquavius.griffin@ringcentral.com>`;

        let subject = "Mailer To Go Test";

        // Send mail with defined transport object
        let info = await transporter.sendMail({
            from: from, // Sender address, must use the Mailer To Go domain
            to: to, // Recipients
            subject: subject, // Subject line
            text: "Test from Mailer To Go 😊.", // Plain text body
            html: "Test from <b>Mailer To Go</b> 😊.", // HTML body
        });
    }


}

module.exports = EmailManager