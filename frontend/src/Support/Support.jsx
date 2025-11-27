// import React, { useState } from "react";
// import "./Support.css";

// function Support() {
//   const [openIndex, setOpenIndex] = useState(null);

//   const faqs = [
//     {
//       question: "How can I change my flight date?",
//       answer:
//         "You can change your flight date by visiting the 'My Flights' tab and selecting the flight you wish to modify.",
//     },
//     {
//       question: "How do I earn reward points?",
//       answer:
//         "You earn points for every completed flight. The amount depends on your ticket class and distance flown.",
//     },
//     {
//       question: "Can I check in without my confirmation code?",
//       answer:
//         "Yes, you can use your last name and frequent flyer number to check in if you’ve lost your confirmation code.",
//     },
//     {
//       question: "How do I contact customer service?",
//       answer:
//         "We’re available 24/7 via this form or by calling +1 (518) 555-0123.",
//     },
//   ];

//   return (
//     <div className="user-page support">
//       {/* ===== HEADER ===== */}
//       <h2 className="section-title">Customer Support</h2>
//       <p className="support-text">
//         Need help? Browse common questions or submit a support ticket.
//       </p>

//       {/* ===== SIDE-BY-SIDE LAYOUT ===== */}
//       <div className="support-layout">
//         {/* --- LEFT SIDE: FAQ --- */}
//         <div className="faq-section">
//           <h3 className="faq-title">Frequently Asked Questions</h3>
//           <div className="faq-list">
//             {faqs.map((faq, index) => (
//               <div
//                 key={index}
//                 className={`faq-item ${openIndex === index ? "open" : ""}`}
//                 onClick={() =>
//                   setOpenIndex(openIndex === index ? null : index)
//                 }
//               >
//                 <div className="faq-question">
//                   <span>{faq.question}</span>
//                   <span className="faq-icon">
//                     {openIndex === index ? "−" : "+"}
//                   </span>
//                 </div>
//                 {openIndex === index && (
//                   <div className="faq-answer">{faq.answer}</div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* --- RIGHT SIDE: SUPPORT FORM --- */}
//         <div className="support-form-container">
//           <form className="support-form">
//             <h3 className="form-title">Submit a Ticket</h3>
//             <p className="support-text">
//               Need help? Browse common questions or submit a support ticket.
//             </p>

//             <input type="text" placeholder="Your Name" />
//             <input type="email" placeholder="Your Email" /> {/* Added email field */}
//             <textarea placeholder="Describe your issue..." rows="4" />

//             <button type="submit">Submit Ticket</button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Support;


import React, { useState } from "react";
import axios from "axios";
import "./Support.css";

function Support() {
  const [openIndex, setOpenIndex] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [successMessage, setSuccessMessage] = useState("");

  const faqs = [
    {
      question: "How can I change my flight date?",
      answer:
        "You can change your flight date by visiting the 'My Flights' tab and selecting the flight you wish to modify.",
    },
    {
      question: "How do I earn reward points?",
      answer:
        "You earn points for every completed flight. The amount depends on your ticket class and distance flown.",
    },
    {
      question: "Can I check in without my confirmation code?",
      answer:
        "Yes, you can use your last name and frequent flyer number to check in if you’ve lost your confirmation code.",
    },
    {
      question: "How do I contact customer service?",
      answer:
        "We’re available 24/7 via this form or by calling +1 (518) 555-0123.",
    },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("liftoffUser"));

    try {
      await axios.post("http://localhost:9000/submitTicket", {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        userId: user?._id || null,
      });

      setSuccessMessage("✅ Your ticket has been submitted successfully!");

      setFormData({
        name: "",
        email: "",
        message: ""
      });

    } catch (err) {
      console.error("Submit Ticket Error:", err);
      alert("Error submitting ticket. Please try again.");
    }
  };

  return (
    <div className="user-page support">
      {/* ===== HEADER ===== */}
      <h2 className="section-title">Customer Support</h2>
      <p className="support-text">
        Need help? Browse common questions or submit a support ticket.
      </p>

      {/* ===== SIDE-BY-SIDE LAYOUT ===== */}
      <div className="support-layout">
        
        {/* --- LEFT SIDE: FAQ --- */}
        <div className="faq-section">
          <h3 className="faq-title">Frequently Asked Questions</h3>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${openIndex === index ? "open" : ""}`}
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              >
                <div className="faq-question">
                  <span>{faq.question}</span>
                  <span className="faq-icon">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </div>

                {openIndex === index && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT SIDE: SUPPORT FORM --- */}
        <div className="support-form-container">
          <form className="support-form" onSubmit={handleSubmit}>
            <h3 className="form-title">Submit a Ticket</h3>

            {successMessage && (
              <p style={{ color: "green", marginBottom: "10px" }}>
                {successMessage}
              </p>
            )}

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <textarea
              name="message"
              placeholder="Describe your issue..."
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
            />

            <button type="submit">Submit Ticket</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Support;

