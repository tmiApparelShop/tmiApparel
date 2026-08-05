import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  Heart, 
  Loader2, 
  ChevronRight, 
  X
} from 'lucide-react';

// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// WordPress REST API Target
const WORDPRESS_API_URL = "https://public-api.wordpress.com/wp/v2/sites/mytmiapparel.wordpress.com/posts?_embed";

function App() {
  const [view, setView] = useState('shop'); 
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
              category: p.category || "Collection",
              img: p.image_src || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400"
            })));
            setLoadingProducts(false);
            return;
          }
        } catch (err) {
          console.warn("Supabase fetch fallback triggered:", err);
        }
      }

      const fallbackProducts = [
        { id: 1, name: "Citizens Feedback Unisex Garment Dyed T-Shirt", price: "$39.50", category: "T-Shirts", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400" },
        { id: 2, name: "TMI Signature Heavyweight Hoodie", price: "$85.00", category: "Outerwear", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400" }
      ];
      setProducts(fallbackProducts);
      setLoadingProducts(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (view === 'journal' && posts.length === 0) {
      const fetchWordPressPosts = async () => {
        setLoadingPosts(true);
        try {
          const res = await fetch(WORDPRESS_API_URL);
          if (res.ok) {
            const wpData = await res.json();
            if (Array.isArray(wpData) && wpData.length > 0) {
              setPosts(wpData.map(post => ({
                id: post.id,
                title: post.title?.rendered || "Untitled Post",
                excerpt: post.excerpt?.rendered?.replace(/<[^>]+>/g, '') || "",
                content: post.content?.rendered || "",
                date: new Date(post.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
                author: post._embedded?.['author']?.[0]?.name || "TMI Editorial",
                img: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800"
              })));
              setLoadingPosts(false);
              return;
            }
          }
        } catch (error) {
          console.warn("WordPress REST API fetch error", error);
        }
        setLoadingPosts(false);
      };
      fetchWordPressPosts();
    }
  }, [view, posts.length]);

  return (
    <div className="min-h-screen bg-black text-[#32CD32] font-sans selection:bg-[#32CD32] selection:text-black">
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-black/90 border-b border-[#32CD32]/20 backdrop-blur-md py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-12">
            <h1 onClick={() => { setView('shop'); setSelectedPost(null); }} className="text-2xl font-black tracking-tighter uppercase italic cursor-pointer">
              Too Much <span className="text-white">Information</span>
            </h1>
            <div className="hidden md:flex space-x-8 text-[11px] font-bold uppercase tracking-[0.2em] text-[#32CD32]/70">
              <button onClick={() => { setView('shop'); setSelectedPost(null); }} className={`transition ${view === 'shop' ? 'text-[#32CD32]' : 'hover:text-white'}`}>Shop</button>
              <button onClick={() => { setView('journal'); setSelectedPost(null); }} className={`transition ${view === 'journal' ? 'text-[#32CD32] underline underline-offset-4' : 'hover:text-white'}`}>Journal</button>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-[#32CD32]">
            <Search size={18} className="cursor-pointer hover:text-white transition" />
            <div className="relative cursor-pointer group" onClick={() => setCartCount(p => p + 1)}>
              <ShoppingBag size={18} className="group-hover:text-white transition" />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cartCount}</span>}
            </div>
            <Menu size={20} className="md:hidden cursor-pointer" />
          </div>
        </div>
      </nav>

      {/* Main Content Areas */}
      {view === 'shop' && (
        <main className="pt-32 px-6 max-w-7xl mx-auto min-h-screen">
          <h2 className="text-4xl md:text-6xl font-black mb-12 italic tracking-tighter uppercase border-b border-[#32CD32]/30 pb-4">
            The Collection
          </h2>
          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-24"><Loader2 className="animate-spin mb-4" size={32} /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map(product => (
                <div key={product.id} className="group cursor-pointer border border-[#32CD32]/20 p-4 rounded-xl hover:border-[#32CD32] transition">
                  <div className="aspect-[3/4] bg-neutral-900 mb-4 overflow-hidden rounded-lg">
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{product.category}</p>
                  <h4 className="font-bold text-lg leading-tight my-1 group-hover:text-white transition">{product.name}</h4>
                  <p className="font-mono">{product.price}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {view === 'journal' && (
        <main className="pt-32 px-6 max-w-5xl mx-auto min-h-screen">
          {selectedPost ? (
             <div className="space-y-8 pb-24">
               <button onClick={() => setSelectedPost(null)} className="flex items-center text-xs font-bold uppercase tracking-widest hover:text-white transition"><X size={16} className="mr-2" /> Close</button>
               <h2 className="text-4xl md:text-5xl font-black italic uppercase">{selectedPost.title}</h2>
               <div dangerouslySetInnerHTML={{ __html: selectedPost.content || selectedPost.excerpt }} className="prose prose-invert prose-p:text-[#32CD32] prose-headings:text-white max-w-none text-lg leading-relaxed" />
             </div>
          ) : (
            <div className="space-y-12">
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase border-b border-[#32CD32]/30 pb-4">
                Operations Journal
              </h2>
              {loadingPosts ? (
                <div className="flex flex-col items-center justify-center py-24"><Loader2 className="animate-spin mb-4" size={32} /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {posts.map(post => (
                    <div key={post.id} onClick={() => setSelectedPost(post)} className="border border-[#32CD32]/20 p-6 rounded-xl hover:border-[#32CD32] cursor-pointer transition">
                      <h3 className="text-2xl font-bold italic uppercase mb-3 text-white">{post.title}</h3>
                      <p className="text-sm opacity-80 line-clamp-3 mb-4">{post.excerpt}</p>
                      <span className="text-[10px] font-black uppercase tracking-widest">{post.date}</span>
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

// THIS IS THE CRITICAL PIECE I FORGOT! 
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
