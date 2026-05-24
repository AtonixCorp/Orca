output "public_network_id" {
  value = module.networking.public_network_id
}

output "services_network_id" {
  value = module.networking.services_network_id
}

output "database_network_id" {
  value = module.networking.database_network_id
}

output "api_gateway_instance_id" {
  value = module.compute.api_gateway_instance_id
}

output "service_node_ids" {
  value = module.compute.service_node_ids
}

output "database_node_ids" {
  value = module.compute.database_node_ids
}

output "database_volume_id" {
  value = module.storage.database_volume_id
}

output "object_storage_volume_id" {
  value = module.storage.object_storage_volume_id
}

output "logs_volume_id" {
  value = module.storage.logs_volume_id
}