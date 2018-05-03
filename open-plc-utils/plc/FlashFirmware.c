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
 *   signed FlashFirmware (struct plc * plc, uint32_t options);
 *
 *   plc.h
 *
 *   write powerline parameters and firmware into flash memory using
 *   VS_MODULE_OPERATION messages; force flash and do not reset;
 *
 *   struct vs_module_spec is defined in plc.h;
 *
 *
 *   Contributor(s):
 *      Charles Maier
 *
 *--------------------------------------------------------------------*/

#ifndef FLASHFIRMWARE_SOURCE
#define FLASHFIRMWARE_SOURCE

#include "../plc/plc.h"

signed FlashFirmware (struct plc * plc, uint32_t options)

{
	struct vs_module_spec vs_module_spec [] =
	{
		{
			PLC_MODULEID_PARAMETERS,
			0,
			0,
			0
		},
		{
			PLC_MODULEID_FIRMWARE,
			0,
			0,
			0
		}
	};
	ModuleSpec (&plc->PIB, &vs_module_spec [0]);
	ModuleSpec (&plc->NVM, &vs_module_spec [1]);
	if (ModuleSession (plc, (sizeof (vs_module_spec) / sizeof (struct vs_module_spec)), vs_module_spec))
	{
		return (-1);
	}
	if (ModuleWrite (plc, &plc->PIB, 0, &vs_module_spec [0]))
	{
		return (-1);
	}
	if (ModuleWrite (plc, &plc->NVM, 1, &vs_module_spec [1]))
	{
		return (-1);
	}
	if (ModuleCommit (plc, options))
	{
		return (-1);
	}
	return (0);
}


#endif

