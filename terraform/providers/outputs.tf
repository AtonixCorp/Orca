output "openstack_network" {
  description = "Resolved OpenStack network information."
  value = {
    network_id   = module.openstack_network.network_id
    subnet_id    = module.openstack_network.subnet_id
    network_name = module.openstack_network.network_name
  }
}

output "openstack_compute" {
  description = "OpenStack compute instances keyed by compute group."
  value = {
    for name, module_instance in module.openstack_compute : name => {
      instance_ids   = module_instance.instance_ids
      instance_names = module_instance.instance_names
    }
  }
}