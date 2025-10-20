import express from 'express';
import { isVendorOwnerOrAdmin } from '../middleware/isVendorOwnerOrAdmin-mock';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = express.Router();
// Validation schemas
const CreateFieldDefSchema = z.object({
  key: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  type: z.enum(['text', 'number', 'boolean', 'select']),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
  order: z.number().default(0),
});

const UpdateFieldDefSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  type: z.enum(['text', 'number', 'boolean', 'select']).optional(),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
  order: z.number().optional(),
});

// GET /api/vendor/order-field-defs
router.get('/', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;

    const fieldDefs = await prisma.orderFieldDef.findMany({
      where: { vendorProfileId },
      orderBy: { order: 'asc' },
    });

    res.json({
      fieldDefs: fieldDefs.map(field => ({
        ...field,
        options: field.options ? JSON.parse(field.options) : null,
      })),
    });

  } catch (error) {
    console.error('Get order field definitions error:', error);
    res.status(500).json({ error: 'Failed to fetch order field definitions' });
  }
});

// POST /api/vendor/order-field-defs
router.post('/', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const fieldData = CreateFieldDefSchema.parse(req.body);

    // Check if key already exists
    const existingField = await prisma.orderFieldDef.findUnique({
      where: {
        vendorProfileId_key: {
          vendorProfileId,
          key: fieldData.key,
        },
      },
    });

    if (existingField) {
      return res.status(400).json({ error: 'Field key already exists' });
    }

    // Validate options for select type
    if (fieldData.type === 'select' && (!fieldData.options || fieldData.options.length === 0)) {
      return res.status(400).json({ error: 'Select type requires options' });
    }

    // Get next order number if not provided
    let order = fieldData.order;
    if (order === 0) {
      const lastField = await prisma.orderFieldDef.findFirst({
        where: { vendorProfileId },
        orderBy: { order: 'desc' },
      });
      order = lastField ? lastField.order + 1 : 1;
    }

    const fieldDef = await prisma.orderFieldDef.create({
      data: {
        vendorProfileId,
        key: fieldData.key,
        label: fieldData.label,
        type: fieldData.type,
        options: fieldData.options ? JSON.stringify(fieldData.options) : null,
        required: fieldData.required,
        order,
      },
    });

    res.status(201).json({
      ...fieldDef,
      options: fieldDef.options ? JSON.parse(fieldDef.options) : null,
    });

  } catch (error) {
    console.error('Create order field definition error:', error);
    res.status(500).json({ error: 'Failed to create order field definition' });
  }
});

// PUT /api/vendor/order-field-defs/:id
router.put('/:id', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { id } = req.params;
    const updateData = UpdateFieldDefSchema.parse(req.body);

    // Check if field exists and belongs to vendor
    const existingField = await prisma.orderFieldDef.findFirst({
      where: { id, vendorProfileId },
    });

    if (!existingField) {
      return res.status(404).json({ error: 'Field definition not found' });
    }

    // Validate options for select type
    if (updateData.type === 'select' && (!updateData.options || updateData.options.length === 0)) {
      return res.status(400).json({ error: 'Select type requires options' });
    }

    const fieldDef = await prisma.orderFieldDef.update({
      where: { id },
      data: {
        ...updateData,
        options: updateData.options ? JSON.stringify(updateData.options) : undefined,
      },
    });

    res.json({
      ...fieldDef,
      options: fieldDef.options ? JSON.parse(fieldDef.options) : null,
    });

  } catch (error) {
    console.error('Update order field definition error:', error);
    res.status(500).json({ error: 'Failed to update order field definition' });
  }
});

