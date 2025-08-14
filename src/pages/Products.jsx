import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import Avatar from '../components/atoms/Avatar';
import DataTable from '../components/organisms/DataTable';

const ProductsContainer = styled(motion.div)`
  padding: ${props => props.theme.spacing[6]};
  min-height: 100vh;
  background: ${props => props.theme.colors.background.primary};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing[4]};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[3]};
  }
`;

const ProductsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${props => props.theme.spacing[4]};
    margin-bottom: ${props => props.theme.spacing[4]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[1]};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100%;
    justify-content: space-between;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    width: 100%;
    
    & > * {
      flex: 1;
    }
  }
`;

const StockStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
`;

const StockDot = styled.div.withConfig({
  shouldForwardProp: (prop) => !['level'].includes(prop),
})`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => getStockColor(props.level, props.theme)};
`;

const ProductImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.gray[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const getStockColor = (level, theme) => {
  if (level === 'out') return theme.colors.red[500];
  if (level === 'low') return theme.colors.yellow[500];
  if (level === 'medium') return theme.colors.primary[500];
  return theme.colors.green[500];
};

const getStockLabel = (current, min = 0, max = 0) => {
  if (current === 0) return { level: 'out', label: 'Out of Stock' };
  if (current <= min) return { level: 'low', label: 'Low Stock' };
  if (current <= max * 0.5) return { level: 'medium', label: 'Medium Stock' };
  return { level: 'high', label: 'In Stock' };
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const Products = () => {
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Mock product data
  const mockProducts = [
    {
      id: 'PRD-001',
      name: 'iPhone 14 Pro',
      sku: 'APL-IP14P-256-SG',
      category: 'Electronics',
      supplier: 'Apple Inc.',
      price: 999.00,
      cost: 750.00,
      currentStock: 2,
      minStock: 5,
      maxStock: 50,
      reorderPoint: 10,
      location: 'A-1-01',
      barcode: '123456789012',
      status: 'active',
      lastUpdated: '2024-01-15T10:30:00Z',
      image: null
    },
    {
      id: 'PRD-002',
      name: 'Samsung Galaxy S23',
      sku: 'SAM-GS23-128-BLK',
      category: 'Electronics',
      supplier: 'Samsung Electronics',
      price: 799.99,
      cost: 620.00,
      currentStock: 15,
      minStock: 8,
      maxStock: 40,
      reorderPoint: 12,
      location: 'A-1-02',
      barcode: '123456789013',
      status: 'active',
      lastUpdated: '2024-01-14T14:20:00Z',
      image: null
    },
    {
      id: 'PRD-003',
      name: 'MacBook Air M2',
      sku: 'APL-MBA-M2-256-SLV',
      category: 'Electronics',
      supplier: 'Apple Inc.',
      price: 1199.00,
      cost: 900.00,
      currentStock: 8,
      minStock: 3,
      maxStock: 20,
      reorderPoint: 5,
      location: 'A-2-01',
      barcode: '123456789014',
      status: 'active',
      lastUpdated: '2024-01-14T09:15:00Z',
      image: null
    },
    {
      id: 'PRD-004',
      name: 'Nike Air Max 90',
      sku: 'NKE-AM90-US10-WHT',
      category: 'Footwear',
      supplier: 'Nike Inc.',
      price: 129.99,
      cost: 65.00,
      currentStock: 25,
      minStock: 10,
      maxStock: 100,
      reorderPoint: 20,
      location: 'B-1-01',
      barcode: '123456789015',
      status: 'active',
      lastUpdated: '2024-01-13T16:45:00Z',
      image: null
    },
    {
      id: 'PRD-005',
      name: 'Sony WH-1000XM4',
      sku: 'SNY-WH1000XM4-BLK',
      category: 'Electronics',
      supplier: 'Sony Corporation',
      price: 349.99,
      cost: 210.00,
      currentStock: 0,
      minStock: 5,
      maxStock: 30,
      reorderPoint: 8,
      location: 'A-3-01',
      barcode: '123456789016',
      status: 'inactive',
      lastUpdated: '2024-01-10T11:30:00Z',
      image: null
    }
  ];

  // Define table columns
  const columns = [
    {
      key: 'product',
      header: 'Product',
      width: '300px',
      render: (_, product) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ProductImage>
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <Icon name="products" size={20} />
            )}
          </ProductImage>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" weight="medium" truncate>
              {product.name}
            </Typography>
            <Typography variant="caption" color="secondary" truncate>
              SKU: {product.sku}
            </Typography>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      accessor: 'category',
      width: '120px'
    },
    {
      key: 'supplier',
      header: 'Supplier',
      accessor: 'supplier',
      width: '150px',
      truncate: true,
      maxWidth: '150px'
    },
    {
      key: 'price',
      header: 'Price',
      width: '100px',
      align: 'right',
      render: (_, product) => (
        <Typography variant="body2" weight="medium">
          {formatPrice(product.price)}
        </Typography>
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      width: '120px',
      render: (_, product) => {
        const stockInfo = getStockLabel(product.currentStock, product.minStock, product.maxStock);
        return (
          <StockStatus>
            <StockDot level={stockInfo.level} />
            <div>
              <Typography variant="body2" weight="medium">
                {product.currentStock}
              </Typography>
              <Typography variant="caption" color="secondary">
                {stockInfo.label}
              </Typography>
            </div>
          </StockStatus>
        );
      }
    },
    {
      key: 'location',
      header: 'Location',
      accessor: 'location',
      width: '100px'
    },
    {
      key: 'status',
      header: 'Status',
      width: '100px',
      render: (_, product) => (
        <Badge 
          variant={product.status === 'active' ? 'success' : 'secondary'} 
          size="sm"
        >
          {product.status}
        </Badge>
      )
    }
  ];

  // Define filters
  const filters = [
    { key: 'category', label: 'Filter by category' },
    { key: 'supplier', label: 'Filter by supplier' },
    { key: 'location', label: 'Filter by location' },
    { key: 'status', label: 'Filter by status' }
  ];

  // Define table actions
  const actions = [
    {
      id: 'view',
      icon: 'eye',
      label: 'View Details'
    },
    {
      id: 'edit',
      icon: 'edit',
      label: 'Edit Product'
    },
    {
      id: 'more',
      icon: 'menu',
      label: 'More Actions',
      dropdown: [
        { id: 'duplicate', icon: 'copy', label: 'Duplicate' },
        { id: 'export', icon: 'download', label: 'Export' },
        { id: 'archive', icon: 'archive', label: 'Archive' },
        { id: 'delete', icon: 'delete', label: 'Delete', destructive: true }
      ]
    }
  ];

  // Define bulk actions
  const bulkActions = [
    {
      id: 'updateStatus',
      label: 'Update Status',
      icon: 'edit',
      variant: 'secondary'
    },
    {
      id: 'updateLocation',
      label: 'Update Location',
      icon: 'products',
      variant: 'secondary'
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: 'download',
      variant: 'secondary'
    },
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: 'delete',
      variant: 'danger'
    }
  ];

  const handleSearch = (query) => {
    console.log('Search:', query);
  };

  const handleSort = (sortConfig) => {
    console.log('Sort:', sortConfig);
  };

  const handleRowClick = (product) => {
    console.log('Row clicked:', product);
    // Navigate to product detail page
  };

  const handleAction = (actionId, product) => {
    console.log('Action:', actionId, product);
    
    switch (actionId) {
      case 'view':
        // Navigate to product detail
        break;
      case 'edit':
        // Open edit form
        break;
      case 'duplicate':
        // Duplicate product
        break;
      case 'delete':
        // Delete product
        break;
      default:
        break;
    }
  };

  const handleBulkAction = (actionId, productIds) => {
    console.log('Bulk action:', actionId, productIds);
    
    switch (actionId) {
      case 'updateStatus':
        // Open status update dialog
        break;
      case 'updateLocation':
        // Open location update dialog
        break;
      case 'export':
        // Export selected products
        break;
      case 'delete':
        // Delete selected products
        break;
      default:
        break;
    }
  };

  const handleSelect = (selectedIds) => {
    setSelectedProducts(selectedIds);
  };

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleImport = () => {
    console.log('Import products');
  };

  const handleAddProduct = () => {
    console.log('Add new product');
  };

  const handleExport = () => {
    console.log('Export all products');
  };

  return (
    <ProductsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <ProductsHeader>
        <HeaderLeft>
          <Typography variant="h3" weight="bold" color="primary">
            Products
          </Typography>
          <Typography variant="body1" color="secondary">
            Manage your product inventory and information.
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <Typography variant="caption" color="tertiary">
            {mockProducts.length} total products
          </Typography>
          
          <QuickActions>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleImport}
            >
              <Icon name="upload" size={16} />
              Import
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
            >
              <Icon name="download" size={16} />
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddProduct}
            >
              <Icon name="plus" size={16} />
              Add Product
            </Button>
          </QuickActions>
        </HeaderRight>
      </ProductsHeader>

      <DataTable
        title="Product Inventory"
        description="Complete list of products with stock levels and details"
        data={mockProducts}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder="Search products, SKUs, or suppliers..."
        sortable
        selectable
        filterable
        filters={filters}
        actions={actions}
        bulkActions={bulkActions}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 25, 50, 100]}
        emptyStateTitle="No products found"
        emptyStateDescription="Get started by adding your first product or adjusting your filters."
        emptyStateIcon="products"
        onSearch={handleSearch}
        onSort={handleSort}
        onSelect={handleSelect}
        onRowClick={handleRowClick}
        onAction={handleAction}
        onBulkAction={handleBulkAction}
      />
    </ProductsContainer>
  );
};

export default Products;