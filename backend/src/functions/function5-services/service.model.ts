/**
 * functions/function5-services/service.model.ts
 * Owner: Function 5 — Pet Service Management
 */

import { Schema, model } from 'mongoose';
import { IService, ServiceCategory } from '../../types/models';

const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Grooming',
  'Bathing',
  'Nail Trimming',
  'Nail Polishing',
  'Training',
  'Boarding',
  'Walking',
  'Pet Daycare',
  'Pet Spa',
  'Other',
];

const serviceSchema = new Schema<IService>(
  {
    serviceCenterId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceCenter',
      index: true,
      default: null,
    },
    name: { type: String, required: [true, 'Service name is required'], trim: true },
    description: { type: String, trim: true, maxlength: [1000, 'Description cannot exceed 1000 characters'], default: null },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: SERVICE_CATEGORIES, message: 'Invalid service category' },
      trim: true,
    },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    duration: { type: Number, min: [1, 'Duration must be at least 1 minute'], default: 60 },
    provider: { type: String, trim: true, default: null },
    availability: { type: Boolean, default: true },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

serviceSchema.index({ name: 'text', description: 'text' });
serviceSchema.index({ category: 1 });
serviceSchema.index({ availability: 1 });
serviceSchema.index({ serviceCenterId: 1 });

const Service = model<IService>('Service', serviceSchema);
export default Service;
