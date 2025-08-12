import { Monitor, Shield, Power, Key } from 'lucide-react';

const categories = [
  {
    icon: Monitor,
    title: 'Headunit Universal',
    description: 'Android multimedia terbaru',
  },
  {
    icon: Shield,
    title: 'Sistem Alarm Mobil',
    description: 'Keamanan kendaraan maksimal',
  },
  {
    icon: Power,
    title: 'Start/Stop Engine',
    description: 'Sistem nyala mesin modern',
  },
  {
    icon: Key,
    title: 'Keyless & Remote Start',
    description: 'Kenyamanan tanpa kunci',
  },
];

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Kategori Produk Unggulan
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Temukan solusi terbaik untuk meningkatkan kenyamanan dan keamanan kendaraan Anda
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div
                key={index}
                className="group relative bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all duration-300 hover:shadow-card hover:-translate-y-2 hover:shadow-glow/20 cursor-pointer"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-primary-foreground" />
                  </div>
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 w-16 h-16 mx-auto bg-primary rounded-xl opacity-0 group-hover:opacity-20 group-hover:scale-125 transition-all duration-300 blur-lg"></div>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                  {category.title}
                </h3>
                
                <p className="text-text-secondary">
                  {category.description}
                </p>

                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;