output "database_volume_id" {
  value = openstack_blockstorage_volume_v3.database_volume.id
}

output "object_storage_volume_id" {
  value = openstack_blockstorage_volume_v3.object_storage_volume.id
}

output "logs_volume_id" {
  value = openstack_blockstorage_volume_v3.logs_volume.id
}