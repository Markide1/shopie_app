export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images?: Array<{
      imageUrl: string;
    }>;
  };
  quantity: number;
}

export interface AddToCartDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}