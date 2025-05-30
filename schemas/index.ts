// schemas/index.ts - Export all schemas from a central location

// Auth schemas
export {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  newPasswordSchema,
  changePasswordSchema,
  profileUpdateSchema,
  userRoleUpdateSchema,
  userActivationSchema,
  verifyEmailSchema,
  twoFactorSetupSchema,
  twoFactorVerificationSchema,
  type LoginFormData,
  type RegisterFormData,
  type ResetPasswordFormData,
  type NewPasswordFormData,
  type ChangePasswordFormData,
  type ProfileUpdateFormData,
  type UserRoleUpdateFormData,
  type UserActivationFormData,
  type VerifyEmailFormData,
  type TwoFactorSetupFormData,
  type TwoFactorVerificationFormData,
} from './auth';

// Operator schemas
export {
  operatorSchema,
  operatorFilterSchema,
  operatorUpdateSchema,
  operatorActivationSchema,
  operatorBulkOperationSchema,
  operatorImportSchema,
  operatorExportSchema,
  type OperatorFormData,
  type OperatorFilterData,
  type OperatorUpdateData,
  type OperatorActivationData,
  type OperatorBulkOperationData,
  type OperatorImportData,
  type OperatorExportData,
} from './operator';

// Security schemas
export {
  ActivityLogSchema,
  ActivityLogFilterSchema,
  PermissionSchema,
  RolePermissionSchema,
  RateLimitSchema,
  BackupConfigSchema,
  SecurityPolicySchema,
  SecurityLogExportSchema,
  PerformanceMetricSchema,
} from './security';

// You can add more schema exports here as you create them
// Contract schemas (when you create them)
// export { contractSchema, ... } from './contract';

// Complaint schemas (when you create them)  
// export { complaintSchema, ... } from './complaint';