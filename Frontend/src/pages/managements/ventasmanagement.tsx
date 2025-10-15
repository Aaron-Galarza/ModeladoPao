import { useState, useEffect, useMemo } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  /* where */ 
} from "firebase/firestore";
import { db } from "../../firebase/firebase.config";
import { 
  FaMoneyBill, 
  FaBox, 
  FaCalendarAlt,
  FaFileExport,
  FaChartLine,
  FaShoppingCart,
  FaHome,
  /* FaStore,
  FaPercent */
} from "react-icons/fa";
import { CSVLink } from "react-csv";

// Interfaces para los datos
interface OrderProduct {
  idProducto: string;
  quantity: number;
  name: string;
  price: number;
}

interface OrderDetails {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  deliveryType: 'pickup' | 'delivery';
  shippingAddress?: string;
  paymentMethod: 'cash' | 'transfer';
  products: OrderProduct[];
  totalAmount: number;
  notes?: string;
  status: 'pending' | 'in-progress' | 'delivered' | 'cancelled';
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// Tipos para los filtros
type DateFilter = 'today' | 'week' | 'month' | 'custom';
type PaymentFilter = 'all' | 'cash' | 'transfer';

const VentasManagement = () => {
  const [allOrders, setAllOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // UseEffect para el listener de Firestore
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    try {
      const ordersCollection = collection(db, "Pedidos");
      const ordersQuery = query(ordersCollection, orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(ordersQuery, 
        (snapshot) => {
          const ordersData: OrderDetails[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            const products = (data.products || data.productos || []).map((product: any) => ({
              idProducto: product.idProducto || product.productId || 'N/A',
              quantity: Number(product.quantity) || Number(product.cantidad) || 1,
              name: product.name || product.nombre || 'Producto sin nombre',
              price: Number(product.price) || Number(product.precioEnElPedido) || 0
            }));
            
            let totalAmount = Number(data.totalAmount) || Number(data.total) || 0;
            if (totalAmount === 0 && products.length > 0) {
              totalAmount = products.reduce((sum: number, product: OrderProduct) => {
                return sum + (Number(product.price) * Number(product.quantity));
              }, 0);
            }
            
            ordersData.push({
              id: doc.id,
              guestName: data.guestName || data.nombreCliente || "Cliente no especificado",
              guestEmail: data.guestEmail || data.emailCliente || "",
              guestPhone: data.guestPhone || data.telefonoCliente || "",
              deliveryType: data.deliveryType || 'pickup',
              shippingAddress: data.shippingAddress || data.direccionEnvio,
              paymentMethod: data.paymentMethod || 'cash',
              products: products,
              totalAmount: totalAmount,
              notes: data.notes || data.notas,
              status: data.status || 'pending',
              createdAt: data.createdAt || Timestamp.now(),
              updatedAt: data.updatedAt
            });
          });
          
          setAllOrders(ordersData);
          setLoading(false);
        },
        (error) => {
          console.error("Error en el listener de pedidos:", error);
          setError(`Error al cargar los pedidos: ${error.message}`);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error("Error configurando el listener:", err);
      setError("Error al configurar la conexión con la base de datos");
      setLoading(false);
    }
  }, []);

  // Filtrar órdenes entregadas según los filtros seleccionados
  const filteredOrders = useMemo(() => {
    let filtered = allOrders.filter(order => order.status === 'delivered');
    
    // Aplicar filtro de fecha
    const now = new Date();
    let startDate: Date, endDate: Date;
    
    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) return filtered;
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        endDate.setDate(endDate.getDate() + 1); // Incluir el día completo
        break;
      default:
        return filtered;
    }
    
    filtered = filtered.filter(order => {
      const orderDate: Date = order.createdAt instanceof Timestamp 
        ? order.createdAt.toDate() 
        : new Date(order.createdAt);
      return orderDate >= startDate && orderDate < endDate;
    });
    
    // Aplicar filtro de método de pago
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentMethod === paymentFilter);
    }
    
