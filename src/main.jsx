import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  ArrowRight, 
  Heart, 
  Loader2, 
  BookOpen, 
  ChevronRight, 
  X,
  Calendar,
  User
} from 'lucide-react';

/**
 * TMI Apparel - Unified Main Storefront & Headless WordPress Journal
 * Integrates:
 * - Product Storefront (Supabase + Local CSV Fallbacks)
 * - Headless WordPress.com Journal (https://public-api.wordpress.com/wp/v2/sites/mytmiapparel.wordpress.com/posts)
 */

// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Updated WordPress REST API Target (Your new public site)
const WORDPRESS_API_URL = "https://public-api.wordpress.com/wp/v2/sites/mytmiapparel.wordpress.com/posts?_embed";

export default function App() {
  const [view, setView] = useState('shop'); // 'shop' | 'journal'
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Handle Navbar Scroll Styling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 1. Fetch Products (Supabase with CSV Fallback)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .limit(12);

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

      // Default catalog fallback derived from products_export_1.csv
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
        }
      ];
      setProducts(fallbackProducts);
      setLoadingProducts(false);
    };

    fetchProducts();
  }, []);

  // 2. Fetch Posts from Headless WordPress.com
  useEffect(() => {
    if (view === 'journal' && posts.length === 0) {
      const fetchWordPressPosts = async () => {
        setLoadingPosts(true);
        try {
          const res = await fetch(WORDPRESS_API_URL);
          if (res.ok) {
            const wpData = await res.json();
            if (Array.isArray(wpData) && wpData.length > 0) {
              const formattedPosts = wpData.map(post => {
                const featuredImg = post._embedded?.['wp:featuredmedia']?.[0]?.source_url 
                  || "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800";
                const authorName = post._embedded?.['author']?.[0]?.name || "TMI Editorial";
                
                return {
                  id: post.id,
                  title: post.title?.rendered || "Untitled Post",
                  excerpt: post.excerpt?.rendered?.replace(/<[^>]+>/g, '') || "",
                  content: post.content?.rendered || "",
                  date: new Date(post.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
                  author: authorName,
                  img: featuredImg
                };
              });
              setPosts(formattedPosts);
              setLoadingPosts(false);
              return;
            }
          }
        } catch (error) {
          console.warn("WordPress REST API fetch error, using fallback posts:", error);
        }

        // Fallback Journal Entries if WordPress site is brand new or empty
        const fallbackPosts = [
          {
            id: 101,
            title: "Designing the Essential Garment Dyed Heavyweight Tee",
            excerpt: "A deep dive into our 14-month material sourcing process and why garment-dyeing produces superior texture.",
            content: "<p>When we set out to construct our heavyweight tee, we wanted a garment that retained structural density without sacrificing softness...</p>",
            date: "Aug 01, 2026",
            author: "TMI Design Lab",
            img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800"
          },
          {
            id: 102,
            title: "The Minimalist Wardrobe for Modern Polymaths",
            excerpt: "Why fewer, better pieces create psychological clarity and elevate everyday performance.",
            content: "<p>Minimalism in apparel isn't about having nothing—it's about eliminating distraction through precision engineering...</p>",
            date: "Jul 28, 2026",
            author: "Alex Rivera",
            img: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800"
          }
        ];
        setPosts(fallbackPosts);
        setLoadingPosts(false);
      };

      fetchWordPressPosts();
    }
  }, [view, posts.length]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-100">
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-12">
            <h1 
              onClick={() => { setView('shop'); setSelectedPost(null); }}
              className="text-2xl font-black tracking-tighter uppercase italic cursor-pointer select-none"
            >
              TMI <span className="text-blue-600 font-black">Apparel</span>
            </h1>
            <div className="hidden md:flex space-x-8 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              <button 
                onClick={() => { setView('shop'); setSelectedPost(null); }}
                className={`transition ${view === 'shop' ? 'text-blue-600 font-black' : 'hover:text-black'}`}
              >
                Shop
              </button>
              <button 
                onClick={() => { setView('journal'); setSelectedPost(null); }}
                className={`transition ${view === 'journal' ? 'text-blue-600 font-black underline underline-offset-4' : 'hover:text-black'}`}
              >
                Journal
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <Search size={18} className="cursor-pointer hover:text-blue-600 transition text-neutral-400" />
            <div className="relative cursor-pointer group" onClick={() => setCartCount(prev => prev + 1)}>
              <ShoppingBag size={18} className="group-hover:text-blue-600 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <Menu size={20} className="md:hidden cursor-pointer" />
          </div>
        </div>
      </nav>

      {/* VIEW 1: STOREFRONT */}
      {view === 'shop' && (
        <main>
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
              <span className="inline-block px-3 py-1 bg-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6 rounded-sm">
                Drop 01 / Core
              </span>
              <h2 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] italic tracking-tighter uppercase">
                Too Much <br/>Information.
              </h2>
              <p className="text-lg md:text-xl mb-10 opacity-80 font-light max-w-lg mx-auto leading-relaxed">
                Wearable technology meets minimalist design. Built for the modern ecosystem.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
                  className="bg-white text-black px-10 py-4 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 shadow-xl"
                >
                  Shop Now
                </button>
                <button 
                  onClick={() => setView('journal')}
                  className="border border-white/20 backdrop-blur-sm px-10 py-4 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-all"
                >
                  The Journal
                </button>
              </div>
            </div>
          </section>

          {/* Product Grid */}
          <section className="max-w-7xl mx-auto px-6 py-24">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-blue-600 mb-2">The Collection</h3>
                <h4 className="text-4xl font-bold tracking-tight italic uppercase">New Arrivals</h4>
              </div>
            </div>

            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-neutral-400 uppercase text-[10px] font-black tracking-widest">Loading Catalog...</p>
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
          </section>
        </main>
      )}

      {/* VIEW 2: HEADLESS WORDPRESS JOURNAL */}
      {view === 'journal' && (
        <main className="max-w-6xl mx-auto px-6 pt-36 pb-24">
          {/* Article Modal View */}
          {selectedPost ? (
            <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
              <button 
                onClick={() => setSelectedPost(null)}
                className="flex items-center text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-blue-600 transition mb-6"
              >
                <X size={16} className="mr-2" /> Close Article
              </button>
              
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">WordPress Journal</span>
                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">
                  {selectedPost.title}
                </h2>
                <div className="flex items-center space-x-6 text-xs text-neutral-400 font-bold uppercase tracking-widest pt-2 border-b border-neutral-100 pb-6">
                  <span className="flex items-center"><User size={14} className="mr-1.5" /> {selectedPost.author}</span>
                  <span className="flex items-center"><Calendar size={14} className="mr-1.5" /> {selectedPost.date}</span>
                </div>
              </div>

              <div className="aspect-video rounded-3xl overflow-hidden bg-neutral-100">
                <img src={selectedPost.img} alt={selectedPost.title} className="w-full h-full object-cover" />
              </div>

              <div 
                className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed space-y-4 font-serif text-lg"
                dangerouslySetInnerHTML={{ __html: selectedPost.content || selectedPost.excerpt }}
              />

              <div className="pt-12 border-t border-neutral-200">
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="bg-black text-white px-8 py-4 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-blue-600 transition"
                >
                  ← Back to Journal
                </button>
              </div>
            </div>
          ) : (
            /* Journal Grid View */
            <div className="space-y-16">
              <div className="text-center max-w-2xl mx-auto space-y-4">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-blue-600">Powered by Headless WordPress</span>
                <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
                  TMI <span className="text-blue-600">Journal</span>
                </h2>
                <p className="text-neutral-500 font-serif text-lg">
                  Stories, engineering notes, and behind-the-scenes insights synced live from WordPress.
                </p>
              </div>

              {loadingPosts ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                  <p className="text-neutral-400 uppercase text-[10px] font-black tracking-widest">Fetching WordPress Feed...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {posts.map(post => (
                    <article 
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="group cursor-pointer bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition duration-500"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-neutral-100 relative">
                        <img 
                          src={post.img} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                        />
                      </div>
                      <div className="p-8 space-y-4">
                        <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                          <span>{post.date}</span>
                          <span>•</span>
                          <span className="text-blue-600">{post.author}</span>
                        </div>
                        <h3 className="text-2xl font-bold italic uppercase tracking-tight group-hover:text-blue-600 transition leading-tight">
                          {post.title}
                        </h3>
                        <p className="text-neutral-500 text-sm line-clamp-3 leading-relaxed font-serif">
                          {post.excerpt}
                        </p>
                        <div className="pt-4 flex items-center text-xs font-bold uppercase tracking-widest text-blue-600">
                          Read Story <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition" />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* Shared Footer */}
      <footer className="bg-white border-t border-neutral-100 pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-neutral-900 rounded-[3rem] p-12 md:p-20 mb-20 text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full"></div>
            <div className="max-w-lg text-center md:text-left relative z-10">
              <h4 className="text-4xl md:text-5xl font-black mb-6 italic uppercase tracking-tighter">Inside the Journal</h4>
              <p className="text-neutral-400 text-lg">Read our latest posts or explore the new drop on the storefront.</p>
            </div>
            <button 
              onClick={() => { setView(view === 'shop' ? 'journal' : 'shop'); setSelectedPost(null); }}
              className="bg-blue-600 hover:bg-blue-700 px-10 py-5 rounded-full font-bold uppercase text-xs tracking-widest transition-all whitespace-nowrap relative z-10 shadow-lg hover:shadow-blue-600/40"
            >
              {view === 'shop' ? 'Read the Journal' : 'Visit Storefront'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2 space-y-4">
               <h1 className="text-xl font-black tracking-tighter uppercase italic">TMI Apparel</h1>
               <p className="text-neutral-400 text-sm max-w-xs leading-relaxed">
                 Experimental lab focused on high-performance garments for the digital age.
               </p>
            </div>
            <div>
              <h5 className="text-[11px] font-black uppercase tracking-widest mb-4">Navigation</h5>
              <ul className="space-y-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                <li onClick={() => setView('shop')} className="hover:text-black cursor-pointer">Shop</li>
                <li onClick={() => setView('journal')} className="hover:text-black cursor-pointer">Journal</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-t border-neutral-100 pt-8 gap-4">
            <p>© 2026 TMI APPAREL DESIGN GROUP. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
