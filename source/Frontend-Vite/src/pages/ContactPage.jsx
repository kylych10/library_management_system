import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const contactInfo = [
  {
    icon: <EmailIcon sx={{ fontSize: 24, color: '#4F46E5' }} />,
    title: 'Email Us',
    value: 'kylychbek.parpiev@alatoo.edu.kg',
    sub: 'We reply within 24 hours',
  },
  {
    icon: <PhoneIcon sx={{ fontSize: 24, color: '#4F46E5' }} />,
    title: 'Call Us',
    value: '+996 (773) 191-101',
    sub: 'Mon–Fri, 9am–6pm',
  },
  {
    icon: <LocationOnIcon sx={{ fontSize: 24, color: '#4F46E5' }} />,
    title: 'Visit Us',
    value: 'Bishkek, Kyrgyzstan',
    sub: 'Ala-Too International University',
  },
  {
    icon: <AccessTimeIcon sx={{ fontSize: 24, color: '#4F46E5' }} />,
    title: 'Working Hours',
    value: 'Mon–Fri: 9am – 6pm',
    sub: 'Sat: 10am – 4pm',
  },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    // Simulate send
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <AutoAwesomeIcon sx={{ fontSize: 16 }} />
            <span>Get in Touch</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            We'd Love to{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Hear From You
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question, suggestion, or just want to say hello?
            Our team is always happy to help.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {contactInfo.map((c, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                  {c.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{c.title}</h3>
                <p className="text-gray-800 font-medium text-sm mb-0.5">{c.value}</p>
                <p className="text-gray-400 text-xs">{c.sub}</p>
              </div>
            ))}
          </div>

          {/* Form + Map */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send a Message</h2>
              <p className="text-gray-500 mb-8">Fill out the form and we'll get back to you shortly.</p>

              {sent ? (
                <div className="flex flex-col items-center text-center py-10">
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
                    <CheckCircleIcon sx={{ fontSize: 48, color: '#10B981' }} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 mb-6">Thank you for reaching out. We'll reply within 24 hours.</p>
                  <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="text-indigo-600 font-medium hover:underline text-sm">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                      <input name="name" required value={form.name} onChange={handleChange}
                        placeholder="Kylychbek Parpiev"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                      <input name="email" type="email" required value={form.email} onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                    <select name="subject" required value={form.subject} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 text-sm transition-all bg-white">
                      <option value="">Select a topic…</option>
                      <option>General Inquiry</option>
                      <option>Book Recommendation</option>
                      <option>Technical Support</option>
                      <option>Account Issue</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                    <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
                      placeholder="Tell us how we can help…"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 text-sm resize-none transition-all" />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <SendIcon sx={{ fontSize: 18 }} /> Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Map + info */}
            <div className="space-y-6">
              {/* Map placeholder */}
              <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-gradient-to-br from-indigo-100 to-purple-100 h-72 flex items-center justify-center">
                <iframe
                  title="Ala-Too International University"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2923.0!2d74.5698!3d42.8746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x389ec83d8b1b3d0f%3A0x6d1b1f2e3a4c5d6e!2sAla-Too+International+University!5e0!3m2!1sen!2skg!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  onError={e => e.target.style.display = 'none'}
                />
              </div>

              {/* FAQ */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                {[
                  { q: 'How do I borrow a book?', a: 'Create an account, subscribe to a plan, then browse and borrow any available book instantly.' },
                  { q: 'Is there a mobile app?', a: 'Our web app is fully responsive and works great on all devices. A native app is coming soon.' },
                  { q: 'Can I suggest new books?', a: 'Yes! Use the contact form above or reach us by email to suggest books for our catalog.' },
                ].map((faq, i) => (
                  <div key={i} className={`pb-4 mb-4 ${i < 2 ? 'border-b border-gray-200' : ''}`}>
                    <p className="font-semibold text-gray-800 text-sm mb-1">{faq.q}</p>
                    <p className="text-gray-500 text-sm">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
