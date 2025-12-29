export const writeups = [
    {
        category: "Cryptography",
        challenges: [
            {
                title: "Chaotic Trust",
                author: "Swarnim",
                description: `Chaos was used to generate a keystream for encrypting the flag using XOR.
A partial keystream leak was left behind during debugging.

Chaos on computers isn’t always unpredictable.
Can you exploit floating-point precision and recover the flag?`,
                solution: `- uses the equation \`xn+1​=r⋅xn​⋅(1−xn​) with r=3.99\`
- so x2 is​ using the logistic map and checked if its last 2 bytes match the second chunk of the leak.
- got the python script generated to XOR with ciphertext to recover plaintext
\`\`\`
import struct

cipher_hex = "9f672a7efb6ec57d0379727c360bc968c07e8b6a256acc0a850f4c608b6a9e0b5472f11f0d"
cipher = bytes.fromhex(cipher_hex)

seed = 0.123456 

def logistic_map(x, r=3.99):
    return r * x * (1 - x)

keystream = b""
x = seed
while len(keystream) < len(cipher):
    x = logistic_map(x)
    keystream += struct.pack('<f', x)[-2:]

flag = bytes(a ^ b for a, b in zip(cipher, keystream))
print(f"Flag: {flag.decode()}")
\`\`\`
\`\`\`
fsociety@FSOCIETY:~$ python3 0.py
Flag: BYPASS_CTF{CH40T1C_TRU57_15_4W350M3!}
\`\`\``,
                flag: "BYPASS_CTF{CH40T1C_TRU57_15_4W350M3!}"
            },
            {
                title: "Whispers of the Cursed Scroll",
                author: "Swarnim",
                description: `An old pirate scroll has resurfaced from the depths of the sea.
It looks ordinary… maybe even some code.

But sailors who dismissed it were never seen again.

Legends say the message was hidden not in what is written,

The sea doesn’t shout its secrets.
Only those who read between the lines survive. ☠️⚓

Don't trust me I am Lier...`,
                solution: `- When opened file it was S, T and L's 
- By looking up the [Whitespace language specification](https://en.wikipedia.org/wiki/Whitespace_(programming_language)), the code repeats a specific structure:
- [Space] [Space] (Mapped as S S).
- Binary values \`S=0\` \`T=1\`
- [Line Feed] (Mapped as L)
\`\`\`
remove command S S: We are left with S T S S S S T S L.

remove terminator L: We are left with S T S S S S T S.

convert to binary:

    S → 0

    T → 1

    result: 01000010

convert to ASCII: 01000010 in binary is 66 in decimal.

result: ASCII 66 is the letter 'B'.
\`\`\`
- So we write a quick py script to decode the whole thing and we get the flag \`BYPASS_CTF{Wh1tsp4c3_cut13_1t_w4s}\``,
                flag: "BYPASS_CTF{Wh1tsp4c3_cut13_1t_w4s}"
            },
            {
                title: "The Key Was Never Text",
                author: "Swarnim",
                description: `He never trusted digital things.
His favorite key was something with hands but no voice.

>“The face tells you everything if you know how to read it.”

You recovered this message:

18 5 25 11 10 1 22 9 11 9 3 5 12 1 14 4

Flag Format- BYPASS_CTF{ANSWER_IN_UPPERCASE_NO_SPACES}`,
                solution: `- the hint itself tells this is a \`A1Z26 cipher\`
- headed to [A1Z26 cipher decoder](https://cryptii.com/pipes/a1z26-cipher)
![cipher](img/A1Z26.png)`,
                flag: "BYPASS_CTF{REYKJAVIKICELAND}"
            },
            {
                title: "Once More Unto the Same Wind",
                author: "Swarnim",
                description: `The crew of the Black Horizon believed their cipher unbreakable.
Captain Blackwind swore by the Galois Seal — “no blade can cut it, no storm can bend it.”

Yet in his haste, the navigator trusted the same wind to carry more than one message.`,
                solution: `- this is a \`AES-GCM\` keystream is XORed with the plaintext to create the ciphertext
- \`enq_EQq1fJa.py\` had static key and static nonce 
- two different plaintexts \`known_plaintext\` and \`FLAG\` are encrypted using this exact same Key/Nonce pair
- got a py script to decode this.
\`\`\`
import binascii

def solve():
    c1_hex = "7713283f5e9979693d337dc27b7f5575350591c530d1d4c9070607c898be0588e5cf437aef"
    c2_hex = "740b393f4c8b676b283447f14f534b5d071bb2e105e4f0fa19332ee8b7a027a0d4e66749d3"

    c1 = bytes.fromhex(c1_hex)
    c2 = bytes.fromhex(c2_hex)

    p1 = b"A" * len(c1)

    flag_bytes = bytes([b1 ^ b2 ^ b3 for b1, b2, b3 in zip(c1, c2, p1)])

    print(f"Flag found: {flag_bytes.decode('utf-8')}")

if __name__ == "__main__":
    solve()
\`\`\`
\`\`\`
fsociety@FSOCIETY:~$ python3 4.py
Flag found: BYPASS_CTF{rum_is_better_than_cipher}

fsociety@FSOCIETY:~$
\`\`\``,
                flag: "BYPASS_CTF{rum_is_better_than_cipher}"
            },
            {
                title: "Count the steps, not the stars",
                author: "Vikhyat",
                description: `“When the map looks wrong, try to think like mathematician…
and let each step grow better than last.”
Bruteforced the n values using a python script as we knew the enc value of \`B\` from \`BYPASS_CTF{\``,
                solution: `\`\`\`

from multiprocessing import Pool, Value, cpu_count
from functools import reduce
from itertools import product, islice

TARGET = 3827591716288630776540535668038365628871133898264070018792556815246012718335698404146173574751497387952867457629767297216012860845869627771721518203820241154212224
BASE = ord("B") ** 2

CHUNK = 120000
progress = Value('i', 0)
found = Value('b', False)

def ecv(v, a, b, c):
    return reduce(lambda v, s: (v << s) ^ s, (16, a, b, c), v)

def worker(chunk):
    for a, b, c in chunk:
        if found.value:
            return None

        if ecv(BASE, a, b, c) == TARGET:
            with found.get_lock():
                found.value = True
            return (a, b, c)

    with progress.get_lock():
        progress.value += len(chunk)
        if progress.value % 100000 == 0:
            print(f"testing {progress.value:,} combos")

    return None

def chunks(iterable, size):
    it = iter(iterable)
    while True:
        block = list(islice(it, size))
        if not block:
            break
        yield block

def main():
    combos = product(range(10, 100), range(10, 100), range(100, 1000))

    with Pool(cpu_count()) as p:
        for result in p.imap_unordered(worker, chunks(combos, CHUNK)):
            if result:
                print("\n match")
                print(result)
                return

    print("\nNo match")

if __name__ == "__main__":
    main()


\`\`\`
We get values as 32,96, 384

Run a decode script, get the flag (idk why it had noise)

\`\`\`
from functools import reduce

def ecv(v):
    n = [16, 32, 96, 384]
    return reduce(lambda v, s: (v << s) ^ s, n, v)


enc = [the enc goes here]

charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_{}"


lookup = {}
for ch in charset:
    lookup[ecv(ord(ch)**2)] = ch


flag = "".join(lookup.get(v, "?") for v in enc)

print(flag)

\`\`\``,
                flag: "BYPASS_CTF{pearl_navigated_through_dark_waters_4f92b}"
            }
        ]
    },
    {
        category: "Steganography",
        challenges: [
            {
                title: "Gold Challenge",
                author: "Swarnim",
                description: `The challenge is contained within the Medallion_of_Cortez.bmp file.

This cursed coin holds more than just gold.

They say the greed of those who plundered it left a stain upon its very soul—a fractured image, visible only to those who can peel back the layers of light.

To lift the curse, you must first reassemble the key. Once the key is whole, its message will grant you the power to unlock the true treasure within.

Beware, for the final step is guarded, and only the words revealed by the light will let you pass.`,
                solution: `- the des and clues \`peel back the layers of light\` and \`fractured image\` says its a  Bit Plane Slicing, specifically looking at the Least Significant Bits \`LSB\`
- py script to extract LSB of RGB channel
\`\`\`
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt

img_path = 'Medallion_of_Cortez.bmp'
img = Image.open(img_path)
data = np.array(img)

r_lsb = (data[:, :, 0] & 1) * 255
g_lsb = (data[:, :, 1] & 1) * 255
b_lsb = (data[:, :, 2] & 1) * 255

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
titles = ['Red Channel LSB', 'Green Channel LSB', 'Blue Channel LSB']
layers = [r_lsb, g_lsb, b_lsb]

for ax, layer, title in zip(axes, layers, titles):
    ax.imshow(layer, cmap='gray')
    ax.set_title(title)
    ax.axis('off')

plt.tight_layout()
plt.savefig('extracted_layers.png')
\`\`\`

- this gives us \`extracted_layers.png\` which has a \`qr code\`
![extracted](img/extracted_layers.png)

- when scanned the qr code we get the key \`SunlightRevealsAll\`
- now it is clear, thats not the flag but ran to run \`steghide\`

<img src="img/steghide.png" width="500">`,
                flag: "BYPASS_CTF{Aztec_Gold_Curse_Lifted}"
            },
            {
                title: "The Locker of Lost Souls",
                author: "Vikhyat",
                description: `They say that to be locked away in Davy Jones' Locker is to be erased from the world of the living, a fate worse than death. One of our divers recovered this image from the wreck of the *Sea Serpent*. The ship's log spoke of a curse, a vision that could only be understood by those who could 'see beyond the veil'. The image seems to be just a picture of an old locker on the seabed, covered in barnacles, but the log claims it holds the key to escape the Locker itself. Standard instruments find nothing. Maybe the old captain was just mad from the pressure, or maybe... you're just not looking at it the right way.`,
                solution: `Just a stereogram, thats all. 

<img width="1024" height="768" alt="image" src="https://github.com/user-attachments/assets/b6ea5f20-980d-47c2-9303-9a09411172a5" />`,
                flag: "BYPASS_CTF{D34D_M4N5_CH35T}"
            },
            {
                title: "Jigsaw Puzzle",
                author: "Vikhyat",
                description: `Challenge Title: The Captain's Scattered Orders

A rival pirate ransacked Captain Jack Sparrow's cabin and, in a fit of rage, tore his portrait to shreds. But this was no ordinary portrait. The Captain, in his infinite cunning, had scrawled his latest secret orders across the back of it before it was framed.

The 25 pieces were scattered across the deck. If you can piece the Captain's portrait back together, you might just be able to read his hidden message.

Find the pieces in this directory, reassemble the image, and decipher the orders. Good luck, savvy?`,
                solution: `Arrange the parts to form the image, write down the string that you get with the little letters: \`Gurcnffjbeqvf:oLCNFF_PGS{RVTUG_CBRPRF_BS_R\\TUG}\`.

ROT13 that, we get our flag. \`Thepasswordis:bYPASS_CTF{EIGHT_POECES_OF_E\\GHT}\` (idk why were flags crooked like this, fix the grammar and its correct)`,
                flag: "BYPASS_CTF{EIGHT_PIECES_OF_EIGHT}"
            }
        ]
    },
    {
        category: "Forensics",
        challenges: [
            {
                title: "Captain's Session",
                author: "Vikhyat",
                description: `The Captain left no open tabs and no saved files.

What remains is scattered within the browser itself.

Track down the remnants and reveal what was hidden.`,
                solution: `We're given a script which validates the questions along with a bunch of logs.

First question by the script is \`What is the url of the bookmarked website?\` 
- On inspecting the logs, bunch of em are sqlite3 DBs. On inspecting the DB called \`Bookmarks\`, we get website \`isdf.dev\`.
- Enter the answer, we get part 1 -> \`BYPASS_CTF{My_d0g\`

Second question asks for a password
- Inspecting \`Login Data\` DB, we get the password as \`stepped on\`.
- Enter the answer, we get part 2 -> \`_0st3pp3d_0n_\`

Got the third part by checking the History DB's url table.

<img width="879" height="69" alt="image" src="https://github.com/user-attachments/assets/d1d10509-2dce-432b-a570-6744a6f03e90" />`,
                flag: "BYPASS_CTF{My_d0g_0st3pp3d_0n_4_b33_shh}"
            },
            {
                title: "Silas's Last Voyage",
                author: "Vikhyat",
                description: `Recovered from the wreck of *The Gilded Eel*, this hard drive belonged to the paranoid navigator Silas Blackwood. Legend says Silas found the route to the "Zero Point" treasure, but he claimed the map itself was alive—shifting and lying to anyone who tried to read it directly.

He left his legacy in this drive. We've tried standard extraction, but all we found were sea shanties and corrupted images. There’s a rumor that Silas split the truth into four winds: Sound, Sight, Logic, and Path.

Beware the "Fools' Gold" (fake flags)—Silas loved to mock the impatient. You must assemble the pieces in the order the *Captain* commands.

File: silas_drive.img`,
                solution: `Analysis of the disk img gives us a bunch of deleted files. We get 3 files which are different from the others, 2 images and one .wav. The wav had morse code which read \`Logs first path second coin third\` which was to do with the order of the flags. 

The found two images when XOR'ed with each other gives the word \`tales\` which hits towards coin so third part.

<img width="400" height="400" alt="flag" src="https://github.com/user-attachments/assets/494c6c11-d534-47a7-89a7-70ad8a73347b" />

Honestly forgot how I got part two but I got \`tell_no_\` from a base64 string from an error statement or sm and so having \`tell_no_tales\` hinted towards the flag being \`dead_men_tell_no_tales\`. Which happened to be correct.`,
                flag: "BYPASS_CTF{dead_men_tell_no_tales}"
            }
        ]
    },
    {
        category: "Reverse Engineering",
        challenges: [
            {
                title: "Dead Man's Riddle",
                author: "Vikhyat",
                description: `"Ye who seek the treasure must pay the price... Navigate the chaos, roll the dice."

A spectral chest sits before you, guarded by a cursed lock that shifts with the tides. The local pirates say the lock has a mind of its own, remembering every mistake you make. There are no keys, only a passphrase spoken into the void.

Can you break the curse and claim the flag?`,
                solution: `The main logic of this was in the \`consult_compass\` function, where the input string is encrypted using the rolling global variable g_state. For each character, the program combined the character value and its index with part of g_state, producing a transformed byte. This transformed value was then compared against a hard-coded table in check_course(). Since the transformation was fully reversible and the expected values were stored in the binary, we could recreate the algorithm, reverse the math for each of the 30 positions, and recover the original passphrase.

script: 

\`\`\`
def rol32(x, r):
    x &= 0xffffffff
    return ((x << r) | (x >> (32 - r))) & 0xffffffff

g = 0xDEADBEEF
g ^= 0x1337C0DE
g = rol32(g, 3) ^ 0x1337C0DE   # result: 0x7fe43150

vals = [
    18, 83, 60, 68, 32, 119, 168, 232, 82, 49,
    235, 147, 56, 40, 111, 103, 95, 46, 200, 222,
    116, 224, 121, 185, 72, 84, 241, 128, 203, 88
]

out = []

for pos, val in enumerate(vals):
    shift = pos % 5
    t = (g >> shift) & 0xffffffff

    c = (val ^ t) - pos
    c &= 0xff  # keep as byte

    out.append(c)

    # update g_state
    g = (31337 * g + c) & 0xffffffff

flag = bytes(out).decode()
print(flag)

\`\`\`

flag: BYPASS_CTF{T1d3s_0f_D3c3pt10n}`,
                flag: "BYPASS_CTF{T1d3s_0f_D3c3pt10n}"
            },
            {
                title: "Cursed Compass",
                author: "Vikhyat",
                description: `"The seas are rough, and the Kraken awaits."

We've recovered a strange game from a derelict pirate ship. The captain claimed the game held the coordinates to his greatest treasure.
But every time we win, the treasure seems... fake.

Can you navigate the treacherous code and find what lies beneath the surface?
The game is built for Linux (x86_64). You might need to install SDL2 to run it (\`sudo apt install libsdl2-2.0-0\` or similar).

Hint: Sometimes, the waves themselves whisper the secrets.`,
                solution: `The \`calculate_wave_physics\` was the function of interest as it had an pseudo rng gen and was XOR'ed with data from \`g_tide_data\`.

Reversing the algorithm, gave us the flag. 

Script:
\`\`\`
g = [
0x4F,0x5D,0x21,0x4E,0x0A,0x5E,0x98,0x0D,0xFE,0xEA,
0xB2,0xB0,0xC8,0x57,0x9E,0xE8,0xB8,0x49,0x84,0x05,
0xCE,0x7E,0x49,0xEA,0xEF,0x6F,0x16,0xE3,0x8A,0x29,
0x70,0x44,0x83,0xA5,0x39,0x67
]

s = 195948557
flag = ""

for i in range(len(g)):
    # advance PRNG i times
    s = 195948557
    for _ in range(i):
        s = (1664525*s + 1013904223) & 0xffffffff

    decoded = ((s >> (i % 7)) ^ g[i]) & 0xff
    flag += chr(decoded)

print(flag)

\`\`\`

flag: BYPASS_CTF{Fr4m3_By_Fr4m3_D3c3pt10n}`,
                flag: "BYPASS_CTF{Fr4m3_By_Fr4m3_D3c3pt10n}"
            },
            {
                title: "Captain's Sextant",
                author: "Vikhyat",
                description: `"The stars guide the way, but only for those who know the rhythm of the ocean."

You have found an old navigational simulator used by the Pirate Lord to train his navigators.
Legend says the Lord hid the coordinates to his stash inside the simulation itself.
But it only reveals itself to those with perfect intuition.

Align the sextant. Follow the stars.
But remember: The game knows when you are guessing.`,
                solution: `The function \`process_input_event\` calls another function \`align_star\` which takes \`g_star_timings[]\` as input. The \`align_star\` function has a shift/xor mechanism being made on the values of \`g_star_timings[]\`. Recreate the function and get the flag.

Script: 
\`\`\`
timings = [
    0xE5,0xF3,0x6F,0x7F,0x10,0x33,0xA1,0x24,0xCB,0x30,
    0xD6,0xFD,0x8A,0x81,0x7D,0xEC,0xF0,0x9D,0xEA,0x07,
    0x6C,0xBD,0x2C,0xCE,0xFD,0xF7,0xBD,0xF7,0x9A,0xEA,
    0x4F,0x87,0xCE,0xB4,0x28,0x7E,0x4B,0xA3,0xE9,0x45,
    0x4F,0x97,0x81,0x68
]

def lcg_step(k):
    return (1103515245 * k + 12345) & 0x7FFFFFFF

flag = ""
for index, t in enumerate(timings):
    k = 322416807
    for _ in range(index):
        k = lcg_step(k)

    shift = (index & 3)
    mask = (k >> shift) & 0xFF
    ch = t ^ mask
    flag += chr(ch)

print(flag)

\`\`\`

flag: BYPASS_CTF{T1m1ng_1s_Ev3ryth1ng_In_Th3_V01d}`,
                flag: "BYPASS_CTF{T1m1ng_1s_Ev3ryth1ng_In_Th3_V01d}"
            },
            {
                title: "Deceiver's Log",
                author: "Vikhyat",
                description: `"Words are wind, and maps are lies. Only the dead speak true, beneath the tides."

You've found the digital logbook of the infamous Captain "Ghost" Jack. It promises untold riches to those who can unlock it.
But be warned: The Captain was a known liar. He built this log to mock those who try to steal his secrets.

The program seems... friendly enough. It might even give you a flag.
But is it the *real* flag?

Trust nothing. Verify everything. The truth is fleeting, existing only for a moment before the lies take over.`,
                solution: `Function \`whisper_truth\` has the flag pretty much with a rotating key XOR. Recreate the function, give the key value which was \`0BADF00D\` (found in \`g_chaos\`)

Script:

\`\`\`
g_chaos = 0x0BADF00D

constants = {
 0:0x4F,1:0x5F,2:0x53,3:0x40,4:0x53,5:0xD3,6:0x9F,7:0xA3,8:0xA4,
 9:0xBE,10:7,11:0xEA,12:0xAD,13:0x1A,14:0x82,15:0x2F,16:0xF2,
 17:0x98,18:0xDB,19:0x2A,20:0x8A,21:0x33,22:0x1D,23:0x48,
 24:0x45,25:0xB5,26:0x36,27:0xFE,28:0x95,29:0x1E,30:7,
 31:0x74,32:0x52,33:0x5F,34:0x33,35:0x74,36:0x72,37:0xDF,
 38:0x85,39:0x99,40:0xC3,41:0x8B,42:1
}

def ror(x):
    return ((x>>1) | ((x&1)<<31)) & 0xFFFFFFFF

k = g_chaos
out = []

for i in range(43):
    c = constants[i]
    out.append((k ^ c) & 0xFF)
    k = ror(k)

print(bytes(out))
print(bytes(out).decode(errors="ignore"))

\`\`\`


flag: BYPASS_CTF{Tru5t_N0_0n3_N0t_Ev3n_Y0ur_Ey3s}`,
                flag: "BYPASS_CTF{Tru5t_N0_0n3_N0t_Ev3n_Y0ur_Ey3s}"
            }
        ]
    },
    {
        category: "Web",
        challenges: [
            {
                title: "The Lost Log Book",
                author: "Swarnim",
                description: `Sail into unsafe waters where faulty authentication and obscured routes guard valuable secrets. There’s more than meets the eye in this pirate portal — hidden methods await those bold enough to look past the browser’s limits.

Flag Format:- BYPASS_CTF{.......}`,
                solution: `- website had a login page, so tried sql injection payload \`' or true--\` in password field and username random.
![login](img/sqlreq.png)
![loginsuccess](img/loginsuccess.png)

- Request fetch treasure map had an output \`Zvffvat K-Cvengr urnqre.\` decoded rot13 to \`Missing X-Pirate header.\`
![fetch](img/fetch.png)

- Added headers as \`X-Pirate: Jack\` then it gives \`VHJhY2UgbG9nYm9vaw==\` when decoded base64 it gives \`Trace logbook\`

- sent request to \`/logbook\` with method \`TRACE\`
![trace](img/trace.png)`,
                flag: "BYPASS_CTF{D0nt_trust_a11}"
            },
            {
                title: "Pirate's Hidden Cove",
                author: "Swarnim",
                description: `You've discovered a secret pirate cove, hidden deep within the Tor network — a place where digital buccaneers stash their treasures. Somewhere on these sites lies the captain's flag. Can you find the 📄.`,
                solution: `- Start your tor and browse the url given.
![tor](img/tor.png)

- Ran ffuf \`ffuf -u http://sjvsa2qdemto3sgcf2s76fbxup5fxqkt6tmgslzgj2qsuxeafbqnicyd.onion/FUZZ -w dirsearch.txt -e .txt,.html,.md,.zip,.bak,.env -x socks5://127.0.0.1:9050\` 
![ffuf](img/ffuf.png)

- the .env had the flag in plain text.`,
                flag: "BYPASS_CTF{T0r_r0ut314}"
            },
            {
                title: "Pirate's Treasure Hunt",
                author: "Swarnim",
                description: `Set sail on an adventure through the treacherous seas of mathematics! Navigate through 20 nautical challenges, each more perilous than the last. Solve riddles of arithmetic under time pressure as the Kraken closes in. Only those who master the pirate code of division, multiplication, and conquest can claim the legendary pirate's map.`,
                solution: `- This chall was where we get 5 seconds to solve each question which was easy to hardesttt impossible to solve in 5 seconds, so i thought of interceptiog the request and i saw the server side was not validating the progress so sent it to intruder and added numbers payload from 1 to 20 for a garbage value (aim was to send this request 20 times untill the progress is 20)
![reqqq](img/reqint.png)

- Response with less length had the flag.
![flagmath](img/flagmath.png)`,
                flag: "BYPASS_CTF{d1v1d3_n_c0nqu3r_l1k3_4_p1r4t3}"
            },
            {
                title: "A Treasure That Doesn’t Exist",
                author: "Swarnim",
                description: `The page insists it's not here — a digital dead end. Yet, something about this absence feels… intentional.  
> Pages may lie, but the browser doesn’t.`,
                solution: `- Inspect network requests, navigated to /favicon.ico which throwed a 404, but still had a response, when tried to save it directly it showed file not available on server, so tried to download it from the \`Network Tab > Preview\`
![pirate](img/pirate.png)

- Now ran \`strings favicon.ico\` and got the flag. ;-;
![pirate](img/stringspirate.png)`,
                flag: "BYPASS_CTF{404_Err0r_N0t_F0und_v}"
            },
            {
                title: "The Cursed Archive",
                author: "Swarnim",
                description: `We stumbled upon a strange fan site hosting a collection of Pirates of the Caribbean movies. It looks like a simple static gallery, but our scanners picked up strange energy signatures coming from the server. Do React.`,
                solution: `- When I loaded the webpage i saw the headers in request had \`rsc, next-router\` running on \`nextjs 16.0.6\` there I knew it was a CVE.
- As a bugbounty hunter I knew about \`CVE-2025-55182\` and I used to use an extension from [mrknow001](https://github.com/mrknow001/RSC_Detector) to hunt for vulns. there it was confirmed that it was a \`React2Shell\`
![r2c](img/r2s.png)

- now when I ran \`ls\` I found there was a \`flag.txt\` but when you read it it gave whitespaces so had to read it as base64 so used \`base64 flag.txt\` 
![bflag](img/bflag.png)

- now ran this command on my terminal and got the flag.txt on my terminal \`echo "BASE64_HERE" | base64 -d > flag.txt\`

- now when removed whitespaces \\x00 and decoded as
\`\`\`
P1: BYPASS_CTF{R34ct

checking vc might help

\`\`\`
- the flag had 3 parts P1, P2 and P3. so we got the P1 \`BYPASS_CTF{R34ct\` and it says checking vc which means \`version control .git\` and looking into previous commits.

\`\`\`
[+] Command: git branch
[+] Output:
  check
* main
\`\`\`
- check branch looked suspicious so I tried to look into check branch \`git show check\`

![p3](img/p3.png)

- BOOM!!! P3: \`Acc3ss}\`
- Now we have P1 and P3, so P2?
- I remember saw few trails \`6b71d2c\` \`9bca028^\`
- So I ran \`git show 6b71d2c\` and got a [pastebin](https://pastebin.com/D7V0Urjh) link.
- Got the P2: \`_2she111_\`
- Now the final flag \`P1+P2+P3 = BYPASS_CTF{R34ct_2she111_Acc3ss}\``,
                flag: "BYPASS_CTF{R34ct_2she111_Acc3ss}"
            }
        ]
    },
    {
        category: "Miscellaneous",
        challenges: [
            {
                title: "Level Devil",
                author: "Swarnim",
                description: `Looks simple. Plays dirty.

Welcome to Level Devil, a platformer that refuses to play fair.
The path looks obvious, the goal seems close—but this level thrives on deception.

Hidden traps, unreliable platforms, and misleading progress will test your patience and awareness.
Not everything you see is safe, and not every solution lies in plain sight.

Your mission is simple:
Reach the end and claim what’s hidden.

But remember—
in this level, trust is your biggest weakness.

Good luck. You’ll need it.`,
                solution: `- this chall has a browser-based game
- the game is designed to be extremely difficult, hidden spikes, falling platforms, and "troll" mechanics that kill the player unexpectedly.
- upon inspecting the source \`ctrl+u\` the game logic was exposed.
- mostly three specific API calls found in the script 
- \`POST /api/start\` – Initiates a session and returns a \`session_id\`.
- \`POST /api/collect_flag\` – Called when the player touches the specific "flag" tile in the game.
- \`POST /api/win\` – Called when the player reaches the door.
- server side does not verify if the player actually jumped over the spikes or traversed the map, it only checks if the API calls are made in the correct order for a valid session ID.
- here had to write a js to run in the browser console and also added the sleeper to avoid \`Time-Based Heuristic (Speed Check)\`
\`\`\`
(async () => {
    const start = await fetch('/api/start', { method: 'POST' }).then(r => r.json());
    console.log(\`[+] Session Active: \${start.session_id}\`);

    console.log("[*] Simulating human gameplay (Waiting 25s)...");
    await new Promise(r => setTimeout(r, 25000));

    await fetch('/api/collect_flag', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({session_id: start.session_id})
    });

    const response = await fetch('/api/win', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({session_id: start.session_id})
    }).then(r => r.json());

    if (response.flag) {
        console.log("%c[PWNED] Flag: " + response.flag, "color:lime; font-size:14px");
        alert(response.flag);
    } else {
        console.error("Failed:", response);
    }
})();
\`\`\`
![game](img/game.png)`,
                flag: "BYPASS_CTF{l3v3l_d3v1l_n0t_s0_1nn0c3nt}"
            },
            {
                title: "The Heart Beneath the Hull",
                author: "Swarnim",
                description: `Not all treasures are buried in sand,`,
                solution: `- so the image when opened showed a devboard with pin numbers
- \`68 65 61 72 74 5f 69 6e 5f 61 5f 63 68 65 73 74\`
- opened cyber chef and decoded it to ascii \`heart_in_a_chest\`
![cc](img/cc.png)`,
                flag: "BYPASS_CTF{heart_in_a_chest}"
            },
            {
                title: "Follow the trend",
                author: "Swarnim",
                description: `Did you Doomscroll??

>This challenge filters spectators from participants. Spectators don’t get flag`,
                solution: `- This was one more hilarious I can say.
- It took me to their instagram page, I started looking into bio, links, nothing worked, then read the chall description again.
- questioned myself, what do i do when i open instagram?
- sad realization that \`no interaction = no flag\`
- i had to login from my alt acc and then i started liking commenting \`(flag, bypass_ctf)\` on all reels, then I got a dm saying \`here your flag pirate\`
<img src="img/insta.jpeg" width="350">`,
                flag: "BYPASS_CTF{i_l0v3_i$d4}"
            },
            {
                title: "Hungry, Not Stupid",
                author: "Swarnim",
                description: `The snake is hungry — not desperate. Most food is a lie. Only those who observe, experiment, and learn will survive long enough to reach the flag.`,
                solution: `- this chall was a snake game where we had "eat the correct food" to reveal the flag, character by character. A single wrong move resets the entire game progress. With multiple food options spawning each turn and no visual indicators of which was correct, the probability of guessing correctly 20+ times in a row was impossible.
- found the game logic in the [game.js](https://snack-mxc1.onrender.com/static/js/game.js) file
- the game was controlled via a REST APIs
- \`POST /api/start\` - Initiates the game, returns grid size and initial food.
- \`POST /api/eat\` - Validates a move. Returns \`status: "correct"\` (with a flag) or \`status: "wrong"\` (reset).
- while interceptiong the request found it was giving a json output
![snakereq](img/snakereq.png)

- now with the apis had to write a py script to get the correct food and get the flag
\`\`\`
import requests, zlib, base64, json

BASE_URL = "https://snack-mxc1.onrender.com"

def decode_cookie(cookie_value):
    if cookie_value.startswith('.'): cookie_value = cookie_value[1:]
    payload = cookie_value.split('.')[0]
    payload += '=' * (4 - (len(payload) % 4)) # Fix padding
    return json.loads(zlib.decompress(base64.urlsafe_b64decode(payload)))

def pwn():
    s = requests.Session()
    s.post(f"{BASE_URL}/api/start")
    
    collected_flag = ""
    while True:
        try:
            data = decode_cookie(s.cookies['session'])
            target = data['correct_food_pos']
            
            res = s.post(f"{BASE_URL}/api/eat", json={
                "eaten_food_pos": target, 
                "snake_body": [{"x":0,"y":0}] 
            }).json()
            
            if res['status'] == 'correct':
                collected_flag += res['flag_char']
                print(f"Flag: {collected_flag}")
            elif res['status'] == 'win':
                print(f"FULL FLAG: {res['full_flag']}")
                break
        except Exception:
            break

if __name__ == "__main__":
    pwn()
\`\`\`
<img src="img/snakeflag.png" width="450">`,
                flag: "BYPASS_CTF{5n4k3_1s_v3ry_l0ng}"
            },
            {
                title: "Signal from the deck",
                author: "Vikhyat",
                description: `Something aboard the ship is trying to communicate.
No words. No explanations.
Only patterns.

Nothing useful lives on the surface.
The answer waits for those who pay attention.`,
                solution: `Just a game. Each square is randomly assigned a number per session, just click the square over and over until you find which number is for which square. Do it right a few times, you get the flag.`,
                flag: "BYPASS_CTF{...}"
            }
        ]
    },
    {
        category: "Other",
        challenges: [
            {
                title: "No Follow, No Treasure 1",
                author: "Swarnim",
                description: `Access denied.

Reason: No social footprint detected.

Authenticate yourself at the official Bypass CTF page
and leave a visible trace.

Flag unlocks post-verification.

>Just look around the ship; sometimes the pirates carry the flag.`,
                solution: `- Part1: in #welcome channel description had a spoiler text \`BYPASS_CTF{w3lc0m3\`
![spoiler](img/spoiler.png)

- Part2: this one tricked me out so bad. when I saw the emojies in the server one said \`:_t00_:\`
![emoji](img/emoji.png)

- Part3: description said \`pirates carry the flag\`, I started asking mods for the flags lol, but when I opened \`jrdevadattan\`s profile banner had the flag \`byp4ss_ctf}\`
![deva](img/deva.png)`,
                flag: "BYPASS_CTF{w3lc0m3_t00_byp4ss_ctf}"
            }
        ]
    }
];
