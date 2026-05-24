variable "auth_url" {
  type = string
}

variable "project_name" {
  type = string
}

variable "username" {
  type = string
}

variable "password" {
  type      = string
  sensitive = true
}

variable "region" {
  type = string
}

variable "external_network_id" {
  type = string
}

variable "public_subnet_cidr" {
  type    = string
  default = "172.20.10.0/24"
}

variable "services_subnet_cidr" {
  type    = string
  default = "172.20.20.0/24"
}

variable "database_subnet_cidr" {
  type    = string
  default = "172.20.30.0/24"
}

variable "public_gateway_ip" {
  type    = string
  default = "172.20.10.1"
}

variable "services_gateway_ip" {
  type    = string
  default = "172.20.20.1"
}

variable "database_gateway_ip" {
  type    = string
  default = "172.20.30.1"
}

variable "dns_nameservers" {
  type    = list(string)
  default = ["1.1.1.1", "8.8.8.8"]
}