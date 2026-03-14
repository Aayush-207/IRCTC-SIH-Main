import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

const PantryCart = () => {
  const [searchParams] = useSearchParams();
  const [trainNumber, setTrainNumber] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const VEG_BADGE = (
    <span className="inline-flex items-center rounded-md bg-green-600 text-white text-xs px-2 py-1">VEG</span>
  );
  const NONVEG_BADGE = (
    <span className="inline-flex items-center rounded-md bg-red-600 text-white text-xs px-2 py-1">NON-VEG</span>
  );

  const dummyBooking = {
    bookingId: "IRCTC-9Q2M7K",
    pnr: "6523189745",
    trainNumber: trainNumber || "12301",
    trainName: "Rajdhani Express",
    coach: "B2",
    seat: seatNumber || "36",
  };

  const menuItems = {
    meals: [
      { id: "veg-meal", name: "Vegetarian Thali", price: 180, description: "Complete meal with rice, dal, vegetables, roti, pickle & papad", veg: true, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop" },
      { id: "chicken-meal", name: "Chicken Thali", price: 220, description: "Rice, chicken curry, dal, roti", veg: false, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop" },
      { id: "biryani", name: "Veg Biryani", price: 150, description: "Aromatic basmati rice with mixed vegetables and spices", veg: true, image: "https://www.madhuseverydayindian.com/wp-content/uploads/2022/11/easy-vegetable-biryani.jpg" },
      { id: "chicken-biryani", name: "Chicken Biryani", price: 260, description: "Fragrant rice layered with marinated chicken", veg: false, image: "https://www.thespruceeats.com/thmb/XDBL9gA6A6nYWUdsRZ3QwH084rk=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/SES-chicken-biryani-recipe-7367850-hero-A-ed211926bb0e4ca1be510695c15ce111.jpg" }
    ],
    snacks: [
      { id: "samosa", name: "Samosa (2 pcs)", price: 30, description: "Crispy fried pastry with potato filling", veg: true, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUU4BdyVmeXxPtiSbUp03lnkD6BwjgHLKXpQ&s" },
      { id: "sandwich", name: "Veg Sandwich", price: 50, description: "Grilled sandwich with vegetables", veg: true, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDatWDLCQMSnJpAg0bIVFeoo-9oDOkp99OIw&s" },
      { id: "pakoda", name: "Onion Pakoda", price: 40, description: "Assorted onion fritters, crispy and spicy", veg: true, image: "https://cdn2.foodviva.com/static-content/food-images/snacks-recipes/onion-pakoda/onion-pakoda.jpg" },
      { id: "chips", name: "Chips", price: 20, description: "Crispy potato chips", veg: true, image: "https://www.bbassets.com/media/uploads/p/l/40053582_2-balaji-simply-salted-chips.jpg" }
    ],
    beverages: [
      { id: "tea", name: "Masala Tea", price: 15, description: "Hot spiced milk tea", veg: true, image: "https://static.vecteezy.com/system/resources/thumbnails/051/200/639/small/creamy-cup-of-masala-chai-tea-rich-and-creamy-cup-of-masala-chai-tea-full-of-spices-and-flavor-beautifully-set-in-a-simple-backdrop-photo.jpg" },
      { id: "coffee", name: "Coffee", price: 20, description: "Freshly brewed coffee", veg: true, image: "https://cdn.shopify.com/s/files/1/0551/0981/2291/files/Flat_White_480x480.jpg?v=1719815848" },
      { id: "cold-drink", name: "Cold Drink", price: 25, description: "Chilled soft drink", veg: true, image: "https://www.shutterstock.com/image-photo/poznan-poland-oct-28-2021-260nw-2071581119.jpg" },
      { id: "water", name: "Water Bottle", price: 15, description: "500ml packaged drinking water", veg: true, image: "https://i.pinimg.com/736x/11/66/35/116635cd3373a3bc15fd060b9fe9c7f3.jpg" }
    ]
  } as unknown as {
    meals: any[];
    snacks: any[];
    beverages: any[];
  };

  useEffect(() => {
    const trainFromUrl = searchParams.get("trainNumber")?.trim() || "";
    const seatFromUrl = searchParams.get("seatNumber")?.trim() || "";
    if (trainFromUrl) setTrainNumber(trainFromUrl);
    if (seatFromUrl) setSeatNumber(seatFromUrl);
  }, [searchParams]);

  const handleAddToCart = (item: any) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1, category: getCategoryForItem(item.id) }]);
    }
    
    toast({
      title: "Added to Cart",
      description: `${item.name} added to your cart`
    });
  };

  const handleUpdateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
    toast({
      title: "Removed from Cart",
      description: "Item removed from your cart"
    });
  };

  const getCategoryForItem = (id: string) => {
    for (const [category, items] of Object.entries(menuItems)) {
      if ((items as any[]).some((item) => item.id === id)) {
        return category as string;
      }
    }
    return '';
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const MenuItemCard = ({ item }: { item: any }) => {
    const cartItem = cart.find(cartItem => cartItem.id === item.id);
    const isVeg = !!item.veg;
    
    return (
      <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
        <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
        <CardContent className="p-4 space-y-3 flex flex-col flex-1">
          <div>
            <h4 className="font-semibold text-base">{item.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {item.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isVeg ? VEG_BADGE : NONVEG_BADGE}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <span className="text-lg font-bold text-primary">₹{item.price}</span>
          </div>

          {cartItem ? (
            <div className="flex items-center justify-center gap-1 mt-2">
              <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => handleUpdateQuantity(item.id, -1)}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="font-medium w-6 text-center text-sm">{cartItem.quantity}</span>
              <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => handleUpdateQuantity(item.id, 1)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => handleAddToCart(item)} className="w-full mt-2 h-9 text-sm">
              <Plus className="h-3 w-3 mr-1" />
              Add to Cart
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tight">
            Pantry Cart
          </h1>
          <p className="text-zinc-400">Order delicious food delivered to your seat</p>
        </div>

        {/* Booking Details */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-12">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-zinc-400 text-sm">Train</p>
                <p className="text-white font-semibold text-lg">{dummyBooking.trainName}</p>
                <p className="text-zinc-300 text-sm">{dummyBooking.trainNumber}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">PNR</p>
                <p className="text-white font-semibold text-lg">{dummyBooking.pnr}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Coach</p>
                <p className="text-white font-semibold text-lg">{dummyBooking.coach}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Seat</p>
                <p className="text-white font-semibold text-lg">{dummyBooking.seat}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Booking ID</p>
                <p className="text-white font-semibold text-sm">{dummyBooking.bookingId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-3 space-y-12">
            {/* Meals Section */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded"></span>
                Meals
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {menuItems.meals.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Snacks Section */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded"></span>
                Snacks
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {menuItems.snacks.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Beverages Section */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded"></span>
                Beverages
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {menuItems.beverages.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                  Your Cart
                  {cart.length > 0 && (
                    <Badge className="bg-blue-600">{cart.length}</Badge>
                  )}
                </h3>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-zinc-400">Your cart is empty</p>
                    <p className="text-xs text-zinc-500 mt-2">Add items to get started</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-start p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex-1">
                            <h5 className="font-semibold text-white text-sm">{item.name}</h5>
                            <p className="text-xs text-zinc-400">₹{item.price} each</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-6 w-6 p-0 text-zinc-300 hover:text-white"
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-medium w-5 text-center text-white text-xs">{item.quantity}</span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-6 w-6 p-0 text-zinc-300 hover:text-white"
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-400 hover:text-red-300 ml-1"
                              onClick={() => handleRemoveFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/20 pt-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300">Subtotal:</span>
                        <span className="text-lg font-bold text-white">₹{getTotalPrice()}</span>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-11 text-white font-semibold">
                        Place Order
                      </Button>
                      
                      <p className="text-xs text-center text-zinc-400">
                        Delivery in 30-45 minutes at next station
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PantryCart;