// DELETE /api/vendor/order-field-defs/:id
router.delete('/:id', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { id } = req.params;

    // Check if field exists and belongs to vendor
    const existingField = await prisma.orderFieldDef.findFirst({
      where: { id, vendorProfileId },
    });

    if (!existingField) {
      return res.status(404).json({ error: 'Field definition not found' });
    }

    // Check if field is being used in any orders
    const ordersWithField = await prisma.order.findFirst({
      where: {
        vendorProfileId,
        customFields: {
          contains: existingField.key,
        },
      },
    });

    if (ordersWithField) {
      return res.status(400).json({ 
        error: 'Cannot delete field definition that is being used in orders' 
      });
    }

    await prisma.orderFieldDef.delete({
      where: { id },
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Delete order field definition error:', error);
    res.status(500).json({ error: 'Failed to delete order field definition' });
  }
});

// POST /api/vendor/order-field-defs/reorder
router.post('/reorder', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;
    const { fieldIds } = req.body;

    if (!Array.isArray(fieldIds)) {
      return res.status(400).json({ error: 'fieldIds must be an array' });
    }

    // Update order for each field
    const updatePromises = fieldIds.map((fieldId, index) => 
      prisma.orderFieldDef.updateMany({
        where: {
          id: fieldId,
          vendorProfileId,
        },
        data: {
          order: index + 1,
        },
      })
    );

    await Promise.all(updatePromises);

    res.json({ success: true });

  } catch (error) {
    console.error('Reorder field definitions error:', error);
    res.status(500).json({ error: 'Failed to reorder field definitions' });
  }
});

// GET /api/vendor/order-field-defs/preview
router.get('/preview', isVendorOwnerOrAdmin, async (req, res) => {
  try {
    const vendorProfileId = req.user!.vendorProfileId!;

    const fieldDefs = await prisma.orderFieldDef.findMany({
      where: { vendorProfileId },
      orderBy: { order: 'asc' },
    });

    // Generate preview HTML
    const html = generateFieldPreviewHTML(fieldDefs);

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('Get field preview error:', error);
    res.status(500).json({ error: 'Failed to generate field preview' });
  }
});

// Helper function to generate field preview HTML
function generateFieldPreviewHTML(fieldDefs: any[]): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Custom Fields Preview</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .preview { max-width: 600px; margin: 0 auto; }
        .field { margin-bottom: 20px; }
        .field label { display: block; margin-bottom: 5px; font-weight: bold; }
        .field input, .field select, .field textarea { 
            width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; 
        }
        .field .required { color: red; }
        .field .help { font-size: 12px; color: #666; margin-top: 5px; }
        .header { text-align: center; margin-bottom: 30px; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
    </style>
</head>
<body>
    <div class="preview">
        <div class="header">
            <h1>Custom Fields Preview</h1>
            <p>This is how your custom fields will appear in the order form</p>
        </div>
        
        ${fieldDefs.map(field => `
            <div class="field">
                <label for="${field.key}">
                    ${field.label}
                    ${field.required ? '<span class="required">*</span>' : ''}
                </label>
                
                ${field.type === 'text' ? `
                    <input type="text" id="${field.key}" name="${field.key}" placeholder="Enter ${field.label.toLowerCase()}">
                ` : field.type === 'number' ? `
                    <input type="number" id="${field.key}" name="${field.key}" placeholder="Enter ${field.label.toLowerCase()}">
                ` : field.type === 'boolean' ? `
                    <input type="checkbox" id="${field.key}" name="${field.key}">
                    <label for="${field.key}">Yes</label>
                ` : field.type === 'select' ? `
                    <select id="${field.key}" name="${field.key}">
                        <option value="">Select ${field.label.toLowerCase()}</option>
                        ${JSON.parse(field.options || '[]').map((option: string) => `
                            <option value="${option}">${option}</option>
                        `).join('')}
                    </select>
                ` : ''}
                
                <div class="help">
                    Type: ${field.type} | Required: ${field.required ? 'Yes' : 'No'}
                </div>
            </div>
        `).join('')}
        
        <div class="footer">
            <p>Preview generated by Craved Artisan Orders Management System</p>
        </div>
    </div>
</body>
</html>`;
}

export default router;
