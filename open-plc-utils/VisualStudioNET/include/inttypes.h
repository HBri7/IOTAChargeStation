/*====================================================================*
 *      
 *   Copyright (c) 2013 by Qualcomm Atheros.
 *   
 *   Permission to use, copy, modify, and/or distribute this software 
 *   for any purpose with or without fee is hereby granted, provided 
 *   that the above copyright notice and this permission notice appear 
 *   in all copies.
 *   
 *   THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL 
 *   WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED 
 *   WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL  
 *   THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR 
 *   CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM 
 *   LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, 
 *   NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN 
 *   CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *   
 *--------------------------------------------------------------------*/

/*====================================================================*
 *
 *   inttypes.h - substitute inttypes.h file for Windows;
 *
 *   this is an important POSIX header that Microsoft ommits; 
 *
 *   Contributor(s):
 *	Charles Maier
 *	Mathieu Olivari
 *
 *--------------------------------------------------------------------*/

#ifndef INTTYPES_HEADER
#define INTTYPES_HEADER

#define PRIu8  "hhu"
#define PRIu16 "hu"
#define PRIu32 "u"
#define PRIu64 "llu"

#define PRId64 "I64d"

#define PRIX8  "hhX"
#define PRIX16 "hX"
#define PRIX32 "X"
#define PRIX64 "llX"

#endif

