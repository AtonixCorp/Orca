terraform {
  required_version = ">= 1.5.0"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.31"
    }
  }
}

provider "kubernetes" {
  config_path    = var.kubeconfig_path != "" ? pathexpand(var.kubeconfig_path) : null
  config_context = var.kubeconfig_context != "" ? var.kubeconfig_context : null

  host                   = var.kubernetes_host != "" ? var.kubernetes_host : null
  token                  = var.kubernetes_token != "" ? var.kubernetes_token : null
  cluster_ca_certificate = var.kubernetes_cluster_ca_certificate != "" ? base64decode(var.kubernetes_cluster_ca_certificate) : null
}

locals {
  namespace_set = distinct(concat(var.namespaces, [var.orca_namespace]))
}

module "k8s_namespaces" {
  source = "./modules/k8s-namespaces"

  providers = {
    kubernetes = kubernetes
  }

  enabled    = var.kubernetes_enabled
  namespaces = local.namespace_set
}

module "k8s_services" {
  source = "./modules/k8s-services"

  providers = {
    kubernetes = kubernetes
  }

  enabled   = var.kubernetes_enabled
  namespace = var.orca_namespace
  workloads = var.orca_workloads

  depends_on = [module.k8s_namespaces]
}