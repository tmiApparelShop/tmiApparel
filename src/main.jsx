import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Menu, 
  Loader2, 
  X,
  ChevronDown
} from 'lucide-react';

// Initialize Supabase Client (Can be swapped for WooCommerce later)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const WORDPRESS_API_URL = "https://public-api.wordpress.com/wp/v2/sites/mytmiapparel.wordpress.com/posts?_embed";

function App() {
  const [view, setView] = useState('shop'); 
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      if (supabase) {
        try {
          const { data, error } = await supabase.from('products').select('*').limit(12);
          if (!error && data && data.length > 0) {
            setProducts(data.map(p => ({
              id: p.id,
              name: p.title,
              price: `$${typeof p.price === 'number' ? p.price.toFixed(2) : p.price}`,
              img: p.image_src || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400"
            })));
            setLoadingProducts(false);
            return;
          }
        } catch (err) {
          console.warn("Supabase fetch error:", err);
        }
      }

      const fallbackProducts = [
        { id: 1, name: "Citizens Feedback Unisex T-Shirt", price: "$39.50", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400" },
        { id: 2, name: "TMI Signature Hoodie", price: "$85.00", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400" }
      ];
      setProducts(fallbackProducts);
      setLoadingProducts(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (view === 'news' && posts.length === 0) {
      const fetchWordPressPosts = async () => {
        setLoadingPosts(true);
        try {
          const res = await fetch(WORDPRESS_API_URL);
          if (res.ok) {
            const wpData = await res.json();
            if (Array.isArray(wpData) && wpData.length > 0) {
              setPosts(wpData.map(post => ({
                id: post.id,
                title: post.title?.rendered || "Untitled",
                excerpt: post.excerpt?.rendered?.replace(/<[^>]+>/g, '') || "",
                content: post.content?.rendered || "",
                date: new Date(post.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
                img: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || ""
              })));
              setLoadingPosts(false);
              return;
            }
          }
        } catch (error) {
          console.warn("WordPress REST API error", error);
        }
        setLoadingPosts(false);
      };
      fetchWordPressPosts();
    }
  }, [view, posts.length]);

  return (
    <div className="min-h-screen bg-black text-[#32CD32] font-sans selection:bg-[#32CD32] selection:text-black">
      
      {/* Top Announcement Bar */}
      <div className="w-full border-b border-[#32CD32]/20 py-2 text-center text-xs font-bold tracking-widest uppercase bg-black">
        For those who know shop today...
      </div>

      {/* Main Navigation */}
      <nav className="w-full border-b border-[#32CD32]/20 py-6 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          {/* Logo Area */}
          <div className="flex items-center space-x-12">
            <div 
              onClick={() => { setView('shop'); setSelectedPost(null); }} 
              className="border-2 border-[#32CD32] p-3 text-center cursor-pointer relative group"
            >
              {/* Placeholder for the UFO graphic */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xl group-hover:-translate-y-1 transition-transform">🛸</div>
              <h1 className="text-xl font-black tracking-widest uppercase leading-none">TMI APPAREL</h1>
              <span className="text-[7px] tracking-[0.3em] uppercase block mt-1">For Those Who Know</span>
            </div>

            {/* Nav Links */}
            <div className="hidden lg:flex space-x-6 text-sm font-bold uppercase tracking-widest">
              <button onClick={() => { setView('shop'); setSelectedPost(null); }} className={`transition ${view === 'shop' ? 'text-white' : 'hover:text-white'}`}>Home</button>
              <button className="hover:text-white transition">Collections</button>
              <button className="hover:text-white transition">Contact</button>
              <button className="hover:text-white transition">About Us</button>
              <button onClick={() => { setView('news'); setSelectedPost(null); }} className={`transition ${view === 'news' ? 'text-white' : 'hover:text-white'}`}>News</button>
            </div>
          </div>
          
          {/* Right Action Icons */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center cursor-pointer hover:text-white font-bold text-sm">
              USD <ChevronDown size={14} className="ml-1" />
            </div>
            <Search size={20} className="cursor-pointer hover:text-white transition" />
            <User size={20} className="cursor-pointer hover:text-white transition hidden sm:block" />
            <div className="relative cursor-pointer group" onClick={() => setCartCount(p => p + 1)}>
              <ShoppingBag size={20} className="group-hover:text-white transition" />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{cartCount}</span>}
            </div>
            <Menu size={24} className="lg:hidden cursor-pointer" />
          </div>
        </div>
      </nav>

      {/* VIEW: HOME / SHOP */}
      {view === 'shop' && (
        <main>
          {/* Hero Section */}
          <section className="relative flex flex-col items-center justify-center text-center px-4 py-32 bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#32CD32]/10 via-black to-black">
            
            <div className="border border-[#32CD32]/50 px-4 py-1 mb-10 flex items-center bg-black/50 backdrop-blur">
              <span className="w-2 h-2 bg-[#32CD32] rounded-full mr-3 animate-pulse"></span>
              <span className="text-xs uppercase tracking-[0.3em] font-mono">Signal Detected</span>
            </div>

            <h2 className="text-6xl sm:text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-8 font-sans drop-shadow-[0_0_15px_rgba(50,205,50,0.5)]">
              TOO MUCH<br />INFORMATION
            </h2>

            <p className="font-mono text-sm sm:text-base max-w-2xl mx-auto leading-relaxed text-[#32CD32]/80">
              Targeted Individual ? Shop sarcastic, conspiracy-themed<br />
              apparel like crop tops, t-shirts and computer/cell<br />
              phone accessories' for "targeted individuals
            </p>
          </section>

          {/* Product Grid */}
          <section className="px-6 max-w-7xl mx-auto pb-32">
            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center py-24"><Loader2 className="animate-spin mb-4" size={32} /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map(product => (
                  <div key={product.id} className="group cursor-pointer p-4 transition text-center">
                    <div className="aspect-square bg-neutral-900 mb-6 overflow-hidden border border-[#32CD32]/20 group-hover:border-[#32CD32] transition">
                      <img src={product.img} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500" />
                    </div>
                    <h4 className="font-bold text-sm uppercase tracking-widest leading-snug mb-2 group-hover:text-white transition">{product.name}</h4>
                    <p className="font-mono text-[#32CD32]/70">{product.price}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* VIEW: NEWS / JOURNAL */}
      {view === 'news' && (
        <main className="pt-24 px-6 max-w-5xl mx-auto min-h-screen">
          {selectedPost ? (
             <div className="space-y-8 pb-24">
               <button onClick={() => setSelectedPost(null)} className="flex items-center text-xs font-bold uppercase tracking-widest hover:text-white transition"><X size={16} className="mr-2" /> Back to Terminal</button>
               <h2 className="text-4xl md:text-5xl font-black uppercase">{selectedPost.title}</h2>
               <div dangerouslySetInnerHTML={{ __html: selectedPost.content || selectedPost.excerpt }} className="prose prose-invert prose-p:text-[#32CD32] prose-headings:text-white max-w-none text-lg leading-relaxed font-mono" />
             </div>
          ) : (
            <div className="space-y-12">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase border-b border-[#32CD32]/30 pb-4">
                News Feed
              </h2>
              {loadingPosts ? (
                <div className="flex flex-col items-center justify-center py-24"><Loader2 className="animate-spin mb-4" size={32} /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {posts.map(post => (
                    <div key={post.id} onClick={() => setSelectedPost(post)} className="border border-[#32CD32]/20 p-6 hover:border-[#32CD32] cursor-pointer transition bg-black">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#32CD32]/60 block mb-3">{post.date}</span>
                      <h3 className="text-xl font-bold uppercase mb-3 text-white leading-tight">{post.title}</h3>
                      <p className="text-sm opacity-80 line-clamp-3 mb-4 font-mono">{post.excerpt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      )}
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
