.PHONY: main
main: ./node_modules ./node_modules/emsdk/upstream/emscripten/emcc ./build ./build/sha1dc.js

.PHONY: clean
clean:
	rm -rf build

.PHONY: fmt
fmt: ./node_modules
	prettier -w {src,test}/*.js README.md
	clang-format -i ./src/*.c

./node_modules:
	pnpm i

./node_modules/emsdk/upstream/emscripten/emcc:
	./node_modules/emsdk/emsdk install 3.1.57
	./node_modules/emsdk/emsdk activate 3.1.57

./build:
	mkdir build

./build/sha1.o: ./sha1dc/sha1.c
	./em emcc -O2 ./sha1dc/sha1.c -c -o ./build/sha1.o -I ./sha1dc

./build/ubc_check.o: ./sha1dc/ubc_check.c
	./em emcc -O2 ./sha1dc/ubc_check.c -c -o ./build/ubc_check.o -I ./sha1dc

./build/alloc.o: ./src/alloc.c
	./em emcc -O2 ./src/alloc.c -c -o ./build/alloc.o -I .

./build/sha1dc.js: ./build/sha1.o ./build/ubc_check.o ./build/alloc.o
	./em emcc -O2 ./build/sha1.o ./build/ubc_check.o ./build/alloc.o -o ./build/sha1dc.js --no-entry -s EXPORTED_FUNCTIONS=_SHA1DCInit,_SHA1DCSetSafeHash,_SHA1DCSetUseUBC,_SHA1DCSetUseDetectColl,_SHA1DCSetDetectReducedRoundCollision,_SHA1DCUpdate,_SHA1DCFinal,_ctx,_buffer,_buffer_size
