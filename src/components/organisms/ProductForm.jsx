import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import Icon from '../atoms/Icon';
import Badge from '../atoms/Badge';
import FormField from '../molecules/FormField';

const FormContainer = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[6]};
  background: ${props => props.theme.colors.background.elevated};
  border: 1px solid ${props => props.theme.colors.border.default};
  border-radius: ${props => props.theme.spacing[3]};
  padding: ${props => props.theme.spacing[8]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[6]};
    gap: ${props => props.theme.spacing[4]};
  }
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.subtle};
`;

const FormTitle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const FormStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: ${props => props.theme.spacing[1]};
  background: ${props => props.theme.colors.primary[100]};
  color: ${props => props.theme.colors.primary[600]};
`;

const FieldGrid = styled.div.withConfig({
  shouldForwardProp: (prop) => !['columns'].includes(prop),
})`
  display: grid;
  gap: ${props => props.theme.spacing[4]};
  
  ${props => props.columns === 2 && css`
    grid-template-columns: 1fr 1fr;
    
    @media (max-width: ${props.theme.breakpoints.md}) {
      grid-template-columns: 1fr;
    }
  `}
  
  ${props => props.columns === 3 && css`
    grid-template-columns: repeat(3, 1fr);
    
    @media (max-width: ${props.theme.breakpoints.lg}) {
      grid-template-columns: 1fr 1fr;
    }
    
    @media (max-width: ${props.theme.breakpoints.md}) {
      grid-template-columns: 1fr;
    }
  `}
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[2]};
  
  ${props => props.span && css`
    grid-column: span ${props.span};
    
    @media (max-width: ${props.theme.breakpoints.md}) {
      grid-column: span 1;
    }
  `}
`;

const FormActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[4]};
  padding-top: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border.subtle};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column-reverse;
    align-items: stretch;
  }
`;

const ActionsLeft = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    justify-content: center;
  }
`;

const ActionsRight = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing[2]};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    justify-content: stretch;
    
    & > * {
      flex: 1;
    }
  }
