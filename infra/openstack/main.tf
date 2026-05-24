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

module "networking" {
  source = "./networking"

  auth_url            = var.auth_url
  project_name        = var.project_name
  username            = var.username
  password            = var.password
  region              = var.region
  external_network_id = var.external_network_id

  public_subnet_cidr   = var.public_subnet_cidr
  services_subnet_cidr = var.services_subnet_cidr
  database_subnet_cidr = var.database_subnet_cidr
  public_gateway_ip    = var.public_gateway_ip
  services_gateway_ip  = var.services_gateway_ip
  database_gateway_ip  = var.database_gateway_ip
  dns_nameservers      = var.dns_nameservers
}

module "compute" {
  source = "./compute"

  auth_url   = var.auth_url
  project_name = var.project_name
  username   = var.username
  password   = var.password
  region     = var.region

  image_name            = var.image_name
  key_pair              = var.key_pair
  public_network_id     = module.networking.public_network_id
  services_network_id   = module.networking.services_network_id
  database_network_id   = module.networking.database_network_id
  public_security_groups   = [module.networking.public_security_group_id]
  internal_security_groups = [module.networking.public_security_group_id]
  database_security_groups = [module.networking.database_security_group_id]

  api_flavor_name      = var.api_flavor_name
  service_flavor_name  = var.service_flavor_name
  database_flavor_name = var.database_flavor_name
  service_node_count   = var.service_node_count
  database_node_count  = var.database_node_count
}

module "storage" {
  source = "./storage"

  auth_url     = var.auth_url
  project_name = var.project_name
  username     = var.username
  password     = var.password
  region       = var.region

  database_volume_size_gb      = var.database_volume_size_gb
  object_storage_volume_size_gb = var.object_storage_volume_size_gb
  logs_volume_size_gb          = var.logs_volume_size_gb
}