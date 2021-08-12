from wordfreq import word_frequency as wfq
from math import log

print('actual | harmonic mean | harmonic divisor | logharmonic mean')
while True:
    words = input().split()
    freqs = [wfq(word, 'en') for word in words]
    recips = [1/f for f in freqs]
    print(f"{wfq(' '.join(words), 'en'):.4e} {len(freqs)/sum(recips):.4e} {1/sum(recips):.4e} {log(len(freqs))/sum(recips):.4e}|", ' '.join([f"{f:.4e}" for f in freqs]))
