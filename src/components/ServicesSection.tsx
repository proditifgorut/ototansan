import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, MapPin, Clock } from 'lucide-react';
import technicianService from '@/assets/technician-service.jpg';

const services = [
  'Pemasangan Headunit & Audio',
  'Instalasi Sistem Alarm & Keamanan',
  'Setup Push Start & Keyless Entry',
  'Konfigurasi Remote Start System',
  'Maintenance & After Sales Service',
];

const ServicesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Column */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={technicianService}
                alt="Teknisi profesional memasang headunit"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent"></div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-8 -right-8 bg-card border border-border rounded-xl p-6 shadow-card">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Garansi 1 Tahun</p>
                  <p className="text-sm text-text-secondary">Service & Parts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Column */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Pemasangan{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Profesional
              </span>{' '}
              & Terpercaya
            </h2>

            <p className="text-lg text-text-secondary mb-8 leading-relaxed">
              Tim ahli kami siap membantu pemasangan semua produk yang Anda beli. 
              Kami menjamin instalasi yang rapi, aman, dan bergaransi di workshop 
              kami atau di lokasi Anda.
            </p>

            {/* Services List */}
            <div className="space-y-4 mb-8">
              {services.map((service, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground">{service}</span>
                </div>
              ))}
            </div>

            {/* Service Features */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center space-x-2 p-3 bg-surface/50 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">On-Site Service</span>
              </div>
              
              <div className="flex items-center space-x-2 p-3 bg-surface/50 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">Same Day</span>
              </div>
              
              <div className="flex items-center space-x-2 p-3 bg-surface/50 rounded-lg">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground">24/7 Support</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl">
                Info Jasa Pemasangan
              </Button>
              
              <Button variant="outline" size="xl">
                Hubungi Teknisi
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;