    return filtered;
  }, [allOrders, dateFilter, paymentFilter, customStartDate, customEndDate]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalProducts = filteredOrders.reduce((sum, order) => 
      sum + order.products.reduce((prodSum, product) => prodSum + product.quantity, 0), 0);
    
    const deliveryOrders = filteredOrders.filter(order => order.deliveryType === 'delivery');
    const deliveryPercentage = filteredOrders.length > 0 
      ? (deliveryOrders.length / filteredOrders.length) * 100 
      : 0;
    
    // Calcular top 5 productos más vendidos
    const productSales: {[key: string]: {name: string, quantity: number, revenue: number}} = {};
    
    filteredOrders.forEach(order => {
      order.products.forEach(product => {
        if (!productSales[product.name]) {
          productSales[product.name] = {
            name: product.name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[product.name].quantity += product.quantity;
        productSales[product.name].revenue += product.price * product.quantity;
      });
    });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    return {
      totalSales,
      totalProducts,
      deliveryPercentage,
      topProducts,
      totalOrders: filteredOrders.length
    };
  }, [filteredOrders]);

  // Preparar datos para CSV
  const csvData = useMemo(() => {
    return filteredOrders.map(order => ({
      "Fecha": order.createdAt instanceof Timestamp 
        ? order.createdAt.toDate().toLocaleDateString() 
        : new Date(order.createdAt).toLocaleDateString(),
      "Hora": order.createdAt instanceof Timestamp 
        ? order.createdAt.toDate().toLocaleTimeString() 
        : new Date(order.createdAt).toLocaleTimeString(),
    "Productos": order.products.map(product => `${product.name} (x${product.quantity})`).join(', '),      "Cliente": order.guestName,
      "Método de Pago": order.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia',
      "Tipo de Entrega": order.deliveryType === 'pickup' ? 'Retiro' : 'Delivery',
      "Subtotal": `$${order.totalAmount.toFixed(2)}`
    }));
  }, [filteredOrders]);

  // Formatear fecha para mostrar
  const formatDate = (date: Timestamp | Date) => {
    if (!date) return "Fecha no disponible";
    
    try {
      if (date instanceof Timestamp) {
        return date.toDate().toLocaleString("es-ES", {
          dateStyle: 'short',
          timeStyle: 'short'
        });
      }
      return new Date(date).toLocaleString("es-ES", {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Cargando ventas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Estadísticas de Ventas</h1>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="custom">Personalizado</option>
            </select>
            
            {dateFilter === 'custom' && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Desde</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full p-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full p-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Filtro por método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
          
          {/* Botón exportar */}
          <div className="flex items-end">
            <CSVLink
              data={csvData}
              filename={`ventas-${new Date().toISOString().split('T')[0]}.csv`}
              className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <FaFileExport className="mr-2" />
              Exportar CSV
            </CSVLink>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total vendido */}
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <FaMoneyBill className="text-blue-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Vendido</p>
              <p className="text-xl font-bold text-gray-800">${stats.totalSales.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        {/* Productos vendidos */}
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <FaBox className="text-green-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Productos Vendidos</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
        
        {/* Pedidos a domicilio */}
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <FaHome className="text-purple-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivery</p>
              <p className="text-xl font-bold text-gray-800">{stats.deliveryPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        {/* Total pedidos */}
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="rounded-full bg-orange-100 p-3 mr-4">
              <FaShoppingCart className="text-orange-500 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pedidos</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top productos */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FaChartLine className="mr-2 text-blue-500" /> Top 5 Productos Más Vendidos
        </h2>
        
        {stats.topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantity} unidades</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay datos de productos vendidos en el período seleccionado.</p>
        )}
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FaCalendarAlt className="mr-2 text-blue-500" /> Detalle de Ventas
        </h2>
        
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                     {order.products.map(product => `${product.name} (x${product.quantity})`).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
                {/* Fila de total */}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={3} className="px-6 py-4 text-right text-sm text-gray-900">Total del período:</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stats.totalSales.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay ventas en el período seleccionado.</p>
        )}
      </div>
    </div>
  );
};

export default VentasManagement;