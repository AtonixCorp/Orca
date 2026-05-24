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

locals {
  cloud_init = <<-EOF
              #cloud-config
              package_update: true
              packages:
                - docker.io
              runcmd:
                - systemctl enable docker
                - systemctl start docker
              EOF
}

resource "openstack_compute_instance_v2" "api_gateway" {
  name            = "smartcito-api-gateway"
  image_name      = var.image_name
  flavor_name     = var.api_flavor_name
  key_pair        = var.key_pair
  security_groups = var.public_security_groups
  user_data       = local.cloud_init

  network {
    uuid = var.public_network_id
  }

  network {
    uuid = var.services_network_id
  }
}

resource "openstack_compute_instance_v2" "service_nodes" {
  count           = var.service_node_count
  name            = "smartcito-service-${count.index + 1}"
  image_name      = var.image_name
  flavor_name     = var.service_flavor_name
  key_pair        = var.key_pair
  security_groups = var.internal_security_groups
  user_data       = local.cloud_init

  network {
    uuid = var.services_network_id
  }
}

resource "openstack_compute_instance_v2" "database_nodes" {
  count           = var.database_node_count
  name            = "smartcito-database-${count.index + 1}"
  image_name      = var.image_name
  flavor_name     = var.database_flavor_name
  key_pair        = var.key_pair
  security_groups = var.database_security_groups
  user_data       = local.cloud_init

  network {
    uuid = var.database_network_id
  }
}