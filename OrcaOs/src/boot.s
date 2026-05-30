.set ALIGN,    1<<0
.set MEMINFO,  1<<1
.set FLAGS,    ALIGN | MEMINFO
.set MAGIC,    0x1BADB002
.set CHECKSUM, -(MAGIC + FLAGS)

.section .multiboot,"a"
.align 4
.long MAGIC
.long FLAGS
.long CHECKSUM

.section .bss,"aw",@nobits
.align 16
stack_bottom:
.skip 16384
stack_top:

.section .text,"ax"
.global _start
.type _start, @function
_start:
    mov $stack_top, %esp
    push %ebx
    push %eax
    movb $'S', %al
    outb %al, $0xE9
    movb $'K', %al
    outb %al, $0xE9
    call kernel_main

.hang:
    cli
    hlt
    jmp .hang

.size _start, . - _start
