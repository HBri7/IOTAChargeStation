/*====================================================================*
 *
 *    encapsulate and transmit as many Ethernet frames as possible
 *    without overflowing the SPI write buffer;
 *
 *--------------------------------------------------------------------*/

function transmit frame do read write buffer space available register;
while transmit queue is not empty and write buffer space is available do encapsulate transmit frame;
write transmit frame to write buffer;
if error then return failure;
end if;
update transmit statistics;
remove frame from transmit queue;
end while;
return (success);
end function;

/*====================================================================*
 *
 *   read as many frames as possible from the read buffer;
 *
 *--------------------------------------------------------------------*/

function receive frame do allocate an input buffer;
if no memory available then return failure;
end if;
read read space available register;
if read buffer is empty then return failure;
end if;
write frame length into buffer size register;
if mode is legacy then send read command;
end if;
while read buffer is not empty do read read buffer into frame buffer;
extract Ethernet frame from frame buffer;
update read statistics;
end while;
return (success);
end function;

/*====================================================================*
 *
 *   state machine to manage QCA7000 SPI slave synchronization;
 *
 *--------------------------------------------------------------------*/

function synchronize SPI slave do allocate a static reset counter;
if synchronization state is CPU on then read QCA7000 signature register;
read QCA7000 signature register;
if signature is invalid then set synchronization state to unknown;
else read SPI write buffer space available register;
if write buffer is empty then qca->SynchState = QCASPI_SYNC_READY;
set synchronization state to ready;
return;
else set synchronization state to unknown;
end if;
end if;
end if;
if synchronization stats is ready then if mode is legacy then return;
end if;
read QCA7000 signature register;
if signature is invalid then set synchronization state to unknown;
return;
end if;
end if;
if synchronization state is unknown then if mode is legacy then use GPIO to reset QCA7000;
else read QCA7000 signature register;
if signature is invalid then return;
end if;
set soc_core_reset bit in QCA SPI configuration register;
end if set synchronization state to reset;
clear reset counter;
return;
end if;
if synchronization state is reset then increment reset counter;
if reset counter exceeds reset limit then set synchronization state to unknown;
end if;
end if;
return;
end function;

/*====================================================================*
 *
 *   handle QCA7000 interrupts and transmit requests; interrupts are
 *   from the QCA7000; transmit requests are from the host computer;
 *
 *--------------------------------------------------------------------*/

function interrupt serivce routine do while terminate is false do set thread state to interruptable;
if no interrupts and synchronization state is synchronized and transmit queue is empty then allow other tasks to run;
end if set thread state to busy;
check synchronization state;
if syncrhonization state is not synchronized then flush transmit queue;
suspend for a while;
end if;
if interrupt occurred then disable SPI interrupts;
read SPI interrupt cause register;
if SPI interrupt cause is CPU on then update synchronization state;
if synchronization state is synchronized then continue;
end if;
end if;
if SPI interrupt cause is packet available then if synchronization state is synchronized then call receive frame function;
end if;
end if;
if SPI interrupt cause is read buffer error then set synchronization state to unknown;
continue;
end if;
if SPI interrupt cause is write buffer error then set synchronization state to unknown;
continue;
end if;
clear SPI interrupt cause register;
clear SPI interrupt register;
end if;
if transmit queue is not empty then call transmit frame function;
end if;
end while;
set thread state to dormant;
return;
end function;

/*====================================================================*
 *
 *   basic interrupt handler; count interrupts since last service;
 *   wake up dormant service routine;
 *
 *--------------------------------------------------------------------*/

function interrupt handler do increment interrupt count;
if thread is available and thread is dormant then wake up thread to service interrupt;
end if;
return (success);
end function;

