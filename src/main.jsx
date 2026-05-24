import React, { useState, useEffect } from 'react'
import { ShoppingBag, Search, Menu, ArrowRight, Heart, Loader2 } from 'lucide-react'

/**
 * TMIApparel.com - Main Storefront & Entry Point
 * Cleaned up manual render calls to comply with the platform's React Contract
 * and prevent version/runtime conflicts in react-dom.
 */

const App = () => {
  const [supabase, setSupabase] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Initialize Supabase Client dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@supabase/supabase-js@2';
    script.async = true;
    script.onload = () => {
      // Add your Supabase keys here for dynamic fetching
      const supabaseUrl = ""; 
      const supabaseKey = ""; 
      
      if (supabaseUrl && supabaseKey && window.supabase) {
        const client = window.supabase.createClient(supabaseUrl, supabaseKey);
        setSupabase(client);
      }
    };
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  // 2. Fetch or load mock products
  useEffect(() => {
    const fetchProducts = async () => {
      if (supabase) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(10);
        
        if (!error && data && data.length > 0) {
          setProducts(data.map(p => ({
            id: p.id,
            name: p.title,
            price: `$${p.price}`,
            category: p.category || "General",
            img: p.image_src || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400"
          })));
          setLoading(false);
          return;
        }
      }

      // Local fallback products derived from products_export_1.csv
      const fallbackProducts = [
        { 
          id: 1, 
          name: "Citizens Feedback Unisex Garment Dyed T-Shirt", 
          price: "$39.50", 
          category: "T-Shirts", 
          img: "https://cdn.shopify.com/s/files/1/0681/5337/6854/files/unisex-garment-dyed-heavyweight-t-shirt-white-front-68f097e602342.jpg?v=1760598009" 
        },
        { 
          id: 2, 
          name: "TMI Signature Heavyweight Hoodie", 
          price: "$85.00", 
          category: "Outerwear", 
          img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400" 
        },
        { 
          id: 3, 
          name: "Digital Nomad Cargo Pant", 
          price: "$110.00", 
          category: "Bottoms", 
          img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=400" 
        },
        { 
          id: 4, 
          name: "Signature Heavy Canvas Tote", 
          price: "$35.00", 
          category: "Accessories", 
          img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400" 
        },
      ];
      setProducts(fallbackProducts);
      setLoading(false);
    };

    fetchProducts();
  }, [supabase]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-12">
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">TMI Apparel</h1>
            <div className="hidden md:flex space-x-8 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              <a href="#" className="hover:text-blue-600 transition">Shop</a>
              <a href="#" className="hover:text-blue-600 transition">Collections</a>
              <a href="#" className="hover:text-blue-600 transition underline underline-offset-4">Journal</a>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <Search size={18} className="cursor-pointer hover:text-blue-600 transition text-neutral-400" />
            <div className="relative cursor-pointer group" onClick={() => setCartCount(prev => prev + 1)}>
              <ShoppingBag size={18} className="group-hover:text-blue-600 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </div>
            <Menu size={20} className="md:hidden cursor-pointer" />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-neutral-900 text-white">
        <div className="absolute inset-0 opacity-50">
          <img 
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover"
            alt="Hero Background"
          />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <span className="inline-block px-3 py-1 bg-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 rounded-sm">Drop 01 / Core</span>
          <h2 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] italic tracking-tighter uppercase">Too Much <br/>Information.</h2>
          <p className="text-lg md:text-xl mb-10 opacity-80 font-light max-w-lg mx-auto leading-relaxed">
            Wearable technology meets minimalist design. Built for the modern ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white text-black px-10 py-4 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 shadow-xl">
              Shop Now
            </button>
            <button className="border border-white/20 backdrop-blur-sm px-10 py-4 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-all">
              The Journal
            </button>
          </div>
        </div>
      </section>

      {/* Shop Grid */}
      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.4em] text-blue-600 mb-2">The Collection</h3>
            <h4 className="text-4xl font-bold tracking-tight italic uppercase">New Arrivals</h4>
          </div>
          <button className="flex items-center text-[11px] font-bold uppercase tracking-widest group border-b border-neutral-200 pb-1">
            View All Drops <ArrowRight className="ml-2 group-hover:translate-x-1 transition" size={14} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
            <p className="text-neutral-400 uppercase text-[10px] font-black tracking-widest">Accessing Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-[2rem] bg-neutral-100 aspect-[3/4] mb-6">
                  <img 
                    src={product.img} 
                    alt={product.name}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCartCount(c => c + 1); }}
                    className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 shadow-xl active:scale-95"
                  >
                    Quick Add — {product.price}
                  </button>
                  <div className="absolute top-6 right-6 p-3 bg-white/50 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">{product.category}</p>
                  <h4 className="font-bold text-lg leading-tight group-hover:text-blue-600 transition">{product.name}</h4>
                  <p className="text-neutral-500 font-medium">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-100 pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-neutral-900 rounded-[3rem] p-12 md:p-20 mb-20 text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full"></div>
            <div className="max-w-lg text-center md:text-left relative z-10">
              <h4 className="text-4xl md:text-5xl font-black mb-6 italic uppercase tracking-tighter">Inside the Journal</h4>
              <p className="text-neutral-400 text-lg">Discover the process, the people, and the philosophy behind the TMI design lab.</p>
            </div>
            <a href="#" className="bg-blue-600 hover:bg-blue-700 px-10 py-5 rounded-full font-bold uppercase text-xs tracking-widest transition-all whitespace-nowrap relative z-10 shadow-lg">
              Read the Journal
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
               <h1 className="text-xl font-black tracking-tighter uppercase italic mb-6">TMI Apparel</h1>
               <p className="text-neutral-400 text-sm max-w-xs leading-relaxed">
                 Experimental lab focused on high-performance garments for the digital age.
               </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-t border-neutral-100 pt-8 gap-4">
            <p>© 2026 TMI APPAREL DESIGN GROUP. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
