import mongoose from 'mongoose';

const employerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  companyDetails: {
    type: String,
    required: [true, 'Company details are required'],
    trim: true,
    maxlength: [1000, 'Company details cannot exceed 1000 characters']
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true
  },
  companySize: {
    type: String,
    required: [true, 'Company size is required'],
    enum: {
      values: ['1-10', '11-50', '51-200', '201-500', '501+'],
      message: 'Please select a valid company size'
    }
  },
  website: {
    type: String,
    trim: true,
    match: [
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      'Please enter a valid URL'
    ]
  },
  contactPersonName: {
    type: String,
    required: [true, 'Contact person name is required'],
    trim: true
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true // This will add createdAt and updatedAt fields automatically
});

// Create indexes for frequently queried fields
employerSchema.index({ status: 1 });
employerSchema.index({ companyName: 1 });
employerSchema.index({ contactEmail: 1 }, { unique: true });

const Employer = mongoose.models.Employer || mongoose.model('Employer', employerSchema);

export default Employer;
