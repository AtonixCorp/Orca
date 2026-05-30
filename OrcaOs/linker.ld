ENTRY(_start)

PHDRS {
  text PT_LOAD FLAGS(5);
  data PT_LOAD FLAGS(6);
}

SECTIONS {
  . = 1M;

  .multiboot : {
    *(.multiboot)
  } :text

  .text : {
    *(.text*)
  } :text

  .rodata : {
    *(.rodata*)
    *(.eh_frame*)
  } :text

  . = ALIGN(4K);

  .data : {
    *(.data*)
  } :data

  .bss : {
    *(.bss*)
    *(COMMON)
  } :data
}
