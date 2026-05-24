output "api_gateway_instance_id" {
  value = openstack_compute_instance_v2.api_gateway.id
}

output "service_node_ids" {
  value = [for node in openstack_compute_instance_v2.service_nodes : node.id]
}

output "database_node_ids" {
  value = [for node in openstack_compute_instance_v2.database_nodes : node.id]
}