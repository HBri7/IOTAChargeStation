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
 *   signed nvmseek2 (signd fd, char const * filename, struct nvm_header2 * nvm_header, uint32_t imagetype);
 *
 *   nvm.h
 *
 *   search a panther/lynx PIB file for the next image of a given
 *   type; return 0 on success or -1 on failure to find another
 *   image of the given type;
 *
 *   the call must provide an image header strucuture for use while
 *   searching; on success, that structure will contain information
 *   about the image and file will be positioned to the start of
 *   the image;
 *
 *
 *--------------------------------------------------------------------*/

#ifndef NVMSEEK2_SOURCE
#define NVMSEEK2_SOURCE

#include <unistd.h>

#include "../tools/endian.h"
#include "../tools/files.h"
#include "../tools/error.h"
#include "../pib/pib.h"
#include "../nvm/nvm.h"

signed nvmseek2 (signed fd, char const * filename, struct nvm_header2 * nvm_header, uint32_t imagetype)

{
	unsigned module = 0;
	uint32_t origin = ~0;
	uint32_t offset = 0;
	do
	{
		if (read (fd, nvm_header, sizeof (* nvm_header)) != sizeof (* nvm_header))
		{
			error (1, errno, NVM_HDR_CANTREAD, filename, module);
		}
		if (LE16TOH (nvm_header->MajorVersion) != 1)
		{
			error (1, 0, "(0) " NVM_HDR_VERSION , filename, module);
		}
		if (LE16TOH (nvm_header->MinorVersion) != 1)
		{
			error (1, 0, "(1) " NVM_HDR_VERSION, filename, module);
		}
		if (checksum32 (nvm_header, sizeof (* nvm_header), 0))
		{
			error (1, 0, NVM_HDR_CHECKSUM, filename, module);
		}
		if (LE32TOH (nvm_header->PrevHeader) != origin)
		{
			error (1, 0, NVM_HDR_LINK, filename, module);
		}
		if (LE32TOH (nvm_header->ImageType) == imagetype)
		{
			return (0);
		}
		if (fdchecksum32 (fd, LE32TOH (nvm_header->ImageLength), nvm_header->ImageChecksum))
		{
			error (1, ECANCELED, NVM_IMG_CHECKSUM, filename, module);
		}
		origin = offset;
		offset = LE32TOH (nvm_header->NextHeader);
		module++;
	}
	while (~nvm_header->NextHeader);
	if (lseek (fd, 0, SEEK_CUR) != lseek (fd, 0, SEEK_END))
	{
		error (1, errno, NVM_HDR_LINK, filename, module);
	}
	if (lseek (fd, 0, SEEK_SET))
	{
		error (1, errno, FILE_CANTHOME, filename);
	}
	return (-1);
}


#endif

