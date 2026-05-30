#ifndef ORCA_HANDOFF_H
#define ORCA_HANDOFF_H

#include <stddef.h>
#include <stdint.h>

#define ORCA_MAX_HANDOFF_FILES 6

typedef enum {
    ORCA_HANDOFF_FILE_INIT = 0,
    ORCA_HANDOFF_FILE_ROOTFS_MANIFEST = 1,
    ORCA_HANDOFF_FILE_AI_CONFIG = 2,
    ORCA_HANDOFF_FILE_NET_CONFIG = 3,
    ORCA_HANDOFF_FILE_OTA_CONFIG = 4,
    ORCA_HANDOFF_FILE_SYSTEM_INIT_PROFILE = 5,
} orca_handoff_file_id;

typedef struct {
    orca_handoff_file_id id;
    const char* path;
    const uint8_t* data;
    uint32_t size;
    uint8_t available;
} orca_handoff_file_record;

typedef struct {
    uint32_t module_start;
    uint32_t module_end;
    uint32_t archive_entries;
    uint8_t archive_valid;
    orca_handoff_file_record files[ORCA_MAX_HANDOFF_FILES];
} orca_runtime_handoff;

void orca_runtime_handoff_reset(void);
void orca_runtime_handoff_set_module(uint32_t module_start, uint32_t module_end);
void orca_runtime_handoff_set_archive_state(uint8_t archive_valid, uint32_t archive_entries);
void orca_runtime_handoff_capture_file(orca_handoff_file_id id, const uint8_t* data, uint32_t size);
const orca_runtime_handoff* orca_get_runtime_handoff(void);
const orca_handoff_file_record* orca_get_handoff_file(orca_handoff_file_id id);
const char* orca_handoff_file_token(orca_handoff_file_id id);

#endif