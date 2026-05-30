#include "orca_handoff.h"

typedef struct {
    orca_handoff_file_id id;
    const char* path;
} orca_handoff_target;

static const orca_handoff_target ORCA_HANDOFF_TARGETS[ORCA_MAX_HANDOFF_FILES] = {
    { ORCA_HANDOFF_FILE_INIT, "init" },
    { ORCA_HANDOFF_FILE_ROOTFS_MANIFEST, "usr/share/orca/rootfs.manifest" },
    { ORCA_HANDOFF_FILE_AI_CONFIG, "etc/orca/ai/config.yaml" },
    { ORCA_HANDOFF_FILE_NET_CONFIG, "etc/orca/network/orca-net.conf" },
    { ORCA_HANDOFF_FILE_OTA_CONFIG, "etc/orca/updater/ota.conf" },
    { ORCA_HANDOFF_FILE_SYSTEM_INIT_PROFILE, "etc/orca/system/init/profile.conf" },
};

static orca_runtime_handoff ORCA_RUNTIME_HANDOFF = {
    0u,
    0u,
    0u,
    0u,
    {
        { ORCA_HANDOFF_FILE_INIT, "init", 0, 0u, 0u },
        { ORCA_HANDOFF_FILE_ROOTFS_MANIFEST, "usr/share/orca/rootfs.manifest", 0, 0u, 0u },
        { ORCA_HANDOFF_FILE_AI_CONFIG, "etc/orca/ai/config.yaml", 0, 0u, 0u },
        { ORCA_HANDOFF_FILE_NET_CONFIG, "etc/orca/network/orca-net.conf", 0, 0u, 0u },
        { ORCA_HANDOFF_FILE_OTA_CONFIG, "etc/orca/updater/ota.conf", 0, 0u, 0u },
        { ORCA_HANDOFF_FILE_SYSTEM_INIT_PROFILE, "etc/orca/system/init/profile.conf", 0, 0u, 0u },
    }
};

void orca_runtime_handoff_reset(void) {
    size_t i = 0;

    ORCA_RUNTIME_HANDOFF.module_start = 0u;
    ORCA_RUNTIME_HANDOFF.module_end = 0u;
    ORCA_RUNTIME_HANDOFF.archive_entries = 0u;
    ORCA_RUNTIME_HANDOFF.archive_valid = 0u;

    for (i = 0; i < ORCA_MAX_HANDOFF_FILES; ++i) {
        ORCA_RUNTIME_HANDOFF.files[i].data = 0;
        ORCA_RUNTIME_HANDOFF.files[i].size = 0u;
        ORCA_RUNTIME_HANDOFF.files[i].available = 0u;
    }
}

void orca_runtime_handoff_set_module(uint32_t module_start, uint32_t module_end) {
    ORCA_RUNTIME_HANDOFF.module_start = module_start;
    ORCA_RUNTIME_HANDOFF.module_end = module_end;
}

void orca_runtime_handoff_set_archive_state(uint8_t archive_valid, uint32_t archive_entries) {
    ORCA_RUNTIME_HANDOFF.archive_valid = archive_valid;
    ORCA_RUNTIME_HANDOFF.archive_entries = archive_entries;
}

void orca_runtime_handoff_capture_file(orca_handoff_file_id id, const uint8_t* data, uint32_t size) {
    size_t i = 0;

    for (i = 0; i < ORCA_MAX_HANDOFF_FILES; ++i) {
        if (ORCA_HANDOFF_TARGETS[i].id == id) {
            ORCA_RUNTIME_HANDOFF.files[i].data = data;
            ORCA_RUNTIME_HANDOFF.files[i].size = size;
            ORCA_RUNTIME_HANDOFF.files[i].available = 1u;
            return;
        }
    }
}

const orca_runtime_handoff* orca_get_runtime_handoff(void) {
    return &ORCA_RUNTIME_HANDOFF;
}

const orca_handoff_file_record* orca_get_handoff_file(orca_handoff_file_id id) {
    size_t i = 0;

    for (i = 0; i < ORCA_MAX_HANDOFF_FILES; ++i) {
        if (ORCA_RUNTIME_HANDOFF.files[i].id == id) {
            return &ORCA_RUNTIME_HANDOFF.files[i];
        }
    }

    return 0;
}

const char* orca_handoff_file_token(orca_handoff_file_id id) {
    switch (id) {
        case ORCA_HANDOFF_FILE_INIT:
            return "init";
        case ORCA_HANDOFF_FILE_ROOTFS_MANIFEST:
            return "manifest";
        case ORCA_HANDOFF_FILE_AI_CONFIG:
            return "ai-cfg";
        case ORCA_HANDOFF_FILE_NET_CONFIG:
            return "net-cfg";
        case ORCA_HANDOFF_FILE_OTA_CONFIG:
            return "ota-cfg";
        case ORCA_HANDOFF_FILE_SYSTEM_INIT_PROFILE:
            return "init-prof";
        default:
            return "unknown";
    }
}