`;

const ErrorSummary = styled(motion.div)`
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.red[50]};
  border: 1px solid ${props => props.theme.colors.red[200]};
  border-radius: ${props => props.theme.spacing[2]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const ErrorList = styled.ul`
  margin: ${props => props.theme.spacing[2]} 0 0 ${props => props.theme.spacing[4]};
  padding: 0;
  list-style: none;
  
  li {
    position: relative;
    padding-left: ${props => props.theme.spacing[2]};
    margin-bottom: ${props => props.theme.spacing[1]};
    
    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: ${props => props.theme.colors.red[600]};
    }
  }
`;

const ValidationIcon = styled.div`
  display: flex;
  align-items: center;
  color: ${props => getValidationColor(props.status, props.theme)};
`;

const getValidationColor = (status, theme) => {
  switch (status) {
    case 'valid':
      return theme.colors.green[600];
    case 'invalid':
      return theme.colors.red[600];
    case 'warning':
      return theme.colors.yellow[600];
    default:
      return theme.colors.text.tertiary;
  }
};

// Validation rules
const validationRules = {
  required: (value, message = 'This field is required') => 
    value && value.toString().trim() ? null : message,
  
  minLength: (min, message) => (value) =>
    !value || value.length >= min ? null : message || `Must be at least ${min} characters`,
    
  maxLength: (max, message) => (value) =>
    !value || value.length <= max ? null : message || `Must be no more than ${max} characters`,
    
  email: (value, message = 'Please enter a valid email') =>
    !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : message,
    
  number: (value, message = 'Please enter a valid number') =>
    !value || !isNaN(Number(value)) ? null : message,
    
  positive: (value, message = 'Must be a positive number') =>
    !value || Number(value) > 0 ? null : message,
    
  min: (min, message) => (value) =>
    !value || Number(value) >= min ? null : message || `Must be at least ${min}`,
    
  max: (max, message) => (value) =>
    !value || Number(value) <= max ? null : message || `Must be no more than ${max}`,
    
  pattern: (regex, message) => (value) =>
    !value || regex.test(value) ? null : message,
};

const ProductForm = ({
  initialData = {},
  mode = 'create',
  onSubmit,
  onCancel,
  onDelete,
  loading = false,
  className,
  ...props
}) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    supplier: '',
    description: '',
    price: '',
    cost: '',
    minStock: '',
    maxStock: '',
    currentStock: '',
    reorderPoint: '',
    location: '',
    barcode: '',
    weight: '',
    dimensions: '',
    tags: '',
    status: 'active',
    unit: '',
    expirationDate: '',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Define field configurations
  const fieldConfigs = {
    name: {
      label: 'Product Name',
      type: 'text',
      required: true,
      rules: [
        validationRules.required,
        validationRules.minLength(2, 'Product name must be at least 2 characters'),
        validationRules.maxLength(100, 'Product name must be no more than 100 characters')
      ]
    },
    sku: {
      label: 'SKU',
      type: 'text',
      required: true,
      rules: [
        validationRules.required,
        validationRules.pattern(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens')
      ]
    },
    category: {
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'food', label: 'Food & Beverages' },
        { value: 'home', label: 'Home & Garden' },
        { value: 'books', label: 'Books' },
        { value: 'toys', label: 'Toys & Games' }
      ],
      rules: [validationRules.required]
    },
    supplier: {
      label: 'Supplier',
      type: 'text',
      rules: [validationRules.maxLength(100)]
    },
    description: {
      label: 'Description',
      type: 'textarea',
      rows: 3,
      rules: [validationRules.maxLength(500)]
    },
    price: {
      label: 'Selling Price',
      type: 'number',
      required: true,
      prefix: '$',
      step: '0.01',
      rules: [
        validationRules.required,
        validationRules.number,
        validationRules.positive
      ]
    },
    cost: {
      label: 'Cost Price',
      type: 'number',
      prefix: '$',
      step: '0.01',
      rules: [
        validationRules.number,
        validationRules.positive
      ]
    },
    currentStock: {
      label: 'Current Stock',
      type: 'number',
      required: true,
      rules: [
        validationRules.required,
        validationRules.number,
        validationRules.min(0)
      ]
    },
    minStock: {
      label: 'Minimum Stock',
      type: 'number',
      rules: [
        validationRules.number,
        validationRules.min(0)
      ]
    },
    maxStock: {
      label: 'Maximum Stock',
      type: 'number',
      rules: [
        validationRules.number,
        validationRules.min(0)
      ]
    },
    reorderPoint: {
      label: 'Reorder Point',
      type: 'number',
      rules: [
        validationRules.number,
        validationRules.min(0)
      ]
    },
    location: {
      label: 'Storage Location',
      type: 'text',
      rules: [validationRules.maxLength(50)]
    },
    barcode: {
      label: 'Barcode',
      type: 'text',
      rules: [
        validationRules.pattern(/^\d+$/, 'Barcode must contain only numbers')
      ]
    },
    weight: {
      label: 'Weight (kg)',
      type: 'number',
      step: '0.01',
      rules: [
        validationRules.number,
        validationRules.positive
      ]
    },
    dimensions: {
      label: 'Dimensions (L×W×H cm)',
      type: 'text',
      placeholder: 'e.g., 30×20×10',
      rules: [validationRules.maxLength(50)]
    },
    tags: {
      label: 'Tags',
      type: 'text',
      placeholder: 'Comma-separated tags',
      helperText: 'Separate tags with commas',
      rules: [validationRules.maxLength(200)]
    },
    status: {
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'discontinued', label: 'Discontinued' }
      ],
      rules: [validationRules.required]
    },
    unit: {
      label: 'Unit of Measurement',
      type: 'select',
      options: [
        { value: 'pcs', label: 'Pieces' },
        { value: 'kg', label: 'Kilograms' },
        { value: 'g', label: 'Grams' },
        { value: 'l', label: 'Liters' },
        { value: 'ml', label: 'Milliliters' },
        { value: 'm', label: 'Meters' },
        { value: 'cm', label: 'Centimeters' },
        { value: 'box', label: 'Boxes' },
        { value: 'pack', label: 'Packs' }
      ],
      rules: [validationRules.maxLength(20)]
    },
    expirationDate: {
      label: 'Expiration Date',
      type: 'date',
      helperText: 'Leave empty for non-perishable items',
      rules: []
    }
  };

  // Validate a single field
  const validateField = useCallback((name, value) => {
    const config = fieldConfigs[name];
    if (!config || !config.rules) return null;

    for (const rule of config.rules) {
      const error = rule(value);
      if (error) return error;
    }

    // Cross-field validation
    if (name === 'maxStock' && formData.minStock && Number(value) < Number(formData.minStock)) {
      return 'Maximum stock must be greater than minimum stock';
    }
    if (name === 'minStock' && formData.maxStock && Number(value) > Number(formData.maxStock)) {
      return 'Minimum stock must be less than maximum stock';
    }
    if (name === 'cost' && formData.price && Number(value) > Number(formData.price)) {
      return 'Cost price should typically be less than selling price';
    }

    return null;
  }, [formData]);

  // Validate entire form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.keys(fieldConfigs).forEach(name => {
      const error = validateField(name, formData[name]);
      if (error) {
        newErrors[name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Handle field changes
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    setIsDirty(true);

    // Validate field on change if it was previously touched
    if (touched[name] || errors[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Handle field blur
  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const processedData = {
      ...formData,
      price: formData.price ? Number(formData.price) : null,
      cost: formData.cost ? Number(formData.cost) : null,
      currentStock: formData.currentStock ? Number(formData.currentStock) : 0,
      minStock: formData.minStock ? Number(formData.minStock) : null,
      maxStock: formData.maxStock ? Number(formData.maxStock) : null,
      reorderPoint: formData.reorderPoint ? Number(formData.reorderPoint) : null,
      weight: formData.weight ? Number(formData.weight) : null,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    };

    onSubmit?.(processedData);
  };

  // Calculate form status
  const hasErrors = Object.keys(errors).some(key => errors[key]);
  const hasRequiredFields = Object.keys(fieldConfigs)
    .filter(key => fieldConfigs[key].required)
    .every(key => formData[key] && formData[key].toString().trim());

  const formStatus = hasErrors ? 'invalid' : hasRequiredFields ? 'valid' : 'incomplete';

  const getStatusBadge = () => {
    switch (formStatus) {
      case 'valid':
        return <Badge variant="success" size="sm">Valid</Badge>;
      case 'invalid':
        return <Badge variant="error" size="sm">Has Errors</Badge>;
      default:
        return <Badge variant="secondary" size="sm">Incomplete</Badge>;
    }
  };

  // Get error summary
  const errorList = Object.keys(errors).filter(key => errors[key]).map(key => ({
    field: fieldConfigs[key]?.label || key,
    message: errors[key]
  }));

  return (
    <FormContainer
      onSubmit={handleSubmit}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <FormHeader>
        <FormTitle>
          <Icon name={mode === 'create' ? 'plus' : 'edit'} size={24} />
          <Typography variant="h4" weight="semibold">
            {mode === 'create' ? 'Add New Product' : 'Edit Product'}
          </Typography>
        </FormTitle>
        
        <FormStatus>
          {getStatusBadge()}
          <ValidationIcon status={formStatus}>
            <Icon 
              name={formStatus === 'valid' ? 'checkCircle' : formStatus === 'invalid' ? 'error' : 'clock'} 
              size={20} 
            />
          </ValidationIcon>
        </FormStatus>
      </FormHeader>

      {errorList.length > 0 && (
        <ErrorSummary
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <Typography variant="subtitle2" weight="medium" color="error">
            Please fix the following errors:
          </Typography>
          <ErrorList>
            {errorList.map(({ field, message }) => (
              <li key={field}>
                <Typography variant="body2" color="error">
                  <strong>{field}:</strong> {message}
                </Typography>
              </li>
            ))}
          </ErrorList>
        </ErrorSummary>
      )}

      {/* Basic Information */}
      <FormSection>
        <SectionHeader>
          <SectionIcon>
            <Icon name="info" size={16} />
          </SectionIcon>
          <Typography variant="h6" weight="medium">
            Basic Information
          </Typography>
        </SectionHeader>
        
        <FieldGrid columns={2}>
          <FormField
            {...fieldConfigs.name}
            name="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={errors.name}
          />
          <FormField
            {...fieldConfigs.sku}
            name="sku"
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
            onBlur={() => handleBlur('sku')}
            error={errors.sku}
          />
          <FormField
            {...fieldConfigs.category}
            name="category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            onBlur={() => handleBlur('category')}
            error={errors.category}
          />
          <FormField
            {...fieldConfigs.supplier}
            name="supplier"
            value={formData.supplier}
            onChange={(e) => handleChange('supplier', e.target.value)}
            onBlur={() => handleBlur('supplier')}
            error={errors.supplier}
          />
          <FieldGroup span={2}>
            <FormField
              {...fieldConfigs.description}
              name="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              error={errors.description}
              showCharacterCount
              maxLength={500}
            />
          </FieldGroup>
        </FieldGrid>
      </FormSection>

      {/* Pricing */}
      <FormSection>
        <SectionHeader>
          <SectionIcon>
            <Icon name="trending" size={16} />
          </SectionIcon>
          <Typography variant="h6" weight="medium">
            Pricing
          </Typography>
        </SectionHeader>
        
        <FieldGrid columns={2}>
          <FormField
            {...fieldConfigs.price}
            name="price"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            onBlur={() => handleBlur('price')}
            error={errors.price}
          />
          <FormField
            {...fieldConfigs.cost}
            name="cost"
            value={formData.cost}
            onChange={(e) => handleChange('cost', e.target.value)}
            onBlur={() => handleBlur('cost')}
            error={errors.cost}
          />
        </FieldGrid>
      </FormSection>

      {/* Inventory */}
      <FormSection>
        <SectionHeader>
          <SectionIcon>
            <Icon name="products" size={16} />
          </SectionIcon>
          <Typography variant="h6" weight="medium">
            Inventory Management
          </Typography>
        </SectionHeader>
        
        <FieldGrid columns={3}>
          <FormField
            {...fieldConfigs.currentStock}
            name="currentStock"
            value={formData.currentStock}
            onChange={(e) => handleChange('currentStock', e.target.value)}
            onBlur={() => handleBlur('currentStock')}
            error={errors.currentStock}
          />
          <FormField
            {...fieldConfigs.minStock}
            name="minStock"
            value={formData.minStock}
            onChange={(e) => handleChange('minStock', e.target.value)}
            onBlur={() => handleBlur('minStock')}
            error={errors.minStock}
          />
          <FormField
            {...fieldConfigs.maxStock}
            name="maxStock"
            value={formData.maxStock}
            onChange={(e) => handleChange('maxStock', e.target.value)}
            onBlur={() => handleBlur('maxStock')}
            error={errors.maxStock}
          />
          <FormField
            {...fieldConfigs.reorderPoint}
            name="reorderPoint"
            value={formData.reorderPoint}
            onChange={(e) => handleChange('reorderPoint', e.target.value)}
            onBlur={() => handleBlur('reorderPoint')}
            error={errors.reorderPoint}
          />
          <FormField
            {...fieldConfigs.location}
            name="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            onBlur={() => handleBlur('location')}
            error={errors.location}
          />
          <FormField
            {...fieldConfigs.status}
            name="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            onBlur={() => handleBlur('status')}
            error={errors.status}
          />
        </FieldGrid>
      </FormSection>

      {/* Additional Details */}
      <FormSection>
        <SectionHeader>
          <SectionIcon>
            <Icon name="settings" size={16} />
          </SectionIcon>
          <Typography variant="h6" weight="medium">
            Additional Details
          </Typography>
        </SectionHeader>
        
        <FieldGrid columns={2}>
          <FormField
            {...fieldConfigs.barcode}
            name="barcode"
            value={formData.barcode}
            onChange={(e) => handleChange('barcode', e.target.value)}
            onBlur={() => handleBlur('barcode')}
            error={errors.barcode}
          />
          <FormField
            {...fieldConfigs.unit}
            name="unit"
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            onBlur={() => handleBlur('unit')}
            error={errors.unit}
          />
          <FormField
            {...fieldConfigs.weight}
            name="weight"
            value={formData.weight}
            onChange={(e) => handleChange('weight', e.target.value)}
            onBlur={() => handleBlur('weight')}
            error={errors.weight}
          />
          <FormField
            {...fieldConfigs.expirationDate}
            name="expirationDate"
            value={formData.expirationDate}
            onChange={(e) => handleChange('expirationDate', e.target.value)}
            onBlur={() => handleBlur('expirationDate')}
            error={errors.expirationDate}
          />
          <FormField
            {...fieldConfigs.dimensions}
            name="dimensions"
            value={formData.dimensions}
            onChange={(e) => handleChange('dimensions', e.target.value)}
            onBlur={() => handleBlur('dimensions')}
            error={errors.dimensions}
          />
          <FormField
            {...fieldConfigs.tags}
            name="tags"
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            onBlur={() => handleBlur('tags')}
            error={errors.tags}
          />
        </FieldGrid>
      </FormSection>

      <FormActions>
        <ActionsLeft>
          {mode === 'edit' && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={onDelete}
              disabled={loading}
            >
              <Icon name="delete" size={16} />
              Delete Product
            </Button>
          )}
        </ActionsLeft>

        <ActionsRight>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={hasErrors || !hasRequiredFields}
          >
            <Icon name="save" size={16} />
            {mode === 'create' ? 'Create Product' : 'Save Changes'}
          </Button>
        </ActionsRight>
      </FormActions>
    </FormContainer>
  );
};

export default ProductForm;