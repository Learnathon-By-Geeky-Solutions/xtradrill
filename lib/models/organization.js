import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  companySize: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  clerkOrgId: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);

export default Organization;
