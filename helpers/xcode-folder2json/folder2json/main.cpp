//
//  main.cpp
//  folder2json
//
//	A-not-very-sophisticated command line tool that creates a json of files in a folder encoded as Base64 strings
//
//  Created by Johan E. Sundhage on 2013-05-27.
//  Copyright (c) 2013 Klevgrand produktion AB. All rights reserved.
//


// Base64 encoding code from http://stackoverflow.com/questions/342409/how-do-i-base64-encode-decode-in-c

#include <stdint.h>
#include <stdlib.h>
#include <iostream>
#include <dirent.h>
#include <vector>
#include <sys/types.h>
#include <sys/stat.h>


void reportError(const char* errortext) {
	std::cout << errortext << "\n";
	
}

static char encoding_table[] = {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
	'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
	'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
	'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
	'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
	'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
	'w', 'x', 'y', 'z', '0', '1', '2', '3',
	'4', '5', '6', '7', '8', '9', '+', '/'};
static char *decoding_table = NULL;
static int mod_table[] = {0, 2, 1};

void build_decoding_table() {
	
    decoding_table = (char*)malloc(256);
	
    for (int i = 0; i < 64; i++)
        decoding_table[(unsigned char) encoding_table[i]] = i;
}


char *base64_encode(const unsigned char *data,
                    size_t input_length,
                    size_t *output_length) {
	
    *output_length = 4 * ((input_length + 2) / 3);
	
	// malloc +1 byte for termination...
    char *encoded_data = (char*)malloc(*output_length+1);
	// terminate the string (fix Johan Sundhage)
	*(encoded_data+*output_length) = 0;
	
	if (encoded_data == NULL) return NULL;
	
    for (int i = 0, j = 0; i < input_length;) {
		
        uint32_t octet_a = i < input_length ? data[i++] : 0;
        uint32_t octet_b = i < input_length ? data[i++] : 0;
        uint32_t octet_c = i < input_length ? data[i++] : 0;
		
        uint32_t triple = (octet_a << 0x10) + (octet_b << 0x08) + octet_c;
		
        encoded_data[j++] = encoding_table[(triple >> 3 * 6) & 0x3F];
        encoded_data[j++] = encoding_table[(triple >> 2 * 6) & 0x3F];
        encoded_data[j++] = encoding_table[(triple >> 1 * 6) & 0x3F];
        encoded_data[j++] = encoding_table[(triple >> 0 * 6) & 0x3F];
    }
	
    for (int i = 0; i < mod_table[input_length % 3]; i++)
        encoded_data[*output_length - 1 - i] = '=';
	
    return encoded_data;
}


unsigned char *base64_decode(const char *data,
                             size_t input_length,
                             size_t *output_length) {
	
    if (decoding_table == NULL) build_decoding_table();
	
    if (input_length % 4 != 0) return NULL;
	
    *output_length = input_length / 4 * 3;
    if (data[input_length - 1] == '=') (*output_length)--;
    if (data[input_length - 2] == '=') (*output_length)--;
	
    unsigned char *decoded_data = (unsigned char*)malloc(*output_length);
    if (decoded_data == NULL) return NULL;
	
    for (int i = 0, j = 0; i < input_length;) {
		
        uint32_t sextet_a = data[i] == '=' ? 0 & i++ : decoding_table[data[i++]];
        uint32_t sextet_b = data[i] == '=' ? 0 & i++ : decoding_table[data[i++]];
        uint32_t sextet_c = data[i] == '=' ? 0 & i++ : decoding_table[data[i++]];
        uint32_t sextet_d = data[i] == '=' ? 0 & i++ : decoding_table[data[i++]];
		
        uint32_t triple = (sextet_a << 3 * 6)
        + (sextet_b << 2 * 6)
        + (sextet_c << 1 * 6)
        + (sextet_d << 0 * 6);
		
        if (j < *output_length) decoded_data[j++] = (triple >> 2 * 8) & 0xFF;
        if (j < *output_length) decoded_data[j++] = (triple >> 1 * 8) & 0xFF;
        if (j < *output_length) decoded_data[j++] = (triple >> 0 * 8) & 0xFF;
    }
	
    return decoded_data;
}




void base64_cleanup() {
    free(decoding_table);
}


int main(int argc, const char * argv[])
{
	if (argc < 3) reportError("You must provide a path and output filename.");

	const char* path = argv[1];
	const char* output = argv[2];
	
	//std::cout << path << " -> " << output << "\n";
	DIR* dir;
	
	dir = opendir(path);
	if (dir == NULL) {
		reportError("Source path do not exist.");
		return 0;
	}
	
	// get the file list and create proper paths..
	
	std::vector<std::string> files;
	
	dirent* dirinfo;
	while ((dirinfo = readdir(dir)) != NULL) {
		if (dirinfo->d_type == DT_REG) {
			std::string s = std::string(dirinfo->d_name);
			files.push_back(s);
		}
	}
	
	build_decoding_table();
	
	
	// have an output file to throw data at..
	FILE* outFile;
	outFile = fopen(output, "w");
	if (outFile == NULL) {
		reportError("Output file cannot be created.");
		return 0;
	}
	
	// this is how it's done..
	fprintf(outFile, "{\n\t\"files\": {\n");
	
	// process...
	for (int i=0; i<files.size(); i++) {
		std::string filename = files[i];
		std::string fullpath = std::string(path+std::string("/")+filename);
		
		const char* cs = fullpath.c_str();
		
		struct stat filestatus;
		stat(cs, &filestatus);
		long long int fsize = filestatus.st_size;
		
		
		char* fileBuf = (char*)malloc(fsize);
		
		
		FILE* inFile;
		inFile = fopen(cs, "rb");
		if (inFile) {
			fread(fileBuf, fsize, 1, inFile);
		} else {
			reportError("Could not open file.");
			fclose(outFile);
			return 0;
		}
		
		// verkar funka..
		size_t base64Len = 0;
		//printf("base64len: %zi\n", base64Len);
		
		char* res = base64_encode((unsigned char*)fileBuf, fsize, &base64Len);
		size_t stringlen = strlen(res);
		
		printf("%s %lli -> %zi  stringlen: %zi\n", filename.c_str(), fsize, base64Len, stringlen);
		if (i == files.size()-1) {
			fprintf(outFile, "\t\t\"%s\": \"%s\"\n", filename.c_str(), res);
			
		} else {
			fprintf(outFile, "\t\t\"%s\": \"%s\",\n", filename.c_str(), res);
			
		}
		
		fclose(inFile);
		
		free(fileBuf);
		free((void*)res);
	}
	
	fprintf(outFile, "\t}\n}");
	
	fclose(outFile);
	
	base64_cleanup();
	
	//printf("Done!\n");
    return 0;
}



