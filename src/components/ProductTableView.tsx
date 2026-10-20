import React, { useState } from 'react';
import { Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { APP_CONFIG } from '@/config/constants';

function TableThumbnail({ src, alt }) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div className="h-11 w-11 rounded-lg bg-emerald-50 border border-emerald-100/60 flex items-center justify-center shrink-0 text-emerald-600">
        <UtensilsCrossed className="h-5 w-5 opacity-70" />
      </div>
    );
  }

  return (
    <div className="h-11 w-11 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
}

export default function ProductTableView({ products = [], handleOpenModal, handleDelete, isAdmin = false }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/70 border-b border-gray-200">
            <TableRow>
              <TableHead className="font-bold w-[70px] text-gray-700">စဉ်</TableHead>
              <TableHead className="font-bold text-gray-700 min-w-[200px]">ကုန်ပစ္စည်း အမည်</TableHead>
              <TableHead className="font-bold text-gray-700 min-w-[140px]">အမျိုးအစား</TableHead>
              <TableHead className="font-bold text-gray-700 min-w-[120px] text-right">ဈေးနှုန်း</TableHead>
              {isAdmin && <TableHead className="font-bold text-gray-700 w-[120px] text-right">လုပ်ဆောင်ချက်</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="h-36 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UtensilsCrossed className="h-8 w-8 text-gray-300" />
                    <p className="text-sm font-medium">ကုန်ပစ္စည်း မရှိသေးပါ</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, index) => (
                <TableRow key={product.id} className="hover:bg-gray-50/60 transition-colors group">
                  <TableCell className="font-medium text-gray-500 text-sm">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <TableThumbnail src={product.image_url} alt={product.name} />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">ID: {product.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.categories?.name ? (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                        {product.categories.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-400 border-gray-200 text-xs">
                        အမျိုးအစားမရှိပါ
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-primary text-base">
                      {product.price?.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">{APP_CONFIG.CURRENCY}</span>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenModal(product)}
                          title="ပြင်မည်"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg h-8 w-8 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(product)}
                          title="ဖျက်မည်"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg h-8 w-8 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
