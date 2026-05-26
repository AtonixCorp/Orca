variable "cloud_name" {
  type    = string
  default = null
}

variable "auth_url" {
  type    = string
  default = null
}

variable "project_id" {
  type    = string
  default = null
}

variable "project_name" {
  type    = string
  default = null
}

variable "username" {
  type    = string
  default = null
}

variable "password" {
  type      = string
  sensitive = true
  default   = null
}

variable "region" {
  type    = string
  default = null
}

variable "user_domain_name" {
  type    = string
  default = null
}

variable "database_volume_size_gb" {
  type    = number
  default = 100
}

variable "object_storage_volume_size_gb" {
  type    = number
  default = 250
}

variable "logs_volume_size_gb" {
  type    = number
  default = 150
}

variable "kafka_log_volume_size_gb" {
  type    = number
  default = 250
}

variable "spark_checkpoint_volume_size_gb" {
  type    = number
  default = 150
}

variable "postgres_data_volume_size_gb" {
  type    = number
  default = 200
}

variable "postgres_wal_volume_size_gb" {
  type    = number
  default = 100
}

variable "postgres_replica_volume_size_gb" {
  type    = number
  default = 150
}

variable "hdfs_namenode_volume_size_gb" {
  type    = number
  default = 200
}

variable "hdfs_datanode_volume_size_gb" {
  type    = number
  default = 500
}

variable "kafka_broker_count" {
  type    = number
  default = 3
}

variable "postgres_replica_count" {
  type    = number
  default = 1
}

variable "hdfs_namenode_count" {
  type    = number
  default = 2
}

variable "hdfs_datanode_count" {
  type    = number
  default = 3
}