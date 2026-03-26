"use client";
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
// Removed missing map import
const MapControlContainer = ({ children, className }) => (
    <div className={cn("absolute bg-background/80 backdrop-blur-md text-foreground rounded-2xl border border-border/50 p-4 shadow-2xl z-[1001]", className)}>
        {children}
    </div>
);
import { Circle, MapPin, Navigation, Info, Search, List, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import axios from 'axios'
import { MAHARASHTRA_DISTRICTS_COORDINATES, DEFAULT_MAHARASHTRA_CENTER } from '@/constants/locationConstants'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const STATUS_CLASS_NAME = {
    active: "text-green-500 fill-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]",
    inactive: "text-destructive fill-destructive",
    warning: "text-yellow-500 fill-yellow-500",
}

// Dummy data removed — fetching from DB now

// Haversine formula to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
}

const FarmMap = () => {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState([19.0760, 72.8777]); // Default Mumbai
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("map"); // 'map' or 'list'

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('/api/events?limit=100');
                // Map real event data to the format expected by FarmMap
                // Note: FarmMap expects 'products' in its internal state, keeping names for compatibility
                const events = (response.data.events || []).map(e => {
                    const foundDistrict = Object.keys(MAHARASHTRA_DISTRICTS_COORDINATES).find(
                        d => e.address.toLowerCase().includes(d.toLowerCase()) || (e.city && e.city.toLowerCase().includes(d.toLowerCase()))
                    );
                    const baseCoords = foundDistrict ? MAHARASHTRA_DISTRICTS_COORDINATES[foundDistrict] : DEFAULT_MAHARASHTRA_CENTER;
                    
                    return {
                        id: e._id,
                        name: e.title,
                        farmer: e.organizer?.username || 'Unknown Organizer',
                        district: e.city || 'Maharashtra',
                        village: '',
                        coordinates: [
                            baseCoords[0] + (Math.random() - 0.5) * 0.02,
                            baseCoords[1] + (Math.random() - 0.5) * 0.02
                        ],
                        status: 'active',
                        speciality: e.category,
                        price: e.price,
                        rating: 4.5,
                    };
                });
                setProducts(events);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                () => {
                    console.warn("Geolocation denied, using default.");
                }
            );
        }
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.district?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
            {/* Search and Filters Header */}
            <div className="bg-background/40 backdrop-blur-md border border-border/50 p-4 rounded-3xl flex items-center justify-between gap-4 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search farms, specialties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 rounded-full bg-muted/30 border-border/50 focus:bg-background/80 transition-all h-10"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'map' ? 'farmer' : 'outline'}
                        size="sm"
                        className="rounded-full px-4"
                        onClick={() => setViewMode('map')}
                    >
                        <MapPin className="w-4 h-4 mr-2" /> Map
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'farmer' : 'outline'}
                        size="sm"
                        className="rounded-full px-4"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="w-4 h-4 mr-2" /> List
                    </Button>
                </div>
            </div>

            {viewMode === 'map' ? (
                <div className="flex-1 relative rounded-3xl overflow-hidden border border-border/50 shadow-xl box-border">
                    <MapContainer
                        center={userLocation}
                        zoom={7}
                        scrollWheelZoom={true}
                        className="h-full w-full z-10"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        {/* User Location Marker */}
                        <Marker
                            position={userLocation}
                            icon={L.divIcon({
                                html: renderToStaticMarkup(
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20 h-8 w-8 -m-2"></div>
                                        <div className="bg-blue-600 rounded-full border-2 border-white h-4 w-4 shadow-lg shadow-blue-500/50"></div>
                                    </div>
                                ),
                                className: 'custom-user-icon',
                                iconSize: [20, 20],
                                iconAnchor: [10, 10],
                            })}
                        />

                        {/* Farm Markers */}
                        {filteredProducts.map((product) => (
                            <Marker
                                key={product.id}
                                position={product.coordinates}
                                icon={L.divIcon({
                                    html: renderToStaticMarkup(
                                        <Circle
                                            size={10}
                                            className={STATUS_CLASS_NAME[product.status]}
                                        />
                                    ),
                                    className: 'custom-farm-icon',
                                    iconSize: [20, 20],
                                    iconAnchor: [10, 10],
                                })}
                                eventHandlers={{
                                    click: () => setSelectedProduct(product)
                                }}
                            >
                                <Popup>
                                    <div className="p-1 min-w-[120px]">
                                        <h4 className="font-bold text-sm text-foreground">{product.name}</h4>
                                        <p className="text-[10px] text-muted-foreground">Farmer: {product.farmer}</p>
                                        <p className="text-[10px] font-bold text-farmer-600 mt-1">₹{product.price}/kg</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <Navigation className="w-3 h-3 text-farmer-500" />
                                            <span className="text-xs font-bold text-farmer-600">{calculateDistance(userLocation[0], userLocation[1], product.coordinates[0], product.coordinates[1])} km away</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* Control Overlay (Outside MapContainer to avoid context error) */}
                    <MapControlContainer className="bg-background/80 backdrop-blur-md text-foreground bottom-6 left-6 flex flex-col gap-3 rounded-2xl border border-border/50 p-4 shadow-2xl min-w-[150px] z-[1001]">
                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Status Legend</h5>
                        {["active", "inactive", "warning"].map((status) => (
                            <p key={status} className="flex items-center gap-3 text-sm font-medium">
                                <Circle
                                    size={8}
                                    className={STATUS_CLASS_NAME[status]}
                                />
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </p>
                        ))}
                    </MapControlContainer>

                    {/* Selected Product Detail Overlay (Outside MapContainer) */}
                    <AnimatePresence>
                        {selectedProduct && (
                            <motion.div
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 100 }}
                                className="absolute bottom-6 inset-x-0 mx-auto w-full max-w-sm z-[1001] px-4"
                            >
                                <Card className="bg-background/90 backdrop-blur-xl border-border/50 shadow-2xl rounded-3xl overflow-hidden">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <Badge className="bg-green-500/10 text-green-600 border-none mb-2 rounded-full uppercase text-[10px] tracking-widest">Premium Product</Badge>
                                                <h3 className="text-lg font-black text-foreground">{selectedProduct.name}</h3>
                                                <p className="text-xs text-muted-foreground font-medium">{selectedProduct.district}, {selectedProduct.village}</p>
                                                <p className="text-sm font-bold text-farmer-600 mt-2">₹{selectedProduct.price}/kg</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSelectedProduct(null)}>
                                                <Info className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between mt-6">
                                            <div className="flex items-center gap-1.5 text-farmer-600 font-bold">
                                                <Navigation className="w-4 h-4" />
                                                <span className="text-sm">{calculateDistance(userLocation[0], userLocation[1], selectedProduct.coordinates[0], selectedProduct.coordinates[1])} km</span>
                                            </div>
                                            <Button variant="farmer" className="rounded-full px-6 shadow-lg shadow-farmer-500/20" onClick={() => router.push(`/products/${selectedProduct.id}`)}>
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map(product => (
                            <Card key={product.id} className="rounded-3xl border-border/50 hover:shadow-lg transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg">{product.name}</h3>
                                        <Badge className={cn("rounded-full", product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                                            {product.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">Farmer: {product.farmer}</p>
                                    <p className="text-sm font-bold text-farmer-600 mb-4">₹{product.price}/kg</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-zinc-500">{calculateDistance(userLocation[0], userLocation[1], product.coordinates[0], product.coordinates[1])} km away</span>
                                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => router.push(`/products/${product.id}`)}>View Details</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default FarmMap
