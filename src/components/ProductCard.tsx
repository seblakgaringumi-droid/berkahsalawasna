import React, { useState } from 'react';
import { Product, CartItem } from '../types';
import { Plus, Minus, Check, AlertCircle, ShoppingBag } from 'lucide-react';
import { formatRupiah, formatStock, formatQty } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  cartItem?: CartItem;
  onAddToCart: (product: Product, quantity?: number) => void;
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onViewDetail?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartItem,
  onAddToCart,
  onUpdateQuantity,
  onViewDetail,
}) => {
  const [imageError, setImageError] = useState(false);

  const stock = Number(product.stock_kg) || 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= (product.min_stock || 3);
  const currentCartQty = cartItem?.quantity || 0;

  // Step increment: if unit is 'kg' and user wants 0.5 or 1
  const step = product.unit?.toLowerCase() === 'kg' && stock < 2 ? 0.5 : 1;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const next = currentCartQty + step;
    if (next <= stock) {
      if (currentCartQty === 0) {
        onAddToCart(product, step);
      } else {
        onUpdateQuantity(product.id, next);
      }
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = currentCartQty - step;
    if (next <= 0) {
      onUpdateQuantity(product.id, 0);
    } else {
      onUpdateQuantity(product.id, next);
    }
  };

  // Helper for category fallback icon/color
  const getCategoryTheme = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('beras')) return { bg: 'bg-emerald-50', text: 'text-emerald-800', icon: '🍚' };
    if (c.includes('minyak')) return { bg: 'bg-yellow-50', text: 'text-yellow-800', icon: '🛢️' };
    if (c.includes('telur')) return { bg: 'bg-orange-50', text: 'text-orange-800', icon: '🥚' };
    if (c.includes('minum')) return { bg: 'bg-blue-50', text: 'text-blue-800', icon: '🧃' };
    if (c.includes('bumbu')) return { bg: 'bg-red-50', text: 'text-red-800', icon: '🧂' };
    return { bg: 'bg-slate-100', text: 'text-slate-700', icon: '🛍️' };
  };

  const theme = getCategoryTheme(product.category || '');

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onViewDetail?.(product)}
      className={`bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between cursor-pointer ${
        isOutOfStock 
          ? 'bg-slate-50/80' 
          : currentCartQty > 0 
            ? 'ring-2 ring-emerald-500 shadow-md' 
            : ''
      }`}
    >
      {/* Top Image Container */}
      <div className="relative w-full aspect-square bg-slate-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
        {product.image_url && !imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className={`w-full h-full object-contain p-2 transition duration-300 hover:scale-105 ${
              isOutOfStock ? 'grayscale opacity-50' : ''
            }`}
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center p-3 ${theme.bg}`}>
            <span className={`text-3xl sm:text-4xl mb-1 filter drop-shadow-xs ${isOutOfStock ? 'grayscale opacity-50' : ''}`}>
              {theme.icon}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
              {product.category || 'Toko Berkah'}
            </span>
          </div>
        )}

        {/* Stock Badge - Vibrant Palette Pill */}
        <div className="absolute top-2 left-2 z-20">
          {isOutOfStock ? (
            <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs border border-red-400">
              Habis
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Sisa {formatStock(stock, product.unit)}
            </span>
          ) : (
            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Tersedia
            </span>
          )}
        </div>

        {/* Transparent Out-of-Stock Overlay (Requirement 1.a) */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1.5px] z-10 flex flex-col items-center justify-center p-2 rounded-xl text-center select-none">
            <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md border border-red-300">
              STOK HABIS
            </span>
            <span className="text-[9px] sm:text-[10px] text-white/95 font-medium mt-1">
              Tidak Tersedia
            </span>
          </div>
        )}

        {/* In-cart indicator ribbon */}
        {currentCartQty > 0 && !isOutOfStock && (
          <div className="absolute bottom-2 left-2 bg-yellow-400 text-emerald-950 px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 shadow-xs z-20">
            <Check className="w-3 h-3" />
            <span>{formatQty(currentCartQty, product.unit)} di Keranjang</span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3 className={`font-bold text-xs sm:text-sm line-clamp-2 leading-snug transition ${
            isOutOfStock ? 'text-slate-500' : 'text-slate-800 hover:text-emerald-700'
          }`}>
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 mb-1">
            {product.unit ? `${product.unit.toUpperCase()} / pack` : 'pcs'}
          </p>
        </div>

        {/* Price & Action Section */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className={`text-sm sm:text-base font-black ${isOutOfStock ? 'text-slate-400 line-through' : 'text-emerald-600 font-mono'}`}>
              {formatRupiah(product.selling_price)}
            </div>
          </div>

          {/* Action Button: [+ Tambah] or Stepper or Disabled Gray Button (Requirement 1.b & 1.c) */}
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            {isOutOfStock ? (
              <button
                id={`btn-add-${product.id}`}
                disabled={true}
                aria-disabled="true"
                className="bg-slate-200 text-slate-500 cursor-not-allowed px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center select-none shadow-none"
                title="Stok saat ini tidak tersedia"
              >
                Habis
              </button>
            ) : currentCartQty > 0 ? (
              <div className="flex items-center bg-yellow-100 border border-yellow-300 rounded-lg p-0.5 shadow-xs">
                <button
                  id={`btn-dec-${product.id}`}
                  onClick={handleDecrement}
                  aria-label="Kurangi kuantitas"
                  className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-emerald-900 hover:bg-yellow-200 transition active:scale-95 shadow-xs font-bold text-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center text-xs font-black text-emerald-950 font-mono">
                  {currentCartQty}
                </span>
                <button
                  id={`btn-inc-${product.id}`}
                  onClick={handleIncrement}
                  disabled={currentCartQty >= stock}
                  aria-label="Tambah kuantitas"
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition active:scale-95 shadow-xs font-black text-xs ${
                    currentCartQty >= stock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-yellow-400 text-emerald-900 hover:bg-yellow-300'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id={`btn-add-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product, step);
                }}
                className="bg-yellow-400 hover:bg-yellow-300 text-emerald-900 px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-xs"
                title="Tambah ke keranjang"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-950 stroke-[3]" />
                <span className="hidden xs:inline">Tambah</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
