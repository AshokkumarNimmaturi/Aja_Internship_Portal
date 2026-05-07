import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl text-[#0A1628] mb-8">Privacy Policy</h1>
          
          <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
            <p>Last updated: April 02, 2026</p>
            
            <section>
              <h2 className="text-xl font-bold text-[#0A1628] mb-3">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us when you create an account, 
                purchase a subscription, or communicate with us. This includes your name, 
                email address, phone number, and payment information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0A1628] mb-3">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Provide, maintain, and improve our Internship Portal services.</li>
                <li>Process transactions and send related information, including confirmations and invoices.</li>
                <li>Send you technical notices, updates, security alerts, and support messages.</li>
                <li>Respond to your comments, questions, and customer service requests.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0A1628] mb-3">3. Data Security</h2>
              <p>
                We take reasonable measures to help protect information about you from loss, 
                theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0A1628] mb-3">4. Your Choices</h2>
              <p>
                You may update your account information at any time by logging into your 
                account. You may also contact us to request access to, correct, or delete 
                any personal information that you have provided to us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#0A1628] mb-3">5. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <a href="mailto:support@ajacs.in" className="text-blue-600 font-semibold">support@ajacs.in</a>
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
