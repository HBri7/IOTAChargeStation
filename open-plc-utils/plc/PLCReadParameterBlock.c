/*====================================================================*
 *
 *   Copyright (c) 2013 Qualcomm Atheros, Inc.
 *
 *   All rights reserved.
 *
 *   Redistribution and use in source and binary forms, with or
 *   without modification, are permitted (subject to the limitations
 *   in the disclaimer below) provided that the following conditions
 *   are met:
 *
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *
 *   * Redistributions in binary form must reproduce the above
 *     copyright notice, this list of conditions and the following
 *     disclaimer in the documentation and/or other materials
 *     provided with the distribution.
 *
 *   * Neither the name of Qualcomm Atheros nor the names of
 *     its contributors may be used to endorse or promote products
 *     derived from this software without specific prior written
 *     permission.
 *
 *   NO EXPRESS OR IMPLIED LICENSES TO ANY PARTY'S PATENT RIGHTS ARE
 *   GRANTED BY THIS LICENSE. THIS SOFTWARE IS PROVIDED BY THE
 *   COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
 *   IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *   WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *   PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER
 *   OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 *   SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *   NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 *   LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 *   HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 *   CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 *   OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 *--------------------------------------------------------------------*/

/*====================================================================*
 *
 *   signed PLCReadParameterBlock (struct channel * channel, struct message * message, void * memory, size_t extent);
 *
 *   plc.h
 *
 *   Read the PIB Image from an INT6000 using as many VS_RD_MOD
 *   messages as needed; Write image blocks to file as they are
 *   read;
 *
 *   the objective here is to read the PIB module in 1024 byte blocks
 *   until the module offset equals or exceeds the PIB actual; we do
 *   not know the PIB actual until we have read the header contained
 *   in the first block read from OFFSET 0;
 *
 *   MOFFSET and MLENGTH fields occupy different offsets in REQ and CNF
 *   messages; we exploit that by initializing them using CNF message
 *   offsets then copying values into REQ message offsets before each
 *   read; this works because confirmation messages always return all
 *   the data we request or nothing at all;
 *
 *   Contributor(s):
 *      Charles Maier
 *      Nathaniel Houghton
 *
 *--------------------------------------------------------------------*/

#ifndef READPARAMETERBLOCK_SOURCE
#define READPARAMETERBLOCK_SOURCE

#include <stdint.h>
#include <unistd.h>
#include <memory.h>

#include "../tools/error.h"
#include "../tools/files.h"
#include "../pib/pib.h"
#include "../plc/plc.h"

signed PLCReadParameterBlock (struct channel * channel, struct message * message, void * memory, size_t extent)

{
	uint8_t * buffer = (uint8_t *)(memory);

#ifndef __GNUC__
#pragma pack (push,1)
#endif

	struct __packed vs_rd_mod_request
	{
		struct ethernet_hdr ethernet;
		struct qualcomm_hdr qualcomm;
		uint8_t MODULEID;
		uint8_t MACCESS;
		uint16_t MLENGTH;
		uint32_t MOFFSET;
		uint8_t MSECRET [16];
	}
	* request = (struct vs_rd_mod_request *) (message);
	struct __packed vs_rd_mod_confirm
	{
		struct ethernet_hdr ethernet;
		struct qualcomm_hdr qualcomm;
		uint8_t MSTATUS;
		uint8_t RESERVED1 [3];
		uint8_t MODULEID;
		uint8_t RESERVED;
		uint16_t MLENGTH;
		uint32_t MOFFSET;
		uint32_t CHKSUM;
		uint8_t BUFFER [PLC_RECORD_SIZE];
	}
	* confirm = (struct vs_rd_mod_confirm *) (message);

#ifndef __GNUC__
#pragma pack (pop)
#endif

	uint16_t length = 0;
	uint32_t offset = 0;
	signed actual = PLC_RECORD_SIZE;
	do
	{
		memset (message, 0, sizeof (* message));
		EthernetHeader (&request->ethernet, channel->peer, channel->host, channel->type);
		QualcommHeader (&request->qualcomm, 0, (VS_RD_MOD | MMTYPE_REQ));
		request->MODULEID = VS_MODULE_PIB;
		request->MLENGTH = HTOLE16 (actual);
		request->MOFFSET = HTOLE32 (offset);
		if (sendpacket (channel, message, (ETHER_MIN_LEN - ETHER_CRC_LEN)) <= 0)
		{
			error (1, errno, CHANNEL_CANTSEND);
		}
		if (readpacket (channel, message, sizeof (* message)) <= 0)
		{
			error (1, errno, CHANNEL_CANTREAD);
		}
		if (UnwantedMessage (message, sizeof (* confirm), 0, (VS_RD_MOD | MMTYPE_CNF)))
		{
			actual = PLC_RECORD_SIZE;
			offset = 0;
			continue;
		}
		if (confirm->MSTATUS)
		{
			error (1, ECANCELED, PLC_WONTDOIT);
		}
		if (LE16TOH (confirm->MLENGTH) != actual)
		{
			error (1, ECANCELED, PLC_ERR_LENGTH);
		}
		if (LE32TOH (confirm->MOFFSET) != offset)
		{
			error (1, ECANCELED, PLC_ERR_OFFSET);
		}
		actual = LE16TOH (confirm->MLENGTH);
		offset = LE32TOH (confirm->MOFFSET);
		if (checksum32 (confirm->BUFFER, actual, confirm->CHKSUM))
		{
			error (1, ECANCELED, "Bad Packet Checksum");
		}
		if (offset == length)
		{
			struct pib_header * pib_header = (struct pib_header *) (confirm->BUFFER);
			length = LE16TOH (pib_header->PIBLENGTH);
		}
		if ((offset + actual) > length)
		{
			actual = length - offset;
		}
		memcpy (buffer + offset, confirm->BUFFER, actual);
		offset += actual;
		extent -= actual;
	}
	while (offset < length);
	return (offset);
}


#endif

