import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Menu, 
  Loader2, 
  X,
  ChevronDown,
  Cpu,
  Trash2
} from 'lucide-react';

const WORDPRESS_API_URL = "https://public-api.wordpress.com/wp/v2/sites/mytmiapparel.wordpress.com/posts?_embed";

function App() {
  const [view, setView] = useState('shop'); 
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Production Cart State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('tmi_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('tmi_cart', JSON.stringify(cart));
  }, [cart]);

  // Handle Cart Operations
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const cartTotal = cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0).toFixed(2);

  // Fetch Live Inventory from Cloudflare
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const apiProducts = await res.json();
          setProducts(apiProducts);
        } else {
          throw new Error("Network response was not ok");
        }
      } catch (err) {
        console.warn("API Offline. Loading offline cache.", err);
        setProducts([
          { id: "err1", name: "SYSTEM_ERROR_TEE", price: "0.00", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400" }
        ]);
      }
      setLoadingProducts(false);
    };
    fetchProducts();
  }, []);

  // Fetch News Feed from WordPress
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
            }
          }
        } catch (error) {
          console.warn("WordPress REST API offline", error);
        }
        setLoadingPosts(false);
      };
      fetchWordPressPosts();
    }
  }, [view, posts.length]);

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-[#00E5FF] selection:text-black overflow-x-hidden">
      
      {/* Slide-out Cart UI */}
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-[#050B14] border-l border-[#00E5FF]/30 p-6 shadow-[-20px_0_50px_rgba(0,229,255,0.1)] transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
          
          <div className="flex justify-between items-center border-b border-[#00E5FF]/20 pb-4 mb-6">
            <h3 className="font-black uppercase tracking-widest text-xl text-white flex items-center">
              <Cpu size={20} className="mr-3 text-[#00E5FF]" /> TERMINAL_CART
            </h3>
            <button onClick={() => setIsCartOpen(false)} className="text-[#00E5FF] hover:text-white transition"><X size={24} /></button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {cart.length === 0 ? (
              <p className="text-white/40 font-mono text-sm">NO DATA PACKETS DETECTED.</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-black border border-[#00E5FF]/20 p-3 relative group">
                  <img src={item.img} alt={item.name} className="w-16 h-16 object-cover border border-[#00E5FF]/30" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold uppercase text-white mb-1">{item.name}</h4>
                    <p className="text-[10px] font-mono text-[#00E5FF]">QTY: {item.quantity} // ${item.price}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-white/30 hover:text-red-500 transition px-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-[#00E5FF]/20 pt-6 mt-4">
            <div className="flex justify-between font-mono text-sm mb-6 text-[#00E5FF]">
              <span>SYS_TOTAL:</span>
              <span className="font-bold text-white">${cartTotal} USD</span>
            </div>
            <button className="w-full bg-[#00E5FF] text-black font-black uppercase tracking-[0.2em] py-4 hover:bg-white transition-colors duration-300">
              INITIATE CHECKOUT
            </button>
          </div>
        </div>
      </div>

      {/* Top Announcement Bar */}
      <div className="w-full border-b border-[#00E5FF]/30 py-2 text-center text-[10px] font-mono tracking-[0.3em] uppercase bg-[#00E5FF]/5 text-[#00E5FF]">
        SECURE CONNECTION ESTABLISHED // FOR THOSE WHO KNOW
      </div>

      {/* Main Navigation */}
      <nav className="w-full border-b border-[#00E5FF]/20 py-6 bg-[#030712] relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          <div className="flex items-center space-x-12">
            <div onClick={() => { setView('shop'); setSelectedPost(null); }} className="border border-[#00E5FF] p-3 text-center cursor-pointer relative group bg-[#00E5FF]/5 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[#00E5FF] bg-[#030712] px-1 group-hover:-translate-y-1 transition-transform">
                <Cpu size={24} />
              </div>
              <h1 className="text-xl font-black tracking-widest uppercase leading-none mt-2">TMI APPAREL</h1>
              <span className="text-[7px] tracking-[0.3em] uppercase block mt-1 text-[#00E5FF]">Hardware / Logic</span>
            </div>

            <div className="hidden lg:flex space-x-8 text-sm font-bold uppercase tracking-widest text-white/60">
              <button onClick={() => { setView('shop'); setSelectedPost(null); }} className={`transition ${view === 'shop' ? 'text-[#00E5FF] shadow-[0_2px_0_#00E5FF]' : 'hover:text-white'}`}>Home</button>
              <button className="hover:text-white transition">Collections</button>
              <button className="hover:text-white transition">Contact</button>
              <button className="hover:text-white transition">About Us</button>
              <button onClick={() => { setView('news'); setSelectedPost(null); }} className={`transition ${view === 'news' ? 'text-[#00E5FF] shadow-[0_2px_0_#00E5FF]' : 'hover:text-white'}`}>News</button>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-[#00E5FF]">
            <div className="hidden md:flex items-center cursor-pointer hover:text-white font-mono text-xs tracking-widest transition">
              USD <ChevronDown size={14} className="ml-1" />
            </div>
            <Search size={20} className="cursor-pointer hover:text-white transition" />
            <User size={20} className="cursor-pointer hover:text-white transition hidden sm:block" />
            <div className="relative cursor-pointer group" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={20} className="group-hover:text-white transition" />
              {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-[#00E5FF] text-black text-[10px] w-5 h-5 flex items-center justify-center rounded-none font-bold shadow-[0_0_10px_#00E5FF]">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
            </div>
            <Menu size={24} className="lg:hidden cursor-pointer hover:text-white transition" />
          </div>
        </div>
      </nav>

      {/* VIEW: HOME / SHOP */}
      {view === 'shop' && (
        <main>
          <section className="relative flex flex-col items-center justify-center text-center px-4 py-32 bg-[#030712] overflow-hidden border-b border-[#00E5FF]/20">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px)`, backgroundSize: `40px 40px`, backgroundPosition: `center center` }}></div>
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 20px 20px, #00E5FF 2px, transparent 2.5px)`, backgroundSize: `40px 40px`, backgroundPosition: `center center` }}></div>

            <div className="relative z-10 border border-[#00E5FF] px-4 py-1 mb-10 flex items-center bg-[#00E5FF]/10 backdrop-blur-sm">
              <span className="w-2 h-2 bg-[#00E5FF] rounded-none mr-3 animate-pulse shadow-[0_0_8px_#00E5FF]"></span>
              <span className="text-[10px] uppercase tracking-[0.4em] font-mono text-[#00E5FF]">SYSTEM ONLINE</span>
            </div>

            <h2 className="relative z-10 text-6xl sm:text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-8 font-sans text-white drop-shadow-[0_0_20px_rgba(0,229,255,0.3)]">
              TOO MUCH<br />INFORMATION
            </h2>

            <p className="relative z-10 font-mono text-sm sm:text-base max-w-2xl mx-auto leading-relaxed text-[#00E5FF]/70">
              Targeted Individual ? Shop sarcastic, conspiracy-themed<br />
              apparel like crop tops, t-shirts and computer/cell<br />
              phone accessories' for "targeted individuals"
            </p>
          </section>

          <section className="px-6 max-w-7xl mx-auto py-24">
            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center py-24"><Loader2 className="animate-spin text-[#00E5FF] mb-4" size={32} /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map(product => (
                  <div key={product.id} className="group p-4 text-left bg-[#050B14] border border-[#00E5FF]/10 hover:border-[#00E5FF]/60 hover:shadow-[0_0_20px_rgba(0,229,255,0.1)] relative flex flex-col h-full transition duration-300">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00E5FF]"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00E5FF]"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00E5FF]"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00E5FF]"></div>

                    <div className="aspect-square bg-black mb-6 overflow-hidden border border-[#00E5FF]/20 relative">
                      <img src={product.img} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500 mix-blend-luminosity group-hover:mix-blend-normal" />
                      
                      {/* ADD TO CART OVERLAY BUTTON */}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={() => addToCart(product)} className="border border-[#00E5FF] bg-[#00E5FF]/20 text-white font-bold uppercase tracking-widest text-xs py-3 px-6 hover:bg-[#00E5FF] hover:text-black transition-colors">
                          EXTRACT TO CART
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-sm uppercase tracking-widest leading-snug mb-4 text-white flex-1">{product.name}</h4>
                    <div className="flex justify-between items-end border-t border-[#00E5FF]/20 pt-4 mt-auto">
                      <p className="font-mono text-[#00E5FF]">${product.price}</p>
                      <span className="font-mono text-[9px] text-[#00E5FF]/50 uppercase tracking-widest">In Stock</span>
                    </div>
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
             <div className="space-y-8 pb-24 relative">
               <button onClick={() => setSelectedPost(null)} className="flex items-center text-xs font-mono uppercase tracking-widest text-[#00E5FF] hover:text-white transition"><X size={16} className="mr-2" /> [ RETURN_TO_NODE ]</button>
               <h2 className="text-4xl md:text-5xl font-black uppercase text-white drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">{selectedPost.title}</h2>
               <div dangerouslySetInnerHTML={{ __html: selectedPost.content || selectedPost.excerpt }} className="prose prose-invert prose-p:text-white/80 prose-headings:text-[#00E5FF] prose-a:text-[#00E5FF] max-w-none text-lg leading-relaxed font-mono" />
             </div>
          ) : (
            <div className="space-y-12">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase border-b border-[#00E5FF]/30 pb-4 flex items-center">
                <Cpu size={36} className="mr-4 text-[#00E5FF]" /> NETWORK_LOGS
              </h2>
              {loadingPosts ? (
                <div className="flex flex-col items-center justify-center py-24"><Loader2 className="animate-spin text-[#00E5FF] mb-4" size={32} /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {posts.map(post => (
                    <div key={post.id} onClick={() => setSelectedPost(post)} className="border border-[#00E5FF]/20 p-6 hover:border-[#00E5FF] cursor-pointer transition bg-[#050B14] hover:shadow-[0_0_20px_rgba(0,229,255,0.1)] relative">
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00E5FF]/50"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00E5FF]/50"></div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#00E5FF] block mb-3 border-b border-[#00E5FF]/20 pb-2 inline-block">TS: {post.date}</span>
                      <h3 className="text-xl font-bold uppercase mb-3 text-white leading-tight">{post.title}</h3>
                      <p className="text-sm text-white/60 line-clamp-3 mb-4 font-mono">{post.excerpt}</p>
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

export default App;
