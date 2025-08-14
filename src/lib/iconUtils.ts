import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  FileText, 
  BarChart3, 
  Target, 
  Award, 
  MapPin, 
  Calendar, 
  CreditCard, 
  UserPlus, 
  UserMinus, 
  AlertTriangle,
  Clock,
  Truck,
  CheckCircle,
  Calculator,
  LucideIcon
} from 'lucide-react';

// Centralized icon mapping for all dashboards
const iconMap: { [key: string]: LucideIcon } = {
  // Primary mappings
  'DollarSign': DollarSign,
  'TrendingUp': TrendingUp,
  'TrendingDown': TrendingDown,
  'Users': Users,
  'ShoppingCart': ShoppingCart,
  'Package': Package,
  'FileText': FileText,
  'BarChart3': BarChart3,
  'Target': Target,
  'Award': Award,
  'MapPin': MapPin,
  'Calendar': Calendar,
  'CreditCard': CreditCard,
  'UserPlus': UserPlus,
  'UserMinus': UserMinus,
  'AlertTriangle': AlertTriangle,
  'Clock': Clock,
  'Truck': Truck,
  'CheckCircle': CheckCircle,
  'Calculator': Calculator,
  
  // Lowercase variants
  'dollarsign': DollarSign,
  'trendingup': TrendingUp,
  'trendingdown': TrendingDown,
  'users': Users,
  'shoppingcart': ShoppingCart,
  'package': Package,
  'filetext': FileText,
  'barchart3': BarChart3,
  'target': Target,
  'award': Award,
  'mappin': MapPin,
  'calendar': Calendar,
  'creditcard': CreditCard,
  'userplus': UserPlus,
  'userminus': UserMinus,
  'alerttriangle': AlertTriangle,
  'clock': Clock,
  'truck': Truck,
  'checkcircle': CheckCircle,
  'calculator': Calculator,
  
  // Uppercase variants
  'DOLLARSIGN': DollarSign,
  'TRENDINGUP': TrendingUp,
  'TRENDINGDOWN': TrendingDown,
  'USERS': Users,
  'SHOPPINGCART': ShoppingCart,
  'PACKAGE': Package,
  'FILETEXT': FileText,
  'BARCHART3': BarChart3,
  'TARGET': Target,
  'AWARD': Award,
  'MAPPIN': MapPin,
  'CALENDAR': Calendar,
  'CREDITCARD': CreditCard,
  'USERPLUS': UserPlus,
  'USERMINUS': UserMinus,
  'ALERTTRIANGLE': AlertTriangle,
  'CLOCK': Clock,
  'TRUCK': Truck,
  'CHECKCIRCLE': CheckCircle,
  'CALCULATOR': Calculator,
};

export const getIconByName = (iconName: string): LucideIcon => {
  if (!iconName) return BarChart3; // Default icon
  
  // Try exact match first
  if (iconMap[iconName]) return iconMap[iconName];
  
  // Try lowercase match
  if (iconMap[iconName.toLowerCase()]) return iconMap[iconName.toLowerCase()];
  
  // Try uppercase match
  if (iconMap[iconName.toUpperCase()]) return iconMap[iconName.toUpperCase()];
  
  // Default fallback
  return BarChart3;
};