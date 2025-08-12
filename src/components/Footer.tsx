import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, Clock } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'Produk', href: '#produk' },
    { name: 'Jasa Pemasangan', href: '#jasa' },
    { name: 'Kontak', href: '#kontak' },
  ];

  const informationLinks = [
    { name: 'Cara Pemesanan', href: '#cara-pesan' },
    { name: 'Kebijakan Garansi', href: '#garansi' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <footer className="bg-charcoal border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              AutoModern
            </h3>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Spesialis upgrade sistem otomotif terpercaya di Indonesia. 
              Memberikan solusi teknologi canggih untuk pengalaman berkendara yang lebih baik.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-surface-elevated rounded-lg flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/20 transition-all duration-300 hover:scale-110"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-surface-elevated rounded-lg flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/20 transition-all duration-300 hover:scale-110"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-surface-elevated rounded-lg flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/20 transition-all duration-300 hover:scale-110"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-primary transition-colors duration-200 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Informasi</h4>
            <ul className="space-y-3">
              {informationLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-primary transition-colors duration-200 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block">
                      {link.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-6">Kontak Kami</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-text-secondary">
                    Jl. Raya Otomotif No. 123<br />
                    Jakarta Selatan 12345<br />
                    Indonesia
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-text-secondary">+62 812-3456-7890</p>
                  <p className="text-xs text-text-secondary">WhatsApp Available</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-text-secondary">info@automodern.id</p>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-text-secondary">
                    Senin - Sabtu: 08:00 - 18:00<br />
                    Minggu: 09:00 - 15:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-text-secondary text-sm">
              © 2024 AutoModern Indonesia. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-text-secondary hover:text-primary text-sm transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-text-secondary hover:text-primary text-sm transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-text-secondary hover:text-primary text-sm transition-colors duration-200">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;