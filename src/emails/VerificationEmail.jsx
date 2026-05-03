import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
  Font,
} from "@react-email/components";
import * as React from "react";

export default function VerificationEmail({ otp }) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Your Servify Verification Code</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header/Logo */}
          <Section style={logoContainer}>
             <Text style={logoText}>SERVIFY</Text>
             <Text style={tagline}>Professional Home Services</Text>
          </Section>

          <Hr style={hr} />

          {/* Content */}
          <Section style={contentSection}>
            <Heading style={h1}>Security Verification</Heading>
            <Text style={text}>
              Hello,
            </Text>
            <Text style={text}>
              To complete your registration on **Servify**, please use the 6-digit verification code below. This ensures your account is secure and verified.
            </Text>

            {/* OTP Box */}
            <Section style={otpWrapper}>
              <Text style={otpTitle}>VERIFICATION CODE</Text>
              <Text style={otpCode}>{otp}</Text>
              <Text style={otpExpiry}>Expires in 10 minutes</Text>
            </Section>

            <Text style={text}>
              If you didn't create an account, you can safely ignore this email.
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerHeader}>The Servify Team</Text>
            <Text style={footerText}>
              Empowering local service providers and customers.
            </Text>
            <div style={socialLinks}>
              <Link href="#" style={socialLink}>Facebook</Link> • 
              <Link href="#" style={socialLink}> Instagram</Link> • 
              <Link href="#" style={socialLink}> LinkedIn</Link>
            </div>
            <Text style={copyright}>
              © 2026 Servify. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f4f7f9",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  padding: "20px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px",
  borderRadius: "16px",
  maxWidth: "560px",
  border: "1px solid #e1e8ed",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
};

const logoContainer = {
  textAlign: "center",
  marginBottom: "20px",
};

const logoText = {
  fontSize: "32px",
  fontWeight: "900",
  color: "#ff7a00",
  letterSpacing: "4px",
  margin: "0",
  textAlign: "center",
};

const tagline = {
  fontSize: "12px",
  color: "#8898aa",
  textTransform: "uppercase",
  letterSpacing: "2px",
  marginTop: "4px",
  textAlign: "center",
};

const contentSection = {
  padding: "20px 0",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "26px",
  fontWeight: "800",
  textAlign: "center",
  margin: "0 0 24px 0",
  letterSpacing: "-0.5px",
};

const text = {
  color: "#4a5568",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const otpWrapper = {
  background: "#f9fafb",
  borderRadius: "12px",
  padding: "32px",
  textAlign: "center",
  margin: "32px 0",
  border: "1px solid #edf2f7",
};

const otpTitle = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#718096",
  letterSpacing: "1px",
  margin: "0 0 12px 0",
};

const otpCode = {
  color: "#ff7a00",
  fontSize: "48px",
  fontWeight: "900",
  letterSpacing: "12px",
  margin: "0",
  fontFamily: "monospace",
};

const otpExpiry = {
  fontSize: "13px",
  color: "#a0aec0",
  marginTop: "12px",
};

const hr = {
  borderColor: "#edf2f7",
  margin: "24px 0",
};

const footer = {
  textAlign: "center",
};

const footerHeader = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#2d3748",
  margin: "0 0 8px 0",
};

const footerText = {
  fontSize: "14px",
  color: "#718096",
  margin: "0 0 16px 0",
};

const socialLinks = {
  marginBottom: "20px",
};

const socialLink = {
  color: "#ff7a00",
  fontSize: "13px",
  textDecoration: "none",
  margin: "0 8px",
  fontWeight: "600",
};

const copyright = {
  fontSize: "12px",
  color: "#a0aec0",
  marginTop: "24px",
};
