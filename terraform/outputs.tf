output "kubernetes_namespaces" {
  description = "Namespaces managed by this stack."
  value       = module.k8s_namespaces.namespaces
}

output "orca_workloads" {
  description = "ORCA workloads exposed by the Kubernetes module."
  value       = module.k8s_services.workloads
}