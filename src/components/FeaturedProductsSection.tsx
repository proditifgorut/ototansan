import { Button } from '@/components/ui/button';
import { ShoppingCart, Star } from 'lucide-react';
import productHeadunit from '@/assets/product-headunit.jpg';
import productAlarm from '@/assets/product-alarm.jpg';
import productStartButton from '@/assets/product-startbutton.jpg';
import productRemote from '@/assets/product-remote.jpg';

const products = [
  {
    id: 1,
    name: 'Headunit Android 9 Inch Universal',
    price: 'Rp 2.500.000',
    image: productHeadunit,
    rating: 4.8,
    badge: 'Terlaris',
  },
  {
    id: 2,
    name: 'Sistem Alarm Premium + Sensor',
    price: 'Rp 1.750.000',
    image: productAlarm,
    rating: 4.9,
    badge: 'Best Seller',
  },
  {
    id: 3,
    name: 'Push Start Button & Keyless Entry',
    price: 'Rp 1.200.000',
    image: productStartButton,
    rating: 4.7,
    badge: 'Populer',
  },
  {
    id: 4,
    name: 'Remote Start System Advanced',
    price: 'Rp 2.100.000',
    image: productRemote,
    rating: 4.8,
    badge: 'Premium',
  },
];

const FeaturedProductsSection = () => {
  return (
    <section className="py-20 bg-surface/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Produk Terlaris Kami
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Pilihan terbaik pelanggan dengan kualitas premium dan harga terjangkau
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-card hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full">
                    {product.badge}
                  </span>
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-text-secondary ml-2">
                    ({product.rating})
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                  {product.name}
                </h3>

                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {product.price}
                  </span>
                  
                  <Button variant="cta" size="sm" className="group/btn">
                    <ShoppingCart className="h-4 w-4 mr-1 group-hover/btn:scale-110 transition-transform" />
                    Tambah
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Lihat Semua Produk
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;