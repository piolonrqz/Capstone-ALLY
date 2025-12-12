export const sendEmail = async (emailData, token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/email/send`, {
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
