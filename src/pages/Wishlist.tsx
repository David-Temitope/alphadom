import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { PlatformAd } from '@/components/PlatformAd';
import { WishlistSkeleton } from '@/components/skeletons/PageSkeletons';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast({
      title: 'Added to cart',
      description: `${product.name} added to your cart.`,
    });
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast({
        title: 'Removed from wishlist',
        description: 'Item removed from your wishlist.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove item from wishlist.',
        variant: 'destructive',
      });
    }
  };

  if (loading) return <WishlistSkeleton />;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link to="/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="w-7 h-7 text-red-500" />
              Wishlist
            </h1>
            <p className="text-sm text-muted-foreground">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="py-20">
              <Heart className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Add products you care about and come back later.
              </p>
              <Link to="/products">
                <Button>Browse Products</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {wishlistItems.map((item) => {
              const product = item.products;
              if (!product) return null;

              return (
                <Card
                  key={item.id}
                  className="h-full overflow-hidden transition hover:shadow-lg"
                >
                  <CardContent className="p-3 flex flex-col h-full">
                    {/* Image */}
                    <Link
                      to={`/products/${product.id}`}
                      className="relative mb-3 block overflow-hidden rounded-lg aspect-[3/4]"
                    >
                      <img
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex flex-col flex-1 min-h-0">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-semibold text-sm leading-snug line-clamp-2 hover:text-primary">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="font-bold text-primary text-sm whitespace-nowrap">
                          ₦{product.price.toFixed(2)}
                        </span>

                        {product.sustainability_score > 7 && (
                          <span className="text-[10px] font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Eco
                          </span>
                        )}
                      </div>

                      {/* Actions pinned to bottom */}
                      <div className="mt-auto pt-3 flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 truncate"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1 shrink-0" />
                          Add
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleRemoveFromWishlist(item.product_id!)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <PlatformAd targetPage="wishlist" />
    </div>
  );
};

export default Wishlist;
