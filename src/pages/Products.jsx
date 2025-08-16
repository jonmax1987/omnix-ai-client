import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import Typography from '../components/atoms/Typography';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import Badge from '../components/atoms/Badge';
import Avatar from '../components/atoms/Avatar';
import DataTable from '../components/organisms/DataTable';
import { useI18n } from '../hooks/useI18n';
import useProductsStore from '../store/productsStore';

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

const getStockLabel = (current, min = 0, max = 0, t) => {
  if (current === 0) return { level: 'out', label: t('products.stockLevel.out') };
  if (current <= min) return { level: 'low', label: t('products.stockLevel.low') };
  if (current <= max * 0.5) return { level: 'medium', label: t('products.stockLevel.medium') };
  return { level: 'high', label: t('products.stockLevel.high') };
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const Products = () => {
  const { t } = useI18n();
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Products store
  const { 
    products, 
    loading, 
    error, 
    fetchProducts,
    setFilters,
    filters 
  } = useProductsStore();

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Transform backend products to match frontend format
  const transformedProducts = useMemo(() => {
    return products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku || `SKU-${product.id}`,
      category: product.category || 'Uncategorized',
      supplier: product.supplier || 'Unknown',
      price: product.price || 0,
      cost: product.cost || product.price * 0.7, // Estimate cost as 70% of price
      currentStock: product.quantity || 0,
      minStock: product.minThreshold || 5,
      maxStock: product.maxStock || 100,
      reorderPoint: product.reorderPoint || product.minThreshold || 10,
      location: product.location || 'Unknown',
      barcode: product.barcode || product.sku,
      status: product.status || 'active',
      lastUpdated: product.updatedAt || product.createdAt || new Date().toISOString(),
      image: product.image || null
    }));
  }, [products]);

  // Define table columns
  const columns = [
    {
      key: 'product',
      header: t('products.name'),
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
              {t('products.sku')}: {product.sku}
            </Typography>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      header: t('products.category'),
      accessor: 'category',
      width: '120px'
    },
    {
      key: 'supplier',
      header: t('products.supplier'),
      accessor: 'supplier',
      width: '150px',
      truncate: true,
      maxWidth: '150px'
    },
    {
      key: 'price',
      header: t('products.price'),
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
      header: t('products.quantity'),
      width: '120px',
      render: (_, product) => {
        const stockInfo = getStockLabel(product.currentStock, product.minStock, product.maxStock, t);
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
      header: t('products.location'),
      accessor: 'location',
      width: '100px'
    },
    {
      key: 'status',
      header: t('products.status'),
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
  const filterOptions = [
    { key: 'category', label: t('products.filters.category') },
    { key: 'supplier', label: t('products.filters.supplier') },
    { key: 'location', label: t('products.filters.location') },
    { key: 'status', label: t('products.filters.status') }
  ];

  // Define table actions
  const actions = [
    {
      id: 'view',
      icon: 'eye',
      label: t('products.actions.viewDetails')
    },
    {
      id: 'edit',
      icon: 'edit',
      label: t('products.actions.editProduct')
    },
    {
      id: 'more',
      icon: 'menu',
      label: t('products.actions.moreActions'),
      dropdown: [
        { id: 'duplicate', icon: 'copy', label: t('products.actions.duplicate') },
        { id: 'export', icon: 'download', label: t('products.actions.export') },
        { id: 'archive', icon: 'archive', label: t('products.actions.archive') },
        { id: 'delete', icon: 'delete', label: t('products.actions.delete'), destructive: true }
      ]
    }
  ];

  // Define bulk actions
  const bulkActions = [
    {
      id: 'updateStatus',
      label: t('products.bulkActions.updateStatus'),
      icon: 'edit',
      variant: 'secondary'
    },
    {
      id: 'updateLocation',
      label: t('products.bulkActions.updateLocation'),
      icon: 'products',
      variant: 'secondary'
    },
    {
      id: 'export',
      label: t('products.bulkActions.exportSelected'),
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
            {t('products.title')}
          </Typography>
          <Typography variant="body1" color="secondary">
            {t('products.description')}
          </Typography>
        </HeaderLeft>
        
        <HeaderRight>
          <Typography variant="caption" color="tertiary">
            {loading ? 'Loading...' : error ? 'Error loading products' : `${transformedProducts.length} total products`}
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
              {t('common.export')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddProduct}
            >
              <Icon name="plus" size={16} />
              {t('products.addProduct')}
            </Button>
          </QuickActions>
        </HeaderRight>
      </ProductsHeader>

      <DataTable
        title={t('products.productInventory')}
        description={t('products.description')}
        data={transformedProducts}
        columns={columns}
        loading={loading}
        searchable
        searchPlaceholder={t('products.searchPlaceholder')}
        sortable
        selectable
        filterable
        filters={filterOptions}
        actions={actions}
        bulkActions={bulkActions}
        pagination
        pageSize={10}
        pageSizeOptions={[10, 25, 50, 100]}
        emptyStateTitle={t('products.emptyState')}
        emptyStateDescription={t('products.emptyStateDescription')}
        emptyStateIcon="products"
        onSearch={handleSearch}
        onSort={handleSort}
        onSelect={handleSelect}
        onRowClick={handleRowClick}
        onAction={handleAction}
        onBulkAction={handleBulkAction}
        exportable
        exportFilename="products-inventory"
        exportFormats={['csv', 'pdf']}
      />
    </ProductsContainer>
  );
};

export default Products;