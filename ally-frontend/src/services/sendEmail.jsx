export const sendEmail = async (emailData, token) => {
    try {
      const response = await fetch("http://localhost:8080/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emailData),
      });
  
      if (response.ok) {
        const data = await response.text();
        console.log("Email sent successfully:", data);
      } else {
        const errorText = await response.text();
        console.error("Error sending email:", errorText);
      }
    } catch (error) {
      console.error("Failed to send email:", error.message);
    }
  };
  