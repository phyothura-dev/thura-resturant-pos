import { useState } from 'react';
import { Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { ROLES, APP_CONFIG } from '@/config/constants';

export default function ProductCard({
  product,
  handleOpenModal,
  handleDelete,
  isProduct = false,
  addToCart,
  cartQuantity = 0,
}) {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const isAdmin = user?.role === ROLES.ADMIN;

  const handleCardClick = () => {
    if (!isProduct && addToCart) {
      addToCart(product);
    }
  };

  const hasValidImage = product.image_url && !imageError;
  const inCart = cartQuantity > 0;

  return (
    <Card
      onClick={!isProduct ? handleCardClick : undefined}
      className={`group relative overflow-hidden bg-white rounded-2xl border transition-all duration-200 ${
        !isProduct ? 'cursor-pointer select-none active:scale-[0.98]' : ''
      } ${
        inCart
          ? 'border-primary ring-2 ring-primary/30 shadow-sm bg-emerald-50/15'
          : 'border-gray-200/90 shadow-xs hover:shadow-md hover:border-gray-300'
      }`}
    >
      {/* Image / Thumbnail Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        {hasValidImage ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-emerald-600/70 p-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50/90 border border-emerald-100 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform duration-200">
              <UtensilsCrossed className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-[11px] font-medium text-gray-400">ပုံမရှိပါ</span>
          </div>
        )}

        {/* Category Tag */}
        {product.categories?.name && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center rounded-lg bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-gray-700 shadow-xs border border-gray-100">
              {product.categories.name}
            </span>
          </div>
        )}
      </div>

      {/* Card Body - clean padding and natural Burmese text flow */}
      <div className="p-3.5 space-y-1.5">
        <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors leading-normal line-clamp-1">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1 text-primary">
            <span className="text-base font-extrabold tracking-tight">
              {product.price?.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-gray-500">
              {APP_CONFIG.CURRENCY}
            </span>
          </div>

          {/* Admin Edit/Delete (Products management page only) */}
          {isProduct && isAdmin && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleOpenModal(product)}
                title="ပြင်မည်"
                className="h-7.5 w-7.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(product)}
                title="ဖျက်မည်"
                className="h-7.5 w-7.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
