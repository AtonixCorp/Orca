terraform {
  required_version = ">= 1.6.0"

  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 2.1"
    }
  }
}

provider "openstack" {
  auth_url    = var.auth_url
  tenant_name = var.project_name
  user_name   = var.username
  password    = var.password
  region      = var.region
}

resource "openstack_blockstorage_volume_v3" "database_volume" {
  name        = "smartcito-db-volume"
  size        = var.database_volume_size_gb
  description = "Primary persistent volume for SmartCito databases."
}

resource "openstack_blockstorage_volume_v3" "object_storage_volume" {
  name        = "smartcito-object-volume"
  size        = var.object_storage_volume_size_gb
  description = "Persistent volume for object storage workloads."
}

resource "openstack_blockstorage_volume_v3" "logs_volume" {
  name        = "smartcito-logs-volume"
  size        = var.logs_volume_size_gb
  description = "Persistent volume for aggregated platform logs."
}