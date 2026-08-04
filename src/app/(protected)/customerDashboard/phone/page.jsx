"use client"

export default function PhonePage() {
  return (
    <div
  style={{
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#fff",
  }}
>
  <h2 style={{ color: "#ff7a00", marginBottom: "20px" }}>
    Contact Numbers
  </h2>

  <a
    href="tel:+1234567890"
    style={{
      color: "#ff7a00",
      fontSize: "28px",
      fontWeight: "bold",
      textDecoration: "none",
      margin: "10px 0",
      backgroundColor: "#fff",
      padding: "12px 24px",
      border: "2px solid #ff7a00",
      borderRadius: "8px",
    }}
  >
    +1 234 567 890
  </a>

  <a
    href="tel:+0987654321"
    style={{
      color: "#ff7a00",
      fontSize: "28px",
      fontWeight: "bold",
      textDecoration: "none",
      margin: "10px 0",
      backgroundColor: "#fff",
      padding: "12px 24px",
      border: "2px solid #ff7a00",
      borderRadius: "8px",
    }}
  >
    +0 987 654 321
  </a>
</div>

  );
}