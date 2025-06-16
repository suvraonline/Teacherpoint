export default function ContactPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">Contact Us</h1>
      <p className="text-gray-700 mb-4">
        Have a question or feedback? Reach out to us via the form below or email us at <strong>support@teacherpoint.com</strong>.
      </p>
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="w-full px-4 py-2 border rounded-md"
        />
        <textarea
          placeholder="Your Message"
          className="w-full px-4 py-2 border rounded-md h-32"
        ></textarea>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Send Message
        </button>
      </form>
    </section>
  );
}
