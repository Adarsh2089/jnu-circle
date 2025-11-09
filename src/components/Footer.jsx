import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">JNU Circle</h3>
            <p className="text-gray-400 mb-4">
              A centralized platform for JNU students to access previous year questions, 
              notes, and study materials. Share knowledge, grow together.
            </p>
            <p className="text-gray-500 text-sm">
              🌐 Visit us at: <a href="https://jnucircle.app" className="text-indigo-400 hover:text-indigo-300">jnucircle.app</a>
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/resources" className="hover:text-white transition">Resources</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
            </ul>
            <div className="mt-6">
              <h4 className="font-semibold mb-2 text-sm">Support</h4>
              <a href="mailto:support@jnucircle.app" className="text-gray-400 hover:text-white transition text-sm">
                support@jnucircle.app
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} JNU Circle. All rights reserved.</p>
          <p className="text-sm mt-2 text-gray-500">
            Made with ❤️ for JNU students
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
