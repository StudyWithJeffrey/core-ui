export * from './authService.service';
import { AuthServiceService } from './authService.service';
export * from './namespaceService.service';
import { NamespaceServiceService } from './namespaceService.service';
export * from './secretService.service';
import { SecretServiceService } from './secretService.service';
export * from './workflowService.service';
import { WorkflowServiceService } from './workflowService.service';
export const APIS = [AuthServiceService, NamespaceServiceService, SecretServiceService, WorkflowServiceService];
